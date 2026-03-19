import { PGlite } from '@electric-sql/pglite'

// ── Database instance (singleton) ─────────────────────────────────────────────
export const db = new PGlite('./bands-db')

await db.query(`
  CREATE TABLE IF NOT EXISTS "Bands" (
    id   TEXT PRIMARY KEY,
    data JSONB NOT NULL
  )
`)

await db.query(`
  CREATE TABLE IF NOT EXISTS "Members" (
    id      TEXT PRIMARY KEY,
    band_id TEXT NOT NULL REFERENCES "Bands"(id) ON DELETE CASCADE,
    data    JSONB NOT NULL
  )
`)

await db.query(`
  CREATE TABLE IF NOT EXISTS "Albums" (
    id      TEXT PRIMARY KEY,
    band_id TEXT NOT NULL REFERENCES "Bands"(id) ON DELETE CASCADE,
    data    JSONB NOT NULL
  )
`)

console.log('[Bands] Database ready')

// ── Shared types ───────────────────────────────────────────────────────────────
export type Band   = { id: string; name: string; genre: string; formedAt: string }
export type Member = { id: string; bandId: string; name: string; role: string }
export type Album  = { id: string; bandId: string; title: string; releasedAt: string }
