<script>
  import { createSvelteTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/svelte-table';
  import { writable } from 'svelte/store';

  export let data = [];
  export let title = 'Top Scorers';

  let selectedCount = 25;
  let searchTerm = '';
  let sorting = writable([]);
  let globalFilter = writable('');

  $: columns = [
    {
      accessorKey: 'rank',
      header: 'Rank',
      cell: (info) => info.row.index + 1,
    },
    {
      accessorKey: 'name',
      header: 'Player',
    },
    {
      accessorKey: 'team',
      header: 'Team',
    },
    {
      accessorKey: 'goals',
      header: 'Goals',
      cell: (info) => info.getValue() || 0,
    },
    {
      accessorKey: 'assists',
      header: 'Assists',
      cell: (info) => info.getValue() || 0,
    },
    {
      accessorKey: 'matches',
      header: 'Matches',
      cell: (info) => info.getValue() || 0,
    },
  ];

  $: table = createSvelteTable({
    get data() {
      return data.slice(0, selectedCount);
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      get sorting() {
        return $sorting;
      },
      get globalFilter() {
        return $globalFilter;
      },
    },
    globalFilterFn: 'includesString',
  });

  const handleSort = (column) => {
    sorting.update((s) => {
      const existing = s.find((item) => item.id === column.id);
      if (existing) {
        if (existing.desc) {
          return s.filter((item) => item.id !== column.id);
        }
        return s.map((item) => (item.id === column.id ? { ...item, desc: true } : item));
      }
      return [{ id: column.id, desc: false }];
    });
  };

  $: rows = $table.getRowModel().rows;
</script>

<div class="player-table">
  <div class="player-table__header">
    <h2>{title}</h2>
    <div class="player-table__controls">
      <div class="control-group">
        <label for="search-input">Search:</label>
        <input
          id="search-input"
          type="text"
          placeholder="Player or team..."
          bind:value={$globalFilter}
          class="search-input"
        />
      </div>
      <div class="control-group">
        <label for="count-select">Show:</label>
        <select id="count-select" bind:value={selectedCount}>
          <option value={25}>Top 25</option>
          <option value={50}>Top 50</option>
          <option value={100}>Top 100</option>
          <option value={1000}>All ({data.length})</option>
        </select>
      </div>
    </div>
  </div>

  <table class="player-table__table">
    <thead>
      <tr>
        {#each $table.getHeaderGroups()[0]?.headers ?? [] as header (header.id)}
          <th
            on:click={() => header.column.columnDef.header !== 'Rank' && handleSort(header.column)}
            class={header.column.columnDef.header !== 'Rank' ? 'sortable' : ''}
          >
            <div class="header-cell">
              {#if typeof header.column.columnDef.header === 'string'}
                {header.column.columnDef.header}
              {/if}
              {#if header.column.columnDef.header !== 'Rank' && $sorting.find((s) => s.id === header.id)}
                <span class="sort-indicator">
                  {$sorting.find((s) => s.id === header.id)?.desc ? '↓' : '↑'}
                </span>
              {/if}
            </div>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.id)}
        <tr>
          {#each row.getVisibleCells() as cell (cell.id)}
            <td class={cell.column.id === 'goals' || cell.column.id === 'assists' || cell.column.id === 'matches' ? 'numeric' : ''}>
              {#if cell.column.columnDef.cell}
                {cell.column.columnDef.cell(cell.getContext())}
              {:else}
                {cell.getValue()}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  {#if rows.length === 0}
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
    align-items: flex-start;
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
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .player-table__controls label {
    font: var(--font-label);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  .search-input {
    appearance: none;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-raised);
    color: var(--color-text-primary);
    font: var(--font-mono);
    min-width: 180px;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-home);
    box-shadow: 0 0 0 3px rgba(79, 179, 232, 0.1);
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

  th.sortable {
    cursor: pointer;
    user-select: none;
  }

  th.sortable:hover {
    background: var(--color-bg-hover);
  }

  .header-cell {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.25rem);
  }

  .sort-indicator {
    font-size: 0.75rem;
    color: var(--color-home);
    font-weight: bold;
  }

  td {
    font: var(--font-mono);
    color: var(--color-text-primary);
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border-subtle);
    font-variant-numeric: tabular-nums;
  }

  td.numeric {
    text-align: right;
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
