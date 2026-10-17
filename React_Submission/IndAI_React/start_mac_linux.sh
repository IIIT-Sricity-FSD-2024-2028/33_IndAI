#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
[ -f back-end/.env ] || node scripts/configure.mjs
if [ ! -d back-end/node_modules ] || [ ! -d frontend/node_modules ] || [ ! -d node_modules ]; then npm run setup; fi
npm run dev
