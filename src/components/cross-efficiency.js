export function crossEfficiency(teamStats, match, d3) {
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

  const getStat = (teamId, statName) => {
    const stats = teamStats[teamId] || [];
    const stat = stats.find((s) => s[0] === statName);
    return stat ? stat[1] : 0;
  };

  const buildData = (teamId) => ({
    crosses: getStat(teamId, "Crosses"),
    crossesCompleted: getStat(teamId, "CrossesCompleted"),
    corners: getStat(teamId, "Corners"),
    goalsFromCorner: getStat(teamId, "AttemptAtGoalFromCorner"),
    goalsFromCross: getStat(teamId, "AttemptAtGoalFromCross"),
  });

  const data = [
    { team: match.homeTeam, ...buildData(homeTeamId) },
    { team: match.awayTeam, ...buildData(awayTeamId) },
  ];

  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = Math.min(550, window.innerWidth - 40);
  const height = 320;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxCrosses = Math.max(...data.map((d) => d.crosses));
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.team))
    .range([0, innerWidth])
    .padding(0.4);
  const yScale = d3.scaleLinear().domain([0, maxCrosses]).range([innerHeight, 0]);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);

  data.forEach((d) => {
    const x = xScale(d.team);
    const w = xScale.bandwidth();

    // Crosses bar
    const crossBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    crossBar.setAttribute("x", x + w * 0.05);
    crossBar.setAttribute("y", yScale(d.crosses));
    crossBar.setAttribute("width", w * 0.25);
    crossBar.setAttribute("height", innerHeight - yScale(d.crosses));
    crossBar.setAttribute("fill", "#4fb3e8");
    g.appendChild(crossBar);

    // Completed crosses
    const completedBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    completedBar.setAttribute("x", x + w * 0.35);
    completedBar.setAttribute("y", yScale(d.crossesCompleted));
    completedBar.setAttribute("width", w * 0.25);
    completedBar.setAttribute("height", innerHeight - yScale(d.crossesCompleted));
    completedBar.setAttribute("fill", "#2bb56a");
    g.appendChild(completedBar);

    // Goals from crosses (smaller, on right)
    const goalsFromCrossBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    goalsFromCrossBar.setAttribute("x", x + w * 0.65);
    goalsFromCrossBar.setAttribute("y", yScale(d.goalsFromCross));
    goalsFromCrossBar.setAttribute("width", w * 0.15);
    goalsFromCrossBar.setAttribute("height", innerHeight - yScale(d.goalsFromCross));
    goalsFromCrossBar.setAttribute("fill", "#e8394b");
    g.appendChild(goalsFromCrossBar);

    // Value labels on bars
    if (d.crosses > 0) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", x + w * 0.175);
      label.setAttribute("y", yScale(d.crosses) - 5);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "10px");
      label.setAttribute("fill", "#4fb3e8");
      label.textContent = d.crosses;
      g.appendChild(label);
    }

    if (d.crossesCompleted > 0) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", x + w * 0.475);
      label.setAttribute("y", yScale(d.crossesCompleted) - 5);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "10px");
      label.setAttribute("fill", "#2bb56a");
      label.textContent = d.crossesCompleted;
      g.appendChild(label);
    }
  });

  // Y axis
  for (let i = 0; i <= maxCrosses; i += Math.ceil(maxCrosses / 4)) {
    const y = yScale(i);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 0);
    line.setAttribute("x2", innerWidth);
    line.setAttribute("y1", y);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "#253144");
    line.setAttribute("stroke-width", "0.5");
    g.appendChild(line);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", -10);
    text.setAttribute("y", y);
    text.setAttribute("dy", "0.3em");
    text.setAttribute("text-anchor", "end");
    text.setAttribute("font-size", "11px");
    text.setAttribute("fill", "#7d95b0");
    text.textContent = i;
    g.appendChild(text);
  }

  // X axis labels
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
  legend.style.flexWrap = "wrap";

  const items = [
    { color: "#4fb3e8", label: "Crosses" },
    { color: "#2bb56a", label: "Completed" },
    { color: "#e8394b", label: "Goals from Crosses" },
  ];

  items.forEach((item) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "6px";

    const box = document.createElement("div");
    box.style.width = "12px";
    box.style.height = "12px";
    box.style.backgroundColor = item.color;

    div.appendChild(box);
    div.appendChild(document.createTextNode(item.label));
    legend.appendChild(div);
  });

  container.appendChild(legend);
  return container;
}
