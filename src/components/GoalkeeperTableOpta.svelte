<script>
  export let goalkeepers = [];

  let sortKey = 'saves';
  let sortDir = -1; // -1 = desc

  function setSort(key) {
    if (sortKey === key) {
      sortDir *= -1;
    } else {
      sortKey = key;
      sortDir = -1;
    }
  }

  $: sorted = [...goalkeepers].sort((a, b) => {
    const av = a[sortKey] ?? -Infinity;
    const bv = b[sortKey] ?? -Infinity;
    return (av < bv ? -1 : av > bv ? 1 : 0) * sortDir;
  });

  const fmt = (v, decimals = 0) =>
    v == null ? '—' : typeof v === 'number' ? v.toFixed(decimals) : v;

  const pct = (v) => (v == null ? '—' : (v * 100).toFixed(1) + '%');

  const COLS = [
    { key: 'playerName', label: 'Goalkeeper', numeric: false },
    { key: 'teamName', label: 'Team', numeric: false },
    { key: 'appearances', label: 'Apps', numeric: true },
    { key: 'saves', label: 'Saves', numeric: true },
    { key: 'shotsFaced', label: 'Shots Faced', numeric: true },
    { key: 'savePct', label: 'Save%', numeric: true, format: pct },
    { key: 'goalsConceded', label: 'GC', numeric: true },
    { key: 'cleanSheets', label: 'CS', numeric: true },
    { key: 'goalKicks', label: 'Goal Kicks', numeric: true },
    { key: 'penaltyFaced', label: 'Pens Faced', numeric: true },
    { key: 'penaltySave', label: 'Pen Saves', numeric: true },
    { key: 'totalClearance', label: 'Clearances', numeric: true },
    { key: 'passPct', label: 'Pass%', numeric: true, format: pct },
  ];

  const csvCell = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  function downloadCsv() {
    const rows = [
      COLS.map((c) => c.label),
      ...sorted.map((gk) => COLS.map((c) => gk[c.key])),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'goalkeepers-opta.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<button class="csv-btn" on:click={downloadCsv}>Download CSV</button>

<div class="table-wrap">
  <table>
    <thead>
      <tr>
        {#each COLS as col}
          <th
            class:numeric={col.numeric}
            class:active={sortKey === col.key}
            on:click={() => setSort(col.key)}
          >
            {col.label}
            {#if sortKey === col.key}
              <span class="sort-icon">{sortDir === -1 ? '↓' : '↑'}</span>
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sorted as gk (gk.playerId)}
        <tr>
          {#each COLS as col}
            <td class:numeric={col.numeric}>
              {#if col.format}
                {col.format(gk[col.key])}
              {:else if col.numeric}
                {fmt(gk[col.key])}
              {:else}
                {gk[col.key]}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .csv-btn {
    margin-bottom: var(--space-sm);
    padding: var(--space-xs) var(--space-md);
    font: var(--font-body-sm);
    color: var(--color-text-secondary);
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: pointer;
  }
  .csv-btn:hover {
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
  th {
    padding: var(--space-sm) var(--space-md);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-surface);
    font: var(--font-label);
    color: var(--color-text-secondary);
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
  }
  th:hover {
    color: var(--color-text-primary);
  }
  th.active {
    color: var(--color-text-primary);
  }
  td {
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-border-subtle);
    white-space: nowrap;
  }
  tr:hover td {
    background: var(--color-bg-surface);
  }
  .numeric {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .sort-icon {
    margin-left: 4px;
    font-size: 0.75em;
  }
</style>
