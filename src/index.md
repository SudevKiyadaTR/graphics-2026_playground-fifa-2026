<style>
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap");

:root {
  --bg-base: #0d1017;
  --bg-surface: #141b27;
  --bg-raised: #1c2638;
  --border: #253144;
  --border-subtle: #1a2535;
  --text-primary: #f0f4f8;
  --text-secondary: #7d95b0;
  --text-muted: #4a6070;
  --accent: #e8394b;
  --positive: #2bb56a;
  --series-1: #4fb3e8;
  --series-2: #e8394b;
}

.observablehq p,
.observablehq li,
.observablehq div {
  font-family: Inter, sans-serif;
}

.dashboard-shell {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.dashboard-hero {
  background: linear-gradient(135deg, color-mix(in oklab, var(--bg-surface) 90%, #111827) 0%, var(--bg-surface) 60%, color-mix(in oklab, var(--series-1) 12%, var(--bg-surface)) 100%);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
}

.hero-kicker {
  font: 500 0.75rem/1 Inter, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.hero-title {
  margin-top: 10px;
  font: 800 3.2rem/1 "Barlow Condensed", sans-serif;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--text-primary);
}

.hero-sub {
  margin-top: 10px;
  font: 400 1rem/1.6 Inter, sans-serif;
  color: var(--text-secondary);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 16px;
}

.stat-label {
  font: 500 0.72rem/1 Inter, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.stat-value {
  margin-top: 10px;
  font: 800 2.4rem/1 "Barlow Condensed", sans-serif;
  letter-spacing: 0.03em;
  color: var(--text-primary);
}

.stat-note {
  margin-top: 8px;
  font: 400 0.82rem/1.4 "DM Mono", monospace;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
}

.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  margin: 0 0 12px;
  font: 700 1.4rem/1 "Barlow Condensed", sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-primary);
}

.schedule-table-wrap {
  overflow-x: auto;
}

.schedule-table-wrap table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  table-layout: fixed;
}

.schedule-table-wrap thead th {
  font: 500 0.75rem/1 "DM Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  padding: 10px;
  text-align: left;
}

.schedule-table-wrap tbody td {
  padding: 10px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font: 400 0.82rem/1.4 "DM Mono", monospace;
  font-variant-numeric: tabular-nums;
}

.schedule-table-wrap tbody td:first-child,
.schedule-table-wrap thead th:first-child {
  width: 28px;
  padding-left: 6px;
  padding-right: 6px;
}

.schedule-table-wrap tbody td:nth-child(3) {
  color: var(--text-primary);
  font: 500 0.88rem/1.4 "DM Mono", monospace;
}

.schedule-table-wrap tbody td:nth-child(4) {
  color: var(--positive);
  font: 500 0.9rem/1.4 "DM Mono", monospace;
}

.schedule-table-wrap tbody tr:hover td {
  background: var(--bg-raised);
}

.schedule-table-wrap th,
.schedule-table-wrap td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

```js
import { scheduleChart } from "./components/schedule-chart.js";

const matches = await FileAttachment("./data/matches.json").json();
const completed = matches.filter((m) => m.homeScore !== null || m.awayScore !== null);

const totalGoals = completed.reduce(
  (sum, m) => sum + Number(m.homeScore || 0) + Number(m.awayScore || 0),
  0
);
const avgGoals = completed.length ? (totalGoals / completed.length).toFixed(2) : "0.00";
const upcoming = matches.length - completed.length;
const nextMatch = [...matches]
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .find((m) => new Date(m.date) > new Date());
```

```js
display(html`
  <div class="dashboard-shell">
    <section class="dashboard-hero">
      <div class="hero-kicker">FIFA World Cup 2026</div>
      <div class="hero-title">Tournament Control Room</div>
      <div class="hero-sub">
        Live-ready schedule and match intelligence view for all tracked fixtures.
      </div>
    </section>

    <section class="stat-grid">
      <article class="stat-card">
        <div class="stat-label">Matches Tracked</div>
        <div class="stat-value">${matches.length}</div>
        <div class="stat-note">Group + knockout timeline</div>
      </article>
      <article class="stat-card">
        <div class="stat-label">Completed</div>
        <div class="stat-value">${completed.length}</div>
        <div class="stat-note">${upcoming} upcoming</div>
      </article>
      <article class="stat-card">
        <div class="stat-label">Goals Scored</div>
        <div class="stat-value">${totalGoals}</div>
        <div class="stat-note">Avg ${avgGoals} per match</div>
      </article>
      <article class="stat-card">
        <div class="stat-label">Next Match</div>
        <div class="stat-value">
          ${nextMatch
            ? new Date(nextMatch.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "TBD"}
        </div>
        <div class="stat-note">
          ${nextMatch ? `${nextMatch.homeTeam} vs ${nextMatch.awayTeam}` : "Schedule pending"}
        </div>
      </article>
    </section>

    <section class="section-card">
      <h2 class="section-title">Match Schedule</h2>
      ${scheduleChart(matches, Inputs)}
    </section>
  </div>
`);
```
