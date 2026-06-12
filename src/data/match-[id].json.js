import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Error reading ${filePath}: ${error.message}`);
    return null;
  }
}

function getMatchBundle(matchId) {
  const matches = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "matches.json"), "utf-8"));
  const match = matches.find((m) => m.id === matchId);

  if (!match) {
    throw new Error(`Match ${matchId} not found`);
  }

  return {
    meta: match,
    timeline: readJsonFile(path.join(DATA_DIR, "timelines", `${matchId}.json`)),
    teamStats: readJsonFile(path.join(DATA_DIR, "team-stats", `${matchId}.json`)),
    playerStats: readJsonFile(path.join(DATA_DIR, "player-stats", `${matchId}.json`)),
    powerRanking: readJsonFile(path.join(DATA_DIR, "power-ranking", `${matchId}.json`)),
  };
}

export default function () {
  const matchId = this.id;
  if (!matchId) {
    throw new Error("Match ID not provided");
  }
  return getMatchBundle(matchId);
}
