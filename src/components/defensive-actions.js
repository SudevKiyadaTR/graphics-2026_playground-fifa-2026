export function defensiveActionsMatrix(teamStats, match, d3) {
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

  const data = [
    {
      team: match.homeTeam,
      foulsFor: getStat(homeTeamId, "FoulsFor"),
      foulsAgainst: getStat(homeTeamId, "FoulsAgainst"),
      forcedTurnovers: getStat(homeTeamId, "ForcedTurnovers"),
      yellowCards: getStat(homeTeamId, "YellowCards"),
      redCards: getStat(homeTeamId, "RedCards"),
    },
    {
      team: match.awayTeam,
      foulsFor: getStat(awayTeamId, "FoulsFor"),
      foulsAgainst: getStat(awayTeamId, "FoulsAgainst"),
      forcedTurnovers: getStat(awayTeamId, "ForcedTurnovers"),
      yellowCards: getStat(awayTeamId, "YellowCards"),
      redCards: getStat(awayTeamId, "RedCards"),
    },
  ];

  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = Math.min(580, window.innerWidth - 40);
  const height = 340;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxVal = Math.max(...data.flatMap((d) => [d.foulsFor, d.foulsAgainst, d.forcedTurnovers]));

  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.team))
    .range([0, innerWidth])
    .padding(0.25);

  const yScale = d3.scaleLinear().domain([0, maxVal]).range([innerHeight, 0]);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);

  const categories = [
    { key: "foulsFor", color: "#4fb3e8", label: "Fouls For" },
    { key: "foulsAgainst", color: "#e8394b", label: "Fouls Against" },
    { key: "forcedTurnovers", color: "#2bb56a", label: "Forced Turnovers" },
  ];

  data.forEach((d, idx) => {
    const x = xScale(d.team);
    const w = xScale.bandwidth();
    const categoryWidth = w / categories.length;

    categories.forEach((cat, catIdx) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x + catIdx * categoryWidth);
      rect.setAttribute("y", yScale(d[cat.key]));
      rect.setAttribute("width", categoryWidth * 0.9);
      rect.setAttribute("height", innerHeight - yScale(d[cat.key]));
      rect.setAttribute("fill", cat.color);
      g.appendChild(rect);

      // Value label
      if (d[cat.key] > 0) {
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", x + catIdx * categoryWidth + categoryWidth * 0.45);
        label.setAttribute("y", yScale(d[cat.key]) - 4);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "10px");
        label.setAttribute("fill", cat.color);
        label.setAttribute("font-weight", "600");
        label.textContent = d[cat.key];
        g.appendChild(label);
      }
    });

    // Cards row below
    const cardY = innerHeight + 40;
    const cardX = x + w / 2;

    // Yellow cards
    for (let i = 0; i < d.yellowCards; i++) {
      const card = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      card.setAttribute("x", cardX - w / 2 + i * 8);
      card.setAttribute("y", cardY);
      card.setAttribute("width", 6);
      card.setAttribute("height", 10);
      card.setAttribute("fill", "#f0c040");
      card.setAttribute("stroke", "#f0c040");
      g.appendChild(card);
    }

    // Red cards
    for (let i = 0; i < d.redCards; i++) {
      const card = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      card.setAttribute("x", cardX + w / 4 + i * 8);
      card.setAttribute("y", cardY);
      card.setAttribute("width", 6);
      card.setAttribute("height", 10);
      card.setAttribute("fill", "#e8394b");
      card.setAttribute("stroke", "#e8394b");
      g.appendChild(card);
    }
  });

  // Y axis
  for (let i = 0; i <= maxVal; i += Math.ceil(maxVal / 5)) {
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

  // Y axis label
  const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yAxisLabel.setAttribute("transform", "rotate(-90)");
  yAxisLabel.setAttribute("y", -margin.left + 15);
  yAxisLabel.setAttribute("x", -innerHeight / 2);
  yAxisLabel.setAttribute("text-anchor", "middle");
  yAxisLabel.setAttribute("font-size", "11px");
  yAxisLabel.setAttribute("fill", "#7d95b0");
  yAxisLabel.textContent = "Count";
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
    { color: "#4fb3e8", label: "Fouls For" },
    { color: "#e8394b", label: "Fouls Against" },
    { color: "#2bb56a", label: "Forced Turnovers" },
    { color: "#f0c040", label: "Yellow Cards" },
    { color: "#e8394b", label: "Red Cards" },
  ];

  items.forEach((item) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "6px";

    const box = document.createElement("div");
    if (item.label.includes("Card")) {
      box.style.width = "10px";
      box.style.height = "14px";
    } else {
      box.style.width = "12px";
      box.style.height = "12px";
    }
    box.style.backgroundColor = item.color;

    div.appendChild(box);
    div.appendChild(document.createTextNode(item.label));
    legend.appendChild(div);
  });

  container.appendChild(legend);
  return container;
}
