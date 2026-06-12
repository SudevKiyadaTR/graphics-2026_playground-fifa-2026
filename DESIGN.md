# Design System — FIFA 2026 Dashboard

Dark, data-dense, sporty. Built on Observable Framework's `near-midnight` theme.

---

## Typography

### Typeface Stack

| Role | Family | Weight | Notes |
|---|---|---|---|
| Display (titles, scorelines) | **Barlow Condensed** | 700, 800 | Uppercase, tracking +0.04em. Sporty authority. |
| UI / Body | **Inter** | 400, 500, 600 | Proportional. Never use monospace for paragraphs or labels. |
| Chart data (axes, stats, tables) | **DM Mono** | 400, 500 | Tabular-nums enabled. Clean ascenders, no quirky stylistics. |

All three are Google Fonts. Load a single `<link>` preconnect + stylesheet:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap">
```

### Type Scale

```css
/* Display — match scorelines, page headings */
.display-xl  { font: 800 4rem/1    'Barlow Condensed', sans-serif; letter-spacing: 0.02em; text-transform: uppercase; }
.display-lg  { font: 700 2.5rem/1  'Barlow Condensed', sans-serif; letter-spacing: 0.03em; text-transform: uppercase; }
.display-md  { font: 700 1.75rem/1 'Barlow Condensed', sans-serif; letter-spacing: 0.03em; text-transform: uppercase; }

/* Body — prose, labels, captions */
.body-lg     { font: 400 1rem/1.6     Inter, sans-serif; }
.body-sm     { font: 400 0.875rem/1.5 Inter, sans-serif; }
.label       { font: 500 0.75rem/1    Inter, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }

/* Data — all numeric readouts, table cells, chart ticks */
.mono        { font: 400 0.875rem/1   'DM Mono', monospace; font-variant-numeric: tabular-nums; }
.mono-lg     { font: 500 1.25rem/1    'DM Mono', monospace; font-variant-numeric: tabular-nums; }
```

**Rule:** any number that a viewer will compare across rows (goals, minutes, rankings, possession %) must use `DM Mono` with `tabular-nums`.

---

## Color Palette

The `near-midnight` Observable theme handles the base background (`#0d1017`). Layer these tokens on top.

### Core Tokens

```css
:root {
  /* Backgrounds */
  --bg-base:    #0d1017;   /* near-midnight default */
  --bg-surface: #141b27;   /* cards, panels */
  --bg-raised:  #1c2638;   /* hovered card, header row */

  /* Borders */
  --border:     #253144;
  --border-subtle: #1a2535;

  /* Text */
  --text-primary:   #f0f4f8;
  --text-secondary: #7d95b0;
  --text-muted:     #4a6070;

  /* Accent — scarlet red (main tournament energy) */
  --accent:         #e8394b;
  --accent-dim:     #7a1c26;

  /* Positive / Negative */
  --positive:   #2bb56a;   /* ranking up, wins */
  --negative:   #e8394b;   /* ranking down, losses */
  --neutral:    #7d95b0;   /* draws */

  /* Data series (categorical, accessible at ≥ 3:1 contrast on --bg-surface) */
  --series-1: #4fb3e8;  /* home team / primary series */
  --series-2: #e8394b;  /* away team / secondary series */
  --series-3: #f0a04a;  /* third series / highlights */
  --series-4: #7c5cce;  /* fourth series */
  --series-5: #2bb56a;  /* fifth series */
}
```

### Categorical Encoding Rules

- Home team always `--series-1` (cool blue), away team always `--series-2` (red).
- Do not use red for negative state when it already encodes the away team — use amber `--series-3` for warnings in that context.
- The `--accent` scarlet is reserved for callouts, active state, and critical highlights. Don't use it as a series color.

---

## Chart Conventions (Observable Plot)

### Shared Plot Style Object

Define once in `src/components/_theme.js` and import into every chart component:

```js
export const plotDefaults = {
  style: {
    background: "transparent",
    color: "var(--text-primary)",
    fontFamily: "'DM Mono', monospace",   // all axes, tick labels, channel labels
    fontSize: "11px",
    fontVariantNumeric: "tabular-nums",
  },
  marginLeft: 48,
  marginBottom: 36,
  marginTop: 16,
  marginRight: 16,
  x: { tickSize: 4, tickPadding: 6 },
  y: { tickSize: 4, tickPadding: 6 },
  color: { scheme: "observable10" },     // override per-chart when using the tokens above
};
```

