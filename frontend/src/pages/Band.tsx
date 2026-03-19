import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gql } from '../gql'
import './Band.css'

type Band   = { id: string; name: string; genre: string; formedAt: string }
type Member = { id: string; name: string; role: string }
type Album  = { id: string; title: string; releasedAt: string }

export default function Band() {
  const { id } = useParams<{ id: string }>()
  const [band, setBand]       = useState<Band | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [albums, setAlbums]   = useState<Album[]>([])
  const [memberName, setMemberName] = useState('')
  const [memberRole, setMemberRole] = useState('')
  const [albumTitle, setAlbumTitle] = useState('')
  const [albumDate, setAlbumDate]   = useState('')

  const load = () => Promise.all([
    gql<{ band: Band }>(`{ band(id:"${id}") { id name genre formedAt } }`).then(d => setBand(d.band)),
    gql<{ members: Member[] }>(`{ members(bandId:"${id}") { id name role } }`).then(d => setMembers(d.members)),
    gql<{ albums: Album[] }>(`{ albums(bandId:"${id}") { id title releasedAt } }`).then(d => setAlbums(d.albums)),
  ])

  useEffect(() => { load() }, [id])

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberName.trim()) return
    await gql('mutation($id:ID!,$bandId:ID!,$name:String!,$role:String!){ addMember(id:$id,bandId:$bandId,name:$name,role:$role){ id } }', {
      id: crypto.randomUUID(), bandId: id, name: memberName, role: memberRole,
    })
    setMemberName(''); setMemberRole(''); load()
  }

  const addAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!albumTitle.trim()) return
    await gql('mutation($id:ID!,$bandId:ID!,$title:String!,$releasedAt:String!){ addAlbum(id:$id,bandId:$bandId,title:$title,releasedAt:$releasedAt){ id } }', {
      id: crypto.randomUUID(), bandId: id, title: albumTitle, releasedAt: albumDate || new Date().toISOString().slice(0, 10),
    })
    setAlbumTitle(''); setAlbumDate(''); load()
  }

  if (!band) return <div className="band-page"><p>Loading…</p></div>

  return (
    <div className="band-page">
      <Link to="/bands" className="back">← Bands</Link>
      <h1>{band.name}</h1>
      <p className="meta">{band.genre} · formed {band.formedAt.slice(0, 10)}</p>

      <section>
        <h2>Members</h2>
        <form onSubmit={addMember} className="create-form">
          <input placeholder="Name" value={memberName} onChange={e => setMemberName(e.target.value)} />
          <input placeholder="Role (e.g. Guitar)" value={memberRole} onChange={e => setMemberRole(e.target.value)} />
          <button type="submit">Add</button>
        </form>
        <ul className="item-list">
          {members.map(m => <li key={m.id}><span>{m.name}</span><span className="tag">{m.role}</span></li>)}
          {members.length === 0 && <li className="empty">No members yet.</li>}
        </ul>
      </section>

      <section>
        <h2>Albums</h2>
        <form onSubmit={addAlbum} className="create-form">
          <input placeholder="Title" value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} />
          <input type="date" value={albumDate} onChange={e => setAlbumDate(e.target.value)} />
          <button type="submit">Add</button>
        </form>
        <ul className="item-list">
          {albums.map(a => <li key={a.id}><span>{a.title}</span><span className="tag">{a.releasedAt.slice(0, 10)}</span></li>)}
          {albums.length === 0 && <li className="empty">No albums yet.</li>}
        </ul>
      </section>
    </div>
  )
}
