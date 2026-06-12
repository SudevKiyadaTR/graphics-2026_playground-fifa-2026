import * as Plot from "@observablehq/plot";

export function scheduleChart(matches) {
  // Prepare data: sort by date
  const data = matches
    .map((m) => ({
      ...m,
      dateObj: new Date(m.date),
      result: m.homeScore !== null ? `${m.homeScore}-${m.awayScore}` : "TBD",
      played: m.homeScore !== null,
    }))
    .sort((a, b) => a.dateObj - b.dateObj);

  return Plot.plot({
    style: {
      background: "transparent",
      color: "var(--text-primary)",
      fontFamily: "'Inter', sans-serif",
      fontSize: "12px",
    },
    width: 1100,
    height: 500,
    marginLeft: 100,
    marginBottom: 40,
    marginTop: 20,
    marginRight: 20,
    x: { type: "linear", label: "Match Sequence" },
    y: (d) => d.dateObj,
    marks: [
      Plot.dot(data, {
        x: (d, i) => i + 1,
        y: "dateObj",
        fill: (d) => (d.played ? "var(--positive)" : "var(--series-3)"),
        r: 5,
        stroke: "var(--border)",
        strokeWidth: 1,
      }),
      Plot.text(data, {
        x: (d, i) => i + 1,
        y: "dateObj",
        text: "result",
        fontSize: 11,
        fontWeight: 600,
        fill: "var(--text-primary)",
        dy: -12,
      }),
      Plot.text(data, {
        x: (d, i) => i + 1,
        y: "dateObj",
        text: (d) => `${d.homeTeam} vs ${d.awayTeam}`,
        fontSize: 10,
        fill: "var(--text-secondary)",
        dy: 2,
        anchor: "start",
        dx: 10,
      }),
      Plot.axisX({ label: "Matches (chronological order)" }),
      Plot.axisY({ label: "Date" }),
      Plot.gridX({ stroke: "var(--border-subtle)", strokeOpacity: 0.2 }),
      Plot.gridY({ stroke: "var(--border-subtle)", strokeOpacity: 0.2 }),
    ],
  });
}