Apply as:
```js
Plot.plot({ ...plotDefaults, marks: [...] })
```

### Axis & Grid

```js
// Gridlines: very subtle, never compete with data
Plot.gridY({ stroke: "var(--border-subtle)", strokeWidth: 1 })
Plot.gridX({ stroke: "var(--border-subtle)", strokeWidth: 1 })
```

- Tick labels: `DM Mono`, 11px, `--text-secondary`
- Axis titles: `Inter`, 11px, `--text-muted`, uppercase, `letterSpacing: "0.06em"`
- Remove both axes' domain lines (set `stroke: "none"` on axis marks)

### Tooltip / Pointer

Use Observable's built-in `Plot.tip()` mark. Style override:

```css
.plot-tip {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: var(--text-primary);
  padding: 8px 10px;
}
```

---

## Component Patterns

### Score / Stat Callout Card

Large number display for scorelines and key stats.

```css
.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 16px 20px;
}

.stat-card__value {
  font: 800 3rem/1 'Barlow Condensed', sans-serif;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}

.stat-card__label {
  font: 500 0.7rem/1 Inter, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-top: 4px;
}
```

### Standings / Leaderboard Table

```css
table.standings {
  width: 100%;
  border-collapse: collapse;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

table.standings th {
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-align: right;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border);
}

table.standings th:first-child { text-align: left; }

table.standings td {
  color: var(--text-primary);
  text-align: right;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-subtle);
}

table.standings td:first-child { text-align: left; font-family: Inter, sans-serif; }

table.standings tr:hover td { background: var(--bg-raised); }
```

Qualification spots: a 3px left border in `--positive` (green) for top 2 qualifying, `--series-3` (amber) for playoff spots.

### Power Ranking Delta Badge

```css
.delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font: 500 0.8rem/1 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  padding: 2px 6px;
  border-radius: 3px;
}

.delta--up   { color: var(--positive); background: color-mix(in srgb, var(--positive) 12%, transparent); }
.delta--down { color: var(--negative); background: color-mix(in srgb, var(--negative) 12%, transparent); }
.delta--flat { color: var(--neutral);  background: transparent; }
```

### Timeline Event Marker

Colors for match timeline events:

| Event | Color |
|---|---|
| Goal | `--positive` (#2bb56a) |
| Yellow card | #f0c040 |
| Red card | `--negative` (#e8394b) |
| Substitution (on) | `--series-1` (blue) |
| Substitution (off) | `--text-muted` |
| Own goal | `--series-3` (amber) |

Minute labels in `DM Mono`, 11px, `--text-secondary`. Player names in `Inter`, 13px.

---

## Layout & Spacing

8px base grid. Use multiples of 8 for all margin, padding, and gap values.

```
4px  — tight internal padding (badge, chip)
8px  — component internal gap
16px — card padding, section gap (small)
24px — card padding (comfortable), inter-component gap
32px — section separation
48px — major section break
```

Page column width cap: `1200px`. Two-column layout at ≥ 900px.

---

## Observable Framework Integration

Override CSS custom properties in `src/style.css` (loaded by Observable via `import` in the `.md` pages or globally via `observablehq.config.js`'s `styles` key if supported, otherwise inline `<style>` block at the top of each page):

```css
/* src/style.css */
:root {
  /* Inherit near-midnight backgrounds; add tokens above */
}

/* Replace Observable's default monospace (Courier) on data tables */
.observablehq table {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}

/* Keep body prose in Inter */
.observablehq p, .observablehq li {
  font-family: Inter, sans-serif;
}
```

---

## Don'ts

- Do not use Barlow Condensed for body copy — it is display-only.
- Do not use `monospace` (system fallback) for data — always specify `'DM Mono', monospace`.
- Do not use more than two accent colors in a single chart.
- Do not use pure `#ffffff` text — use `--text-primary` (`#f0f4f8`) to reduce harshness on dark backgrounds.
- Do not add drop shadows to chart marks — they read as amateur. Use borders or opacity for layering.
- Do not use pie charts. Use horizontal bar charts for part-to-whole data.
