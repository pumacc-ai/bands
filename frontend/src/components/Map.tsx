import { useEffect, useRef } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  v: 'weekly',
})

const RADIUS_MILES = 100

/**
 * Compute the Google Maps zoom level that frames a given radius (in miles)
 * around a centre point.
 *
 * Formula derived from the Web Mercator tile resolution:
 *   metersPerPixel = 156543.03392 × cos(lat) / 2^zoom
 *
 * Solving for zoom:
 *   zoom = log2( 156543 × cos(lat) × (containerWidthPx / 2) / radiusMeters )
 *
 * We clamp to [1, 21] to stay within Google Maps' valid range.
 */
function zoomForRadius(
  latDeg: number,
  radiusMiles: number,
  containerWidthPx: number,
): number {
  const radiusMeters = radiusMiles * 1609.34
  const latRad = (latDeg * Math.PI) / 180
  const zoom = Math.log2(
    (156543.03392 * Math.cos(latRad) * (containerWidthPx / 2)) / radiusMeters,
  )
  return Math.min(21, Math.max(1, Math.round(zoom)))
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    async function initMap() {
      const { Map, InfoWindow } = await importLibrary('maps')
      const { AdvancedMarkerElement } = await importLibrary('marker')

      // Start with a world view; we'll zoom in as soon as geolocation resolves
      const map = new Map(mapRef.current!, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        mapId: 'bands-location-map',
      })

      const infoWindow = new InfoWindow()

      // ── Helper: pan + zoom to a position at the 100-mile radius zoom ────────
      function flyToLocation(pos: google.maps.LatLngLiteral) {
        const containerWidth = mapRef.current?.clientWidth ?? 800
        const zoom = zoomForRadius(pos.lat, RADIUS_MILES, containerWidth)
        map.setCenter(pos)
        map.setZoom(zoom)
      }

      // ── Auto-locate on load ──────────────────────────────────────────────────
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            new AdvancedMarkerElement({ map, position: pos })
            flyToLocation(pos)
          },
          () => {
            // Silently fall back to world view if permission is denied
          },
        )
      }

      // ── "Pan to Current Location" button ────────────────────────────────────
      const locationButton = document.createElement('button')
      locationButton.textContent = 'Pan to Current Location'
      locationButton.classList.add('map-location-btn')
      map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton)

      locationButton.addEventListener('click', () => {
        if (!navigator.geolocation) {
          infoWindow.setPosition(map.getCenter())
          infoWindow.setContent('Geolocation is not supported by your browser.')
          infoWindow.open(map)
          return
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            infoWindow.setPosition(pos)
            infoWindow.setContent(
              `You are here: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`,
            )
            infoWindow.open(map)
            flyToLocation(pos)
          },
          () => {
            infoWindow.setPosition(map.getCenter())
            infoWindow.setContent('Error: Could not retrieve your location.')
            infoWindow.open(map)
          },
        )
      })
    }

    initMap()
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
