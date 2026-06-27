<script>
  export let matchStats = {};
  export let homeTeam = '';
  export let awayTeam = '';

  const getTeamStats = (teamId, stats) => {
    const teamStats = stats[teamId] || [];
    const statMap = {};
    teamStats.forEach(([key, value]) => {
      statMap[key] = value;
    });
    return statMap;
  };

  const teamIds = Object.keys(matchStats);
  const homeTeamId = teamIds[0];
  const awayTeamId = teamIds[1];

  const homeStats = getTeamStats(homeTeamId, matchStats);
  const awayStats = getTeamStats(awayTeamId, matchStats);

  const possession = {
    home: (homeStats.Possession * 100).toFixed(1),
    away: (awayStats.Possession * 100).toFixed(1)
  };

  const xg = {
    home: (homeStats.XG || 0).toFixed(2),
    away: (awayStats.XG || 0).toFixed(2)
  };

  const passes = {
    home: homeStats.PassesCompleted && homeStats.Passes ?
      ((homeStats.PassesCompleted / homeStats.Passes) * 100).toFixed(0) : 0,
    away: awayStats.PassesCompleted && awayStats.Passes ?
      ((awayStats.PassesCompleted / awayStats.Passes) * 100).toFixed(0) : 0
  };
</script>

<div class="key-stats">
  <div class="stat-card">
    <div class="stat-name">Possession</div>
    <div class="stat-comparison">
      <div class="home" class:leading={possession.home > possession.away}>
        {possession.home}%
      </div>
      <div class="divider">:</div>
      <div class="away" class:leading={possession.away > possession.home}>
        {possession.away}%
      </div>
    </div>
  </div>

  <div class="stat-card">
    <div class="stat-name">xG (Expected Goals)</div>
    <div class="stat-comparison">
      <div class="home" class:leading={xg.home > xg.away}>
        {xg.home}
      </div>
      <div class="divider">:</div>
      <div class="away" class:leading={xg.away > xg.home}>
        {xg.away}
      </div>
    </div>
  </div>

  <div class="stat-card">
    <div class="stat-name">Pass Completion</div>
    <div class="stat-comparison">
      <div class="home" class:leading={passes.home > passes.away}>
        {passes.home}%
      </div>
      <div class="divider">:</div>
      <div class="away" class:leading={passes.away > passes.home}>
        {passes.away}%
      </div>
    </div>
  </div>
</div>

<style>
  .key-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    background: var(--color-bg-raised);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 1rem;
    text-align: center;
  }

  .stat-name {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
  }

  .stat-comparison {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 0.5rem;
  }

  .home,
  .away {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
    flex: 1;
    padding: 0.5rem 0;
  }

  .home {
    color: var(--color-home);
  }

  .away {
    color: var(--color-away);
  }

  .home.leading,
  .away.leading {
    font-weight: 800;
    font-size: 1.5rem;
  }

  .divider {
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--color-text-secondary);
  }
</style>
