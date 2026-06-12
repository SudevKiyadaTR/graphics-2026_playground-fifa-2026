# Player Stats

Detailed player performance metrics across FIFA World Cup 2026 matches.

```js
const playerStats = await FileAttachment("./data/player-stats.json").json();

const enrichedPlayerStats = playerStats.map((player) => ({
  ...player,
  playerName: player.player || "Unknown",
}));
```

## Snapshot

- **Tracked Players:** ${enrichedPlayerStats.length}
- **Total Goals:** ${enrichedPlayerStats.reduce((sum, p) => sum + (p.goals || 0), 0)}
- **Total Assists:** ${enrichedPlayerStats.reduce((sum, p) => sum + (p.assists || 0), 0)}

## Full Table

```js
display(
  Inputs.table(enrichedPlayerStats, {
    columns: [
      "playerName",
      "team",
      "matchesPlayed",
      "goals",
      "assists",
      "passes",
      "passesCompleted",
      "timePlayed",
      "totalDistance",
      "avgSpeed",
      "topSpeed",
      "threat",
    ],
    header: {
      playerName: "Player",
      team: "Team",
      matchesPlayed: "Matches",
      goals: "Goals",
      assists: "Assists",
      passes: "Passes",
      passesCompleted: "Completed",
      timePlayed: "Time (min)",
      totalDistance: "Distance (m)",
      avgSpeed: "Avg Speed",
      topSpeed: "Top Speed",
      threat: "Threat",
    },
  })
);
```
