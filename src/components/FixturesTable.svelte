<script>
  import { createSvelteTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/svelte-table';
  import { writable } from 'svelte/store';

  export let data = [];
  export let base = '/';

  let searchTerm = '';
  let sorting = writable([]);
  let globalFilter = writable('');

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  $: columns = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (info) => formatDate(info.getValue()),
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
    },
    {
      accessorKey: 'homeTeam',
      header: 'Match',
      cell: (info) => `${info.row.original.homeTeam} vs ${info.row.original.awayTeam}`,
    },
    {
      accessorKey: 'homeScore',
      header: 'Result',
      cell: (info) => {
        const match = info.row.original;
        return match.homeScore !== null && match.awayScore !== null
          ? `${match.homeScore} - ${match.awayScore}`
          : '-';
      },
    },
    {
      accessorKey: 'group',
      header: 'Group',
    },
  ];

  $: table = createSvelteTable({
    get data() {
      return data;
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

<div class="fixtures-table-wrapper">
  <div class="fixtures-controls">
    <input
      type="text"
      placeholder="Search matches..."
      bind:value={$globalFilter}
      class="search-input"
    />
  </div>

  <table class="fixtures-table">
    <thead>
      <tr>
        {#each $table.getHeaderGroups()[0]?.headers ?? [] as header (header.id)}
          <th
            on:click={() => handleSort(header.column)}
            class="sortable"
          >
            <div class="header-cell">
              {#if typeof header.column.columnDef.header === 'string'}
                {header.column.columnDef.header}
              {/if}
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
        <tr
          on:click={() => (window.location.href = `${base}matches/${row.original.id}`)}
          class="clickable-row"
        >
          {#each row.getVisibleCells() as cell (cell.id)}
            <td class={cell.column.id === 'result' ? 'result-cell' : ''}>
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
    <p class="empty-message">No matches found</p>
  {/if}
</div>

<style>
  .fixtures-table-wrapper {
    margin-top: var(--space-2xl);
  }

  .fixtures-controls {
    margin-bottom: var(--space-lg);
  }

  .search-input {
    appearance: none;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-raised);
    color: var(--color-text-primary);
    font: var(--font-mono);
    min-width: 200px;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-home);
    box-shadow: 0 0 0 3px rgba(79, 179, 232, 0.1);
  }

  .fixtures-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    overflow: hidden;
  }

  .fixtures-table thead {
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
  }

  .fixtures-table th {
    padding: var(--space-md);
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    cursor: pointer;
    user-select: none;
  }

  .fixtures-table th.sortable:hover {
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

  .fixtures-table td {
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-primary);
  }

  .fixtures-table tbody tr:last-child td {
    border-bottom: none;
  }

  .fixtures-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .clickable-row {
    cursor: pointer;
  }

  .clickable-row:hover {
    background: rgba(79, 179, 232, 0.08) !important;
  }

  .result-cell {
    font-weight: 700;
    text-align: center;
    min-width: 60px;
  }

  .empty-message {
    text-align: center;
    color: var(--color-text-secondary);
    padding: var(--space-lg);
    margin: 0;
  }
</style>
