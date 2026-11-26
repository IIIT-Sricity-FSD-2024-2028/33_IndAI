#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
npm run setup
npm run dev
