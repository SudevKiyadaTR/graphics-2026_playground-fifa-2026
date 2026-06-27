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

  // In Possession phases
  const inPossession = [
    { name: 'Build Up Unopposed', home: homeStats.PhaseAggregateBuildUpUnopposed || 0, away: awayStats.PhaseAggregateBuildUpUnopposed || 0 },
    { name: 'Build Up Opposed', home: homeStats.PhaseAggregateBuildUpOpposed || 0, away: awayStats.PhaseAggregateBuildUpOpposed || 0 },
    { name: 'Progression', home: homeStats.PhaseAggregateProgression || 0, away: awayStats.PhaseAggregateProgression || 0 },
    { name: 'Final Third', home: homeStats.PhaseAggregateFinalThird || 0, away: awayStats.PhaseAggregateFinalThird || 0 },
    { name: 'Long Ball', home: homeStats.PhaseAggregateLongBall || 0, away: awayStats.PhaseAggregateLongBall || 0 },
    { name: 'Attacking Transition', home: homeStats.PhaseAggregateAttackingTransition || 0, away: awayStats.PhaseAggregateAttackingTransition || 0 },
    { name: 'Counter Attack', home: homeStats.PhaseAggregateCounterattack || 0, away: awayStats.PhaseAggregateCounterattack || 0 },
    { name: 'Set Piece', home: homeStats.PhaseAggregateSetPieces || 0, away: awayStats.PhaseAggregateSetPieces || 0 },
  ];

  // Out of Possession phases
  const outPossession = [
    { name: 'High Press', home: homeStats.PhaseAggregateHighPress || 0, away: awayStats.PhaseAggregateHighPress || 0 },
    { name: 'Mid Press', home: homeStats.PhaseAggregateMidPress || 0, away: awayStats.PhaseAggregateMidPress || 0 },
    { name: 'Low Press', home: homeStats.PhaseAggregateLowPress || 0, away: awayStats.PhaseAggregateLowPress || 0 },
    { name: 'High Block', home: homeStats.PhaseAggregateHighBlock || 0, away: awayStats.PhaseAggregateHighBlock || 0 },
    { name: 'Mid Block', home: homeStats.PhaseAggregateMidBlock || 0, away: awayStats.PhaseAggregateMidBlock || 0 },
    { name: 'Low Block', home: homeStats.PhaseAggregateLowBlock || 0, away: awayStats.PhaseAggregateLowBlock || 0 },
    { name: 'Recovery', home: homeStats.PhaseAggregateRecovery || 0, away: awayStats.PhaseAggregateRecovery || 0 },
    { name: 'Defensive Transition', home: homeStats.PhaseAggregateDefensiveTransition || 0, away: awayStats.PhaseAggregateDefensiveTransition || 0 },
    { name: 'Counter-press', home: homeStats.PhaseAggregateCounterPress || 0, away: awayStats.PhaseAggregateCounterPress || 0 },
  ];

  const formatTime = (val) => {
    const mins = Math.floor(val);
    const secs = Math.round((val - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
</script>

<div class="phases-container">
  <div class="phase-section">
    <h3>In Possession</h3>
    <div class="phase-list">
      {#each inPossession as phase (phase.name)}
        <div class="phase-row">
          <div class="phase-name">{phase.name}</div>
          <div class="phase-bars">
            <div class="bar home" style="width: {(phase.home / 60) * 100}%">
              {phase.home > 2 ? formatTime(phase.home) : ''}
            </div>
            <div class="bar away" style="width: {(phase.away / 60) * 100}%">
              {phase.away > 2 ? formatTime(phase.away) : ''}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="phase-section">
    <h3>Out of Possession</h3>
    <div class="phase-list">
      {#each outPossession as phase (phase.name)}
        <div class="phase-row">
          <div class="phase-name">{phase.name}</div>
          <div class="phase-bars">
            <div class="bar home" style="width: {(phase.home / 60) * 100}%">
              {phase.home > 2 ? formatTime(phase.home) : ''}
            </div>
            <div class="bar away" style="width: {(phase.away / 60) * 100}%">
              {phase.away > 2 ? formatTime(phase.away) : ''}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .phases-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .phase-section h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .phase-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .phase-row {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1rem;
    align-items: center;
  }

  .phase-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-transform: uppercase;
  }

  .phase-bars {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .bar {
    height: 20px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
    color: white;
    min-width: 2px;
    transition: width 0.3s ease;
  }

  .bar.home {
    background: var(--color-home);
  }

  .bar.away {
    background: var(--color-away);
  }

  @media (max-width: 900px) {
    .phases-container {
      grid-template-columns: 1fr;
    }
  }
</style>
