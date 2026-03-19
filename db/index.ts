import pg from 'pg'

const { Pool } = pg

// ── Connection pool ────────────────────────────────────────────────────────────
// Configure via DATABASE_URL or individual PG* env vars (PGHOST, PGPORT, etc.)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://localhost/bands',
})

// Thin query wrapper keeps callers identical to the old PGlite API
export const db = {
  query: <T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values?: unknown[],
  ) => pool.query<T>(text, values),
}

// ── Schema bootstrap ───────────────────────────────────────────────────────────
// Called once on server start; idempotent (CREATE TABLE IF NOT EXISTS).
export async function migrate() {
  // gen_random_uuid() is built-in since PostgreSQL 13; uuid-ossp is the fallback
  await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)

  await db.query(`
    CREATE TABLE IF NOT EXISTS bands (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       TEXT        NOT NULL,
      genre      TEXT        NOT NULL DEFAULT '',
      formed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS events (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      band_id    UUID REFERENCES bands(id) ON DELETE CASCADE,
      title      TEXT        NOT NULL,
      venue      TEXT        NOT NULL DEFAULT '',
      event_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT NOT NULL UNIQUE,
      name          TEXT NOT NULL,
      password_hash TEXT NOT NULL DEFAULT '',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_id   UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      resource   TEXT NOT NULL,
      action     TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (admin_id, resource, action)
    )
  `)

  console.log('[Bands] Database ready')
}

// ── Shared types ───────────────────────────────────────────────────────────────
export type Band = {
  id: string; name: string; genre: string; formed_at: string; created_at: string
}
export type BandEvent = {
  id: string; band_id: string | null; title: string; venue: string
  event_date: string | null; created_at: string
}
export type Admin = {
  id: string; email: string; name: string; created_at: string
}
export type Permission = {
  id: string; admin_id: string; resource: string; action: string; created_at: string
}
