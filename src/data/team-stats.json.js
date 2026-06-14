import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data/matches");

// Build a map of matchId -> team stats
const teamStatsMap = {};

try {
  const matchDirs = fs.readdirSync(DATA_DIR);

  matchDirs.forEach((matchId) => {
    const teamStatsPath = path.join(DATA_DIR, matchId, "team-stats.json");

    if (fs.existsSync(teamStatsPath)) {
      try {
        const teamStats = JSON.parse(fs.readFileSync(teamStatsPath, "utf-8"));
        teamStatsMap[matchId] = teamStats;
      } catch {
        // Skip invalid JSON
      }
    }
  });
} catch {
  // Skip if directory doesn't exist
}

process.stdout.write(`${JSON.stringify(teamStatsMap)}\n`);
