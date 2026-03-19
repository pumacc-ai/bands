import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gql } from '../gql.ts'
import './Admin.css'

type Band = { id: string; name: string; genre: string; formedAt: string }

export default function Admin() {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState<Band[]>([])
  const [loading, setLoading] = useState(false)

  // Debounced search: fires 300 ms after the user stops typing
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const d = await gql<{ searchBands: Band[] }>(
          'query($q:String!){ searchBands(query:$q){ id name genre formedAt } }',
          { q: query },
        )
        setResults(d.searchBands)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="admin-page">
      <Link to="/" className="admin-back">← Home</Link>
      <h1 className="admin-title">Admin</h1>

      <section className="admin-section">
        <h2>Band Search</h2>
        <div className="admin-search-bar">
          <input
            type="search"
            placeholder="Search by name or genre…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {loading && <span className="admin-spinner">◎</span>}
        </div>

        {results.length > 0 && (
          <ul className="admin-band-list">
            {results.map(b => (
              <li key={b.id}>
                <Link to={`/bands/${b.id}`} className="admin-band-row">
                  <span className="admin-band-name">{b.name}</span>
                  <span className="admin-band-genre">{b.genre}</span>
                  <span className="admin-band-id">{b.id}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <p className="admin-empty">No bands match "{query}"</p>
        )}
      </section>
    </div>
  )
}
