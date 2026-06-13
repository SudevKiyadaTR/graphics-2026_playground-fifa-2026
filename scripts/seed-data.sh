#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "[$(date)] Seeding scraped-data using FIFA scraper (--force)..."
node scripts/scrape.js --force

echo "[$(date)] Clearing Observable cache..."
rm -rf src/.observablehq/cache

echo "[$(date)] Rebuilding dashboard so loaders pick up fresh scrape..."
npm run build

echo "[$(date)] Seed complete"
