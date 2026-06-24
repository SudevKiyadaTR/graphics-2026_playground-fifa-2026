<script>
  export let data = [];
  export let title = 'Top Scorers';

  let selectedCount = 25;
  $: filtered = data.slice(0, selectedCount);
</script>

<div class="player-table">
  <div class="player-table__header">
    <h2>{title}</h2>
    <div class="player-table__controls">
      <label for="count-select">Show:</label>
      <select id="count-select" bind:value={selectedCount}>
        <option value={25}>Top 25</option>
        <option value={50}>Top 50</option>
        <option value={100}>Top 100</option>
        <option value={1000}>All ({data.length})</option>
      </select>
    </div>
  </div>

  <table class="player-table__table">
    <thead>
      <tr>
        <th>Rank</th>
        <th>Player</th>
        <th>Team</th>
        <th style="text-align: right;">Goals</th>
        <th style="text-align: right;">Assists</th>
        <th style="text-align: right;">Matches</th>
      </tr>
    </thead>
    <tbody>
      {#each filtered as player, index (player.id || `${player.name}-${index}`)}
        <tr>
          <td>{index + 1}</td>
          <td>{player.name}</td>
          <td>{player.team}</td>
          <td style="text-align: right;">{player.goals || 0}</td>
          <td style="text-align: right;">{player.assists || 0}</td>
          <td style="text-align: right;">{player.matches || 0}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if filtered.length === 0}
    <p class="player-table__empty">No players found</p>
  {/if}
</div>

<style>
  .player-table {
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: var(--space-lg);
    margin: var(--space-lg) 0;
  }

  .player-table__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
    flex-wrap: wrap;
    gap: var(--space-md);
  }

  .player-table__header h2 {
    margin: 0;
    font: var(--font-display-md);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .player-table__controls {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .player-table__controls label {
    font: var(--font-label);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-secondary);
  }

  .player-table__controls select {
    appearance: none;
    background: var(--color-bg-raised) url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%237d95b0" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>')
      no-repeat right 8px center;
    background-size: 16px;
    padding: var(--space-sm) 32px var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text-primary);
    font: var(--font-mono);
    cursor: pointer;
    min-width: 140px;
  }

  .player-table__controls select:hover {
    background-color: var(--color-bg-raised);
    border-color: var(--color-border);
  }

  .player-table__controls select:focus {
    outline: none;
    border-color: var(--color-home);
    box-shadow: 0 0 0 3px rgba(79, 179, 232, 0.1);
  }

  .player-table__table {
    width: 100%;
    border-collapse: collapse;
    margin: 0;
  }

  thead {
    background: var(--color-bg-raised);
  }

  th {
    font: var(--font-label);
    color: var(--color-text-muted);
    text-align: left;
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  td {
    font: var(--font-mono);
    color: var(--color-text-primary);
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border-subtle);
    font-variant-numeric: tabular-nums;
  }

  tbody tr:hover {
    background: var(--color-bg-raised);
  }

  .player-table__empty {
    text-align: center;
    color: var(--color-text-secondary);
    padding: var(--space-lg);
    margin: 0;
  }
</style>
