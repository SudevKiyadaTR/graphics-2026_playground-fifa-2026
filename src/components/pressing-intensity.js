export function pressingIntensityHeat(teamStats, match, d3) {
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";

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

  const data = [
    {
      team: match.homeTeam,
      total: getStat(homeTeamId, "DefensivePressuresApplied"),
      direct: getStat(homeTeamId, "DirectDefensivePressuresApplied"),
      recovery: getStat(homeTeamId, "BallRecoveryTime"),
    },
    {
      team: match.awayTeam,
      total: getStat(awayTeamId, "DefensivePressuresApplied"),
      direct: getStat(awayTeamId, "DirectDefensivePressuresApplied"),
      recovery: getStat(awayTeamId, "BallRecoveryTime"),
    },
  ];

  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = Math.min(500, window.innerWidth - 40);
  const height = 320;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const totalMax = Math.max(...data.map((d) => d.total));
  const yScale = d3.scaleLinear().domain([0, totalMax]).range([innerHeight, 0]);
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.team))
    .range([0, innerWidth])
    .padding(0.3);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);

  // Bars with gradient intensity
  data.forEach((d, i) => {
    const x = xScale(d.team);
    const barWidth = xScale.bandwidth();

    // Total pressure (full bar)
    const totalBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    totalBar.setAttribute("x", x);
    totalBar.setAttribute("y", yScale(d.total));
    totalBar.setAttribute("width", barWidth * 0.6);
    totalBar.setAttribute("height", innerHeight - yScale(d.total));
    totalBar.setAttribute("fill", "#e8394b");
    totalBar.setAttribute("opacity", "0.5");
    g.appendChild(totalBar);

    // Direct pressure overlay
    const directBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    directBar.setAttribute("x", x);
    directBar.setAttribute("y", yScale(d.direct));
    directBar.setAttribute("width", barWidth * 0.6);
    directBar.setAttribute("height", innerHeight - yScale(d.direct));
    directBar.setAttribute("fill", "#e8394b");
    directBar.setAttribute("opacity", "0.9");
    g.appendChild(directBar);

    // Recovery time (right bar)
    const recoveryScale = d3
      .scaleLinear()
      .domain([0, 20])
      .range([0, yScale(0) - yScale(totalMax)]);
    const recoveryBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    recoveryBar.setAttribute("x", x + barWidth * 0.65);
    recoveryBar.setAttribute("y", yScale(totalMax) - recoveryScale(d.recovery));
    recoveryBar.setAttribute("width", barWidth * 0.3);
    recoveryBar.setAttribute("height", recoveryScale(d.recovery));
    recoveryBar.setAttribute("fill", "#f0c040");
    g.appendChild(recoveryBar);
  });

  // Y axis
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
  for (let i = 0; i <= totalMax; i += Math.ceil(totalMax / 5)) {
    const y = yScale(i);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 0);
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

  // Y axis label
  const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yAxisLabel.setAttribute("transform", "rotate(-90)");
  yAxisLabel.setAttribute("y", -margin.left + 15);
  yAxisLabel.setAttribute("x", -innerHeight / 2);
  yAxisLabel.setAttribute("text-anchor", "middle");
  yAxisLabel.setAttribute("font-size", "11px");
  yAxisLabel.setAttribute("fill", "#7d95b0");
  yAxisLabel.textContent = "Pressures";
  g.appendChild(yAxisLabel);

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
    { color: "#e8394b", opacity: "0.5", label: "Total Pressures" },
    { color: "#e8394b", opacity: "0.9", label: "Direct Pressures" },
    { color: "#f0c040", opacity: "1", label: "Recovery Time (s)" },
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
    box.style.opacity = item.opacity;

    div.appendChild(box);
    div.appendChild(document.createTextNode(item.label));
    legend.appendChild(div);
  });

  container.appendChild(legend);
  return container;
}
