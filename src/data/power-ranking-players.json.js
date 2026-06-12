import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");
const MATCHES_DIR = path.join(DATA_DIR, "matches");

// NOTE: The authoritative source for player names and team assignments is the live match endpoint:
//   https://api.fifa.com/api/v3/live/football/{matchId}?language=en
// This returns full squad rosters with player IDs, names, positions, and teams.
// The current implementation falls back to power-ranking.json and timeline.json,
// which do not always include all players (e.g. substitutes without events).
// Consider adding a scraped-data/matches/{id}/live.json file populated from this endpoint.

function getLocalizedDescription(entries) {
  return (
    entries?.find((entry) => entry.locale === "en-GB")?.description || entries?.[0]?.description
  );
}

function extractTimelinePlayerName(description) {
  if (!description) {
    return null;
  }

  const directMatch = description.match(/^(.+?) \(/);
  if (directMatch) {
    return directMatch[1].trim();
  }

  const assistedByMatch = description.match(/Assisted by (.+?)\.?$/);
  if (assistedByMatch) {
    return assistedByMatch[1].trim();
  }

  return null;
}

const playerLookup = {};

if (fs.existsSync(MATCHES_DIR)) {
  for (const matchId of fs.readdirSync(MATCHES_DIR).sort()) {
    const matchDir = path.join(MATCHES_DIR, matchId);
    const stats = fs.statSync(matchDir);
    if (!stats.isDirectory()) continue;

    // Read power-ranking.json
    const powerRankingPath = path.join(matchDir, "power-ranking.json");
    if (fs.existsSync(powerRankingPath)) {
      const content = JSON.parse(fs.readFileSync(powerRankingPath, "utf-8"));

      for (const player of content.outfieldPlayers || []) {
        playerLookup[player.playerId] = {
          playerName: getLocalizedDescription(player.playerName) || `Player ${player.playerId}`,
          teamName: getLocalizedDescription(player.teamName) || "Unknown",
        };
      }
    }

    // Read timeline.json
    const timelinePath = path.join(matchDir, "timeline.json");
    if (fs.existsSync(timelinePath)) {
      const timeline = JSON.parse(fs.readFileSync(timelinePath, "utf-8"));
      const events = Array.isArray(timeline) ? timeline : timeline.Event || [];

      for (const event of events) {
        const description = event.EventDescription?.find(
          (entry) => entry.Locale === "en-GB"
        )?.Description;
        const playerName = extractTimelinePlayerName(description);
        const playerId = Number(event.IdPlayer);

        if (playerId && playerName && !playerLookup[playerId]) {
          playerLookup[playerId] = { playerName, teamName: "Unknown" };
        }
      }
    }
  }
}

process.stdout.write(`${JSON.stringify(playerLookup)}\n`);
