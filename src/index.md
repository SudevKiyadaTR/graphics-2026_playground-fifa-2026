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
      power:
        scores.count > 0
          ? (scores.attacking + scores.defensive + scores.creativity) / (3 * scores.count)
          : 0,
    }))
    .filter((t) => isFinite(t.power))
    .sort((a, b) => b.power - a.power);
}

function enrichTopScorerNames(scorers, prData) {
  if (!prData || !prData.outfieldPlayers) return scorers;
  
  const playerNameMap = {};
  prData.outfieldPlayers.forEach((player) => {
    playerNameMap[player.playerId] = player.playerName?.[0]?.description;
  });
  
  return scorers.map((scorer) => {
    const playerId = parseInt(scorer.player.match(/\d+/)?.[0] || 0);
    const playerName = playerNameMap[playerId];
    return {
      ...scorer,
      playerName: playerName || scorer.player,
    };
  });
}

function getTopPlayerPower(prData) {
  if (!prData || !prData.outfieldPlayers) return [];
  return prData.outfieldPlayers
    .map((player) => ({
      name: player.playerName?.[0]?.description || "Unknown",
      team: player.teamName?.[0]?.description || "Unknown",
      power:
        (player.attackingScore || 0) +
        (player.defensiveScore || 0) +
        (player.creativityScore || 0),
    }))
    .filter((p) => isFinite(p.power) && p.power > 0)
    .sort((a, b) => b.power - a.power)
    .slice(0, 16);
}

const teamPower = aggregateTeamPower(powerRankingData);
const topPlayerPower = getTopPlayerPower(powerRankingData);
const enrichedTopScorers = enrichTopScorerNames(topScorers, powerRankingData);
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

if (matchData.length === 0) {
  display(html`<p style="color:#999">No completed matches yet</p>`);
} else {
  display(
    Plot.plot({
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
          title: (d) =>
            `Match ${d.matchIndex + 1}: ${d.homeTeam} vs ${d.awayTeam}\n${d.score}\nTotal Goals: ${d.totalGoals}`,
        }),
      ],
    })
  );
}
```

## Player Power Rankings

```js
if (topPlayerPower.length > 0) {
  display(
    Plot.plot({
      title: "Top Player Power Ratings",
      width: 960,
      height: 500,
      margin: { left: 180 },
      x: { label: "Power Score" },
      y: { label: null },
      marks: [
        Plot.barX(topPlayerPower, {
          y: "name",
          x: "power",
          fill: "#4CAF50",
          title: (d) => `${d.name} (${d.team}): ${d.power.toFixed(2)}`,
        }),
      ],
    })
  );
} else {
  display(html`<p style="color:#999">No player power data yet</p>`);
}
```

## Group Standings

```js
const groups = [...new Set(standings.map((s) => s.group))].sort();

groups.forEach((group) => {
  const teamStandings = standings
    .filter((s) => s.group === group)
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

  display(
    html`<h3 style="margin-top: 24px">${group}</h3>${Inputs.table(teamStandings, {
      columns: ["team", "played", "w", "d", "l", "gf", "ga", "gd", "pts"],
      header: {
        team: "Team",
        played: "P",
        w: "W",
        d: "D",
        l: "L",
        gf: "GF",
        ga: "GA",
        gd: "GD",
        pts: "Pts",
      },
    })}`
  );
});
```

## Top Scorers

```js
display(
  Inputs.table(enrichedTopScorers.slice(0, 15), {
    columns: ["playerName", "team", "goals", "assists"],
    header: {
      playerName: "Player",
      team: "Team",
      goals: "Goals",
      assists: "Assists",
    },
  })
);
```
