export function playerDistance(playerStats, match, d3) {
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.overflowX = "auto";

  if (!playerStats || Object.keys(playerStats).length === 0) {
    container.textContent = "No player data available";
    return container;
  }

  // Parse player stats and get top 10 by distance
  const players = Object.entries(playerStats)
    .map(([id, stats]) => {
      if (!Array.isArray(stats)) {
        return null;
      }
      const statMap = {};
      stats.forEach((s) => {
        if (Array.isArray(s) && s.length >= 2) {
          statMap[s[0]] = s[1];
        }
      });
      return {
        id,
        walking: statMap.DistanceWalking || 0,
        jogging: statMap.DistanceJogging || 0,
        lowSprintSpeed: statMap.DistanceLowSpeedSprinting || 0,
        highSprintSpeed: statMap.DistanceHighSpeedSprinting || 0,
        highSpeedRunning: statMap.DistanceHighSpeedRunning || 0,
        total: (statMap.TotalDistance || 0) / 1000, // Convert to km
      };
    })
    .filter((p) => p !== null && p.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  if (players.length === 0) {
    container.textContent = "No player distance data";
    return container;
  }

  const margin = { top: 20, right: 20, bottom: 60, left: 50 };
  const width = Math.min(700, window.innerWidth - 40);
  const height = 320;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxTotal = Math.max(...players.map((p) => p.total));
  const xScale = d3
    .scaleBand()
    .domain(players.map((p, i) => `P${i + 1}`))
    .range([0, innerWidth])
    .padding(0.3);
  const yScale = d3.scaleLinear().domain([0, maxTotal]).range([innerHeight, 0]);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);

  // Stacked bars
  players.forEach((p, i) => {
    const x = xScale(`P${i + 1}`);
    const w = xScale.bandwidth();

    const categories = [
      { key: "walking", color: "#4a6070" },
      { key: "jogging", color: "#7d95b0" },
      { key: "lowSprintSpeed", color: "#f0c040" },
      { key: "highSprintSpeed", color: "#e8394b" },
      { key: "highSpeedRunning", color: "#2bb56a" },
    ];

    let y = 0;
    categories.forEach((cat) => {
      const val = p[cat.key] / 1000; // Convert to km
      const barHeight = innerHeight - yScale(val);
      const yPos = yScale(p.total - y) - (innerHeight - yScale(val));

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", yPos);
      rect.setAttribute("width", w);
      rect.setAttribute("height", barHeight);
      rect.setAttribute("fill", cat.color);
      g.appendChild(rect);

      y += val;
    });

    // Total label
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x + w / 2);
    label.setAttribute("y", yScale(p.total) - 5);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "9px");
    label.setAttribute("fill", "#4fb3e8");
    label.textContent = p.total.toFixed(1) + "km";
    g.appendChild(label);
  });

  // Y axis
  for (let i = 0; i <= maxTotal; i += Math.ceil(maxTotal / 5)) {
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
    text.textContent = i.toFixed(1);
    g.appendChild(text);
  }

  // X axis labels
  players.forEach((p, i) => {
    const x = xScale(`P${i + 1}`) + xScale.bandwidth() / 2;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", innerHeight + 15);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "10px");
    text.setAttribute("fill", "#7d95b0");
    text.textContent = `P${i + 1}`;
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
  yAxisLabel.textContent = "Distance (km)";
  g.appendChild(yAxisLabel);

  svg.appendChild(g);
  container.appendChild(svg);

  // Legend
  const legend = document.createElement("div");
  legend.style.marginTop = "12px";
  legend.style.display = "flex";
  legend.style.gap = "16px";
  legend.style.fontSize = "0.7rem";
  legend.style.color = "var(--text-secondary)";
  legend.style.justifyContent = "center";
  legend.style.flexWrap = "wrap";

  const categories = [
    { color: "#4a6070", label: "Walking" },
    { color: "#7d95b0", label: "Jogging" },
    { color: "#f0c040", label: "Low Sprint" },
    { color: "#e8394b", label: "High Sprint" },
    { color: "#2bb56a", label: "High Speed Run" },
  ];

  categories.forEach((cat) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "6px";

    const box = document.createElement("div");
    box.style.width = "10px";
    box.style.height = "10px";
    box.style.backgroundColor = cat.color;

    div.appendChild(box);
    div.appendChild(document.createTextNode(cat.label));
    legend.appendChild(div);
  });

  container.appendChild(legend);
  return container;
}
