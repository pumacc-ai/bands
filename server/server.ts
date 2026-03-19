import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'
import { buildSchema } from 'graphql'
import { createHandler } from 'graphql-http/lib/use/express'
import { db, migrate } from '@bands/db'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())

// ── GraphQL schema ─────────────────────────────────────────────────────────────
const schema = buildSchema(readFileSync(join(__dirname, 'schema.graphql'), 'utf-8'))

// ── Field name adapter: snake_case DB rows → camelCase GraphQL ────────────────
const band  = (r: any) => ({ ...r, formedAt: r.formed_at,  createdAt: r.created_at })
const event = (r: any) => ({ ...r, bandId: r.band_id, eventDate: r.event_date, createdAt: r.created_at })
const admin = (r: any) => ({ ...r, createdAt: r.created_at })
const perm  = (r: any) => ({ ...r, adminId: r.admin_id, createdAt: r.created_at })

const root = {
  // ── Band queries ──────────────────────────────────────────────────────────────
  bands: async () => {
    const r = await db.query('SELECT * FROM bands ORDER BY formed_at DESC')
    return r.rows.map(band)
  },

  band: async ({ id }: { id: string }) => {
    const r = await db.query('SELECT * FROM bands WHERE id = $1', [id])
    return r.rows[0] ? band(r.rows[0]) : null
  },

  searchBands: async ({ query }: { query: string }) => {
    const r = await db.query(
      `SELECT * FROM bands
       WHERE name ILIKE $1 OR genre ILIKE $1
       ORDER BY name`,
      [`%${query}%`],
    )
    return r.rows.map(band)
  },

  // ── Event queries ─────────────────────────────────────────────────────────────
  events: async ({ bandId }: { bandId?: string }) => {
    const r = bandId
      ? await db.query('SELECT * FROM events WHERE band_id = $1 ORDER BY event_date', [bandId])
      : await db.query('SELECT * FROM events ORDER BY event_date')
    return r.rows.map(event)
  },

  // ── Admin queries ─────────────────────────────────────────────────────────────
  admins: async () => {
    const r = await db.query('SELECT id, email, name, created_at FROM admins ORDER BY created_at')
    return r.rows.map(admin)
  },

  permissions: async ({ adminId }: { adminId: string }) => {
    const r = await db.query('SELECT * FROM permissions WHERE admin_id = $1', [adminId])
    return r.rows.map(perm)
  },

  // ── Band mutations ────────────────────────────────────────────────────────────
  createBand: async ({ name, genre }: { name: string; genre: string }) => {
    const r = await db.query(
      'INSERT INTO bands (name, genre) VALUES ($1, $2) RETURNING *',
      [name, genre],
    )
    return band(r.rows[0])
  },

  deleteBand: async ({ id }: { id: string }) => {
    await db.query('DELETE FROM bands WHERE id = $1', [id])
    return true
  },

  // ── Event mutations ───────────────────────────────────────────────────────────
  createEvent: async ({ bandId, title, venue, eventDate }: {
    bandId?: string; title: string; venue: string; eventDate?: string
  }) => {
    const r = await db.query(
      'INSERT INTO events (band_id, title, venue, event_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [bandId ?? null, title, venue, eventDate ?? null],
    )
    return event(r.rows[0])
  },

  deleteEvent: async ({ id }: { id: string }) => {
    await db.query('DELETE FROM events WHERE id = $1', [id])
    return true
  },

  // ── Admin mutations ───────────────────────────────────────────────────────────
  createAdmin: async ({ email, name }: { email: string; name: string }) => {
    const r = await db.query(
      'INSERT INTO admins (email, name) VALUES ($1, $2) RETURNING id, email, name, created_at',
      [email, name],
    )
    return admin(r.rows[0])
  },

  grantPermission: async ({ adminId, resource, action }: {
    adminId: string; resource: string; action: string
  }) => {
    const r = await db.query(
      `INSERT INTO permissions (admin_id, resource, action)
       VALUES ($1, $2, $3)
       ON CONFLICT (admin_id, resource, action) DO UPDATE SET action = EXCLUDED.action
       RETURNING *`,
      [adminId, resource, action],
    )
    return perm(r.rows[0])
  },

  revokePermission: async ({ id }: { id: string }) => {
    await db.query('DELETE FROM permissions WHERE id = $1', [id])
    return true
  },
}

// ── GraphQL endpoint ──────────────────────────────────────────────────────────
app.all('/graphql', (req, res, next) => {
  createHandler({ schema, rootValue: root })(req as any, res as any, next)
})

// ── Static / SPA fallback ─────────────────────────────────────────────────────
app.use(express.static(join(__dirname, '../frontend/dist')))
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist', 'index.html'))
})

const port = parseInt(process.env.PORT ?? '3001')

// Run migrations then start listening
migrate().then(() => {
  app.listen(port, () => console.log(`[Bands] Server → http://localhost:${port}`))
})
