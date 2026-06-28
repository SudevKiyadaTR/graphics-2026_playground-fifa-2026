<script>
  export let timeline = [];
  export let liveData = {};
  export let homeTeam = '';
  export let awayTeam = '';

  // Empirically determined goal frame bounds from tournament goal data
  const GOAL_LEFT = 33;
  const GOAL_RIGHT = 67;
  const GOAL_TOP = 50; // crossbar

  // SVG layout — goal rect is 300×100 = 3:1 matching real goal (7.32m × 2.44m)
  const SVG_GOAL_L = 100;
  const SVG_GOAL_R = 400;
  const SVG_GOAL_T = 30;
  const SVG_GOAL_B = 130;

  const scaleX = (SVG_GOAL_R - SVG_GOAL_L) / (GOAL_RIGHT - GOAL_LEFT); // 8.82 px/unit
  const scaleY = (SVG_GOAL_B - SVG_GOAL_T) / GOAL_TOP; // 2.27 px/unit

  const toX = (dx) => SVG_GOAL_L + (dx - GOAL_LEFT) * scaleX;
  const toY = (dy) => SVG_GOAL_B - dy * scaleY;

  const inGoal = (x, y) => x >= GOAL_LEFT && x <= GOAL_RIGHT && y >= 0 && y <= GOAL_TOP;

  const homeTeamId = String(liveData.HomeTeam?.IdTeam || '');

  // Extract attempts + goals that have gate position
  let events = (Array.isArray(timeline) ? timeline : [])
    .filter(e => (e.Type === 0 || e.Type === 12) && e.GoalGatePositionX != null);

  // Remove attempt if the same player scored a goal at the same minute
  events = events.filter(e => {
    if (e.Type === 12) {
      return !events.some(g => g.Type === 0 && g.IdPlayer === e.IdPlayer && g.MatchMinute === e.MatchMinute);
    }
    return true;
  });

  const shots = events.map(e => {
    const x = e.GoalGatePositionX;
    const y = e.GoalGatePositionY;
    const isHome = String(e.IdTeam) === homeTeamId;
    const isGoal = e.Type === 0;
    const onTarget = isGoal || inGoal(x, y);
    const desc = e.EventDescription?.[0]?.Description || '';
    return {
      x, y,
      svgX: toX(x),
      svgY: toY(y),
      isGoal,
      onTarget,
      isHome,
      time: e.MatchMinute || '',
      desc,
    };
  });

  let hovered = null;
  let tooltipPos = { x: 0, y: 0 };

  const homeShots = shots.filter(s => s.isHome);
  const awayShots = shots.filter(s => !s.isHome);

  // X always spans full field width (data X=0–100); Y fits actual shots
  const vbLeft   = toX(0) - 10;   // data X=0 → svgX≈-191
  const vbRight  = toX(100) + 10; // data X=100 → svgX≈691
  const allY     = shots.map(s => s.svgY);
  const vbTop    = Math.min(...allY, SVG_GOAL_T) - 15;
  const vbBottom = SVG_GOAL_B + 40; // fixed grass below ground line
  const viewBox  = `${vbLeft} ${vbTop} ${vbRight - vbLeft} ${vbBottom - vbTop}`;
</script>

