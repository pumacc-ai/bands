import { Link } from 'react-router-dom'
import './DataDeletion.css'

/**
 * Facebook Data Deletion Instructions page.
 *
 * Facebook requires apps that use Facebook Login to provide a URL where users
 * can request deletion of their data. This page fulfils that requirement and
 * links to the /unregister flow for self-service deletion.
 *
 * Register this URL in the Facebook App Dashboard under:
 *   App Settings → Basic → Data Deletion Instructions URL
 *   → https://bands.pumacc.com/data-deletion
 */
export default function DataDeletion() {
  return (
    <div className="dd-page">

      <header className="dd-header">
        <Link to="/" className="dd-back">← Back to Band Finder</Link>
        <h1 className="dd-title">Data Deletion Instructions</h1>
        <p className="dd-meta">
          How to request removal of your personal data from Band Finder
        </p>
      </header>

      <div className="dd-body">

        <section className="dd-section">
          <p className="dd-lead">
            When you use Facebook Login to register a band, Band Finder stores your
            Facebook email address alongside your band listing. This page explains how
            to delete that data.
          </p>
        </section>

        {/* ── Option 1: self-service ──────────────────────────────────────── */}
        <section className="dd-section">
          <h2 className="dd-h2">Option 1 — Self-Service (instant)</h2>
          <p>
            Use our <strong>Unregister</strong> page to sign in with the same Facebook
            account and remove your bands immediately. You can remove individual bands
            or delete all your data in one step.
          </p>
          <Link to="/unregister" className="dd-action-btn">
            Go to Unregister →
          </Link>
        </section>

        {/* ── Option 2: email request ─────────────────────────────────────── */}
        <section className="dd-section">
          <h2 className="dd-h2">Option 2 — Email Request</h2>
          <p>
            Send a deletion request to{' '}
            <a className="dd-link" href="mailto:privacy@pumacc.com">
              privacy@pumacc.com
            </a>{' '}
            with the subject line <em>"Data deletion request"</em> and include the
            email address associated with your Facebook account. We will confirm
            deletion within <strong>30 days</strong>.
          </p>
        </section>

        {/* ── What we delete ──────────────────────────────────────────────── */}
        <section className="dd-section">
          <h2 className="dd-h2">What Gets Deleted</h2>
          <ul className="dd-list">
            <li>All band registrations linked to your email address</li>
            <li>Your email address stored as the registrant identifier</li>
          </ul>
          <p>
            We do not store your Facebook password, profile photo, friend list,
            or any other Facebook data. Server access logs (IP, timestamp) are
            retained for 30 days for security purposes and cannot be individually
            removed.
          </p>
        </section>

        {/* ── After deletion ──────────────────────────────────────────────── */}
        <section className="dd-section">
          <h2 className="dd-h2">After Deletion</h2>
          <p>
            Once deleted, your bands will no longer appear in Band Finder. The
            deletion is permanent and cannot be undone. If you wish to list a band
            again in the future you can re-register at any time.
          </p>
        </section>

        {/* ── Facebook revocation reminder ────────────────────────────────── */}
        <section className="dd-section">
          <h2 className="dd-h2">Revoking Facebook App Access</h2>
          <p>
            To also revoke Band Finder's Facebook Login permissions (independent of
            the data stored on our servers), visit your Facebook account settings:
          </p>
          <p>
            <a
              className="dd-link"
              href="https://www.facebook.com/settings?tab=applications"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook → Settings → Apps and Websites
            </a>
          </p>
          <p>Find <strong>Band Finder</strong> in the list and click Remove.</p>
        </section>

      </div>

      <footer className="dd-footer">
        <Link to="/privacy" className="dd-link dd-footer-link">Privacy Policy</Link>
        <span className="dd-sep">·</span>
        <Link to="/" className="dd-link dd-footer-link">Home</Link>
      </footer>

    </div>
  )
}
