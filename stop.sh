#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="logs"
PID_FILE="${LOG_DIR}/server.pid"
TEE_PID_FILE="${LOG_DIR}/tee.pid"

# Stop a single process by PID file.
# Sends SIGTERM and waits up to 10 s, then SIGKILL if still alive.
stop_pid() {
  local label="$1"
  local file="$2"

  if [[ ! -f "${file}" ]]; then
    echo "  ${label}: no PID file (${file}) — skipping"
    return
  fi

  local pid
  pid=$(cat "${file}")

  if ! kill -0 "${pid}" 2>/dev/null; then
    echo "  ${label}: PID ${pid} is not running — removing stale PID file"
    rm -f "${file}"
    return
  fi

  echo "  ${label}: stopping PID ${pid} …"
  kill -TERM "${pid}"

  local waited=0
  while kill -0 "${pid}" 2>/dev/null; do
    sleep 0.5
    (( waited++ ))
    if (( waited >= 20 )); then   # 20 × 0.5 s = 10 s
      echo "  ${label}: PID ${pid} did not stop after 10 s — sending SIGKILL"
      kill -KILL "${pid}" 2>/dev/null || true
      break
    fi
  done

  rm -f "${file}"
  echo "  ${label}: stopped"
}

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Bands Server — stopping                 ║"
echo "╚══════════════════════════════════════════╝"

stop_pid "server" "${PID_FILE}"
stop_pid "log tee" "${TEE_PID_FILE}"

echo ""
echo "Done."
echo ""