<div class="goal-map-wrap">
  <svg {viewBox} class="goal-svg">
    <!-- Ground / grass -->
    <rect x={vbLeft} y={SVG_GOAL_B} width={vbRight - vbLeft} height={vbBottom - SVG_GOAL_B} fill="#0d5f3b" opacity="0.4" />

    <!-- Net background -->
    <rect
      x={SVG_GOAL_L} y={SVG_GOAL_T}
      width={SVG_GOAL_R - SVG_GOAL_L} height={SVG_GOAL_B - SVG_GOAL_T}
      fill="rgba(255,255,255,0.04)"
    />

    <!-- Net grid lines (horizontal) -->
    {#each [0.25, 0.5, 0.75] as t}
      <line
        x1={SVG_GOAL_L} x2={SVG_GOAL_R}
        y1={SVG_GOAL_T + t * (SVG_GOAL_B - SVG_GOAL_T)}
        y2={SVG_GOAL_T + t * (SVG_GOAL_B - SVG_GOAL_T)}
        stroke="rgba(255,255,255,0.1)" stroke-width="1"
      />
    {/each}
    <!-- Net grid lines (vertical) -->
    {#each [0.2, 0.4, 0.6, 0.8] as t}
      <line
        x1={SVG_GOAL_L + t * (SVG_GOAL_R - SVG_GOAL_L)}
        x2={SVG_GOAL_L + t * (SVG_GOAL_R - SVG_GOAL_L)}
        y1={SVG_GOAL_T} y2={SVG_GOAL_B}
        stroke="rgba(255,255,255,0.1)" stroke-width="1"
      />
    {/each}

    <!-- Away shots -->
    {#each awayShots as shot, i (i)}
      <circle
        cx={shot.svgX} cy={shot.svgY}
        r={shot.isGoal ? 7 : 5}
        fill={shot.isGoal ? 'var(--color-away)' : 'transparent'}
        stroke="var(--color-away)"
        stroke-width={shot.isGoal ? 2 : (shot.onTarget ? 1.5 : 1)}
        opacity={shot.onTarget || shot.isGoal ? 0.9 : 0.45}
        class="shot"
        on:mouseenter={(e) => { hovered = shot; const r = e.currentTarget.getBoundingClientRect(); tooltipPos = { x: r.left, y: r.top }; }}
        on:mouseleave={() => hovered = null}
      />
      {#if shot.isGoal}
        <text x={shot.svgX} y={shot.svgY + 1} text-anchor="middle" dominant-baseline="middle" class="goal-icon" font-size="7">⚽</text>
      {/if}
    {/each}

    <!-- Home shots -->
    {#each homeShots as shot, i (i)}
      <circle
        cx={shot.svgX} cy={shot.svgY}
        r={shot.isGoal ? 7 : 5}
        fill={shot.isGoal ? 'var(--color-home)' : 'transparent'}
        stroke="var(--color-home)"
        stroke-width={shot.isGoal ? 2 : (shot.onTarget ? 1.5 : 1)}
        opacity={shot.onTarget || shot.isGoal ? 0.9 : 0.45}
        class="shot"
        on:mouseenter={(e) => { hovered = shot; const r = e.currentTarget.getBoundingClientRect(); tooltipPos = { x: r.left, y: r.top }; }}
        on:mouseleave={() => hovered = null}
      />
      {#if shot.isGoal}
        <text x={shot.svgX} y={shot.svgY + 1} text-anchor="middle" dominant-baseline="middle" class="goal-icon" font-size="7">⚽</text>
      {/if}
    {/each}

    <!-- Goal frame (drawn on top of shots) -->
    <!-- Left post -->
    <rect x={SVG_GOAL_L - 3} y={SVG_GOAL_T} width="6" height={SVG_GOAL_B - SVG_GOAL_T + 4} fill="#fff" rx="2" />
    <!-- Right post -->
    <rect x={SVG_GOAL_R - 3} y={SVG_GOAL_T} width="6" height={SVG_GOAL_B - SVG_GOAL_T + 4} fill="#fff" rx="2" />
    <!-- Crossbar -->
    <rect x={SVG_GOAL_L - 3} y={SVG_GOAL_T - 3} width={SVG_GOAL_R - SVG_GOAL_L + 6} height="6" fill="#fff" rx="2" />
    <!-- Ground line -->
    <line x1={vbLeft} y1={SVG_GOAL_B + 4} x2={vbRight} y2={SVG_GOAL_B + 4} stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />

    <!-- Labels -->
    <text x="250" y="12" text-anchor="middle" class="frame-label">Goal Face</text>
  </svg>

  {#if hovered}
    <div class="tooltip" style="left: {tooltipPos.x + 15}px; top: {tooltipPos.y + 15}px;">
      <div class="tt-team" class:home={hovered.isHome} class:away={!hovered.isHome}>
        {hovered.isHome ? homeTeam : awayTeam}
      </div>
      <div class="tt-type">{hovered.isGoal ? '⚽ Goal' : (hovered.onTarget ? 'On Target' : 'Off Target')}</div>
      <div class="tt-min">{hovered.time}'</div>
      {#if hovered.desc}
        <div class="tt-desc">{hovered.desc}</div>
      {/if}
    </div>
  {/if}

  <div class="legend">
    <span class="leg-item">
      <span class="dot filled home"></span> {homeTeam}
    </span>
    <span class="leg-item">
      <span class="dot filled away"></span> {awayTeam}
    </span>
    <span class="leg-item">
      <span class="dot filled mixed"></span> Goal
    </span>
    <span class="leg-item">
      <span class="dot empty mixed"></span> Shot
    </span>
    <span class="leg-item">
      <span class="dot empty dim"></span> Off-target
    </span>
  </div>
</div>

<style>
  .goal-map-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    position: relative;
  }

  .goal-svg {
    width: 100%;
    height: auto;
    border-radius: 4px;
    overflow: hidden;
  }

  :global(.shot) {
    cursor: pointer;
    transition: opacity 0.15s;
  }
  :global(.shot:hover) { opacity: 1 !important; }

  :global(.frame-label) {
    font-size: 9px;
    fill: rgba(255,255,255,0.4);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  :global(.goal-icon) {
    pointer-events: none;
  }

  .tooltip {
    position: fixed;
    background: rgba(0,0,0,0.95);
    color: var(--color-text-primary);
    padding: var(--space-sm) var(--space-md);
    border-radius: 4px;
    font-size: 0.7rem;
    border: 1px solid rgba(255,255,255,0.2);
    pointer-events: none;
    z-index: 100;
    max-width: 220px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.6);
  }

  .tt-team {
    font-weight: 700;
    font-size: 0.75rem;
  }
  .tt-team.home { color: var(--color-home); }
  .tt-team.away { color: var(--color-away); }

  .tt-type { color: var(--color-text-secondary); }
  .tt-min { color: var(--color-text-secondary); font-family: monospace; }
  .tt-desc { color: var(--color-text-primary); font-size: 0.65rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; margin-top: 2px; }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
    font-size: 0.7rem;
    color: var(--color-text-secondary);
  }

  .leg-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot.filled.home { background: var(--color-home); }
  .dot.filled.away { background: var(--color-away); }
  .dot.filled.mixed { background: rgba(255,255,255,0.6); }
  .dot.empty { background: transparent; border: 1.5px solid; }
  .dot.empty.mixed { border-color: rgba(255,255,255,0.6); }
  .dot.empty.dim { border-color: rgba(255,255,255,0.3); opacity: 0.5; }
</style>
