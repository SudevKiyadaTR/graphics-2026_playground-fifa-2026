import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");

function getStatValue(stats, statName) {
  const stat = stats.find((s) => s[0] === statName);
  return stat ? stat[1] : 0;
}

export default function () {
  const matches = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "matches.json"), "utf-8")
  );

  const scorers = {};

  const playerStatsDir = path.join(DATA_DIR, "player-stats");
  if (!fs.existsSync(playerStatsDir)) {
    return [];
  }

  matches.forEach((match) => {
    if (!match.propertyId) {
      return;
    }

    const statsFile = path.join(playerStatsDir, `${match.id}.json`);
    if (!fs.existsSync(statsFile)) {
      return;
    }

    try {
      const allPlayerStats = JSON.parse(
        fs.readFileSync(statsFile, "utf-8")
      );

      const homeTeam = match.homeTeam;
      const awayTeam = match.awayTeam;

      Object.entries(allPlayerStats).forEach(([playerId, stats]) => {
        const goals = getStatValue(stats, "Goals");
        const assists = getStatValue(stats, "Assists");

        if (goals === 0 && assists === 0) {
          return;
        }

        const playerName = playerId;

        [
          { team: homeTeam, goals, assists },
          { team: awayTeam, goals, assists },
        ].forEach(({ team, goals: g, assists: a }) => {
          const key = `${playerName}_${team}`;

          if (!scorers[key]) {
            scorers[key] = {
              player: `Player ${playerName}`,
              team,
              goals: 0,
              assists: 0,
            };
          }

          scorers[key].goals += g;
          scorers[key].assists += a;
        });
      });
    } catch (error) {
      console.warn(`Error reading player stats for match ${match.id}`);
    }
  });

  const result = Object.values(scorers).sort((a, b) => {
    if (b.goals !== a.goals) {
      return b.goals - a.goals;
    }
    return b.assists - a.assists;
  });

  return result;
}
