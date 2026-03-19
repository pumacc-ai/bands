import { Link } from 'react-router-dom'
import './App.css'

export default function App() {
  return (
    <main className="home">
      <h1>Bands</h1>
      <p>Manage your bands, members, and albums.</p>
      <Link to="/bands">
        <button>Browse Bands</button>
      </Link>
    </main>
  )
}
