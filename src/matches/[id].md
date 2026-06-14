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

.viz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  width: 100%;
}

@media (max-width: 768px) {
  .viz-grid {
    grid-template-columns: 1fr;
  }
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
  display: flex;
  justify-content: center;
  align-items: flex-start;
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
const teamStatsMap = await FileAttachment("../data/team-stats.json").json();
const powerRankingMap = await FileAttachment("../data/power-ranking.json").json();
const playerStatsMap = await FileAttachment("../data/player-stats.json").json();

// Import D3 and chart components
import { matchTimelineChart } from "../components/match-timeline-chart.js";
import { footballFieldTimeline } from "../components/football-field-timeline.js";
import { teamStatsBars } from "../components/team-stats-bars.js";
import { powerRankingRadarOverlay } from "../components/power-ranking-radar-overlay.js";
import { shotMap } from "../components/shot-map.js";
import { possessionProgression } from "../components/possession-progression.js";
import { pressingIntensityHeat } from "../components/pressing-intensity.js";
import { crossEfficiency } from "../components/cross-efficiency.js";
import { playerDistance } from "../components/player-distance.js";
import { defensiveActionsMatrix } from "../components/defensive-actions.js";
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

// Get team stats for this match
const teamStats = teamStatsMap[matchId] || null;
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
    ${teamStats
      ? html`
          <section class="section-card">
            <h2 class="section-title">Team Stats Comparison</h2>
            <div class="section-content">
              ${teamStatsBars(teamStats, match.homeTeam, match.awayTeam, d3)}
            </div>
          </section>
        `
      : ""}
    ${powerRankingMap[matchId]
      ? html`
          <section class="section-card">
            <h2 class="section-title">Player Power Profiles</h2>
            <div class="section-content">${powerRankingRadarOverlay(powerRankingMap[matchId])}</div>
          </section>
        `
      : ""}

    <section class="section-card" style="padding: 0; background: none; border: none;">
      <h2 class="section-title" style="padding: 0 20px;">Match Analytics</h2>
      <div class="viz-grid" style="padding: 0 20px;">
        ${teamStats
          ? html`
              <div class="section-card">
                <h3 class="section-title" style="margin-bottom: 12px; font-size: 1.1rem;">
                  Shot Map
                </h3>
                <div class="section-content">${shotMap(teamStats, timeline, match, d3)}</div>
              </div>
            `
          : ""}
        ${teamStats
          ? html`
              <div class="section-card">
                <h3 class="section-title" style="margin-bottom: 12px; font-size: 1.1rem;">
                  Possession Progression
                </h3>
                <div class="section-content">${possessionProgression(teamStats, match, d3)}</div>
              </div>
            `
          : ""}
        ${teamStats
          ? html`
              <div class="section-card">
                <h3 class="section-title" style="margin-bottom: 12px; font-size: 1.1rem;">
                  Pressing Intensity
                </h3>
                <div class="section-content">${pressingIntensityHeat(teamStats, match, d3)}</div>
              </div>
            `
          : ""}
        ${teamStats
          ? html`
              <div class="section-card">
                <h3 class="section-title" style="margin-bottom: 12px; font-size: 1.1rem;">
                  Cross Efficiency
                </h3>
                <div class="section-content">${crossEfficiency(teamStats, match, d3)}</div>
              </div>
            `
          : ""}
        ${playerStatsMap && Object.keys(playerStatsMap).length > 0
          ? html`
              <div class="section-card">
                <h3 class="section-title" style="margin-bottom: 12px; font-size: 1.1rem;">
                  Player Workload
                </h3>
                <div class="section-content">${playerDistance(playerStatsMap, match, d3)}</div>
              </div>
            `
          : ""}
        ${teamStats
          ? html`
              <div class="section-card">
                <h3 class="section-title" style="margin-bottom: 12px; font-size: 1.1rem;">
                  Defensive Actions
                </h3>
                <div class="section-content">${defensiveActionsMatrix(teamStats, match, d3)}</div>
              </div>
            `
          : ""}
      </div>
    </section>

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
