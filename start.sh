#!/usr/bin/env bash
set -euo pipefail

# ── Load environment from ~/.profile ───────────────────────────────────────────
# ~/.profile is not automatically sourced by non-login shells (cron, systemd,
# SSH exec), so we load it explicitly to pick up exported vars like DATABASE_URL.
# shellcheck disable=SC1090
[[ -f ~/.profile ]] && source ~/.profile

# ── Validate required configuration ────────────────────────────────────────────
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "✗  DATABASE_URL is not set."
  echo "   Add it to ~/.profile and re-run, or export it before running this script."
  echo ""
  echo "   Example ~/.profile entry:"
  echo "     export DATABASE_URL=postgresql://user:pass@localhost/bands"
  exit 1
fi

PORT="${PORT:-3001}"

# ── Logging & PID tracking ───────────────────────────────────────────────────────
LOG_DIR="logs"
LOG_FILE="${LOG_DIR}/server.log"
PID_FILE="${LOG_DIR}/server.pid"
TEE_PID_FILE="${LOG_DIR}/tee.pid"
mkdir -p "${LOG_DIR}"

# Redirect all subsequent output (stdout + stderr) through tee so every line
# goes to both the terminal and the log file.  The redirection is applied to
# the shell itself before exec, so the Node process inherits the same fds.
exec > >(tee -a "${LOG_FILE}") 2>&1

# Record the tee subprocess PID (available immediately after the exec redirect)
echo "$!" > "${TEE_PID_FILE}"

# exec below replaces this shell with Node; the shell PID ($$) becomes Node's PID.
# Write it now so the PID file is valid for the running process from the start.
echo "$$" > "${PID_FILE}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ── start ──────────────────────────────────"

# ── Choose run mode ─────────────────────────────────────────────────────────────
# 1. server/server.js      — production tarball (build.sh stages here)
# 2. server/dist/server.js — local npm run build output
# 3. npx tsx               — development fallback (no build required)
if [[ -f "server/server.js" ]]; then
  MODE="production"
  CMD="node server/server.js"
elif [[ -f "server/dist/server.js" ]]; then
  MODE="production (local build)"
  CMD="node server/dist/server.js"
else
  if ! command -v npx &>/dev/null; then
    echo "✗  No compiled server found and npx is unavailable."
    echo "   Run  npm run build  first, or install Node.js."
    exit 1
  fi
  MODE="development"
  CMD="npx tsx server/server.ts"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Bands Server                            ║"
echo "╚══════════════════════════════════════════╝"
echo "  Mode     : ${MODE}"
echo "  Port     : ${PORT}"
echo "  Database : ${DATABASE_URL%%@*}@…"   # hide credentials in output
echo "  Log      : ${LOG_FILE}"
echo "  PID file : ${PID_FILE}  (server)"
echo "  PID file : ${TEE_PID_FILE}  (log tee)"
echo ""

# exec replaces the shell with the node process so signals (SIGTERM, SIGINT)
# are delivered directly to Node rather than via a shell wrapper
exec env PORT="${PORT}" DATABASE_URL="${DATABASE_URL}" ${CMD}
