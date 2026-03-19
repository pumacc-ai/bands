import { Link } from 'react-router-dom'
import Map from './components/Map'
import Logo from './components/Logo'
import './App.css'

export default function App() {
  return (
    <main className="home">

      <header className="home-header">
        <Link to="/" className="home-logo-link">
          <Logo size={36} />
          <span className="home-logo-text">Bands</span>
        </Link>
        <Link to="/bands">
          <button>Browse Bands</button>
        </Link>
      </header>

      <section className="home-banner">
        <div className="home-banner-overlay">
          <h1 className="home-banner-title">Discover Live Music Near You</h1>
          <p className="home-banner-sub">Find bands &amp; events on the map below</p>
        </div>
      </section>

      <div className="home-map">
        <Map />
      </div>

      <footer className="home-footer">
        <Link to="/register">
          <button className="home-register-btn">＋ Register Band</button>
        </Link>
        <Link to="/admin">
          <button className="home-admin-btn">⚙ Admin</button>
        </Link>
      </footer>

    </main>
  )
}
