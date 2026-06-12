import * as Plot from "@observablehq/plot";

export function scheduleChart(matches) {
  const data = matches
    .map((m, i) => ({
      index: i + 1,
      date: new Date(m.date),
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      score:
        m.homeScore !== null ? `${m.homeScore}-${m.awayScore}` : "TBD",
      played: m.homeScore !== null,
    }))
    .sort((a, b) => a.date - b.date);

  return Plot.plot({
    style: {
      background: "transparent",
      color: "var(--text-primary)",
    },
    width: 1000,
    height: 600,
    marginLeft: 80,
    marginBottom: 40,
    marginTop: 20,
    marginRight: 20,
    marks: [
      Plot.text(data, {
        x: (d) => d.index,
        y: (d) => d.date,
        text: (d) => d.score,
        fontSize: 12,
        fontWeight: "bold",
        fill: (d) =>
          d.played ? "var(--positive)" : "var(--series-3)",
      }),
      Plot.text(data, {
        x: (d) => d.index,
        y: (d) => d.date,
        text: (d) =>
          `${d.homeTeam.substring(0, 3).toUpperCase()} vs ${d.awayTeam
            .substring(0, 3)
            .toUpperCase()}`,
        fontSize: 9,
        fill: "var(--text-secondary)",
        dy: 12,
      }),
      Plot.axisX({
        label: "Match #",
        tickSize: 4,
        labelOffset: 30,
      }),
      Plot.axisY({
        label: "Date",
        tickSize: 4,
      }),
    ],
  });
}
