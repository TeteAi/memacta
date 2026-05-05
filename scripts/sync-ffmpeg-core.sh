#!/usr/bin/env bash
# Re-fetch the @ffmpeg/core single-threaded UMD core into /public/ffmpeg/.
# Run after bumping @ffmpeg/ffmpeg in package.json so the self-hosted asset
# stays in lock-step with the npm dependency.
#
# Usage:
#   bash scripts/sync-ffmpeg-core.sh           # uses default version below
#   FFMPEG_CORE_VERSION=0.12.11 bash scripts/sync-ffmpeg-core.sh

set -euo pipefail

VERSION="${FFMPEG_CORE_VERSION:-0.12.10}"
BASE="https://unpkg.com/@ffmpeg/core@${VERSION}/dist/umd"
DEST_DIR="public/ffmpeg"

mkdir -p "${DEST_DIR}"

curl -fL --retry 3 --max-time 60 -o "${DEST_DIR}/ffmpeg-core.js" "${BASE}/ffmpeg-core.js"
curl -fL --retry 3 --max-time 120 -o "${DEST_DIR}/ffmpeg-core.wasm" "${BASE}/ffmpeg-core.wasm"

echo "Synced @ffmpeg/core@${VERSION} into ${DEST_DIR}/"
ls -la "${DEST_DIR}/"
