#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[redeploy] checking registry access..."
REGISTRY="${NPM_REGISTRY:-https://registry.npmmirror.com/}"
npm config set registry "$REGISTRY" >/dev/null 2>&1

if ! npm view npm version --registry "$REGISTRY" >/dev/null 2>&1; then
  echo "[redeploy] registry is not reachable in current environment (403/blocked)."
  echo "[redeploy] current registry: $REGISTRY"
  echo "[redeploy] this usually means outbound access is blocked by proxy/firewall (CONNECT 403)."
  echo "[redeploy] please whitelist registry host in your proxy, then re-run."
  exit 1
fi

echo "[redeploy] installing dependencies..."
npm install --registry "$REGISTRY"

echo "[redeploy] running tests..."
npm test

echo "[redeploy] starting backend and frontend..."
nohup npm run dev:server > .server.log 2>&1 &
SERVER_PID=$!
nohup npm run dev:client > .client.log 2>&1 &
CLIENT_PID=$!

sleep 3

echo "[redeploy] backend PID: $SERVER_PID"
echo "[redeploy] frontend PID: $CLIENT_PID"
echo "[redeploy] logs: .server.log .client.log"
