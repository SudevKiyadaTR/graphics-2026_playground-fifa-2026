# FIFA 2026 Dashboard

Tournament calendar for FIFA World Cup 2026.

```js
const matches = await FileAttachment("./data/matches.json").json();

const scheduleRows = [...matches]
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .map((match) => ({
    date: new Date(match.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    fixture: `${match.homeTeam} vs ${match.awayTeam}`,
    score: `${match.homeScore ?? 0}-${match.awayScore ?? 0}`,
    stage: match.stage,
  }));
```

## Match Schedule

```js
display(
  Inputs.table(scheduleRows, {
    columns: ["date", "fixture", "score", "stage"],
    header: {
      date: "Date",
      fixture: "Match",
      score: "Score",
      stage: "Stage",
    },
  })
);
```
