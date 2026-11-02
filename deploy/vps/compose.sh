#!/usr/bin/env bash
set -euo pipefail
DEPLOY_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
  echo 'Скопируйте deploy/vps/.env.example в deploy/vps/.env и заполните адрес и почту.' >&2
  exit 1
fi
exec docker compose --env-file "$DEPLOY_DIR/.env" -f "$DEPLOY_DIR/compose.yaml" "$@"
