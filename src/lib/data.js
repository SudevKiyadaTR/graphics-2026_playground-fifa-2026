import fs from 'fs';
import path from 'path';

const SCRAPED_DATA_DIR = './scraped-data';

export function loadMatches() {
  const filePath = path.join(SCRAPED_DATA_DIR, 'matches.json');
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function buildPlayerNameMap() {
  const matches = loadMatches();
  const nameMap = new Map();
  const teamNameMap = new Map(); // Cache team names by ID

  matches.forEach((match) => {
    const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', match.id);
    const liveDataPath = path.join(matchDir, 'live.json');

    if (!fs.existsSync(liveDataPath)) return;

    const liveData = JSON.parse(fs.readFileSync(liveDataPath, 'utf-8'));

    const teams = [liveData.HomeTeam, liveData.AwayTeam].filter(Boolean);
    teams.forEach((team) => {
      const teamId = team.IdTeam;
      const teamName = Array.isArray(team.TeamName)
        ? team.TeamName[0]?.Description || `Team ${teamId}`
        : String(team.TeamName || `Team ${teamId}`);
      teamNameMap.set(teamId, teamName);

      if (team.Players && Array.isArray(team.Players)) {
        team.Players.forEach((player) => {
          if (!nameMap.has(player.IdPlayer)) {
            const playerName = player.PlayerName?.[0]?.Description || `Player ${player.IdPlayer}`;
            nameMap.set(player.IdPlayer, {
              name: playerName,
              teamId: teamId,
              teamName: teamName,
            });
          }
        });
      }
    });
  });

  return { nameMap, teamNameMap };
}

export function loadAllPlayerStats() {
  const matches = loadMatches();
  const { nameMap } = buildPlayerNameMap();
  const playerMap = new Map();

  matches.forEach((match) => {
    const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', match.id);
    const playerStatsPath = path.join(matchDir, 'player-stats.json');

    if (!fs.existsSync(playerStatsPath)) return;

    const playerStatsRaw = JSON.parse(fs.readFileSync(playerStatsPath, 'utf-8'));

    Object.entries(playerStatsRaw).forEach(([playerId, stats]) => {
      const goalsEntry = stats.find((s) => s[0] === 'Goals');
      const goals = goalsEntry ? goalsEntry[1] : 0;

      const assistsEntry = stats.find((s) => s[0] === 'Assists');
      const assists = assistsEntry ? assistsEntry[1] : 0;

      if (goals > 0 || assists > 0) {
        if (!playerMap.has(playerId)) {
          const nameInfo = nameMap.get(playerId);
          const playerName = String(nameInfo?.name || `Player ${playerId}`);
          const teamName = String(nameInfo?.teamName || 'Unknown');

          playerMap.set(playerId, {
            id: String(playerId),
            name: playerName,
            team: teamName,
            goals: 0,
            assists: 0,
            matches: 0,
          });
        }

        const player = playerMap.get(playerId);
        player.goals += goals;
        player.assists += assists;
        player.matches += 1;
      }
    });
  });

  return Array.from(playerMap.values())
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals);
}

export function getMatchById(id) {
  const matches = loadMatches();
  return matches.find((m) => m.id === id);
}

export function getMatchPlayerStats(matchId) {
  const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', matchId);
  const playerStatsPath = path.join(matchDir, 'player-stats.json');

  if (!fs.existsSync(playerStatsPath)) return {};

  return JSON.parse(fs.readFileSync(playerStatsPath, 'utf-8'));
}

export function getMatchStats(matchId) {
  const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', matchId);
  const statsPath = path.join(matchDir, 'match-stats.json');
  if (!fs.existsSync(statsPath)) return {};
  return JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
}

export function getTeamStats(matchId) {
  const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', matchId);
  const statsPath = path.join(matchDir, 'team-stats.json');
  if (!fs.existsSync(statsPath)) return {};
  return JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
}

export function getMatchTimeline(matchId) {
  const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', matchId);
  const timelinePath = path.join(matchDir, 'timeline.json');
  if (!fs.existsSync(timelinePath)) return [];
  return JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
}

export function getMatchLive(matchId) {
  const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', matchId);
  const livePath = path.join(matchDir, 'live.json');
  if (!fs.existsSync(livePath)) return {};
  return JSON.parse(fs.readFileSync(livePath, 'utf-8'));
}
