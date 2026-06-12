export function scheduleChart(matches) {
  const sorted = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

  const table = document.createElement("table");
  table.style.cssText =
    "width: 100%; border-collapse: collapse; font-family: Inter, sans-serif; font-size: 13px;";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.style.cssText = "border-bottom: 1px solid var(--border); color: var(--text-muted);";

  ["Date", "Match", "Score", "Stage"].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    th.style.cssText =
      "padding: 8px; font-weight: 500; text-transform: uppercase; text-align: left;";
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  sorted.forEach((m) => {
    const row = document.createElement("tr");
    row.style.cssText = "border-bottom: 1px solid var(--border-subtle);";

    const date = document.createElement("td");
    date.textContent = new Date(m.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    date.style.cssText = "padding: 8px; color: var(--text-secondary);";

    const match = document.createElement("td");
    match.textContent = `${m.homeTeam} vs ${m.awayTeam}`;
    match.style.cssText = "padding: 8px; color: var(--text-primary);";

    const score = document.createElement("td");
    score.textContent = m.homeScore !== null ? `${m.homeScore}-${m.awayScore}` : "TBD";
    score.style.cssText = `padding: 8px; color: ${
      m.homeScore !== null ? "var(--positive)" : "var(--series-3)"
    }; font-weight: 600;`;

    const stage = document.createElement("td");
    stage.textContent = m.stage;
    stage.style.cssText = "padding: 8px; color: var(--text-secondary);";

    row.appendChild(date);
    row.appendChild(match);
    row.appendChild(score);
    row.appendChild(stage);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  return table;
}
