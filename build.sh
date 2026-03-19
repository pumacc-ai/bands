#!/usr/bin/env bash
set -euo pipefail

# ── Config ─────────────────────────────────────────────────────────────────────
VERSION=$(node -p "require('./package.json').version")
PACKAGE="bands-v${VERSION}"
STAGE="dist/${PACKAGE}"
ARCHIVE="dist/${PACKAGE}.tar.gz"

echo "╔══════════════════════════════════════════╗"
echo "║  Bands  ·  Building package v${VERSION}      ║"
echo "╚══════════════════════════════════════════╝"

# ── 1. Clean ───────────────────────────────────────────────────────────────────
rm -rf dist/
mkdir -p dist/

# ── 2. Validate env ────────────────────────────────────────────────────────────
# Load ~/.profile so VITE_GOOGLE_MAPS_API_KEY is available when building
# in non-login shells (CI, cron, etc.)
# shellcheck disable=SC1090
[[ -f ~/.profile ]] && source ~/.profile

if [[ -z "${VITE_GOOGLE_MAPS_API_KEY:-}" ]]; then
  echo "⚠  VITE_GOOGLE_MAPS_API_KEY is not set — map will load without an API key."
  echo "   Add  export VITE_GOOGLE_MAPS_API_KEY=your_key  to ~/.profile and re-run."
fi

# ── 3. Build all workspaces ────────────────────────────────────────────────────
echo ""
echo "→ Compiling TypeScript & building frontend…"
npm run build

# ── 4. Stage compiled server ───────────────────────────────────────────────────
echo "→ Staging package…"

mkdir -p "${STAGE}/server"
cp    server/dist/server.js "${STAGE}/server/server.js"
cp    server/schema.graphql "${STAGE}/server/schema.graphql"
cp    start.sh              "${STAGE}/start.sh"
chmod +x "${STAGE}/start.sh"

# Minimal server package.json: points start at compiled JS, no devDeps
node -e "
const src = require('./server/package.json')
const out = {
  name:    src.name,
  version: src.version,
  type:    src.type,
  scripts: { start: 'node server.js' },
  dependencies: src.dependencies,
}
process.stdout.write(JSON.stringify(out, null, 2) + '\n')
" > "${STAGE}/server/package.json"

# ── 5. Stage compiled db ───────────────────────────────────────────────────────
mkdir -p "${STAGE}/db"
cp    db/dist/index.js  "${STAGE}/db/index.js"
[[ -f db/dist/index.d.ts ]] && cp db/dist/index.d.ts "${STAGE}/db/index.d.ts"

# Minimal db package.json: main points to compiled JS, not index.ts
node -e "
const src = require('./db/package.json')
const out = {
  name:    src.name,
  version: src.version,
  type:    src.type,
  main:    './index.js',
  dependencies: src.dependencies,
}
process.stdout.write(JSON.stringify(out, null, 2) + '\n')
" > "${STAGE}/db/package.json"

# ── 6. Stage frontend dist ─────────────────────────────────────────────────────
# Express serves this from ../frontend/dist relative to server.js
mkdir -p "${STAGE}/frontend"
cp -r frontend/dist/. "${STAGE}/frontend/dist/"

# ── 7. Stage root package (workspace host) ─────────────────────────────────────
node -e "
const src = require('./package.json')
const out = {
  name:       src.name,
  version:    src.version,
  type:       'module',
  workspaces: ['db', 'server'],
  scripts:    { start: 'node server/server.js' },
}
process.stdout.write(JSON.stringify(out, null, 2) + '\n')
" > "${STAGE}/package.json"

# ── 8. Install production dependencies ─────────────────────────────────────────
echo "→ Installing production dependencies…"
(cd "${STAGE}" && npm install --omit=dev --silent)

# ── 9. Write runtime env template ─────────────────────────────────────────────
cat > "${STAGE}/.env.example" << 'EOF'
# Server port (default: 3001)
PORT=3001

# PostgreSQL connection string
DATABASE_URL=postgresql://bands:password@localhost/bands
EOF

# ── 10. Create tarball ────────────────────────────────────────────────────────
echo "→ Creating archive…"
tar -czf "${ARCHIVE}" -C dist/ "${PACKAGE}/"

# ── Summary ───────────────────────────────────────────────────────────────────
SIZE=$(du -sh "${ARCHIVE}" | cut -f1)
echo ""
echo "✓  Package ready: ${ARCHIVE}  (${SIZE})"
echo ""
echo "   Install & run:"
echo "     tar -xzf ${ARCHIVE}"
echo "     cd ${PACKAGE}"
echo "     PORT=3001 node server/server.js"
