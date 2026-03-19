import { Link } from 'react-router-dom'
import './Privacy.css'

const CONTACT_EMAIL = 'privacy@pumacc.com'
const LAST_UPDATED  = 'March 2026'

export default function Privacy() {
  return (
    <div className="priv-page">

      <header className="priv-header">
        <Link to="/" className="priv-back">← Back to Band Finder</Link>
        <h1 className="priv-title">Privacy Policy</h1>
        <p className="priv-meta">Last updated: {LAST_UPDATED}</p>
      </header>

      <div className="priv-body">

        <section className="priv-section">
          <p className="priv-lead">
            Band Finder helps you discover live music near you and lets bands register their
            presence. This page explains what data we collect, why, and how it is protected.
          </p>
        </section>

        {/* ── 1. Data we collect ──────────────────────────────────────────── */}
        <section className="priv-section">
          <h2 className="priv-h2">1. Data We Collect</h2>

          <h3 className="priv-h3">Geolocation</h3>
          <p>
            When you visit the main page your browser may ask permission to share your
            current location. This is used <em>only</em> to centre the map on your area.
            The coordinate is processed entirely in your browser and is <strong>never sent
            to our servers</strong>.
          </p>

          <h3 className="priv-h3">Facebook Account Information</h3>
          <p>
            If you register a band you are asked to sign in with Facebook. We request the
            following Facebook permissions:
          </p>
          <ul className="priv-list">
            <li><strong>Public profile</strong> — your name and profile picture, used to attribute band registrations.</li>
            <li><strong>Email address</strong> (optional) — used for account recovery and important service notifications.</li>
          </ul>
          <p>
            We do not receive your Facebook password, private messages, friend list, or any
            other account data beyond what is listed above.
          </p>

          <h3 className="priv-h3">Band Registration Data</h3>
          <p>
            Information you enter when registering a band (band name, genre, and the
            Facebook ID of the registrant) is stored in our database and is publicly
            visible inside the app.
          </p>

          <h3 className="priv-h3">Server Logs</h3>
          <p>
            Our server records standard HTTP request logs (timestamp, IP address, URL path,
            HTTP status code). Logs are retained for 30 days and are used solely for
            security monitoring and debugging.
          </p>
        </section>

        {/* ── 2. How we use data ──────────────────────────────────────────── */}
        <section className="priv-section">
          <h2 className="priv-h2">2. How We Use Your Data</h2>
          <ul className="priv-list">
            <li>To display bands and events near your location on the map.</li>
            <li>To associate band registrations with a verified Facebook identity.</li>
            <li>To contact you about your band listing if needed.</li>
            <li>To detect and prevent abuse of the registration system.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell, rent, or share your personal data with
            advertisers or other third parties for their marketing purposes.
          </p>
        </section>

        {/* ── 3. Third-party services ─────────────────────────────────────── */}
        <section className="priv-section">
          <h2 className="priv-h2">3. Third-Party Services</h2>

          <h3 className="priv-h3">Google Maps JavaScript API</h3>
          <p>
            The map is powered by Google Maps. When the map loads, Google may set cookies
            and collect usage data in accordance with{' '}
            <a
              className="priv-link"
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google's Privacy Policy
            </a>
            .
          </p>

          <h3 className="priv-h3">Facebook Login (Meta)</h3>
          <p>
            Band registration uses the Facebook JavaScript SDK. Meta may set cookies when
            the SDK loads. See{' '}
            <a
              className="priv-link"
              href="https://www.facebook.com/privacy/policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meta's Privacy Policy
            </a>{' '}
            for details on how they process your data.
          </p>
        </section>

        {/* ── 4. Data retention ───────────────────────────────────────────── */}
        <section className="priv-section">
          <h2 className="priv-h2">4. Data Retention &amp; Deletion</h2>
          <p>
            Band registrations are kept for as long as the band is listed in the app.
            You may request deletion of your band and any associated personal data at any
            time by contacting us at the email below. We will fulfil deletion requests
            within 30 days.
          </p>
        </section>

        {/* ── 5. Cookies ──────────────────────────────────────────────────── */}
        <section className="priv-section">
          <h2 className="priv-h2">5. Cookies</h2>
          <p>
            Band Finder itself does not set first-party cookies. The Google Maps API and
            Facebook SDK may set third-party cookies as described in Section 3. You can
            control cookies through your browser settings; disabling third-party cookies
            may affect map and login functionality.
          </p>
        </section>

        {/* ── 6. Children ─────────────────────────────────────────────────── */}
        <section className="priv-section">
          <h2 className="priv-h2">6. Children's Privacy</h2>
          <p>
            Band Finder is not directed at children under 13. We do not knowingly collect
            personal data from children. If you believe a child has provided us personal
            information, please contact us so we can delete it promptly.
          </p>
        </section>

        {/* ── 7. Changes ──────────────────────────────────────────────────── */}
        <section className="priv-section">
          <h2 className="priv-h2">7. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The "Last updated" date at the top
            of this page will reflect any changes. Continued use of Band Finder after
            changes are posted constitutes acceptance of the revised policy.
          </p>
        </section>

        {/* ── 8. Contact ──────────────────────────────────────────────────── */}
        <section className="priv-section">
          <h2 className="priv-h2">8. Contact</h2>
          <p>
            Questions or requests regarding this policy can be sent to{' '}
            <a className="priv-link" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

      </div>

      <footer className="priv-footer">
        <Link to="/" className="priv-home-link">← Back to Band Finder</Link>
      </footer>

    </div>
  )
}
