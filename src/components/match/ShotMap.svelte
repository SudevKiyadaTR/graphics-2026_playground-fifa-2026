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

  // Shot stats we have
  const shotTypes = [
    { key: 'AttemptAtGoalOnTarget', label: 'On Target' },
    { key: 'AttemptAtGoalOffTarget', label: 'Off Target' },
    { key: 'AttemptAtGoalBlocked', label: 'Blocked' },
  ];

  const getHomeShots = () => shotTypes.reduce((sum, s) => sum + (homeStats[s.key] || 0), 0);
  const getAwayShots = () => shotTypes.reduce((sum, s) => sum + (awayStats[s.key] || 0), 0);
</script>

<div class="shot-map-container">
  <svg viewBox="0 0 1200 800" class="field">
    <!-- Field -->
    <rect x="50" y="50" width="1100" height="700" fill="var(--color-field, #0d5f3b)" stroke="white" stroke-width="2" />

    <!-- Center line -->
    <line x1="600" y1="50" x2="600" y2="750" stroke="white" stroke-width="2" />

    <!-- Center circle -->
    <circle cx="600" cy="400" r="90" fill="none" stroke="white" stroke-width="2" />
    <circle cx="600" cy="400" r="4" fill="white" />

    <!-- Home goal area -->
    <rect x="50" y="250" width="150" height="300" fill="none" stroke="white" stroke-width="2" />

    <!-- Away goal area -->
    <rect x="1000" y="250" width="150" height="300" fill="none" stroke="white" stroke-width="2" />

    <!-- Home penalty area -->
    <rect x="50" y="150" width="270" height="500" fill="none" stroke="white" stroke-width="2" />

    <!-- Away penalty area -->
    <rect x="880" y="150" width="270" height="500" fill="none" stroke="white" stroke-width="2" />

    <!-- Home shots (left side) -->
    <g class="shots-home">
      {#each Array(getHomeShots()) as _, i}
        <!-- ponytail: random-ish placement for visualization (placeholder positions) -->
        <circle
          cx={150 + ((i * 73) % 400)}
          cy={150 + ((i * 127) % 500)}
          r="8"
          fill="var(--color-home)"
          opacity="0.7"
          class="shot-marker"
        />
      {/each}
    </g>

    <!-- Away shots (right side) -->
    <g class="shots-away">
      {#each Array(getAwayShots()) as _, i}
        <circle
          cx={900 - ((i * 73) % 400)}
          cy={150 + ((i * 127) % 500)}
          r="8"
          fill="var(--color-away)"
          opacity="0.7"
          class="shot-marker"
        />
      {/each}
    </g>
  </svg>

  <div class="shot-legend">
    <div class="legend-group">
      <div class="legend-item">
        <div class="dot home"></div>
        <span>{homeTeam}: {getHomeShots()} shots</span>
      </div>
      <div class="legend-item">
        <div class="dot away"></div>
        <span>{awayTeam}: {getAwayShots()} shots</span>
      </div>
    </div>
    <div class="legend-detail">
      {#each shotTypes as shot}
        <div class="detail-row">
          <span>{shot.label}:</span>
          <span class="home-stat">{homeStats[shot.key] || 0}</span>
          <span class="separator">vs</span>
          <span class="away-stat">{awayStats[shot.key] || 0}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .shot-map-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    width: 100%;
    aspect-ratio: 3 / 2;
    background: var(--color-bg-raised);
    border-radius: 4px;
  }

  .shot-marker {
    transition: r 0.2s;
    cursor: pointer;
  }

  .shot-marker:hover {
    r: 12;
  }

  .shot-legend {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--color-bg-raised);
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .legend-group {
    display: flex;
    gap: 1.5rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .dot.home {
    background: var(--color-home);
  }

  .dot.away {
    background: var(--color-away);
  }

  .legend-detail {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .detail-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .separator {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }

  .home-stat {
    color: var(--color-home);
    font-weight: 600;
  }

  .away-stat {
    color: var(--color-away);
    font-weight: 600;
  }
</style>
