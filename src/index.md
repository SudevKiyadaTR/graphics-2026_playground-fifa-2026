# FIFA 2026 Dashboard

Live tournament overview for FIFA World Cup 2026™.

```js
import * as Plot from "npm:@observablehq/plot";
import { scheduleChart } from "./components/schedule-chart.js";

const matches = await FileAttachment("./data/matches.json").json();
const standings = await FileAttachment("./data/standings.json").json();
const topScorers = await FileAttachment("./data/top-scorers.json").json();
const powerRankingData = await FileAttachment("./data/latest-power-ranking.json").json();

function aggregateTeamPower(prData) {
  if (!prData || !prData.outfieldPlayers) return [];
  const teams = {};
  prData.outfieldPlayers.forEach((player) => {
    const teamName = player.teamName?.[0]?.description || "Unknown";
    const attackScore = player.attackingScore || 0;
    const defScore = player.defensiveScore || 0;
    const creScore = player.creativityScore || 0;
    
    if (!isFinite(attackScore) || !isFinite(defScore) || !isFinite(creScore)) {
      return;
    }
    
    if (!teams[teamName]) {
      teams[teamName] = { attacking: 0, defensive: 0, creativity: 0, count: 0 };
    }
    teams[teamName].attacking += attackScore;
    teams[teamName].defensive += defScore;
    teams[teamName].creativity += creScore;
    teams[teamName].count += 1;
  });
  
  return Object.entries(teams)
    .map(([team, scores]) => ({
      team,
      power: scores.count > 0 ? (scores.attacking + scores.defensive + scores.creativity) / (3 * scores.count) : 0,
    }))
    .filter((t) => isFinite(t.power))
    .sort((a, b) => b.power - a.power);
}

const teamPower = aggregateTeamPower(powerRankingData);
```

## Match Schedule

```js
display(scheduleChart(matches));
```

## Tournament Stats

- **Total Matches:** ${matches.length}
- **Played:** ${matches.filter((m) => m.homeScore !== null).length}
- **Upcoming:** ${matches.filter((m) => m.homeScore === null).length}
- **Debug:** Standings: ${standings.length} items, TopScorers: ${topScorers.length} items

## Goals Heatmap

```js
const matchData = matches
  .filter((m) => m.homeScore !== null && m.awayScore !== null)
  .map((m, i) => ({
    matchIndex: i,
    date: new Date(m.date),
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    totalGoals: m.homeScore + m.awayScore,
    score: `${m.homeScore}-${m.awayScore}`,
  }));

matchData.length > 0
  ? Plot.plot({
      title: "Goals per Match",
      width: 960,
      height: 300,
      x: { label: "Match Index" },
      y: { label: "Total Goals" },
      color: { scheme: "RdYlBu", type: "linear", reverse: true, label: "Total Goals" },
      marks: [
        Plot.dot(matchData, {
          x: "matchIndex",
          y: "totalGoals",
          fill: "totalGoals",
          r: 6,
          title: (d) => `Match ${d.matchIndex + 1}: ${d.homeTeam} vs ${d.awayTeam}\n${d.score}\nTotal Goals: ${d.totalGoals}`,
        }),
      ],
    })
  : html`<p style="color:#999">No completed matches yet</p>`;
```

## Team Power Rankings

```js
html`<p style="color:#999">Power rankings temporarily disabled for debugging</p>`;
```

## Group Standings

```js
const groups = [...new Set(standings.map((s) => s.group))].sort();

const allGroupsHtml = groups
  .map((group) => {
    const teamStandings = standings
      .filter((s) => s.group === group)
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });

    const rows = teamStandings
      .map(
        (row) =>
          `<tr><td style="text-align:left;padding:6px 8px">${row.team}</td><td style="text-align:right;padding:6px 8px">${row.played}</td><td style="text-align:right;padding:6px 8px">${row.w}</td><td style="text-align:right;padding:6px 8px">${row.d}</td><td style="text-align:right;padding:6px 8px">${row.l}</td><td style="text-align:right;padding:6px 8px">${row.gf}</td><td style="text-align:right;padding:6px 8px">${row.ga}</td><td style="text-align:right;padding:6px 8px;color:${row.gd >= 0 ? "#4CAF50" : "#ff6b6b"}">${row.gd > 0 ? "+" : ""}${row.gd}</td><td style="text-align:right;padding:6px 8px;font-weight:bold;color:#FFD700">${row.pts}</td></tr>`,
      )
      .join("");

    return `<h3 style="margin-top:24px">${group}</h3><table style="width:100%;border-collapse:collapse;border:1px solid #333"><tr><th style="text-align:left;padding:6px 8px">Team</th><th style="text-align:right;padding:6px 8px">P</th><th style="text-align:right;padding:6px 8px">W</th><th style="text-align:right;padding:6px 8px">D</th><th style="text-align:right;padding:6px 8px">L</th><th style="text-align:right;padding:6px 8px">GF</th><th style="text-align:right;padding:6px 8px">GA</th><th style="text-align:right;padding:6px 8px">GD</th><th style="text-align:right;padding:6px 8px">Pts</th></tr>${rows}</table>`;
  })
  .join("");

html`${allGroupsHtml}`;
```

## Top Scorers

```js
const scorersRows = topScorers
  .slice(0, 15)
  .map(
    (s, i) =>
      `<tr><td style="text-align:left;padding:8px;font-weight:bold;color:#FFD700">${i + 1}</td><td style="text-align:left;padding:8px">${s.player}</td><td style="text-align:left;padding:8px">${s.team}</td><td style="text-align:right;padding:8px;font-weight:bold;color:#4CAF50">${s.goals}</td><td style="text-align:right;padding:8px">${s.assists}</td></tr>`,
  )
  .join("");

html`<table style="width:100%;border-collapse:collapse;border:1px solid #333">
  <tr>
    <th style="text-align:left;padding:8px">#</th>
    <th style="text-align:left;padding:8px">Player</th>
    <th style="text-align:left;padding:8px">Team</th>
    <th style="text-align:right;padding:8px">Goals</th>
    <th style="text-align:right;padding:8px">Assists</th>
  </tr>
  ${scorersRows}
</table>`;
```
