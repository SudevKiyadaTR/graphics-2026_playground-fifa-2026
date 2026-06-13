import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");

const matchesDir = path.join(DATA_DIR, "matches");
const liveData = {};

if (fs.existsSync(matchesDir)) {
  const matchIds = fs.readdirSync(matchesDir);

  matchIds.forEach((matchId) => {
    const liveFilePath = path.join(matchesDir, matchId, "live.json");
    try {
      if (fs.existsSync(liveFilePath)) {
        liveData[matchId] = JSON.parse(fs.readFileSync(liveFilePath, "utf-8"));
      }
    } catch (error) {
      console.warn(`Could not load live data for match ${matchId}: ${error.message}`);
    }
  });
}

process.stdout.write(`${JSON.stringify(liveData)}\n`);
