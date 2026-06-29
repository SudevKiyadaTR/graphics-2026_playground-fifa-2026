<script>
  export let matchStats = {};
  export let timeline = [];
  export let homeTeam = '';
  export let awayTeam = '';
  export let homeScore = 0;
  export let awayScore = 0;
  export let liveData = {};

  let hoveredShot = null;
  let tooltipPos = { x: 0, y: 0 };

  const getTeamStats = (teamId, stats) => {
    const teamStats = stats[teamId] || [];
    const statMap = {};
    teamStats.forEach(([key, value]) => {
      statMap[key] = value;
    });
    return statMap;
  };

  // Authoritative team IDs from live data
  const homeTeamId = String(liveData.HomeTeam?.IdTeam || '');
  const awayTeamId = String(liveData.AwayTeam?.IdTeam || '');

  const homeStats = getTeamStats(homeTeamId, matchStats);
  const awayStats = getTeamStats(awayTeamId, matchStats);

  // Extract shots from timeline
  let shotEvents = (Array.isArray(timeline) ? timeline : [])
    .filter(e => e.Type === 12 || e.Type === 0) // 12=attempt, 0=goal
    .filter(e => e.PositionX !== undefined && e.PositionY !== undefined);

  // Remove attempt if same player scored a goal at the same minute
  shotEvents = shotEvents.filter(e => {
    if (e.Type === 12) {
      const hasGoal = shotEvents.some(
        other => other.Type === 0 && other.IdPlayer === e.IdPlayer && other.MatchMinute === e.MatchMinute
      );
      if (hasGoal) return false;
    }
    return true;
  });

  const allShots = shotEvents.map(e => {
      const description = e.EventDescription?.[0]?.Description || '';
      // Period 5/10 = second half; teams swap ends so flip both axes to normalize
      const isSecondHalf = e.Period === 5 || e.Period === 10;
      const x = isSecondHalf ? 100 - e.PositionX : e.PositionX;
      const y = isSecondHalf ? 100 - e.PositionY : e.PositionY;

      return {
        x: x,
        y: y,
        isGoal: e.Type === 0,
        team: String(e.IdTeam),
        isHome: String(e.IdTeam) === homeTeamId,
        time: e.MatchMinute || '',
        description: description,
        period: e.Period,
        goalGateX: e.GoalGatePositionX,
        goalGateY: e.GoalGatePositionY
      };
    })
    .filter(s => s.x !== undefined && s.y !== undefined);

  // Map coordinates to Opta field (800 x 524)
  const FIELD_WIDTH = 800;
  const FIELD_HEIGHT = 524;
  const CENTER_X = 400;

  // Split field: home team (left 0-400), away team (right 400-800)
  // Flip x so home attacks the LEFT goal (home on left, away on right)
  const toSvgX = (x) => ((100 - x) / 100) * FIELD_WIDTH;

  const homeShots = allShots.filter(s => s.isHome).map((s, idx) => ({
    ...s,
    svgX: toSvgX(s.x),
    svgY: (s.y / 100) * FIELD_HEIGHT,
    shotNumber: idx + 1
  }));

  const awayShots = allShots.filter(s => !s.isHome).map((s, idx) => ({
    ...s,
    svgX: toSvgX(s.x),
    svgY: (s.y / 100) * FIELD_HEIGHT,
    shotNumber: idx + 1
  }));

  if (typeof window !== 'undefined') {
    const toLog = e => ({
      time: e.MatchMinute,
      type: e.Type === 0 ? 'Goal' : 'Attempt',
      description: e.EventDescription?.[0]?.Description || '',
      x: e.PositionX,
      y: e.PositionY,
      period: e.Period
    });
    const allWithPos = (Array.isArray(timeline) ? timeline : []).filter(e => e.PositionX !== undefined && e.PositionY !== undefined);
    console.log(`[ShotMap] ${homeTeam}:`, allWithPos.filter(e => String(e.IdTeam) === homeTeamId).map(toLog));
    console.log(`[ShotMap] ${awayTeam}:`, allWithPos.filter(e => String(e.IdTeam) !== homeTeamId).map(toLog));
  }

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
  <svg class="Opta-Responsive-Svg Opta-selectable-area" preserveAspectRatio="xMidYMid meet" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 843.2 552.8">
    <g class="Opta-Field" transform="translate(20.8,12.8)">
      <g class="Opta-Markings">
        <rect y="0" x="0" width="800" height="524"></rect>
        <line x1="400" y1="524" x2="400" y2="0"></line>
        <circle cx="400" cy="262" r="69.71677559912854"></circle>
        <circle cx="400" cy="262" r="2"></circle>
        <circle cx="92" cy="262" class="Opta-Spot" r="2"></circle>
        <circle cx="708" cy="262" class="Opta-Spot" r="2"></circle>
        <path d="M0,413.43600000000004L136,413.43600000000004L136,110.56399999999996L0,110.56399999999996"></path>
        <path d="M800,413.43600000000004L664,413.43600000000004L664,110.56399999999996L800,110.56399999999996"></path>
        <path d="M0,331.168L46.4,331.168L46.4,192.832L0,192.832"></path>
        <path d="M800,331.168L753.6,331.168L753.6,192.832L800,192.832"></path>
        <path d="M0,287.152L-12,287.152L-12,236.848L0,236.848"></path>
        <path d="M800,287.152L811.9999999999999,287.152L811.9999999999999,236.848L800,236.848"></path>
        <path d="M5.763043760693427e-16,-9.411764705882353A9.411764705882353,9.411764705882353 0 0,1 9.411764705882353,0L9.411764705882353,0A9.411764705882353,9.411764705882353 0 0,0 5.763043760693427e-16,-9.411764705882353Z" transform="translate(0,524)"></path>
        <path d="M9.411764705882353,0A9.411764705882353,9.411764705882353 0 0,1 5.763043760693427e-16,9.411764705882353L5.763043760693427e-16,9.411764705882353A9.411764705882353,9.411764705882353 0 0,0 9.411764705882353,0Z" transform="translate(0,0)"></path>
        <path d="M5.763043760693427e-16,9.411764705882353A9.411764705882353,9.411764705882353 0 0,1 -9.411764705882353,1.1526087521386854e-15L-9.411764705882353,1.1526087521386854e-15A9.411764705882353,9.411764705882353 0 0,0 5.763043760693427e-16,9.411764705882353Z" transform="translate(800,0)"></path>
        <path d="M-9.411764705882353,1.1526087521386854e-15A9.411764705882353,9.411764705882353 0 0,1 -1.728913128208028e-15,-9.411764705882353L-1.728913128208028e-15,-9.411764705882353A9.411764705882353,9.411764705882353 0 0,0 -9.411764705882353,1.1526087521386854e-15Z" transform="translate(800,524)"></path>
        <path d="M44.43914525481061,-53.71769884275655A69.71677559912854,69.71677559912854 0 0,1 44.43914525481062,53.71769884275654L44.43914525481062,53.71769884275654A69.71677559912854,69.71677559912854 0 0,0 44.43914525481061,-53.71769884275655Z" transform="translate(92,262)"></path>
        <path d="M-44.43914525481061,53.71769884275655A69.71677559912854,69.71677559912854 0 0,1 -44.4391452548106,-53.717698842756555L-44.4391452548106,-53.717698842756555A69.71677559912854,69.71677559912854 0 0,0 -44.43914525481061,53.71769884275655Z" transform="translate(708,262)"></path>
      </g>

      <!-- Team side labels -->
      <text x="100" y="24" text-anchor="middle" class="side-label home-side">{homeTeam}</text>
      <text x="700" y="24" text-anchor="middle" class="side-label away-side">{awayTeam}</text>

      <!-- Home team shots -->
      {#each homeShots as shot, i (i)}
        <circle
          cx={shot.svgX}
          cy={shot.svgY}
          r="5"
          fill={shot.isGoal ? 'var(--color-home)' : 'transparent'}
          stroke="var(--color-home)"
          stroke-width="2"
          opacity="0.85"
          class="shot-circle"
          on:mouseenter={(e) => {
            hoveredShot = shot;
            const rect = e.currentTarget.getBoundingClientRect();
            tooltipPos = { x: rect.left, y: rect.top };
          }}
          on:mouseleave={() => hoveredShot = null}
        />
        <text
          x={shot.svgX}
          y={shot.svgY}
          text-anchor="middle"
          dominant-baseline="middle"
          class="shot-number home"
          pointer-events="none"
        >
          {shot.shotNumber}
        </text>
      {/each}

      <!-- Away team shots -->
      {#each awayShots as shot, i (homeShots.length + i)}
        <circle
          cx={shot.svgX}
          cy={shot.svgY}
          r="5"
          fill={shot.isGoal ? 'var(--color-away)' : 'transparent'}
          stroke="var(--color-away)"
          stroke-width="2"
          opacity="0.85"
          class="shot-circle"
          on:mouseenter={(e) => {
            hoveredShot = shot;
            const rect = e.currentTarget.getBoundingClientRect();
            tooltipPos = { x: rect.left, y: rect.top };
          }}
          on:mouseleave={() => hoveredShot = null}
        />
        <text
          x={shot.svgX}
          y={shot.svgY}
          text-anchor="middle"
          dominant-baseline="middle"
          class="shot-number away"
          pointer-events="none"
        >
          {shot.shotNumber}
        </text>
      {/each}
    </g>
    <g class="Opta-events-layer"><rect x="0" y="0" width="838.4" height="549.6"></rect></g>
  </svg>

  {#if hoveredShot}
    <div class="tooltip" style="left: {tooltipPos.x + 15}px; top: {tooltipPos.y + 15}px;">
      <div class="tooltip-row">
        <span class="label">PositionX:</span>
        <span class="value">{hoveredShot.x.toFixed(2)}</span>
      </div>
      <div class="tooltip-row">
        <span class="label">PositionY:</span>
        <span class="value">{hoveredShot.y.toFixed(2)}</span>
      </div>
      {#if hoveredShot.goalGateX !== undefined && hoveredShot.goalGateY !== undefined}
        <div class="tooltip-row">
          <span class="label">GoalGateX:</span>
          <span class="value">{hoveredShot.goalGateX.toFixed(2)}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">GoalGateY:</span>
          <span class="value">{hoveredShot.goalGateY.toFixed(2)}</span>
        </div>
      {/if}
      <div class="tooltip-row">
        <span class="label">Time:</span>
        <span class="value">{hoveredShot.time}</span>
      </div>
      <div class="tooltip-row">
        <span class="label">Type:</span>
        <span class="value">{hoveredShot.isGoal ? '⚽ Goal' : 'Shot'}</span>
      </div>
      <div class="tooltip-row description">
        <span class="value">{hoveredShot.description}</span>
      </div>
    </div>
  {/if}

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
    position: relative;
  }

  :global(.Opta-Responsive-Svg) {
    width: 100%;
    height: auto;
    aspect-ratio: 843.2 / 552.8;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  :global(.Opta-Field rect[width="800"]) {
    fill: #0d5f3b !important;
  }

  :global(.Opta-Markings line) {
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 1;
  }

  :global(.Opta-Markings circle) {
    fill: none;
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 1;
  }

  :global(.Opta-Markings path) {
    fill: none;
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 1;
  }

  :global(.Opta-Spot) {
    fill: rgba(255, 255, 255, 0.3);
  }

  :global(.Opta-events-layer rect) {
    fill: transparent !important;
    pointer-events: none;
  }

  :global(.shot-circle) {
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  :global(.shot-circle:hover) {
    opacity: 1 !important;
    stroke-width: 0.6;
  }

  :global(.side-label) {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  :global(.home-side) { fill: var(--color-home); }
  :global(.away-side) { fill: var(--color-away); }

  :global(.shot-number) {
    font-size: 12px;
    font-weight: bold;
    stroke: rgba(0, 0, 0, 0.5);
    stroke-width: 0.5;
  }

  :global(.shot-number.home),
  :global(.shot-number.away) {
    fill: white;
  }

  .tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.95);
    color: var(--color-text-primary);
    padding: var(--space-md);
    border-radius: 4px;
    font-size: 0.7rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    pointer-events: none;
    z-index: 100;
    width: 240px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  }

  .tooltip-row {
    display: flex;
    justify-content: space-between;
    gap: var(--space-md);
    padding: 4px 0;
  }

  .tooltip-row:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 6px;
    margin-bottom: 6px;
  }

  .tooltip-row.description {
    flex-direction: column;
    border-bottom: none;
    padding-top: 6px;
    margin-top: 6px;
    margin-bottom: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tooltip .label {
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .tooltip .value {
    font-family: monospace;
    color: var(--color-text-primary);
  }

  .legend {
    display: flex;
    justify-content: center;
    gap: var(--space-2xl);
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
