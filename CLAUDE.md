# FIFA 2026 Dashboard

## Project Overview

Static tournament dashboard for FIFA World Cup 2026. A Node.js scraper runs on a schedule (cron/GitHub Actions) and writes raw JSON to `scraped-data/`. Astro reads those files at build time, renders static pages, and embeds Svelte components for client-side interactivity (e.g., player table filtering).

**Architecture:**

- **Data:** JSON files written by scraper to `scraped-data/`
- **Build:** Astro (static site generator) loads JSON at build time
- **Interactivity:** Svelte components for client-side filtering/sorting
- **Styling:** CSS with design tokens
- **Deployment:** Static files to any CDN/host

## Project Structure

```
src/
  pages/                    # Astro pages (one route per file)
    index.astro            # Main dashboard
    matches/
      [id].astro           # Per-match page (parameterized)
    players.astro          # Player stats with filtering
  components/              # Svelte components (.svelte)
    PlayerTable.svelte     # Sortable, filterable player table
    MatchCard.svelte       # Match result card
    Header.astro           # Global header (Astro component)
    Footer.astro           # Global footer
  layouts/
    Base.astro             # Root layout (html, head, body)
  lib/
    data.js                # Utility functions to load/process JSON
    constants.js           # Shared constants, color tokens
  styles/
    global.css             # Global styles (typography, resets)
    tokens.css             # Design tokens (colors, spacing, font sizes)
scraped-data/              # JSON output from scraper (not in version control)
scripts/
  scrape.js                # Node.js scraper
public/                    # Static assets (favicon, images)
```

## Workflow

### Before starting a task

```bash
git checkout main
git pull
git checkout -b task/N-<short-slug>
```

Work entirely on that branch. Do not commit directly to `main`.

### After completing a task

1. **Update `progress.md`** — append task completion entry with files changed and verification
2. **Commit and push** the branch
3. **Merge to main** with descriptive message

All three steps required before starting the next task.

## Tech Stack

- **Framework:** Astro (v5+) — static site generation
- **Components:** Svelte — client-side interactivity
- **Styling:** CSS with custom properties (no framework needed)
- **Data:** JSON files loaded at build time via `import assert { type: 'json' }`
- **Dev:** `npm run dev` (hot reload)
- **Build:** `npm run build` (outputs static site to `dist/`)
- **Scraper:** `npm run scrape` (writes to `scraped-data/`)

## Data Loading

### In Astro pages

Load JSON at build time (static import):

```javascript
---
import standings from '../data/standings.json' assert { type: 'json' };
import PlayerTable from '../components/PlayerTable.svelte';
---

<PlayerTable data={standings} />
```

### In Svelte components

Receive data as props from parent Astro page:

```svelte
<script>
  export let data = [];
  let selectedCount = 25;
  $: filtered = data.slice(0, selectedCount);
</script>

<select bind:value={selectedCount}>
  <option value={25}>Top 25</option>
  <option value={50}>Top 50</option>
  <option value={100}>Top 100</option>
  <option value={1000}>All</option>
</select>

<table>
  <thead>
    <tr><th>Player</th><th>Goals</th></tr>
  </thead>
  <tbody>
    {#each filtered as player (player.id)}
      <tr>
        <td>{player.name}</td>
        <td>{player.goals}</td>
      </tr>
    {/each}
  </tbody>
</table>
```

## Svelte Patterns

**Reactive statements:** `$:` runs whenever dependencies change

```svelte
let count = 0;
$: doubled = count * 2;  // runs whenever count changes
```

**Two-way binding:**

- `bind:value={variable}` for inputs/selects
- `bind:checked={boolean}` for checkboxes
- `bind:this={element}` for DOM refs

**Conditionals & loops:**

```svelte
{#if condition}
  <p>Shown if true</p>
{:else}
  <p>Shown if false</p>
{/if}

{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}
```

## Styling

- **Global:** `src/styles/global.css` (resets, typography, layout)
- **Tokens:** `src/styles/tokens.css` (CSS custom properties)
- **Components:** Scoped `<style>` in Svelte files (auto-scoped to component)

Example Svelte scoped styles:

```svelte
<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    padding: var(--spacing-md);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }
</style>
```

## Building & Deployment

```bash
npm run dev              # Local dev server (http://localhost:3000)
npm run build            # Static build to dist/
npm run preview          # Preview built site locally
npm run scrape           # Update scraped-data/
npm run lint:fix         # Auto-fix linting
npm run format           # Auto-format code
```

After building, `dist/` contains static HTML/CSS/JS. Deploy it anywhere.

## Code Quality

Before committing:

```bash
npm run lint:fix    # ESLint auto-fix
npm run format      # Prettier auto-format
```

Must pass before merging to main. Fix any remaining lint errors manually.

## References

- **`DESIGN.md`** — Colors, typography, spacing, layout rules
- **`FIFA_CONVENTIONS.md`** — Tournament structure, scoring, display standards
