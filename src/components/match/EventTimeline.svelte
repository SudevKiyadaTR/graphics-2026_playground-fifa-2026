<script>
  export let timeline = [];
  export let homeTeam = '';
  export let awayTeam = '';
  export let liveData = {};

  const typeMap = {
    0: { label: 'Goal', icon: '⚽' },
    2: { label: 'Yellow Card', icon: '🟨' },
    3: { label: 'Red Card', icon: '🟥' },
    5: { label: 'Sub', icon: '🔄' },
  };

  const parseMinute = (str) => parseInt(str) || 0;

  const events = Array.isArray(timeline)
    ? timeline
        .filter(e => e.Type in typeMap && e.MatchMinute)
        .map(e => ({
          ...e,
          minute: parseMinute(e.MatchMinute),
          isHome: liveData.HomeTeam?.IdTeam === e.IdTeam,
          ...typeMap[e.Type],
        }))
    : [];

  const maxMinute = Math.max(90, ...events.map(e => e.minute));
  const pct = (m) => `${(m / maxMinute) * 100}%`;

  const getPlayerName = (playerId) => {
    const all = [...(liveData.HomeTeam?.Players || []), ...(liveData.AwayTeam?.Players || [])];
    return all.find(p => p.IdPlayer === playerId)?.PlayerName?.[0]?.Description || '';
  };

  const tooltip = (e) => {
    const player = getPlayerName(e.IdPlayer);
    return `${e.minute}' ${e.label}${player ? ` · ${player}` : ''}`;
  };
</script>

<div class="tl-wrap">
  {#if events.length === 0}
    <p class="empty">No significant events recorded</p>
  {:else}
    <div class="tl-row home">
      {#each events.filter(e => e.isHome) as e (e.EventId)}
        <span class="dot" style="left:{pct(e.minute)}" data-tip={tooltip(e)}>{e.icon}</span>
      {/each}
    </div>

    <div class="axis">
      <span class="tick" style="left:0">0'</span>
      <span class="tick" style="left:50%">45'</span>
      {#if maxMinute > 90}
        <span class="tick" style="left:{pct(90)}">90'</span>
      {/if}
      <span class="tick end">{maxMinute}'</span>
    </div>

    <div class="tl-row away">
      {#each events.filter(e => !e.isHome) as e (e.EventId)}
        <span class="dot" style="left:{pct(e.minute)}" data-tip={tooltip(e)}>{e.icon}</span>
      {/each}
    </div>

    <div class="legend">
      <span class="home-label">{homeTeam}</span>
      <span class="away-label">{awayTeam}</span>
    </div>
  {/if}
</div>

<style>
  .tl-wrap {
    padding: 0.5rem 0 1rem;
  }

  .tl-row {
    position: relative;
    height: 2rem;
  }

  .dot {
    position: absolute;
    transform: translateX(-50%);
    font-size: 1.1rem;
    cursor: default;
    line-height: 1;
  }

  .home .dot { bottom: 0; }
  .away .dot { top: 0; }

  .dot[data-tip] { position: absolute; }

  .dot[data-tip]::after {
    content: attr(data-tip);
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    background: var(--color-bg-raised, #1e1e2e);
    color: var(--color-text-primary, #fff);
    border: 1px solid var(--color-border, #333);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 10;
  }

  .home .dot[data-tip]::after { bottom: calc(100% + 4px); }
  .away .dot[data-tip]::after { top: calc(100% + 4px); }

  .dot[data-tip]:hover::after { opacity: 1; }

  .axis {
    position: relative;
    height: 1.5rem;
    border-top: 2px solid var(--color-border);
    margin: 0.25rem 0;
  }

  .tick {
    position: absolute;
    font-size: 0.7rem;
    color: var(--color-text-secondary);
    transform: translateX(-50%);
    top: 0.2rem;
  }

  .tick:first-child { transform: none; }
  .tick.end { right: 0; left: auto; transform: none; }

  .legend {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }

  .home-label { color: var(--color-home, #3b82f6); font-weight: 600; }
  .away-label { color: var(--color-away, #ef4444); font-weight: 600; }

  .empty {
    text-align: center;
    color: var(--color-text-secondary);
    padding: 1rem;
  }
</style>
