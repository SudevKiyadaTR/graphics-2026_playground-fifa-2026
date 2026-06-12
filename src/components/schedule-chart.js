export function scheduleChart(matches) {
  const sorted = [...matches]
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const html = `
    <table style="width: 100%; border-collapse: collapse; font-family: Inter, sans-serif; font-size: 13px;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted); text-align: left;">
          <th style="padding: 8px; font-weight: 500; text-transform: uppercase;">Date</th>
          <th style="padding: 8px; font-weight: 500; text-transform: uppercase;">Match</th>
          <th style="padding: 8px; font-weight: 500; text-transform: uppercase;">Score</th>
          <th style="padding: 8px; font-weight: 500; text-transform: uppercase;">Stage</th>
        </tr>
      </thead>
      <tbody>
        ${sorted
          .map(
            (m) => `
          <tr style="border-bottom: 1px solid var(--border-subtle); hover: background var(--bg-raised);">
            <td style="padding: 8px; color: var(--text-secondary);">
              ${new Date(m.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </td>
            <td style="padding: 8px; color: var(--text-primary);">
              ${m.homeTeam} vs ${m.awayTeam}
            </td>
            <td style="padding: 8px; color: ${m.homeScore !== null ? "var(--positive)" : "var(--series-3)"}; font-weight: 600;">
              ${m.homeScore !== null ? `${m.homeScore}-${m.awayScore}` : "TBD"}
            </td>
            <td style="padding: 8px; color: var(--text-secondary);">
              ${m.stage}
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  return html;
}
