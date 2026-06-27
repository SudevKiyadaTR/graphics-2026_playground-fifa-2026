<script>
  export let matchStats = {};
  export let timeline = [];
  export let homeTeam = '';
  export let awayTeam = '';
  export let homeScore = 0;
  export let awayScore = 0;

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

  // Extract shots from timeline
  const shots = (Array.isArray(timeline) ? timeline : [])
    .filter(e => e.Type === 12 || e.Type === 0) // 12=attempt, 0=goal
    .map(e => ({
      x: (e.PositionX !== undefined ? e.PositionX : 50) * 1.5,
      y: e.PositionY !== undefined ? e.PositionY : 50,
      isGoal: e.Type === 0,
      team: String(e.IdTeam),
      isHome: String(e.IdTeam) === homeTeamId
    }))
    .filter(s => s.x !== undefined && s.y !== undefined);

  const homeShots = shots.filter(s => s.isHome);
  const awayShots = shots.filter(s => !s.isHome);

  // Stats summary
  const goals = {
    home: homeScore,
    away: awayScore
  };

  const onTarget = {
    home: homeStats.AttemptAtGoalOnTarget || 0,
    away: awayStats.AttemptAtGoalOnTarget || 0
  };

  const offTarget = {
    home: homeStats.AttemptAtGoalOffTarget || 0,
    away: awayStats.AttemptAtGoalOffTarget || 0
  };

  const blocked = {
    home: homeStats.AttemptAtGoalBlocked || 0,
    away: awayStats.AttemptAtGoalBlocked || 0
  };
</script>

<div class="container">
  <svg class="pitch" viewBox="0 0 150 100" preserveAspectRatio="xMidYMid meet">
    <!-- Pitch background -->
    <rect width="150" height="100" fill="var(--color-field)" />

    <!-- Field markings -->
    <line x1="75" y1="0" x2="75" y2="100" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />
    <circle cx="75" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />
    <circle cx="75" cy="50" r="0.75" fill="rgba(255,255,255,0.4)" />

    <!-- Penalty areas -->
    <rect x="0" y="17.5" width="24.75" height="65" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />
    <rect x="125.25" y="17.5" width="24.75" height="65" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />

    <!-- Goal areas -->
    <rect x="0" y="32" width="8.25" height="36" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />
    <rect x="141.75" y="32" width="8.25" height="36" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />

    <!-- Home team shots (blue) -->
    {#each homeShots as shot}
      <circle
        cx={shot.x}
        cy={shot.y}
        r="1.5"
        fill={shot.isGoal ? 'var(--color-home)' : 'none'}
        stroke="var(--color-home)"
        stroke-width="0.3"
        opacity="0.8"
      />
    {/each}

    <!-- Away team shots (red) -->
    {#each awayShots as shot}
      <circle
        cx={shot.x}
        cy={shot.y}
        r="1.5"
        fill={shot.isGoal ? 'var(--color-away)' : 'none'}
        stroke="var(--color-away)"
        stroke-width="0.3"
        opacity="0.8"
      />
    {/each}
  </svg>

  <div class="legend">
    <div class="legend-row">
      <div class="team-label home">{homeTeam}</div>
      <div class="legend-items">
        <span class="item">
          <span class="dot-filled home"></span>
          Goals
        </span>
        <span class="item">
          <span class="dot-empty home"></span>
          Shots
        </span>
      </div>
    </div>

    <div class="legend-row">
      <div class="team-label away">{awayTeam}</div>
      <div class="legend-items">
        <span class="item">
          <span class="dot-filled away"></span>
          Goals
        </span>
        <span class="item">
          <span class="dot-empty away"></span>
          Shots
        </span>
      </div>
    </div>
  </div>

  <div class="stats">
    <div class="stat-group">
      <div class="stat">
        <span class="label">Goals</span>
        <span class="values">
          <span class="home">{goals.home}</span>
          <span class="sep">:</span>
          <span class="away">{goals.away}</span>
        </span>
      </div>
      <div class="stat">
        <span class="label">On Target</span>
        <span class="values">
          <span class="home">{onTarget.home}</span>
          <span class="sep">:</span>
          <span class="away">{onTarget.away}</span>
        </span>
      </div>
      <div class="stat">
        <span class="label">Off Target</span>
        <span class="values">
          <span class="home">{offTarget.home}</span>
          <span class="sep">:</span>
          <span class="away">{offTarget.away}</span>
        </span>
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

  .pitch {
    width: 100%;
    height: auto;
    aspect-ratio: 150 / 100;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .legend {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg);
  }

  .legend-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .team-label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .team-label.home {
    color: var(--color-home);
  }

  .team-label.away {
    color: var(--color-away);
  }

  .legend-items {
    display: flex;
    gap: var(--space-md);
    font-size: 0.75rem;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--color-text-secondary);
  }

  .dot-filled {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dot-filled.home {
    background: var(--color-home);
  }

  .dot-filled.away {
    background: var(--color-away);
  }

  .dot-empty {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid currentColor;
  }

  .dot-empty.home {
    border-color: var(--color-home);
  }

  .dot-empty.away {
    border-color: var(--color-away);
  }

  .stats {
    display: flex;
    justify-content: center;
  }

  .stat-group {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-lg);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    text-align: center;
  }

  .label {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .values {
    display: flex;
    align-items: center;
    justify-content: space-around;
    font-weight: 700;
    font-size: 1.25rem;
  }

  .home {
    color: var(--color-home);
  }

  .away {
    color: var(--color-away);
  }

  .sep {
    color: var(--color-text-secondary);
    font-weight: 300;
  }
</style>
