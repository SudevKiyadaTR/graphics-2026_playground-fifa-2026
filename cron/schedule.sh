#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "[$(date)] Starting FIFA scraper..."
node scripts/scrape.js

echo "[$(date)] Building dashboard..."
npm run build

echo "[$(date)] Scrape and build complete"
