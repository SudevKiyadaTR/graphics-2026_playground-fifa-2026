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
  --positive: #2bb56a;
  --series-1: #4fb3e8;
}

.observablehq p,
.observablehq li,
.observablehq div {
  font-family: Inter, sans-serif;
}

.observablehq-toc,
nav.observablehq-toc {
  display: none !important;
}

/* Keep homepage TOC/sidebar available; hide it on this detail page only. */
body > div > aside,
.observablehq-sidebar {
  display: none !important;
}

body > div {
  grid-template-columns: minmax(0, 1fr) !important;
}

.observablehq-main,
main.observablehq-main,
body > div > main {
  width: 100% !important;
  max-width: none !important;
}

.players-shell {
  max-width: none;
  width: 100%;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.headline {
  margin: 0;
  font: 800 3rem/1 "Barlow Condensed", sans-serif;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--text-primary);
}

.subhead {
  margin-top: 8px;
  font: 400 1rem/1.6 Inter, sans-serif;
  color: var(--text-secondary);
}

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.snapshot-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 16px;
}

.snapshot-label {
  font: 500 0.72rem/1 Inter, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.snapshot-value {
  margin-top: 10px;
  font: 800 2.4rem/1 "Barlow Condensed", sans-serif;
  letter-spacing: 0.03em;
  color: var(--text-primary);
}

.snapshot-note {
  margin-top: 8px;
  color: var(--text-muted);
  font: 400 0.82rem/1.4 "DM Mono", monospace;
  font-variant-numeric: tabular-nums;
}

.table-wrap {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.table-title {
  margin: 0 0 12px;
  font: 700 1.4rem/1 "Barlow Condensed", sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-primary);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.table-header .table-title {
  margin: 0;
}

.table-controls {
  min-width: 196px;
  max-width: 220px;
  width: 100%;
}

.table-controls form {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin: 0;
}

.table-controls label {
  display: inline-flex;
  align-items: center;
  height: 34px;
  line-height: 34px;
  margin: 0 !important;
  padding: 0 !important;
  color: var(--text-secondary);
  font: 500 0.72rem/1 "DM Mono", monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.table-controls select {
  width: 112px;
  height: 34px;
  padding: 0 10px;
  margin: 0 !important;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-raised);
  color: var(--text-primary);
  font: 500 0.82rem/1 "DM Mono", monospace;
}

.table-controls select:focus {
  outline: 2px solid color-mix(in srgb, var(--series-1) 55%, transparent);
  outline-offset: 1px;
}

@media (max-width: 760px) {
  .table-header {
    align-items: center;
    flex-direction: column;
    gap: 10px;
  }

  .table-controls {
    min-width: 0;
    max-width: none;
    justify-content: flex-start;
  }
}

.table-wrap table {
  width: 100%;
  min-width: 1680px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.table-wrap thead th:first-child,
.table-wrap tbody td:first-child {
  display: none;
}

.table-wrap thead th:nth-child(2),
.table-wrap tbody td:nth-child(2) {
  width: 64px;
  min-width: 64px;
  max-width: 64px;
}

.table-wrap thead th:nth-child(3),
.table-wrap tbody td:nth-child(3) {
  width: 220px;
  min-width: 220px;
  max-width: 220px;
}

.table-wrap thead th:nth-child(4),
.table-wrap tbody td:nth-child(4) {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
}

.table-wrap thead th {
  font: 500 0.75rem/1 "DM Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  padding: 10px;
  text-align: right;
}

.table-wrap thead th:nth-child(3),
.table-wrap thead th:nth-child(4) {
  text-align: left;
}

.table-wrap thead th:nth-child(2),
.table-wrap tbody td:nth-child(2) {
  text-align: right;
}

.table-wrap tbody td {
  padding: 10px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
  text-align: right;
  font: 400 0.88rem/1.4 "DM Mono", monospace;
  font-variant-numeric: tabular-nums;
}

.table-wrap tbody td:nth-child(3),
.table-wrap tbody td:nth-child(4) {
  text-align: left;
  font: 500 0.88rem/1.4 "DM Mono", monospace;
  font-variant-numeric: tabular-nums;
}

.table-wrap tbody td:nth-child(2) {
  text-align: right;
}

.table-wrap tbody tr:hover td {
  background: var(--bg-raised);
}

.table-wrap thead th:nth-child(2),
.table-wrap tbody td:nth-child(2) {
  position: sticky;
  left: 0;
  z-index: 9;
  background: var(--bg-surface);
  box-shadow: 1px 0 0 var(--border);
}

.table-wrap thead th:nth-child(3),
.table-wrap tbody td:nth-child(3) {
  position: sticky;
  left: 64px;
  z-index: 8;
  background: var(--bg-surface);
}

.table-wrap thead th:nth-child(4),
.table-wrap tbody td:nth-child(4) {
  position: static;
}

.table-wrap tbody tr:hover td:nth-child(2),
.table-wrap tbody tr:hover td:nth-child(3) {
  background: var(--bg-raised);
}

.table-wrap th,
.table-wrap td {
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank {
  color: var(--series-1);
  font: 500 0.8rem/1 "DM Mono", monospace;
}

.player-role-suffix {
  margin-left: 6px;
  color: var(--text-muted);
  font: 500 0.78rem/1 "DM Mono", monospace;
  letter-spacing: 0.06em;
}
</style>

```js
import { observableTable } from "./components/observable-table.js";

const playerStats = await FileAttachment("./data/player-stats.json").json();
const sortedPlayers = [...playerStats].sort((a, b) => Number(b.goals || 0) - Number(a.goals || 0));
const topScorer = sortedPlayers[0];
const totalPlayers = sortedPlayers.length;
const totalGoals = sortedPlayers.reduce((sum, p) => sum + Number(p.goals || 0), 0);
const totalAssists = sortedPlayers.reduce((sum, p) => sum + Number(p.assists || 0), 0);
const topPlayerOptions = [10, 25, 50, 100, Math.max(100, totalPlayers)];
const topPlayerCountInput = Inputs.select(topPlayerOptions, {
  label: "Top Players",
  value: Math.min(25, totalPlayers),
  format: (value) => `${value}`,
});

const teamAbbreviations = {
  "Korea Republic": "KOR",
  Mexico: "MEX",
  Czechia: "CZE",
  "South Africa": "RSA",
};

function abbreviateTeam(team) {
  const name = String(team || "TBD").trim();
  if (!name) return "TBD";
  if (teamAbbreviations[name]) return teamAbbreviations[name];

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return parts
      .slice(0, 3)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  return name.slice(0, 3).toUpperCase();
}

function toNumber(value) {
  return Number(value ?? 0);
}

function round2(value) {
  return Number(toNumber(value).toFixed(2));
}

function roleAbbreviation(position) {
  const role = String(position || "").toLowerCase();
  if (role === "goalkeeper") return "GK";
  if (role === "defender") return "DEF";
  if (role === "midfielder") return "MID";
  if (role === "forward") return "FWD";
  return "UNK";
}

const columnTooltips = {
  Rank: "Leaderboard position sorted by goals, then assists.",
  Player: "Player full name.",
  Team: "Team abbreviation.",
  Matches: "Number of matches this player appeared in.",
  Goals: "Goals scored by the player (own goals excluded).",
  Assists: "Official assists credited to the player.",
  Passes: "Total pass attempts.",
  "Passes Completed": "Successful completed passes.",
  "Pass Accuracy %": "Completed passes divided by total passes, as a percentage.",
  Sprints: "Number of sprint actions.",
  "Speed Runs": "Number of high-intensity speed runs.",
  "Total Distance (m)": "Total distance covered in meters.",
  "HSR Distance (m)": "High-Speed Running distance in meters.",
  "HSS Distance (m)": "High-Speed Sprinting distance in meters.",
  "Jogging Distance (m)": "Distance covered while jogging, in meters.",
  "LSS Distance (m)": "Low-Speed Sprinting distance in meters.",
  "Walking Distance (m)": "Distance covered while walking, in meters.",
  "Top Speed": "Highest recorded speed for the player.",
  "Avg Speed": "Average speed across tracked actions.",
  Threat: "Attacking threat index from FIFA player stats.",
};

function normalizeHeaderLabel(text) {
  return String(text || "")
    .replace(/[▾▴]/g, "")
    .trim();
}

function applyColumnTooltips(container) {
  const headers = container.querySelectorAll("thead th");
  for (const th of headers) {
    const label = normalizeHeaderLabel(th.textContent);
    if (!label || !columnTooltips[label]) continue;
    th.title = columnTooltips[label];
    th.setAttribute("aria-label", `${label}: ${columnTooltips[label]}`);
  }
}

function buildLeaderboardRows(limit) {
  const rows = sortedPlayers.slice(0, limit);
  return rows.map((p, index) => ({
    Rank: Number(index + 1),
    Player: `${p.player ?? "Unknown"}|||${roleAbbreviation(p.position)}`,
    Team: abbreviateTeam(p.team),
    Matches: toNumber(p.matchesPlayed),
    Goals: toNumber(p.goals),
    Assists: toNumber(p.assists),
    Passes: toNumber(p.passes),
    "Passes Completed": toNumber(p.passesCompleted),
    "Pass Accuracy %":
      toNumber(p.passes) > 0
        ? round2((toNumber(p.passesCompleted) / toNumber(p.passes)) * 100)
        : 0,
    Sprints: toNumber(p.sprints),
    "Speed Runs": toNumber(p.speedRuns),
    "Total Distance (m)": toNumber(p.totalDistance),
    "HSR Distance (m)": toNumber(p.distanceHighSpeedRunning),
    "HSS Distance (m)": toNumber(p.distanceHighSpeedSprinting),
    "Jogging Distance (m)": toNumber(p.distanceJogging),
    "LSS Distance (m)": toNumber(p.distanceLowSpeedSprinting),
    "Walking Distance (m)": toNumber(p.distanceWalking),
    "Top Speed": round2(p.topSpeed),
    "Avg Speed": round2(p.avgSpeed),
    Threat: round2(p.threat),
  }));
}

function getSelectedTopPlayerCount() {
  const selectEl = topPlayerCountInput.querySelector("select");
  const optionIndex = selectEl ? Number(selectEl.value) : NaN;
  if (Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < topPlayerOptions.length) {
    return topPlayerOptions[optionIndex];
  }
  return Math.min(25, totalPlayers);
}
```

```js
const leaderboardSection = html`<section class="table-wrap">
  <div class="table-header">
    <h2 class="table-title">Leaderboard</h2>
    <div class="table-controls"></div>
  </div>
</section>`;

function renderPlayerCell(value) {
  const raw = String(value ?? "Unknown|||UNK");
  const [name, role] = raw.split("|||");
  return html`<span>${name}<span class="player-role-suffix">${role}</span></span>`;
}

leaderboardSection.querySelector(".table-controls").append(topPlayerCountInput);

const leaderboardTableMount = html`<div class="leaderboard-table-mount"></div>`;
leaderboardSection.append(leaderboardTableMount);

function renderLeaderboardTable() {
  const limit = getSelectedTopPlayerCount();
  const leaderboardTable = observableTable(buildLeaderboardRows(limit), Inputs, {
    columns: [
      "Rank",
      "Player",
      "Team",
      "Matches",
      "Goals",
      "Assists",
      "Passes",
      "Passes Completed",
      "Pass Accuracy %",
      "Sprints",
      "Speed Runs",
      "Total Distance (m)",
      "HSR Distance (m)",
      "HSS Distance (m)",
      "Jogging Distance (m)",
      "LSS Distance (m)",
      "Walking Distance (m)",
      "Top Speed",
      "Avg Speed",
      "Threat",
    ],
    format: {
      Player: renderPlayerCell,
    },
    rows: limit,
    sort: "Goals",
    reverse: true,
  });

  applyColumnTooltips(leaderboardTable);
  leaderboardTableMount.replaceChildren(leaderboardTable);
}

const topPlayerSelect = topPlayerCountInput.querySelector("select");
if (topPlayerSelect) {
  topPlayerSelect.addEventListener("input", renderLeaderboardTable);
  topPlayerSelect.addEventListener("change", renderLeaderboardTable);
}

renderLeaderboardTable();

display(
  html`<div class="players-shell">
    <section>
      <h1 class="headline">Player Intelligence Hub</h1>
      <p class="subhead">
        Tracked output across goals, assists, and appearances with a live leaderboard cut.
      </p>
    </section>

    <section class="snapshot-grid">
      <article class="snapshot-card">
        <div class="snapshot-label">Players Tracked</div>
        <div class="snapshot-value">${totalPlayers}</div>
        <div class="snapshot-note">Active tournament pool</div>
      </article>
      <article class="snapshot-card">
        <div class="snapshot-label">Attributed Player Goals</div>
        <div class="snapshot-value">${totalGoals}</div>
        <div class="snapshot-note">From live goal events; own goals excluded</div>
      </article>
      <article class="snapshot-card">
        <div class="snapshot-label">Assists Logged</div>
        <div class="snapshot-value">${totalAssists}</div>
        <div class="snapshot-note">Chance creation index</div>
      </article>
      <article class="snapshot-card">
        <div class="snapshot-label">Top Scorer</div>
        <div class="snapshot-value">${topScorer?.goals ?? 0}</div>
        <div class="snapshot-note">${topScorer?.player ?? "N/A"}</div>
      </article>
    </section>

    ${leaderboardSection}
  </div>`
);
```
