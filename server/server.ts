import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'
import { buildSchema } from 'graphql'
import { createHandler } from 'graphql-http/lib/use/express'
import { db } from '@bands/db'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())

// ── GraphQL schema ─────────────────────────────────────────────────────────────
const schema = buildSchema(readFileSync(join(__dirname, 'schema.graphql'), 'utf-8'))

const root = {
  // ── Queries ──────────────────────────────────────────────────────────────────
  bands: async () => {
    const r = await db.query<{ id: string; data: any }>('SELECT id, data FROM "Bands" ORDER BY data->>\'formedAt\' DESC')
    return r.rows.map(row => ({ id: row.id, ...row.data }))
  },

  band: async ({ id }: { id: string }) => {
    const r = await db.query<{ id: string; data: any }>('SELECT id, data FROM "Bands" WHERE id = $1', [id])
    if (!r.rows.length) return null
    return { id: r.rows[0].id, ...r.rows[0].data }
  },

  members: async ({ bandId }: { bandId: string }) => {
    const r = await db.query<{ id: string; data: any }>('SELECT id, data FROM "Members" WHERE band_id = $1', [bandId])
    return r.rows.map(row => ({ id: row.id, ...row.data }))
  },

  albums: async ({ bandId }: { bandId: string }) => {
    const r = await db.query<{ id: string; data: any }>('SELECT id, data FROM "Albums" WHERE band_id = $1', [bandId])
    return r.rows.map(row => ({ id: row.id, ...row.data }))
  },

  // ── Mutations ─────────────────────────────────────────────────────────────────
  createBand: async ({ id, name, genre }: { id: string; name: string; genre: string }) => {
    const data = { name, genre, formedAt: new Date().toISOString() }
    await db.query('INSERT INTO "Bands" (id, data) VALUES ($1, $2)', [id, data])
    return { id, ...data }
  },

  addMember: async ({ id, bandId, name, role }: { id: string; bandId: string; name: string; role: string }) => {
    const data = { bandId, name, role }
    await db.query('INSERT INTO "Members" (id, band_id, data) VALUES ($1, $2, $3)', [id, bandId, data])
    return { id, ...data }
  },

  addAlbum: async ({ id, bandId, title, releasedAt }: { id: string; bandId: string; title: string; releasedAt: string }) => {
    const data = { bandId, title, releasedAt }
    await db.query('INSERT INTO "Albums" (id, band_id, data) VALUES ($1, $2, $3)', [id, bandId, data])
    return { id, ...data }
  },

  deleteBand: async ({ id }: { id: string }) => {
    await db.query('DELETE FROM "Bands" WHERE id = $1', [id])
    return true
  },
}

// ── GraphQL endpoint ──────────────────────────────────────────────────────────
app.all('/graphql', (req, res, next) => {
  createHandler({ schema, rootValue: root })(req as any, res as any)
  void next
})

// ── Static / SPA fallback ─────────────────────────────────────────────────────
app.use(express.static(join(__dirname, '../frontend/dist')))
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist', 'index.html'))
})

const port = parseInt(process.env.PORT ?? '3001')
app.listen(port, () => console.log(`[Bands] Server → http://localhost:${port}`))
