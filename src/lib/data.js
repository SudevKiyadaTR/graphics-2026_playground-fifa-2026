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
  const data = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
  return data.Event || [];
}

export function loadPlayerStatsPerMatch() {
  const matches = loadMatches();
  const { nameMap } = buildPlayerNameMap();
  const rows = [];

  matches.forEach((match) => {
    const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', match.id);
    const playerStatsPath = path.join(matchDir, 'player-stats.json');
    if (!fs.existsSync(playerStatsPath)) return;

    const raw = JSON.parse(fs.readFileSync(playerStatsPath, 'utf-8'));
    Object.entries(raw).forEach(([playerId, stats]) => {
      const nameInfo = nameMap.get(playerId);
      const row = {
        matchId: match.id,
        playerName: nameInfo?.name || `Player ${playerId}`,
        teamName: nameInfo?.teamName || 'Unknown',
      };
      stats.forEach(([key, value]) => {
        row[key] = value;
      });
      rows.push(row);
    });
  });

  return rows;
}

export function loadPlayerStatsConsolidated() {
  const matches = loadMatches();
  const { nameMap } = buildPlayerNameMap();
  const playerMap = new Map();

  matches.forEach((match) => {
    const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', match.id);
    const playerStatsPath = path.join(matchDir, 'player-stats.json');
    if (!fs.existsSync(playerStatsPath)) return;

    const raw = JSON.parse(fs.readFileSync(playerStatsPath, 'utf-8'));
    Object.entries(raw).forEach(([playerId, stats]) => {
      if (!playerMap.has(playerId)) {
        const nameInfo = nameMap.get(playerId);
        playerMap.set(playerId, {
          playerName: nameInfo?.name || `Player ${playerId}`,
          teamName: nameInfo?.teamName || 'Unknown',
          matchCount: 0,
        });
      }
      const player = playerMap.get(playerId);
      player.matchCount += 1;
      stats.forEach(([key, value]) => {
        if (typeof value === 'number') {
          player[key] = (player[key] ?? 0) + value;
        }
      });
    });
  });

  return Array.from(playerMap.values()).sort((a, b) => (b.Goals ?? 0) - (a.Goals ?? 0));
}

export function loadGoalkeeperStats() {
  const matches = loadMatches();
  const { nameMap } = buildPlayerNameMap();
  const gkMap = new Map();

  // Build GK ID set from all live.json files
  const gkIds = new Set();
  matches.forEach((match) => {
    const livePath = path.join(SCRAPED_DATA_DIR, 'matches', match.id, 'live.json');
    if (!fs.existsSync(livePath)) return;
    const live = JSON.parse(fs.readFileSync(livePath, 'utf-8'));
    [live.HomeTeam, live.AwayTeam].filter(Boolean).forEach((team) => {
      (team.Players || []).forEach((p) => {
        if (p.Position === 0) gkIds.add(p.IdPlayer);
      });
    });
  });

  const SUM_KEYS = [
    'GoalkeeperSaves', 'GoalkeeperSavesOnTarget', 'GoalKicks',
    'GoalkeeperDefensiveActionsInsidePenaltyArea', 'GoalkeeperDefensiveActionsOutsidePenaltyArea',
    'DistributionsCompletedUnderPressure', 'DistributionsUnderPressure',
    'Passes', 'PassesCompleted', 'TimePlayed',
  ];

  matches.forEach((match) => {
    const psPath = path.join(SCRAPED_DATA_DIR, 'matches', match.id, 'player-stats.json');
    if (!fs.existsSync(psPath)) return;
    const raw = JSON.parse(fs.readFileSync(psPath, 'utf-8'));

    gkIds.forEach((gkId) => {
      if (!raw[gkId]) return;
      const stats = Object.fromEntries(raw[gkId].map(([k, v]) => [k, v]));

      if (!gkMap.has(gkId)) {
        const nameInfo = nameMap.get(gkId);
        gkMap.set(gkId, {
          playerId: String(gkId),
          playerName: nameInfo?.name || `Player ${gkId}`,
          teamName: nameInfo?.teamName || 'Unknown',
          matchCount: 0,
          ...Object.fromEntries(SUM_KEYS.map((k) => [k, 0])),
          shotsOnTargetFaced: 0,
        });
      }
      const gk = gkMap.get(gkId);
      gk.matchCount += 1;
      SUM_KEYS.forEach((k) => { gk[k] += stats[k] ?? 0; });
      // infer shots-on-target faced: saves / savePercentage
      const sp = stats.GoalkeeperSavePercentage;
      const sv = stats.GoalkeeperSaves ?? 0;
      if (sp > 0 && sv > 0) gk.shotsOnTargetFaced += sv / sp;
    });
  });

  return Array.from(gkMap.values())
    .filter((gk) => gk.matchCount > 0)
    .map((gk) => ({
      ...gk,
      savePercentage: gk.shotsOnTargetFaced > 0
        ? gk.GoalkeeperSaves / gk.shotsOnTargetFaced
        : null,
      distributionAccuracy: gk.DistributionsUnderPressure > 0
        ? gk.DistributionsCompletedUnderPressure / gk.DistributionsUnderPressure
        : null,
      passAccuracy: gk.Passes > 0 ? gk.PassesCompleted / gk.Passes : null,
      totalDefensiveActions: gk.GoalkeeperDefensiveActionsInsidePenaltyArea + gk.GoalkeeperDefensiveActionsOutsidePenaltyArea,
    }))
    .sort((a, b) => b.GoalkeeperSaves - a.GoalkeeperSaves);
}

export function getMatchLive(matchId) {
  const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', matchId);
  const livePath = path.join(matchDir, 'live.json');
  if (!fs.existsSync(livePath)) return {};
  return JSON.parse(fs.readFileSync(livePath, 'utf-8'));
}

function parseMinute(str) {
  if (!str) return null;
  const clean = str.replace(/'/g, '');
  const [base, extra] = clean.split('+');
  return parseInt(base, 10) + (extra ? parseInt(extra, 10) : 0);
}

export function loadAllGoals() {
  const matches = loadMatches();
  const goals = [];

  matches.forEach((match) => {
    const matchDir = path.join(SCRAPED_DATA_DIR, 'matches', match.id);
    const timelinePath = path.join(matchDir, 'timeline.json');
    const livePath = path.join(matchDir, 'live.json');
    if (!fs.existsSync(timelinePath) || !fs.existsSync(livePath)) return;

    const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
    const live = JSON.parse(fs.readFileSync(livePath, 'utf-8'));

    const homeName = live.HomeTeam?.TeamName?.[0]?.Description || 'Home';
    const awayName = live.AwayTeam?.TeamName?.[0]?.Description || 'Away';
    const dateStr = (live.LocalDate || live.Date || '').slice(0, 10) || null;
    const duration = parseMinute(live.MatchTime);

    (timeline.Event || [])
      .filter((e) => e.Type === 0)
      .forEach((e) => {
        const desc = e.EventDescription?.[0]?.Description || '';
        const scorer = desc.match(/^([^(]+)/)?.[1]?.trim() || null;
        goals.push({
          matchId: match.id,
          date: dateStr,
          matchName: `${homeName} v ${awayName}`,
          minute: parseMinute(e.MatchMinute),
          rawMinute: e.MatchMinute ?? null,
          period: e.Period,
          goalId: e.EventId,
          duration,
          scorer,
        });
      });
  });

  goals.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return (a.minute ?? 0) - (b.minute ?? 0);
  });
  return goals;
}
