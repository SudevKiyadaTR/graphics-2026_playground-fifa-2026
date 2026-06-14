import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");

const matchPlayerStats = {};

try {
  const matchesPath = path.join(DATA_DIR, "matches.json");
  const matches = JSON.parse(fs.readFileSync(matchesPath, "utf-8"));

  for (const match of matches) {
    const matchId = String(match.id);
    const playerStatsPath = path.join(DATA_DIR, "matches", matchId, "player-stats.json");

    if (fs.existsSync(playerStatsPath)) {
      try {
        const playerStats = JSON.parse(fs.readFileSync(playerStatsPath, "utf-8"));
        matchPlayerStats[matchId] = playerStats;
      } catch (e) {
        console.warn(`Could not parse player stats for match ${matchId}:`, e.message);
      }
    }
  }
} catch (e) {
  console.warn("Could not load match player stats:", e.message);
}

process.stdout.write(`${JSON.stringify(matchPlayerStats)}\n`);
