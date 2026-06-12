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
    if (!teams[teamName]) {
      teams[teamName] = { attacking: 0, defensive: 0, creativity: 0, count: 0 };
    }
    teams[teamName].attacking += player.attackingScore || 0;
    teams[teamName].defensive += player.defensiveScore || 0;
    teams[teamName].creativity += player.creativityScore || 0;
    teams[teamName].count += 1;
  });
  return Object.entries(teams)
    .map(([team, scores]) => ({
      team,
      power: (scores.attacking + scores.defensive + scores.creativity) / (3 * scores.count),
    }))
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

Plot.plot({
  title: "Goals per Match",
  width: 960,
  height: 400,
  x: { label: "Match", type: "point", domain: matchData.map((_, i) => i) },
  y: { label: "Total Goals", type: "point" },
  color: { scheme: "RdYlBu", type: "linear", reverse: true },
  marks: [
    Plot.rect(matchData, {
      x: "matchIndex",
      y: "totalGoals",
      fill: "totalGoals",
      title: (d) => `${d.homeTeam} vs ${d.awayTeam}\n${d.score}\nTotal: ${d.totalGoals}`,
    }),
  ],
});
```

## Team Power Rankings

```js
Plot.plot({
  title: "Team Power Ratings",
  width: 960,
  height: 500,
  margin: { left: 180 },
  x: { label: "Power Score" },
  y: { label: null },
  marks: [
    Plot.barX(teamPower.slice(0, 16), {
      y: "team",
      x: "power",
      fill: "#4CAF50",
      title: (d) => `${d.team}: ${d.power.toFixed(2)}`,
    }),
    Plot.text(teamPower.slice(0, 16), {
      y: "team",
      x: "power",
      text: (d) => d.power.toFixed(2),
      dx: 4,
      textAnchor: "start",
    }),
  ],
});
```
