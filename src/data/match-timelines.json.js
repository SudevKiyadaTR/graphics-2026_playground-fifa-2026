import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");
const MATCHES_FILE = path.join(DATA_DIR, "matches.json");
const MATCHES_DIR = path.join(DATA_DIR, "matches");

const timelinesByMatch = {};

if (fs.existsSync(MATCHES_FILE) && fs.existsSync(MATCHES_DIR)) {
  const matches = JSON.parse(fs.readFileSync(MATCHES_FILE, "utf-8"));

  for (const match of matches) {
    const matchId = String(match.id);
    const timelinePath = path.join(MATCHES_DIR, matchId, "timeline.json");

    if (!fs.existsSync(timelinePath)) {
      continue;
    }

    try {
      const timeline = JSON.parse(fs.readFileSync(timelinePath, "utf-8"));
      timelinesByMatch[matchId] = timeline;
    } catch (error) {
      console.warn(`Error reading timeline for match ${matchId}: ${error.message}`);
    }
  }
}

process.stdout.write(`${JSON.stringify(timelinesByMatch)}\n`);
