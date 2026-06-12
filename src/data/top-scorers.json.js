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

  const playerData = {};

  // Stats to sum across matches
  const sumStats = [
    "Goals",
    "Assists",
    "Passes",
    "PassesCompleted",
    "Penalties",
    "PenaltiesScored",
    "SpeedRuns",
    "Sprints",
    "TimePlayed",
    "TotalDistance",
    "DistanceHighSpeedRunning",
    "DistanceHighSpeedSprinting",
    "DistanceJogging",
    "DistanceLowSpeedSprinting",
    "DistanceWalking",
  ];

  // Stats to average across matches
  const avgStats = ["AvgSpeed", "Threat", "TopSpeed"];

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
        let team = getPlayerTeamFromPowerRanking(powerRankingData, playerId);
        if (!team) {
          team = getPlayerTeamFromTimeline(timelineData, playerId);
        }
        if (!team) {
          team = "Unknown";
        }

        if (!playerData[playerId]) {
          playerData[playerId] = {
            player: `Player ${playerId}`,
            team,
            matchesPlayed: 0,
            // Sum fields
            goals: 0,
            assists: 0,
            passes: 0,
            passesCompleted: 0,
            penalties: 0,
            penaltiesScored: 0,
            speedRuns: 0,
            sprints: 0,
            timePlayed: 0,
            totalDistance: 0,
            distanceHighSpeedRunning: 0,
            distanceHighSpeedSprinting: 0,
            distanceJogging: 0,
            distanceLowSpeedSprinting: 0,
            distanceWalking: 0,
            // Average fields (store as arrays for later averaging)
            avgSpeed: [],
            threat: [],
            topSpeed: [],
          };
        }

        // Increment match count
        playerData[playerId].matchesPlayed += 1;

        // Accumulate sum stats
        playerData[playerId].goals += getStatValue(stats, "Goals");
        playerData[playerId].assists += getStatValue(stats, "Assists");
        playerData[playerId].passes += getStatValue(stats, "Passes");
        playerData[playerId].passesCompleted += getStatValue(stats, "PassesCompleted");
        playerData[playerId].penalties += getStatValue(stats, "Penalties");
        playerData[playerId].penaltiesScored += getStatValue(stats, "PenaltiesScored");
        playerData[playerId].speedRuns += getStatValue(stats, "SpeedRuns");
        playerData[playerId].sprints += getStatValue(stats, "Sprints");
        playerData[playerId].timePlayed += getStatValue(stats, "TimePlayed");
        playerData[playerId].totalDistance += getStatValue(stats, "TotalDistance");
        playerData[playerId].distanceHighSpeedRunning += getStatValue(
          stats,
          "DistanceHighSpeedRunning"
        );
        playerData[playerId].distanceHighSpeedSprinting += getStatValue(
          stats,
          "DistanceHighSpeedSprinting"
        );
        playerData[playerId].distanceJogging += getStatValue(stats, "DistanceJogging");
        playerData[playerId].distanceLowSpeedSprinting += getStatValue(
          stats,
          "DistanceLowSpeedSprinting"
        );
        playerData[playerId].distanceWalking += getStatValue(stats, "DistanceWalking");

        // Collect average stats
        const avgSpeedVal = getStatValue(stats, "AvgSpeed");
        if (avgSpeedVal > 0) {
          playerData[playerId].avgSpeed.push(avgSpeedVal);
        }
        const threatVal = getStatValue(stats, "Threat");
        if (threatVal > 0) {
          playerData[playerId].threat.push(threatVal);
        }
        const topSpeedVal = getStatValue(stats, "TopSpeed");
        if (topSpeedVal > 0) {
          playerData[playerId].topSpeed.push(topSpeedVal);
        }

        // Update team if we had Unknown
        if (playerData[playerId].team === "Unknown" && team !== "Unknown") {
          playerData[playerId].team = team;
        }
      }
    } catch (error) {
      console.warn(`Error reading player stats for match ${match.id}: ${error.message}`);
    }
  }

  // Compute averages for average stats
  const result = Object.values(playerData).map((p) => ({
    player: p.player,
    team: p.team,
    matchesPlayed: p.matchesPlayed,
    goals: p.goals,
    assists: p.assists,
    passes: p.passes,
    passesCompleted: p.passesCompleted,
    penalties: p.penalties,
    penaltiesScored: p.penaltiesScored,
    speedRuns: p.speedRuns,
    sprints: p.sprints,
    timePlayed: Math.round(p.timePlayed),
    totalDistance: Math.round(p.totalDistance),
    distanceHighSpeedRunning: Math.round(p.distanceHighSpeedRunning),
    distanceHighSpeedSprinting: Math.round(p.distanceHighSpeedSprinting),
    distanceJogging: Math.round(p.distanceJogging),
    distanceLowSpeedSprinting: Math.round(p.distanceLowSpeedSprinting),
    distanceWalking: Math.round(p.distanceWalking),
    avgSpeed:
      p.avgSpeed.length > 0
        ? parseFloat((p.avgSpeed.reduce((a, b) => a + b) / p.avgSpeed.length).toFixed(2))
        : 0,
    threat:
      p.threat.length > 0
        ? parseFloat((p.threat.reduce((a, b) => a + b) / p.threat.length).toFixed(2))
        : 0,
    topSpeed:
      p.topSpeed.length > 0
        ? parseFloat((p.topSpeed.reduce((a, b) => a + b) / p.topSpeed.length).toFixed(2))
        : 0,
  }));

  // Sort by goals descending, then assists, then by player name
  result.sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.assists !== a.assists) return b.assists - a.assists;
    return a.player.localeCompare(b.player);
  });

  return result;
}
