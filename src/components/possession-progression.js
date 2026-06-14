export function possessionProgression(teamStats, match, d3) {
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.display = "flex";
  container.style.justifyContent = "center";

  // Get team IDs
  const teamIds = Object.keys(teamStats);
  if (teamIds.length < 2) {
    container.textContent = "Insufficient team data";
    return container;
  }

  const homeTeamId = teamIds[0];
  const awayTeamId = teamIds[1];

  // Helper to get stat value
  const getStat = (teamId, statName) => {
    const stats = teamStats[teamId] || [];
    const stat = stats.find((s) => s[0] === statName);
    return stat ? stat[1] : 0;
  };

  // Build dataset
  const data = [
    {
      team: match.homeTeam,
      attempted: getStat(homeTeamId, "AttemptedBallProgressions"),
      completed: getStat(homeTeamId, "CompletedBallProgressions"),
      attackingLine: getStat(homeTeamId, "LinebreaksAttemptedAttackingLine"),
      attackingLineCompleted: getStat(homeTeamId, "LinebreaksAttemptedAttackingLineCompleted"),
    },
    {
      team: match.awayTeam,
      attempted: getStat(awayTeamId, "AttemptedBallProgressions"),
      completed: getStat(awayTeamId, "CompletedBallProgressions"),
      attackingLine: getStat(awayTeamId, "LinebreaksAttemptedAttackingLine"),
      attackingLineCompleted: getStat(awayTeamId, "LinebreaksAttemptedAttackingLineCompleted"),
    },
  ];

  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = Math.min(500, window.innerWidth - 40);
  const height = 300;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Y scale
  const maxVal = Math.max(...data.flatMap((d) => [d.attempted, d.completed]));
  const yScale = d3.scaleLinear().domain([0, maxVal]).range([innerHeight, 0]);

  // X scale
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.team))
    .range([0, innerWidth])
    .padding(0.3);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);

  // Bars
  data.forEach((d) => {
    const x = xScale(d.team);
    const barWidth = xScale.bandwidth();

    // Attempted bar
    const attemptedBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    attemptedBar.setAttribute("x", x);
    attemptedBar.setAttribute("y", yScale(d.attempted));
    attemptedBar.setAttribute("width", barWidth * 0.45);
    attemptedBar.setAttribute("height", innerHeight - yScale(d.attempted));
    attemptedBar.setAttribute("fill", "#4fb3e8");
    attemptedBar.setAttribute("opacity", "0.6");
    g.appendChild(attemptedBar);

    // Completed bar
    const completedBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    completedBar.setAttribute("x", x + barWidth * 0.5);
    completedBar.setAttribute("y", yScale(d.completed));
    completedBar.setAttribute("width", barWidth * 0.45);
    completedBar.setAttribute("height", innerHeight - yScale(d.completed));
    completedBar.setAttribute("fill", "#2bb56a");
    g.appendChild(completedBar);
  });

  // Y axis
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
  for (let i = 0; i <= maxVal; i += Math.ceil(maxVal / 5)) {
    const y = yScale(i);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", -5);
    line.setAttribute("x2", innerWidth);
    line.setAttribute("y1", y);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "#253144");
    line.setAttribute("stroke-width", "0.5");
    yAxis.appendChild(line);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", -10);
    text.setAttribute("y", y);
    text.setAttribute("dy", "0.3em");
    text.setAttribute("text-anchor", "end");
    text.setAttribute("font-size", "11px");
    text.setAttribute("fill", "#7d95b0");
    text.textContent = i;
    yAxis.appendChild(text);
  }
  g.appendChild(yAxis);

  // X axis
  data.forEach((d) => {
    const x = xScale(d.team) + xScale.bandwidth() / 2;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", innerHeight + 20);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "12px");
    text.setAttribute("fill", "#7d95b0");
    text.textContent = d.team;
    g.appendChild(text);
  });

  svg.appendChild(g);
  container.appendChild(svg);

  // Legend
  const legend = document.createElement("div");
  legend.style.marginTop = "12px";
  legend.style.display = "flex";
  legend.style.gap = "20px";
  legend.style.fontSize = "0.75rem";
  legend.style.color = "var(--text-secondary)";
  legend.style.justifyContent = "center";

  ["Attempted", "Completed"].forEach((label, i) => {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "6px";

    const box = document.createElement("div");
    box.style.width = "12px";
    box.style.height = "12px";
    box.style.backgroundColor = i === 0 ? "#4fb3e8" : "#2bb56a";

    item.appendChild(box);
    item.appendChild(document.createTextNode(label));
    legend.appendChild(item);
  });

  container.appendChild(legend);
  return container;
}
