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

#observablehq-toc {
  display: none !important;
}

#observablehq-main {
  width: 100%;
  padding-right: 0 !important;
}

.match-shell {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.match-header {
  background: linear-gradient(135deg, color-mix(in oklab, var(--bg-surface) 90%, #111827) 0%, var(--bg-surface) 60%, color-mix(in oklab, var(--series-1) 12%, var(--bg-surface)) 100%);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
}

.match-kicker {
  font: 500 0.75rem/1 Inter, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.match-scoreline {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
}

.team-box {
  text-align: center;
}

.team-name {
  font: 600 1rem/1.4 Inter, sans-serif;
  color: var(--text-primary);
}

.team-score {
  margin-top: 8px;
  font: 800 4rem/1 "Barlow Condensed", sans-serif;
  letter-spacing: 0.03em;
  color: var(--text-primary);
}

.team-score.tbd {
  font-size: 2rem;
  color: var(--text-secondary);
}

.scoreline-divider {
  text-align: center;
  color: var(--text-secondary);
  font: 400 0.9rem/1 Inter, sans-serif;
}

.match-meta {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.meta-item {
  text-align: center;
}

.meta-label {
  font: 500 0.72rem/1 Inter, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.meta-value {
  margin-top: 6px;
  font: 600 0.9rem/1.4 "DM Mono", monospace;
  color: var(--text-primary);
}

.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  margin: 0 0 16px;
  font: 700 1.4rem/1 "Barlow Condensed", sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-primary);
}

.section-content {
  overflow-x: auto;
}

.timeline-chart-container {
}

.timeline-chart-container svg {
  width: 100%;
  height: auto;
}

.field-timeline-container {
}

.field-timeline-container svg {
  width: 100%;
  height: auto;
}

.timeline-event {
  padding: 12px;
  border-left: 3px solid var(--border);
  margin-bottom: 8px;
  font: 400 0.82rem/1.4 "DM Mono", monospace;
  color: var(--text-secondary);
}

.timeline-event.goal {
  border-left-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 5%, transparent);
}

.timeline-event.goal .event-type {
  color: var(--accent);
  font-weight: 600;
}

.event-type {
  color: var(--text-primary);
  font-weight: 600;
}

.event-minute {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.back-link {
  font: 500 0.9rem/1 Inter, sans-serif;
  color: var(--series-1);
  text-decoration: none;
  display: inline-block;
  margin-bottom: 16px;
}

.back-link:hover {
  text-decoration: underline;
}
</style>

```js
const matches = await FileAttachment("../data/matches.json").json();
const timelines = await FileAttachment("../data/match-timelines.json").json();
const stadiums = await FileAttachment("../data/stadium-info.json").json();
const liveDataMap = await FileAttachment("../data/live-data.json").json();

// Import D3 and chart components
import { matchTimelineChart } from "../components/match-timeline-chart.js";
import { footballFieldTimeline } from "../components/football-field-timeline.js";
const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7.8.5/+esm");

// Extract match ID from URL path
const pathname = typeof window !== "undefined" ? window.location.pathname : "";
const idMatch = pathname.match(/\/matches\/(\d+)/);
const matchId = idMatch ? idMatch[1] : null;

const match = matches.find((m) => String(m.id) === matchId);

if (!match) {
  throw new Error(`Match with ID ${matchId} not found`);
}

const timeline = timelines[String(match.id)] || { Event: [] };
const events = timeline.Event || [];

// Get live data for this match
const liveData = liveDataMap[matchId];
const stadiumName = liveData?.Stadium?.Name?.[0]?.Description || "Unknown Stadium";
const attendance = liveData?.Attendance ? Number(liveData.Attendance).toLocaleString() : "–";

// Look up capacity from stadium database
const stadiumInfo = stadiums.stadiums.find((s) => s.name === stadiumName);
const capacity = stadiumInfo ? stadiumInfo.capacity.toLocaleString() : "–";
```

```js
display(html`
  <a href="/" class="back-link">← Back to Dashboard</a>

  <div class="match-shell">
    <section class="match-header">
      <div class="match-kicker">${match.stage} – ${match.group}</div>
      <div class="match-scoreline">
        <div class="team-box">
          <div class="team-name">${match.homeTeam}</div>
          <div class="team-score${match.homeScore === null ? " tbd" : ""}">
            ${match.homeScore ?? "TBD"}
          </div>
        </div>
        <div class="scoreline-divider">
          ${new Date(match.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
        <div class="team-box">
          <div class="team-name">${match.awayTeam}</div>
          <div class="team-score${match.awayScore === null ? " tbd" : ""}">
            ${match.awayScore ?? "TBD"}
          </div>
        </div>
      </div>
      <div class="match-meta">
        <div class="meta-item">
          <div class="meta-label">Stadium</div>
          <div class="meta-value">${stadiumName}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Capacity</div>
          <div class="meta-value">${capacity}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Attendance</div>
          <div class="meta-value">${attendance}</div>
        </div>
      </div>
    </section>

    ${events.length > 0
      ? html`
          <section class="section-card">
            <h2 class="section-title">Match Timeline</h2>
            <div class="timeline-chart-container">${matchTimelineChart(match, events, d3)}</div>
          </section>
        `
      : ""}
    ${events.length > 0
      ? html`
          <section class="section-card">
            <h2 class="section-title">Field Timeline</h2>
            <div class="field-timeline-container">${footballFieldTimeline(match, events, d3)}</div>
          </section>
        `
      : ""}

    <section class="section-card">
      <h2 class="section-title">Match Summary</h2>
      <div>
        <strong>${match.homeTeam}</strong> vs <strong>${match.awayTeam}</strong>
        <br />
        <span style="color: var(--text-muted); font-size: 0.9rem;">
          ${match.stage} • ${match.group} •
          ${new Date(match.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
    </section>
  </div>
`);
```
