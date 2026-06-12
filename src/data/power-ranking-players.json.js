import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");
const MATCHES_DIR = path.join(DATA_DIR, "matches");

function getLocalizedDescription(entries) {
  return (
    entries?.find((entry) => entry.Locale === "en-GB")?.Description ||
    entries?.find((entry) => entry.locale === "en-GB")?.description ||
    entries?.[0]?.Description ||
    entries?.[0]?.description
  );
}

const playerLookup = {};

if (fs.existsSync(MATCHES_DIR)) {
  for (const matchId of fs.readdirSync(MATCHES_DIR).sort()) {
    const matchDir = path.join(MATCHES_DIR, matchId);
    if (!fs.statSync(matchDir).isDirectory()) continue;

    // Primary source: live.json — full squad rosters from live/football/{matchId}
    const livePath = path.join(matchDir, "live.json");
    if (fs.existsSync(livePath)) {
      const live = JSON.parse(fs.readFileSync(livePath, "utf-8"));
      if (!live) continue; // null/empty response

      const teamName = (side) => getLocalizedDescription(live[side]?.TeamName) || "Unknown";

      for (const side of ["HomeTeam", "AwayTeam"]) {
        const team = teamName(side);
        for (const player of live[side]?.Players || []) {
          const id = Number(player.IdPlayer);
          if (!id) continue;
          playerLookup[id] = {
            playerName: getLocalizedDescription(player.PlayerName) || `Player ${id}`,
            teamName: team,
          };
        }
      }
      continue; // live.json covers all players for this match
    }

    // Fallback: power-ranking.json (uses lowercase locale/description keys)
    const powerRankingPath = path.join(matchDir, "power-ranking.json");
    if (fs.existsSync(powerRankingPath)) {
      const content = JSON.parse(fs.readFileSync(powerRankingPath, "utf-8"));
      for (const player of content.outfieldPlayers || []) {
        const id = player.playerId;
        if (!playerLookup[id]) {
          playerLookup[id] = {
            playerName: getLocalizedDescription(player.playerName) || `Player ${id}`,
            teamName: getLocalizedDescription(player.teamName) || "Unknown",
          };
        }
      }
    }
  }
}

process.stdout.write(`${JSON.stringify(playerLookup)}\n`);
