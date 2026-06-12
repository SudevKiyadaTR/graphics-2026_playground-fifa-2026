import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");

function getStatValue(stats, statName) {
  const stat = stats.find((s) => s[0] === statName);
  return stat ? stat[1] : 0;
}

function getLocalizedDescription(entries) {
  return (
    entries?.find((entry) => entry.locale === "en-GB")?.description || entries?.[0]?.description
  );
}

function getPlayerTeamFromPowerRanking(powerRankingData, playerId) {
  if (!powerRankingData || !powerRankingData.outfieldPlayers) {
    return null;
  }

  const player = powerRankingData.outfieldPlayers.find((p) => p.playerId === Number(playerId));
  if (player) {
    return getLocalizedDescription(player.teamName) || "Unknown";
  }

  return null;
}

function getPlayerTeamFromTimeline(timelineData, playerId) {
  if (!timelineData) return null;

  const events = Array.isArray(timelineData) ? timelineData : timelineData.Event || [];

  for (const event of events) {
    if (String(event.IdPlayer) === String(playerId)) {
      const description = event.EventDescription?.find(
        (entry) => entry.Locale === "en-GB"
      )?.Description;
      if (description) {
        const match = description.match(/^.+? \((.+?)\)/);
        if (match) {
          return match[1].trim();
        }
      }
    }
  }

  return null;
}

export default function () {
  const matches = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "matches.json"), "utf-8"));

  const scorers = {};

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const matchDir = path.join(DATA_DIR, "matches", String(match.id));
    const statsFile = path.join(matchDir, "player-stats.json");
    if (!fs.existsSync(statsFile)) {
      continue;
    }

    let powerRankingData = null;
    const powerRankingFile = path.join(matchDir, "power-ranking.json");
    if (fs.existsSync(powerRankingFile)) {
      powerRankingData = JSON.parse(fs.readFileSync(powerRankingFile, "utf-8"));
    }

    let timelineData = null;
    const timelineFile = path.join(matchDir, "timeline.json");
    if (fs.existsSync(timelineFile)) {
      timelineData = JSON.parse(fs.readFileSync(timelineFile, "utf-8"));
    }

    try {
      const allPlayerStats = JSON.parse(fs.readFileSync(statsFile, "utf-8"));

      for (const [playerId, stats] of Object.entries(allPlayerStats)) {
        const goals = getStatValue(stats, "Goals");
        const assists = getStatValue(stats, "Assists");

        if (goals === 0 && assists === 0) {
          continue;
        }

        let team = getPlayerTeamFromPowerRanking(powerRankingData, playerId);
        if (!team) {
          team = getPlayerTeamFromTimeline(timelineData, playerId);
        }
        if (!team) {
          team = "Unknown";
        }

        if (!scorers[playerId]) {
          scorers[playerId] = {
            player: `Player ${playerId}`,
            team,
            goals: 0,
            assists: 0,
          };
        }

        scorers[playerId].goals += goals;
        scorers[playerId].assists += assists;

        if (scorers[playerId].team === "Unknown" && team !== "Unknown") {
          scorers[playerId].team = team;
        }
      }
    } catch (error) {
      console.warn(`Error reading player stats for match ${match.id}: ${error.message}`);
    }
  }

  const result = Object.values(scorers).sort((a, b) => {
    if (b.goals !== a.goals) {
      return b.goals - a.goals;
    }
    if (b.assists !== a.assists) {
      return b.assists - a.assists;
    }
    return a.player.localeCompare(b.player);
  });

  return result;
}
