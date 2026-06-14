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
  zoneTitle.style.color = "var(--text-primary)";
  zoneTitle.style.marginBottom = "16px";
  zoneSection.appendChild(zoneTitle);

  // Stacked horizontal bars visualization
  const barsContainer = document.createElement("div");
  barsContainer.style.display = "grid";
  barsContainer.style.gridTemplateColumns = "1fr 1fr";
  barsContainer.style.gap = "24px";

  [
    { team: match.homeTeam, data: zoneData.map((z) => z.home) },
    { team: match.awayTeam, data: zoneData.map((z) => z.away) },
  ].forEach(({ team, data }) => {
    const teamColumn = document.createElement("div");

    const teamLabel = document.createElement("div");
    teamLabel.textContent = team;
    teamLabel.style.fontSize = "0.9rem";
    teamLabel.style.fontWeight = "600";
    teamLabel.style.color = "var(--text-primary)";
    teamLabel.style.marginBottom = "12px";
    teamColumn.appendChild(teamLabel);

    zoneData.forEach((zone, idx) => {
      const zoneRow = document.createElement("div");
      zoneRow.style.marginBottom = "16px";

      // Zone label
      const label = document.createElement("div");
      label.textContent = zone.zone;
      label.style.fontSize = "0.75rem";
      label.style.color = "var(--text-secondary)";
      label.style.marginBottom = "6px";
      label.style.textTransform = "uppercase";
      label.style.letterSpacing = "0.05em";
      zoneRow.appendChild(label);

      // Bar container
      const barContainer = document.createElement("div");
      barContainer.style.display = "flex";
      barContainer.style.alignItems = "center";
      barContainer.style.gap = "8px";

      // Background bar (total attempts)
      const bgBar = document.createElement("div");
      bgBar.style.flex = "1";
      bgBar.style.height = "16px";
      bgBar.style.backgroundColor = "var(--border)";
      bgBar.style.borderRadius = "3px";
      bgBar.style.overflow = "hidden";
      bgBar.style.position = "relative";

      // Filled bar (completed)
      const currentData = data[idx];
      const completion = currentData.attempted > 0 ? (currentData.completed / currentData.attempted) * 100 : 0;

      const fillBar = document.createElement("div");
      fillBar.style.height = "100%";
      fillBar.style.width = `${completion}%`;
      fillBar.style.backgroundColor = completion > 60 ? "#2bb56a" : completion > 40 ? "#f0ad4e" : "#e8394b";
      fillBar.style.transition = "width 0.3s ease";
      bgBar.appendChild(fillBar);

      barContainer.appendChild(bgBar);

      // Percentage text
      const percentText = document.createElement("div");
      percentText.textContent = `${Math.round(completion)}%`;
      percentText.style.fontSize = "0.8rem";
      percentText.style.fontWeight = "600";
      percentText.style.color = completion > 60 ? "#2bb56a" : completion > 40 ? "#f0ad4e" : "#e8394b";
      percentText.style.minWidth = "32px";
      percentText.style.textAlign = "right";
      barContainer.appendChild(percentText);

      // Count text
      const countText = document.createElement("div");
      countText.textContent = `${currentData.completed}/${currentData.attempted}`;
      countText.style.fontSize = "0.75rem";
      countText.style.color = "var(--text-muted)";
      countText.style.minWidth = "45px";
      countText.style.textAlign = "right";
      barContainer.appendChild(countText);

      zoneRow.appendChild(barContainer);
      teamColumn.appendChild(zoneRow);
    });

    barsContainer.appendChild(teamColumn);
  });

  zoneSection.appendChild(barsContainer);
  container.appendChild(zoneSection);

  return container;
}
