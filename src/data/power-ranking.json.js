import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data/matches");

// Build a map of matchId -> power ranking data
const powerRankingMap = {};

try {
  const matchDirs = fs.readdirSync(DATA_DIR);

  matchDirs.forEach((matchId) => {
    const powerRankingPath = path.join(DATA_DIR, matchId, "power-ranking.json");

    if (fs.existsSync(powerRankingPath)) {
      try {
        const powerRankingData = JSON.parse(fs.readFileSync(powerRankingPath, "utf-8"));
        powerRankingMap[matchId] = powerRankingData;
      } catch {
        // Skip invalid JSON
      }
    }
  });
} catch {
  // Skip if directory doesn't exist
}

process.stdout.write(`${JSON.stringify(powerRankingMap)}\n`);
