import { observableTable } from "./observable-table.js";

export function scheduleChart(matches, Inputs) {
  const sorted = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

  const rows = sorted.map((m) => {
    const hasScore = m.homeScore !== null || m.awayScore !== null;

    return {
      Date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Match: `${m.homeTeam} vs ${m.awayTeam}`,
      Score: hasScore ? `${m.homeScore ?? 0}-${m.awayScore ?? 0}` : "TBD",
      Stage: m.stage,
    };
  });

  return observableTable(rows, Inputs, {
    columns: ["Date", "Match", "Score", "Stage"],
    rows: 25,
    wrapperClass: "schedule-table-wrap",
  });
}
