import * as Plot from "@observablehq/plot";

export function scheduleChart(matches) {
  // Prepare data for visualization
  const data = matches.map((match, i) => ({
    ...match,
    matchLabel: `${match.homeTeam} vs ${match.awayTeam}`,
    status: match.homeScore !== null ? "played" : "upcoming",
    totalGoals: (match.homeScore ?? 0) + (match.awayScore ?? 0),
    index: i,
  }));

  // Sort by date
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  return Plot.plot({
    style: {
      background: "transparent",
      color: "var(--text-primary)",
      fontFamily: "'DM Mono', monospace",
      fontSize: "11px",
      fontVariantNumeric: "tabular-nums",
    },
    marginLeft: 120,
    marginBottom: 80,
    marginTop: 20,
    marginRight: 20,
    width: 1100,
    height: 600,
    x: { type: "band", label: "Match" },
    y: { label: "Date" },
    color: { scheme: "observable10", legend: true },
    marks: [
      Plot.rect(data, {
        x: "matchLabel",
        y: (d) => new Date(d.date),
        fill: "status",
        stroke: "var(--border)",
        strokeWidth: 1,
        tip: {
          anchor: "bottom",
          format: {
            x: false,
            y: false,
          },
        },
      }),
      Plot.text(data, {
        x: "matchLabel",
        y: (d) => new Date(d.date),
        text: (d) => (d.homeScore !== null ? `${d.homeScore}-${d.awayScore}` : "TBD"),
        fontSize: 12,
        fontWeight: 600,
        fill: "var(--text-primary)",
        dy: 0,
      }),
      Plot.axisX({ anchor: "bottom", label: null, tickSize: 0 }),
      Plot.axisY({ anchor: "left", label: "Date", tickSize: 4 }),
      Plot.gridY({ stroke: "var(--border-subtle)", strokeWidth: 1 }),
    ],
  });
}
