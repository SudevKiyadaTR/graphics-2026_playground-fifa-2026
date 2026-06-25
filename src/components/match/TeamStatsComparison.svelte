<script>
  export let matchStats = {};
  export let homeTeam = '';
  export let awayTeam = '';

  // ponytail: extract key stats from raw match-stats format
  const getTeamStats = (teamId, stats) => {
    const teamStats = stats[teamId] || [];
    const statMap = {};
    teamStats.forEach(([key, value]) => {
      statMap[key] = value;
    });
    return statMap;
  };

  // Find home and away team IDs from matchStats keys
  const teamIds = Object.keys(matchStats);
  const homeTeamId = teamIds[0];
  const awayTeamId = teamIds[1];

  const homeStats = getTeamStats(homeTeamId, matchStats);
  const awayStats = getTeamStats(awayTeamId, matchStats);

  // Key stats to display
  const keyStats = [
    { key: 'AttemptAtGoal', label: 'Shots' },
    { key: 'AttemptAtGoalOnTarget', label: 'Shots on Target' },
    { key: 'AttemptAtGoalBlocked', label: 'Blocked Shots' },
    { key: 'PassesAccurate', label: 'Accurate Passes' },
    { key: 'Fouls', label: 'Fouls' },
    { key: 'OffSide', label: 'Offsides' },
  ];

  const maxValue = (stat) => {
    const homeVal = homeStats[stat.key] || 0;
    const awayVal = awayStats[stat.key] || 0;
    return Math.max(homeVal, awayVal) || 1;
  };

  const getPercent = (value, max) => (value / max) * 100;
</script>

<div class="stats-grid">
  {#each keyStats as stat (stat.key)}
    <div class="stat-row">
      <div class="stat-label">{stat.label}</div>
      <div class="stat-bars">
        <div class="bar-group home">
          <div class="bar" style="width: {getPercent(homeStats[stat.key] || 0, maxValue(stat))}%"></div>
          <div class="stat-value">{homeStats[stat.key] || 0}</div>
        </div>
        <div class="bar-group away">
          <div class="stat-value">{awayStats[stat.key] || 0}</div>
          <div class="bar" style="width: {getPercent(awayStats[stat.key] || 0, maxValue(stat))}%"></div>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .stat-row {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 1rem;
    align-items: center;
  }

  .stat-label {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .stat-bars {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: center;
  }

  .bar-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .bar-group.home {
    justify-content: flex-end;
  }

  .bar-group.away {
    justify-content: flex-start;
  }

  .bar {
    height: 24px;
    background: var(--color-home);
    border-radius: 4px;
    min-width: 4px;
    transition: width 0.3s ease;
  }

  .bar-group.away .bar {
    background: var(--color-away);
  }

  .stat-value {
    font-weight: 700;
    min-width: 30px;
    text-align: center;
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }
</style>
