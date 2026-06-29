<script>
  import {
    createSvelteTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
  } from '@tanstack/svelte-table';
  import { writable } from 'svelte/store';

  export let matchRows = [];
  export let consolidatedRows = [];
  export let statKeys = [];

  const DEFAULT_STATS = [
    'Goals', 'Assists', 'XG', 'AttemptAtGoal', 'AttemptAtGoalOnTarget',
    'Passes', 'PassesCompleted', 'TimePlayed', 'YellowCards', 'RedCards',
    'TakeOnsCompleted', 'TopSpeed', 'TotalDistance', 'FoulsFor', 'FoulsAgainst',
  ];

  let activeTab = 'consolidated';
  let columnSearch = '';
  let showAllColumns = false;
  let globalFilter = writable('');
  let sorting = writable([]);

  $: visibleStats = (() => {
    const base = showAllColumns
      ? statKeys
      : DEFAULT_STATS.filter((s) => statKeys.includes(s));
    return columnSearch
      ? base.filter((k) => k.toLowerCase().includes(columnSearch.toLowerCase()))
      : base;
  })();

  $: fixedColumns =
    activeTab === 'per-match'
      ? [
          { accessorKey: 'playerName', header: 'Player' },
          { accessorKey: 'teamName', header: 'Team' },
          { accessorKey: 'matchId', header: 'Match ID' },
        ]
      : [
          { accessorKey: 'playerName', header: 'Player' },
          { accessorKey: 'teamName', header: 'Team' },
          { accessorKey: 'matchCount', header: 'GP' },
        ];

  $: statColumns = visibleStats.map((key) => ({
    accessorKey: key,
    header: key,
    cell: (info) => {
      const v = info.getValue();
      if (v == null) return '—';
      if (typeof v !== 'number') return v;
      return Number.isInteger(v) ? v : v.toFixed(2);
    },
  }));

  $: columns = [...fixedColumns, ...statColumns];

  $: currentData = activeTab === 'per-match' ? matchRows : consolidatedRows;

  $: table = createSvelteTable({
    get data() {
      return currentData;
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

  function handleSort(column) {
    sorting.update((s) => {
      const existing = s.find((item) => item.id === column.id);
      if (existing) {
        if (existing.desc) return s.filter((item) => item.id !== column.id);
        return s.map((item) => (item.id === column.id ? { ...item, desc: true } : item));
      }
      return [{ id: column.id, desc: false }];
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    sorting.set([]);
    globalFilter.set('');
  }

  $: rows = $table.getRowModel().rows;

  function downloadCSV() {
    const headers = $table.getHeaderGroups()[0].headers.map((h) => h.column.columnDef.header);
    const csvRows = rows.map((row) =>
      row.getVisibleCells().map((cell) => {
        const v = cell.column.columnDef.cell ? cell.column.columnDef.cell(cell.getContext()) : cell.getValue();
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      })
    );
    const csv = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `player-stats-${activeTab}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
</script>

<div class="stats-table">
  <div class="tabs">
    <button
      class="tab"
      class:active={activeTab === 'consolidated'}
      on:click={() => switchTab('consolidated')}
    >
      By Player
    </button>
    <button
      class="tab"
      class:active={activeTab === 'per-match'}
      on:click={() => switchTab('per-match')}
    >
      By Match
    </button>
  </div>

  <div class="controls">
    <div class="control-group">
      <label for="row-filter">Search:</label>
      <input
        id="row-filter"
        type="text"
        placeholder="Player, team..."
        bind:value={$globalFilter}
        class="text-input"
      />
    </div>
    <div class="control-group">
      <label for="col-filter">Columns:</label>
      <input
        id="col-filter"
        type="text"
        placeholder="Filter columns..."
        bind:value={columnSearch}
        class="text-input"
      />
    </div>
    <button
      class="toggle-btn"
      on:click={() => { showAllColumns = !showAllColumns; columnSearch = ''; }}
    >
      {showAllColumns ? 'Key stats' : `All ${statKeys.length} stats`}
    </button>
    <span class="row-count">{rows.length} rows</span>
    <button class="download-btn" on:click={downloadCSV}>↓ CSV</button>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          {#each $table.getHeaderGroups()[0]?.headers ?? [] as header (header.id)}
            <th on:click={() => handleSort(header.column)} class="sortable">
              <div class="header-cell">
                {header.column.columnDef.header}
                {#if $sorting.find((s) => s.id === header.id)}
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
              <td class:numeric={typeof cell.getValue() === 'number'}>
                {#if cell.column.columnDef.cell}
                  {cell.column.columnDef.cell(cell.getContext())}
                {:else}
                  {cell.getValue() ?? '—'}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
    {#if rows.length === 0}
      <p class="empty">No results</p>
    {/if}
  </div>
</div>

<style>
  .stats-table {
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    overflow: hidden;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--color-border);
  }

  .tab {
    padding: var(--space-md) var(--space-lg);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--color-text-secondary);
    font: var(--font-label);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    margin-bottom: -1px;
  }

  .tab:hover {
    color: var(--color-text-primary);
  }

  .tab.active {
    color: var(--color-home);
    border-bottom-color: var(--color-home);
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
    background: var(--color-bg-raised);
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .control-group label {
    font: var(--font-label);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  .text-input {
    appearance: none;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-surface);
    color: var(--color-text-primary);
    font: var(--font-mono);
    min-width: 160px;
  }

  .text-input:focus {
    outline: none;
    border-color: var(--color-home);
    box-shadow: 0 0 0 3px rgba(79, 179, 232, 0.1);
  }

  .toggle-btn {
    appearance: none;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-surface);
    color: var(--color-text-secondary);
    font: var(--font-label);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    white-space: nowrap;
  }

  .toggle-btn:hover {
    border-color: var(--color-home);
    color: var(--color-home);
  }

  .download-btn {
    appearance: none;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-surface);
    color: var(--color-text-secondary);
    font: var(--font-label);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    white-space: nowrap;
    margin-left: auto;
  }

  .download-btn:hover {
    border-color: var(--color-home);
    color: var(--color-home);
  }

  .row-count {
    font: var(--font-mono);
    color: var(--color-text-muted);
  }

  .table-wrap {
    overflow-x: auto;
    max-height: 70vh;
    overflow-y: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    white-space: nowrap;
  }

  thead {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--color-bg-raised);
  }

  th:first-child,
  td:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
  }

  th:first-child {
    background: var(--color-bg-raised);
    z-index: 3;
  }

  td:first-child {
    background: var(--color-bg-surface);
  }

  tbody tr:hover td:first-child {
    background: var(--color-bg-raised);
  }

  th {
    font: var(--font-label);
    color: var(--color-text-muted);
    text-align: left;
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-border);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    user-select: none;
  }

  th:hover {
    background: var(--color-bg-hover);
  }

  .header-cell {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .sort-indicator {
    font-size: 0.75rem;
    color: var(--color-home);
    font-weight: bold;
  }

  td {
    font: var(--font-mono);
    color: var(--color-text-primary);
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-border-subtle);
    font-variant-numeric: tabular-nums;
  }

  td.numeric {
    text-align: right;
  }

  tbody tr:hover {
    background: var(--color-bg-raised);
  }

  .empty {
    text-align: center;
    color: var(--color-text-secondary);
    padding: var(--space-lg);
    margin: 0;
  }
</style>
