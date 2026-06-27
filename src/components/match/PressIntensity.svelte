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

  // Total pressures
  const totalPressures = {
    home: homeStats.DefensivePressuresApplied || 0,
    away: awayStats.DefensivePressuresApplied || 0
  };

  // Direct pressures (higher intensity)
  const directPressures = {
    home: homeStats.DirectDefensivePressuresApplied || 0,
    away: awayStats.DirectDefensivePressuresApplied || 0
  };

  // Indirect pressures
  const indirectPressures = {
    home: Math.max(0, (totalPressures.home || 0) - (directPressures.home || 0)),
    away: Math.max(0, (totalPressures.away || 0) - (directPressures.away || 0))
  };

  // Forced turnovers
  const turnovers = {
    home: homeStats.ForcedTurnovers || 0,
    away: awayStats.ForcedTurnovers || 0
  };

  // Pass accuracy under pressure
  const passingUnderPressure = {
    home: homeStats.DistributionsUnderPressure && homeStats.DistributionsCompletedUnderPressure
      ? ((homeStats.DistributionsCompletedUnderPressure / homeStats.DistributionsUnderPressure) * 100).toFixed(0)
      : 0,
    away: awayStats.DistributionsUnderPressure && awayStats.DistributionsCompletedUnderPressure
      ? ((awayStats.DistributionsCompletedUnderPressure / awayStats.DistributionsUnderPressure) * 100).toFixed(0)
      : 0
  };
</script>

<div class="container">
  <div class="section">
    <h3>Defensive Pressure</h3>

    <div class="pressure-bars">
      <div class="bar-group">
        <div class="team-label home">{homeTeam}</div>
        <div class="bar-container">
          <div class="bar">
            <div class="segment direct" style="width: {(directPressures.home / Math.max(totalPressures.home, totalPressures.away) || 0) * 100}%"></div>
            <div class="segment indirect" style="width: {(indirectPressures.home / Math.max(totalPressures.home, totalPressures.away) || 0) * 100}%"></div>
          </div>
          <span class="value">{totalPressures.home}</span>
        </div>
      </div>

      <div class="bar-group">
        <div class="team-label away">{awayTeam}</div>
        <div class="bar-container">
          <div class="bar">
            <div class="segment direct" style="width: {(directPressures.away / Math.max(totalPressures.home, totalPressures.away) || 0) * 100}%"></div>
            <div class="segment indirect" style="width: {(indirectPressures.away / Math.max(totalPressures.home, totalPressures.away) || 0) * 100}%"></div>
          </div>
          <span class="value">{totalPressures.away}</span>
        </div>
      </div>
    </div>

    <div class="legend">
      <span><span class="dot direct"></span> Direct</span>
      <span><span class="dot indirect"></span> Indirect</span>
    </div>
  </div>

  <div class="section">
    <h3>Possession Quality</h3>

    <div class="stats-grid">
      <div class="stat">
        <div class="label">Forced Turnovers</div>
        <div class="values">
          <span class="home">{turnovers.home}</span>
          <span class="divider">:</span>
          <span class="away">{turnovers.away}</span>
        </div>
      </div>

      <div class="stat">
        <div class="label">Pass Accuracy Under Pressure</div>
        <div class="values">
          <span class="home">{passingUnderPressure.home}%</span>
          <span class="divider">:</span>
          <span class="away">{passingUnderPressure.away}%</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  h3 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .pressure-bars {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .bar-group {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .team-label {
    width: 60px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .team-label.home {
    color: var(--color-home);
  }

  .team-label.away {
    color: var(--color-away);
  }

  .bar-container {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex: 1;
  }

  .bar {
    flex: 1;
    height: 24px;
    background: var(--color-bg-raised);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
  }

  .segment {
    height: 100%;
    transition: width 0.2s;
  }

  .segment.direct {
    background: var(--color-accent-3);
  }

  .segment.indirect {
    background: var(--color-neutral);
    opacity: 0.5;
  }

  .value {
    min-width: 35px;
    text-align: right;
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: 0.875rem;
  }

  .legend {
    display: flex;
    gap: var(--space-lg);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    margin-right: 4px;
  }

  .dot.direct {
    background: var(--color-accent-3);
  }

  .dot.indirect {
    background: var(--color-neutral);
    opacity: 0.5;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  .stat {
    background: var(--color-bg-raised);
    border-radius: 4px;
    padding: var(--space-sm);
    text-align: center;
  }

  .label {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin-bottom: var(--space-xs);
  }

  .values {
    display: flex;
    align-items: center;
    justify-content: space-around;
    font-weight: 600;
    font-size: 1rem;
  }

  .home {
    color: var(--color-home);
  }

  .away {
    color: var(--color-away);
  }

  .divider {
    color: var(--color-text-secondary);
    font-weight: 300;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
