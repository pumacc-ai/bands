import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gql } from '../gql'
import './Bands.css'

type Band = { id: string; name: string; genre: string; formedAt: string }

export default function Bands() {
  const [bands, setBands] = useState<Band[]>([])
  const [name, setName] = useState('')
  const [genre, setGenre] = useState('')

  const load = () =>
    gql<{ bands: Band[] }>('{ bands { id name genre formedAt } }').then(d => setBands(d.bands))

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await gql('mutation($id:ID!,$name:String!,$genre:String!){ createBand(id:$id,name:$name,genre:$genre){ id } }', {
      id: crypto.randomUUID(), name, genre,
    })
    setName(''); setGenre('')
    load()
  }

  return (
    <div className="bands-page">
      <Link to="/" className="back">← Home</Link>
      <h1>Bands</h1>

      <form onSubmit={create} className="create-form">
        <input placeholder="Band name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Genre" value={genre} onChange={e => setGenre(e.target.value)} />
        <button type="submit">Add Band</button>
      </form>

      <ul className="band-list">
        {bands.map(b => (
          <li key={b.id}>
            <Link to={`/bands/${b.id}`}>
              <span className="band-name">{b.name}</span>
              <span className="band-genre">{b.genre}</span>
            </Link>
          </li>
        ))}
        {bands.length === 0 && <li className="empty">No bands yet.</li>}
      </ul>
    </div>
  )
}
