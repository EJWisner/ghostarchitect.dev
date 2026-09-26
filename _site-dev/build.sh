#!/usr/bin/env bash
# Rebuild next/scene.js from next/src/scene.js. One-time tool, not part of the site's release checklist.
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules/three ] || npm install --no-audit --no-fund
npm run -s build
ls -la scene.js
