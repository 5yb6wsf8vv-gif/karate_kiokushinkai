#!/usr/bin/env bash
# Run on a newly created Ubuntu 24.04 VPS, not in Codespaces.
set -euo pipefail
if [[ $EUID -ne 0 ]]; then
  echo 'Запустите от root на VPS Ubuntu 24.04.' >&2
  exit 1
fi
source /etc/os-release
if [[ ${ID:-} != ubuntu || ${VERSION_ID:-} != 24.04 ]]; then
  echo 'Этот установщик рассчитан на Ubuntu 24.04. Для другой ОС установите Docker и Compose по её инструкции.' >&2
  exit 1
fi
apt-get update
apt-get install -y ca-certificates curl docker.io docker-compose-v2
systemctl enable --now docker
if ! docker compose version >/dev/null; then
  echo 'Не найден Docker Compose v2.' >&2
  exit 1
fi
echo 'Docker готов. Дальнейшие шаги: deploy/vps/README.md'
