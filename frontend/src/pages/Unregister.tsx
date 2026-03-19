import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gql } from '../gql.ts'
import './Unregister.css'

// ── Types ─────────────────────────────────────────────────────────────────────
type FBProfile = {
  id: string
  name: string
  email?: string
}

type Band = {
  id: string
  name: string
  genre: string
}

type AuthState = 'idle' | 'sdk-loading' | 'checking' | 'connected' | 'error'

// ── Facebook SDK loader (same pattern as RegisterBand) ────────────────────────
function loadFacebookSDK(appId: string): Promise<void> {
  return new Promise((resolve) => {
    if (window.FB) { resolve(); return }
    window.fbAsyncInit = () => {
      window.FB.init({ appId, cookie: true, xfbml: true, version: 'v22.0' })
      resolve()
    }
    if (!document.getElementById('facebook-jssdk')) {
      const s = document.createElement('script')
      s.id = 'facebook-jssdk'
      s.src = 'https://connect.facebook.net/en_US/sdk.js'
      s.async = true; s.defer = true
      document.head.appendChild(s)
    } else {
      // SDK script already injected (e.g. navigated from RegisterBand)
      resolve()
    }
  })
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Unregister() {
  const [authState, setAuthState]   = useState<AuthState>('idle')
  const [profile, setProfile]       = useState<FBProfile | null>(null)
  const [bands, setBands]           = useState<Band[]>([])
  const [removing, setRemoving]     = useState<Set<string>>(new Set())
  const [deletingAll, setDeletingAll] = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const appId = import.meta.env.VITE_FACEBOOK_APP_ID ?? ''

  useEffect(() => {
    if (!appId) { setError('VITE_FACEBOOK_APP_ID is not configured.'); setAuthState('error'); return }
    setAuthState('sdk-loading')
    loadFacebookSDK(appId).then(() => {
      setAuthState('checking')
      window.FB.getLoginStatus((res) => {
        if (res.status === 'connected') loadProfile()
        else setAuthState('idle')
      })
    })
  }, [appId])

  function loadProfile() {
    setAuthState('checking')
    window.FB.api('/me', { fields: 'id,name,email' }, (data) => {
      const p = data as unknown as FBProfile
      setProfile(p)
      setAuthState('connected')
      fetchMyBands(p.email ?? '')
    })
  }

  function handleLogin() {
    window.FB.login((res) => {
      if (res.status === 'connected') loadProfile()
      else { setError('Login cancelled or not authorised.'); setAuthState('idle') }
    }, { scope: 'email,public_profile' })
  }

  async function fetchMyBands(email: string) {
    if (!email) { setBands([]); return }
    const d = await gql<{ myBands: Band[] }>(
      'query($e:String!){ myBands(email:$e){ id name genre } }',
      { e: email },
    )
    setBands(d.myBands)
  }

  async function removeBand(id: string) {
    if (!profile?.email) return
    setRemoving(prev => new Set(prev).add(id))
    const d = await gql<{ unregisterBand: boolean }>(
      'mutation($id:ID!,$email:String!){ unregisterBand(id:$id,email:$email) }',
      { id, email: profile.email },
    )
    if (d.unregisterBand) {
      setBands(prev => prev.filter(b => b.id !== id))
    }
    setRemoving(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  async function deleteAllMyData() {
    if (!profile?.email) return
    setDeletingAll(true)
    await gql<{ deleteMyData: number }>(
      'mutation($email:String!){ deleteMyData(email:$email) }',
      { email: profile.email },
    )
    setBands([])
    setDone(true)
    setDeletingAll(false)
  }

  // ── Render: done ─────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="ur-page">
        <div className="ur-done">
          <span className="ur-done-icon">✓</span>
          <h2>All your data has been deleted.</h2>
          <p>Your bands and personal information have been removed from Band Finder.</p>
          <Link to="/" className="ur-btn ur-btn--primary">Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ur-page">

      <header className="ur-header">
        <Link to="/" className="ur-back">← Home</Link>
        <h1 className="ur-title">Remove Your Band</h1>
        <p className="ur-subtitle">
          Sign in with the Facebook account you used to register to remove your listings.
        </p>
      </header>

      <div className="ur-body">

        {/* ── Step 1: auth ──────────────────────────────────────────────────── */}
        <section className="ur-section">
          <h2 className="ur-section-label">Step 1 — Verify with Facebook</h2>

          {authState === 'error' && <p className="ur-error">{error}</p>}

          {(authState === 'sdk-loading' || authState === 'checking') && (
            <p className="ur-loading">◎ Connecting…</p>
          )}

          {authState === 'idle' && (
            <button className="ur-fb-btn" onClick={handleLogin}>
              <FacebookIcon /> Sign in with Facebook
            </button>
          )}

          {authState === 'connected' && profile && (
            <div className="ur-identity">
              <span className="ur-identity-name">{profile.name}</span>
              {profile.email && (
                <span className="ur-identity-email">{profile.email}</span>
              )}
            </div>
          )}
        </section>

        {/* ── Step 2: bands ─────────────────────────────────────────────────── */}
        {authState === 'connected' && (
          <section className="ur-section">
            <h2 className="ur-section-label">Step 2 — Your Registered Bands</h2>

            {!profile?.email && (
              <p className="ur-warn">
                ⚠ Your Facebook account did not share an email address. Re-login and
                allow the email permission so we can look up your registrations.
              </p>
            )}

            {profile?.email && bands.length === 0 && (
              <p className="ur-empty">No bands found for this account.</p>
            )}

            {bands.length > 0 && (
              <>
                <ul className="ur-band-list">
                  {bands.map(b => (
                    <li key={b.id} className="ur-band-row">
                      <span className="ur-band-name">{b.name}</span>
                      <span className="ur-band-genre">{b.genre || '—'}</span>
                      <button
                        className="ur-remove-btn"
                        disabled={removing.has(b.id)}
                        onClick={() => removeBand(b.id)}
                      >
                        {removing.has(b.id) ? '…' : 'Remove'}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="ur-danger-zone">
                  <p className="ur-danger-label">Delete everything</p>
                  <p className="ur-danger-desc">
                    Remove all your bands and personal data from Band Finder in one step.
                    This cannot be undone.
                  </p>
                  <button
                    className="ur-delete-all-btn"
                    disabled={deletingAll}
                    onClick={deleteAllMyData}
                  >
                    {deletingAll ? 'Deleting…' : '✕ Delete All My Data'}
                  </button>
                </div>
              </>
            )}
          </section>
        )}

      </div>
    </div>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  )
}
