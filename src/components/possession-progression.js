export function possessionProgression(teamStats, match, d3) {
  const container = document.createElement("div");
  container.style.width = "100%";

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

  // Build overall progression data
  const overallData = [
    {
      team: match.homeTeam,
      attempted: getStat(homeTeamId, "AttemptedBallProgressions"),
      completed: getStat(homeTeamId, "CompletedBallProgressions"),
    },
    {
      team: match.awayTeam,
      attempted: getStat(awayTeamId, "AttemptedBallProgressions"),
      completed: getStat(awayTeamId, "CompletedBallProgressions"),
    },
  ];

  // Build zone breakdown data
  const zones = [
    { name: "Defensive Line", attemptKey: "LinebreaksAttemptedDefensiveLine", completedKey: "LinebreaksAttemptedDefensiveLineCompleted" },
    { name: "Midfield Line", attemptKey: "LinebreaksAttemptedMidfieldLine", completedKey: "LinebreaksAttemptedMidfieldLineCompleted" },
    { name: "Attacking Line", attemptKey: "LinebreaksAttemptedAttackingLine", completedKey: "LinebreaksAttemptedAttackingLineCompleted" },
  ];

  const zoneData = zones.map((zone) => ({
    zone: zone.name,
    home: {
      attempted: getStat(homeTeamId, zone.attemptKey),
      completed: getStat(homeTeamId, zone.completedKey),
    },
    away: {
      attempted: getStat(awayTeamId, zone.attemptKey),
      completed: getStat(awayTeamId, zone.completedKey),
    },
  }));

  // ===== Overall Progression Chart =====
  const overallSection = document.createElement("div");
  overallSection.style.marginBottom = "24px";

  const overallTitle = document.createElement("h4");
  overallTitle.textContent = "Ball Progression";
  overallTitle.style.fontSize = "0.95rem";
  overallTitle.style.fontWeight = "600";
  overallTitle.style.color = "var(--text-primary)";
  overallTitle.style.marginBottom = "12px";
  overallSection.appendChild(overallTitle);

  const margin = { top: 10, right: 20, bottom: 30, left: 50 };
  const width = Math.min(400, window.innerWidth - 40);
  const height = 200;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Y scale
  const maxVal = Math.max(...overallData.flatMap((d) => [d.attempted, d.completed]));
  const yScale = d3.scaleLinear().domain([0, maxVal]).range([innerHeight, 0]);

  // X scale
  const xScale = d3
    .scaleBand()
    .domain(overallData.map((d) => d.team))
    .range([0, innerWidth])
    .padding(0.3);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);

  // Bars
  overallData.forEach((d) => {
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

    // Completion percentage
    const completion = d.attempted > 0 ? Math.round((d.completed / d.attempted) * 100) : 0;
    const textX = x + barWidth / 2;
    const textY = yScale(d.attempted) - 10;
    const percentText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    percentText.setAttribute("x", textX);
    percentText.setAttribute("y", textY);
    percentText.setAttribute("text-anchor", "middle");
    percentText.setAttribute("font-size", "12px");
    percentText.setAttribute("font-weight", "600");
    percentText.setAttribute("fill", "#2bb56a");
    percentText.textContent = `${completion}%`;
    g.appendChild(percentText);
  });

  // Y axis
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
  for (let i = 0; i <= maxVal; i += Math.ceil(maxVal / 4)) {
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
  overallData.forEach((d) => {
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
  overallSection.appendChild(svg);

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

  overallSection.appendChild(legend);
  container.appendChild(overallSection);

  // ===== Zone Breakdown =====
  const zoneSection = document.createElement("div");
  
  const zoneTitle = document.createElement("h4");
  zoneTitle.textContent = "Linebreaks by Zone";
  zoneTitle.style.fontSize = "0.95rem";
  zoneTitle.style.fontWeight = "600";
  zoneTitle.style.fontFamily = "DM Mono, monospace";
  zoneTitle.style.color = "var(--text-primary)";
  zoneTitle.style.marginBottom = "16px";
  zoneSection.appendChild(zoneTitle);

  // Teams row
  [
    { team: match.homeTeam, data: zoneData.map((z) => z.home) },
    { team: match.awayTeam, data: zoneData.map((z) => z.away) },
  ].forEach(({ team, data }) => {
    const teamRow = document.createElement("div");
    teamRow.style.marginBottom = "20px";

    // Team name
    const teamLabel = document.createElement("div");
    teamLabel.textContent = team;
    teamLabel.style.fontSize = "0.9rem";
    teamLabel.style.fontWeight = "600";
    teamLabel.style.fontFamily = "DM Mono, monospace";
    teamLabel.style.color = "var(--text-primary)";
    teamLabel.style.marginBottom = "8px";
    teamRow.appendChild(teamLabel);

    // Bar container (edge-to-edge, no gaps)
    const barContainer = document.createElement("div");
    barContainer.style.display = "flex";
    barContainer.style.width = "100%";
    barContainer.style.height = "36px";
    barContainer.style.gap = "0";
    barContainer.style.borderRadius = "4px";
    barContainer.style.overflow = "hidden";

    // Three zone bars edge-to-edge with progress fill
    const zoneNames = ["Defensive Line", "Midfield Line", "Attacking Line"];
    zoneNames.forEach((zoneName, idx) => {
      const currentData = data[idx];
      const completion = currentData.attempted > 0 ? (currentData.completed / currentData.attempted) * 100 : 0;

      // Zone bar (background)
      const zoneBar = document.createElement("div");
      zoneBar.style.flex = "1";
      zoneBar.style.backgroundColor = "#1a2332";
      zoneBar.style.display = "flex";
      zoneBar.style.alignItems = "center";
      zoneBar.style.justifyContent = "flex-start";
      zoneBar.style.position = "relative";
      zoneBar.style.overflow = "hidden";

      // Filled progress inside zone
      const barFill = document.createElement("div");
      barFill.style.height = "100%";
      barFill.style.width = `${completion}%`;
      barFill.style.backgroundColor = completion > 60 ? "#2bb56a" : completion > 40 ? "#f0ad4e" : "#e8394b";
      barFill.style.display = "flex";
      barFill.style.alignItems = "center";
      barFill.style.justifyContent = "center";
      barFill.style.transition = "width 0.3s ease";
      barFill.style.fontSize = "0.9rem";
      barFill.style.fontWeight = "700";
      barFill.style.fontFamily = "DM Mono, monospace";
      barFill.style.color = "white";
      barFill.style.textShadow = "0 1px 2px rgba(0,0,0,0.3)";

      if (completion > 0) {
        barFill.textContent = `${Math.round(completion)}%`;
      }

      zoneBar.appendChild(barFill);
      zoneBar.title = `${zoneName}: ${Math.round(completion)}% (${currentData.completed}/${currentData.attempted})`;

      barContainer.appendChild(zoneBar);
    });

    // Zone labels below the bars
    const labelsRow = document.createElement("div");
    labelsRow.style.display = "flex";
    labelsRow.style.width = "100%";
    labelsRow.style.gap = "0";
    labelsRow.style.marginTop = "6px";
    labelsRow.style.fontSize = "0.7rem";
    labelsRow.style.fontFamily = "DM Mono, monospace";
    labelsRow.style.color = "#7d95b0";
    labelsRow.style.textTransform = "uppercase";
    labelsRow.style.fontWeight = "500";

    zoneNames.forEach((zoneName) => {
      const label = document.createElement("div");
      label.textContent = zoneName;
      label.style.flex = "1";
      label.style.textAlign = "center";
      labelsRow.appendChild(label);
    });

    const labelContainer = document.createElement("div");
    labelContainer.appendChild(barContainer);
    labelContainer.appendChild(labelsRow);

    teamRow.appendChild(labelContainer);
    zoneSection.appendChild(teamRow);
  });

  container.appendChild(zoneSection);

  return container;
}
