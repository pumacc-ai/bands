import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './RegisterBand.css'

// ── Types ─────────────────────────────────────────────────────────────────────
type FBProfile = {
  id: string
  name: string
  email?: string
  picture?: { data: { url: string; width: number; height: number } }
}

type LoadState = 'idle' | 'sdk-loading' | 'checking' | 'connected' | 'error'

// ── Facebook SDK loader ───────────────────────────────────────────────────────
function loadFacebookSDK(appId: string): Promise<void> {
  return new Promise((resolve) => {
    if (window.FB) { resolve(); return }

    window.fbAsyncInit = () => {
      window.FB.init({ appId, cookie: true, xfbml: true, version: 'v22.0' })
      resolve()
    }

    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RegisterBand() {
  const [state, setState]     = useState<LoadState>('idle')
  const [profile, setProfile] = useState<FBProfile | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const appId = import.meta.env.VITE_FACEBOOK_APP_ID ?? ''

  // Load SDK on mount and check if the user is already logged in
  useEffect(() => {
    if (!appId) {
      setError('VITE_FACEBOOK_APP_ID is not configured.')
      setState('error')
      return
    }

    setState('sdk-loading')
    loadFacebookSDK(appId).then(() => {
      setState('checking')
      window.FB.getLoginStatus((res) => {
        if (res.status === 'connected') {
          fetchProfile()
        } else {
          setState('idle')
        }
      })
    })
  }, [appId])

  // Fetch /me fields after a successful FB login/status check
  function fetchProfile() {
    setState('checking')
    window.FB.api(
      '/me',
      { fields: 'id,name,email,picture.type(large)' },
      (data) => {
        setProfile(data as unknown as FBProfile)
        setState('connected')
      },
    )
  }

  function handleLogin() {
    window.FB.login((res) => {
      if (res.status === 'connected') {
        fetchProfile()
      } else {
        setError('Facebook login was cancelled or not authorised.')
        setState('idle')
      }
    }, { scope: 'email,public_profile' })
  }

  function handleLogout() {
    window.FB.logout(() => {
      setProfile(null)
      setState('idle')
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const profileUrl = profile ? `https://www.facebook.com/${profile.id}` : null

  return (
    <div className="rb-page">
      <Link to="/" className="rb-back">← Home</Link>
      <h1 className="rb-title">Register Your Band</h1>

      {/* ── Step 1: Facebook login ──────────────────────────────────────── */}
      <section className="rb-section">
        <h2 className="rb-section-label">Step 1 — Verify with Facebook</h2>

        {state === 'error' && (
          <p className="rb-error">{error}</p>
        )}

        {(state === 'sdk-loading' || state === 'checking') && (
          <div className="rb-loading">
            <span className="rb-spinner">◎</span>
            <span>{state === 'sdk-loading' ? 'Loading Facebook SDK…' : 'Connecting…'}</span>
          </div>
        )}

        {state === 'idle' && (
          <div className="rb-login-prompt">
            <p className="rb-login-desc">
              Sign in with Facebook to verify your identity before registering a band.
            </p>
            <button className="rb-fb-btn" onClick={handleLogin}>
              <FacebookIcon />
              Continue with Facebook
            </button>
            {error && <p className="rb-error" style={{ marginTop: 12 }}>{error}</p>}
          </div>
        )}

        {state === 'connected' && profile && (
          <div className="rb-profile-card">
            {profile.picture?.data.url && (
              <img
                className="rb-avatar"
                src={profile.picture.data.url}
                alt={profile.name}
                width={96}
                height={96}
              />
            )}

            <div className="rb-profile-info">
              <p className="rb-profile-name">{profile.name}</p>

              {profile.email ? (
                <p className="rb-profile-row">
                  <span className="rb-profile-label">Email</span>
                  <span className="rb-profile-value">{profile.email}</span>
                </p>
              ) : (
                <p className="rb-profile-row">
                  <span className="rb-profile-label">Email</span>
                  <span className="rb-profile-value rb-muted">
                    Not shared — re-login and allow the email permission to share it
                  </span>
                </p>
              )}

              <p className="rb-profile-row">
                <span className="rb-profile-label">Facebook ID</span>
                <span className="rb-profile-value rb-mono">{profile.id}</span>
              </p>

              <p className="rb-profile-row">
                <span className="rb-profile-label">Public profile</span>
                <a
                  className="rb-profile-link"
                  href={profileUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profileUrl}
                </a>
              </p>
            </div>

            <button className="rb-logout-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </section>

      {/* ── Step 2: Band details (unlocked after login) ─────────────────── */}
      <section className={`rb-section ${state !== 'connected' ? 'rb-section--locked' : ''}`}>
        <h2 className="rb-section-label">Step 2 — Band Details</h2>

        {state !== 'connected' && (
          <p className="rb-locked-msg">Complete Step 1 to unlock band registration.</p>
        )}

        {state === 'connected' && <BandForm submitterName={profile?.name ?? ''} />}
      </section>
    </div>
  )
}

// ── Band registration form ─────────────────────────────────────────────────────
function BandForm({ submitterName }: { submitterName: string }) {
  const [name, setName]   = useState('')
  const [genre, setGenre] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const { gql } = await import('../gql.ts')
    await gql('mutation($name:String!,$genre:String!){ createBand(name:$name,genre:$genre){ id } }',
      { name: name.trim(), genre: genre.trim() })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rb-success">
        <span className="rb-success-icon">✓</span>
        <p><strong>{name}</strong> has been registered!</p>
        <p className="rb-muted">Submitted by {submitterName}</p>
        <Link to="/bands" className="rb-success-link">View all bands →</Link>
      </div>
    )
  }

  return (
    <form className="rb-form" onSubmit={handleSubmit}>
      <label className="rb-label">
        Band Name <span className="rb-required">*</span>
        <input
          className="rb-input"
          type="text"
          placeholder="e.g. The Wildfire"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </label>
      <label className="rb-label">
        Genre
        <input
          className="rb-input"
          type="text"
          placeholder="e.g. Indie Rock"
          value={genre}
          onChange={e => setGenre(e.target.value)}
        />
      </label>
      <button className="rb-submit-btn" type="submit" disabled={!name.trim()}>
        Register Band
      </button>
    </form>
  )
}

// ── Facebook icon SVG ──────────────────────────────────────────────────────────
function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  )
}
