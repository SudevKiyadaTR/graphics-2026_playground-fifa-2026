# Design System — FIFA 2026 Dashboard

Dark, data-dense, sporty. Focused on clarity and quick scanning of tournament information.

## Typography

### Typeface Stack

| Role                      | Family               | Weight   | Usage                           |
| ------------------------- | -------------------- | -------- | ------------------------------- |
| Display (titles, scores)  | **Barlow Condensed** | 700, 800 | Uppercase, tournament authority |
| UI / Body                 | **Inter**            | 400, 500 | All prose, labels, UI text      |
| Data (tables, numbers)    | **DM Mono**          | 400, 500 | All numeric readouts            |

Load from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
/>
```

### Type Scale

Define in `src/styles/tokens.css`:

```css
/* Display — scorelines, page headings */
--font-display-xl: 800 4rem/1 "Barlow Condensed", sans-serif;
--font-display-lg: 700 2.5rem/1 "Barlow Condensed", sans-serif;
--font-display-md: 700 1.75rem/1 "Barlow Condensed", sans-serif;

/* Body — prose, labels */
--font-body-lg: 400 1rem/1.6 Inter, sans-serif;
--font-body-sm: 400 0.875rem/1.5 Inter, sans-serif;
--font-label: 500 0.75rem/1 Inter, sans-serif;

/* Data — numeric, tables, charts */
--font-mono: 400 0.875rem/1 "DM Mono", monospace;
--font-mono-lg: 500 1.25rem/1 "DM Mono", monospace;
```

**Rule:** Any number compared across rows (goals, points, position) must use `DM Mono` with `font-variant-numeric: tabular-nums`.

---

## Color Palette

Dark background with layered surfaces. All colors designed for ≥ 3:1 contrast on dark backgrounds.

### Core Tokens

```css
:root {
  /* Backgrounds */
  --color-bg-base: #0d1017;      /* page background */
  --color-bg-surface: #141b27;   /* cards, panels */
  --color-bg-raised: #1c2638;    /* hover, active */

  /* Borders */
  --color-border: #253144;
  --color-border-subtle: #1a2535;

  /* Text */
  --color-text-primary: #f0f4f8;    /* body, labels */
  --color-text-secondary: #7d95b0;  /* secondary labels */
  --color-text-muted: #4a6070;      /* captions, placeholders */

  /* Status colors */
  --color-positive: #2bb56a;  /* wins, rankings up */
  --color-negative: #e8394b;  /* losses, rankings down */
  --color-neutral: #7d95b0;   /* draws, neutral state */

  /* Team colors */
  --color-home: #4fb3e8;   /* home team (blue) */
  --color-away: #e8394b;   /* away team (red) */
  --color-accent-1: #f0a04a;  /* third series */
  --color-accent-2: #7c5cce;  /* fourth series */
  --color-accent-3: #2bb56a;  /* fifth series */
}
```

### Encoding Rules

- **Home team:** always `--color-home` (blue)
- **Away team:** always `--color-away` (red)
- **Wins/gains:** `--color-positive` (green)
- **Losses/drops:** `--color-negative` (red, only if not already encoding away team)
- **Draws/neutral:** `--color-neutral` (gray)

---

## Component Patterns

### Stat Card (Scoreline)

```svelte
<div class="stat-card">
  <div class="stat-card__value">2–1</div>
  <div class="stat-card__label">Final Score</div>
</div>
```

```css
.stat-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 16px 20px;
}

.stat-card__value {
  font: var(--font-display-xl);
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
}

.stat-card__label {
  font: var(--font-label);
  color: var(--color-text-secondary);
  margin-top: 4px;
  text-transform: uppercase;
}
```

### Data Table

```svelte
<table class="table">
  <thead>
    <tr>
      <th>Player</th>
      <th>Goals</th>
      <th>Assists</th>
    </tr>
  </thead>
  <tbody>
    {#each players as player}
      <tr>
        <td>{player.name}</td>
        <td>{player.goals}</td>
        <td>{player.assists}</td>
      </tr>
    {/each}
  </tbody>
</table>
```

```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.table th {
  font: var(--font-label);
  color: var(--color-text-muted);
  text-align: right;
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-raised);
}

.table th:first-child {
  text-align: left;
}

.table td {
  font: var(--font-mono);
  color: var(--color-text-primary);
  text-align: right;
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.table td:first-child {
  font: var(--font-body-sm);
  text-align: left;
}

.table tbody tr:hover {
  background: var(--color-bg-raised);
}
```

### Delta Badge (Rank Change)

```svelte
<span class="delta delta--up">↑ 3</span>
<span class="delta delta--flat">–</span>
<span class="delta delta--down">↓ 1</span>
```

```css
.delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font: var(--font-mono);
  padding: 2px 6px;
  border-radius: 3px;
  font-variant-numeric: tabular-nums;
}

.delta--up {
  color: var(--color-positive);
  background: rgba(43, 181, 106, 0.1);
}

.delta--down {
  color: var(--color-negative);
  background: rgba(232, 57, 75, 0.1);
}

.delta--flat {
  color: var(--color-text-muted);
}
```

### Form Inputs

```svelte
<select class="select">
  <option value={25}>Top 25</option>
  <option value={50}>Top 50</option>
</select>
```

```css
.select {
  appearance: none;
  background: var(--color-bg-surface) url('data:image/svg+xml...') no-repeat right 8px center;
  background-size: 16px;
  padding: 8px 32px 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-primary);
  font: var(--font-body-sm);
  cursor: pointer;
}

.select:hover {
  border-color: var(--color-border);
  background-color: var(--color-bg-raised);
}

.select:focus {
  outline: none;
  border-color: var(--color-home);
  box-shadow: 0 0 0 3px rgba(79, 179, 232, 0.1);
}
```

---

## Layout & Spacing

Base grid: **8px**. All margins, padding, gaps in multiples of 8.

```
4px  — tight (badge, icon)
8px  — component gap
16px — card padding
24px — section gap
32px — major section
48px — page-level break
```

**Max content width:** `1200px`  
**Responsive breakpoint:** `900px` (switches from single to two-column layouts)

---

## Match Timeline Events

| Event            | Color                    |
| ---------------- | ------------------------ |
| Goal             | `--color-positive`       |
| Yellow card      | `#f0c040`                |
| Red card         | `--color-negative`       |
| Substitution     | `--color-home` (generic) |
| Own goal         | `--color-accent-1`       |
| Penalty          | `--color-accent-2`       |

Minute labels: `--font-mono`, `--color-text-secondary`  
Player names: `--font-body-sm`, `--color-text-primary`

---

## Don'ts

- No pure white (`#fff`) text — use `--color-text-primary` to reduce eye strain
- No decorative shadows on data — use borders for layering
- No Barlow Condensed for body text (display only)
- No mixing more than two team colors in a single chart
- No pie charts (use horizontal bar charts instead)
- All numeric tables must use `tabular-nums`
