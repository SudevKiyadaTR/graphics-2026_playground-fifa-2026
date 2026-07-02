<script>
  import { createSvelteTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/svelte-table';
  import { writable } from 'svelte/store';

  export let data = [];
  export let base = '/';

  let sorting = writable([]);
  let globalFilter = writable('');

  const dash = (v) => (v ?? '—');
  const totalAdded = (r) => (r.fhExtra ?? 0) + (r.shExtra ?? 0);

  $: columns = [
    {
      accessorKey: 'match',
      header: 'Match',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
    },
    {
      accessorKey: 'fhTotal',
      header: '1st Half',
    },
    {
      accessorKey: 'fhExtra',
      header: '1st Added',
    },
    {
      accessorKey: 'shTotal',
      header: '2nd Half',
    },
    {
      accessorKey: 'shExtra',
      header: '2nd Added',
    },
    {
      id: 'total',
      header: 'Total Added',
      accessorFn: (r) => totalAdded(r),
    },
  ];

  const NUMERIC = new Set(['fhTotal', 'fhExtra', 'shTotal', 'shExtra', 'total']);

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

  const downloadCsv = () => {
    const header = 'match,date,stage,fh_total,fh_added,sh_total,sh_added,total_added';
    const lines = rows.map((row) => {
      const r = row.original;
      return [r.match, r.date, r.stage, r.fhTotal ?? '', r.fhExtra ?? '', r.shTotal ?? '', r.shExtra ?? '', totalAdded(r)].join(',');
    });
    const blob = new Blob([header + '\n' + lines.join('\n')], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'stoppage-time.csv' });
    a.click();
  };
</script>

<div class="controls">
  <input
    type="text"
    placeholder="Search matches..."
    bind:value={$globalFilter}
    class="search-input"
  />
  <button class="dl-btn" on:click={downloadCsv}>Download CSV</button>
</div>

<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th class="num">#</th>
        {#each $table.getHeaderGroups()[0]?.headers ?? [] as header (header.id)}
          <th
            class:num={NUMERIC.has(header.column.id)}
            on:click={() => handleSort(header.column)}
          >
            <div class="header-cell" class:right={NUMERIC.has(header.column.id)}>
              {#if typeof header.column.columnDef.header === 'string'}
                {header.column.columnDef.header}
              {/if}
              {#if $sorting.find((s) => s.id === header.column.id)}
                <span class="sort-indicator">
                  {$sorting.find((s) => s.id === header.column.id)?.desc ? '↓' : '↑'}
                </span>
              {/if}
            </div>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row, i (row.id)}
        {@const r = row.original}
        <tr>
          <td class="num">{i + 1}</td>
          <td><a href={`${base}matches/${r.matchId}`}>{r.match}</a></td>
          <td class="mono">{r.date}</td>
          <td>{r.stage}</td>
          <td class="num">{dash(r.fhTotal)}</td>
          <td class="num">{dash(r.fhExtra)}</td>
          <td class="num">{dash(r.shTotal)}</td>
          <td class="num">{dash(r.shExtra)}</td>
          <td class="num total">{totalAdded(r) || '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if rows.length === 0}
    <p class="empty-message">No matches found</p>
  {/if}
</div>

<style>
  .controls {
    display: flex;
    gap: var(--space-md);
    align-items: center;
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
  .dl-btn {
    margin-left: auto;
    padding: var(--space-xs) var(--space-md);
    font: var(--font-label);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    cursor: pointer;
    color: var(--color-text-secondary);
  }
  .dl-btn:hover {
    border-color: var(--color-text-primary);
    color: var(--color-text-primary);
  }

  .table-wrap {
    overflow-x: auto;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font: var(--font-body-sm);
  }
  th, td {
    padding: var(--space-sm) var(--space-md);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }
  th {
    font: var(--font-label);
    color: var(--color-text-secondary);
    background: var(--color-bg-surface);
    cursor: pointer;
    user-select: none;
  }
  th:hover {
    background: var(--color-bg-hover);
  }
  .header-cell {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }
  .header-cell.right {
    justify-content: flex-end;
  }
  .sort-indicator {
    font-size: 0.75rem;
    color: var(--color-home);
    font-weight: bold;
  }
  tr:hover td {
    background: var(--color-bg-surface);
  }
  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .mono {
    font-family: monospace;
    font-size: 0.85em;
    color: var(--color-text-secondary);
  }
  .total {
    font-weight: 600;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  .empty-message {
    text-align: center;
    color: var(--color-text-secondary);
    padding: var(--space-lg);
    margin: 0;
  }
</style>
