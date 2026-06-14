export function playerIntensity(playerStatsMap, liveData, d3) {
  if (!playerStatsMap || Object.keys(playerStatsMap).length === 0 || !liveData) {
    const empty = document.createElement("div");
    empty.textContent = "No player data available";
    empty.style.padding = "20px";
    empty.style.textAlign = "center";
    empty.style.color = "var(--text-secondary)";
    return empty;
  }

  // Create maps of player ID to player name and team from liveData
  const playerNameMap = {};
  const playerTeamMap = {};
  for (const side of ["HomeTeam", "AwayTeam"]) {
    const team = liveData[side];
    const teamName = team?.TeamName?.[0]?.Description || side;
    if (team?.Players) {
      team.Players.forEach((p) => {
        let name = "Unknown";
        if (p.ShortName && Array.isArray(p.ShortName) && p.ShortName[0]) {
          name = p.ShortName[0].Description || "Unknown";
        } else if (p.PlayerName && Array.isArray(p.PlayerName) && p.PlayerName[0]) {
          name = p.PlayerName[0].Description || "Unknown";
        }
        playerNameMap[String(p.IdPlayer)] = name;
        playerTeamMap[String(p.IdPlayer)] = teamName;
      });
    }
  }

  // Get player IDs from this match
  const matchPlayerIds = new Set();
  for (const side of ["HomeTeam", "AwayTeam"]) {
    const team = liveData[side];
    if (team?.Players) {
      team.Players.forEach((p) => {
        matchPlayerIds.add(String(p.IdPlayer));
      });
    }
  }

  // Process player data - filter to this match and get top by total distance
  const players = Array.from(matchPlayerIds)
    .map((playerId) => {
      const stats = playerStatsMap[playerId];
      if (!stats || !Array.isArray(stats)) {
        return null;
      }
      const statMap = {};
      stats.forEach((s) => {
        if (Array.isArray(s) && s.length >= 2) {
          statMap[s[0]] = s[1];
        }
      });

      const walking = statMap.DistanceWalking || 0;
      const jogging = statMap.DistanceJogging || 0;
      const running = statMap.DistanceHighSpeedRunning || 0;
      const sprinting = statMap.DistanceHighSpeedSprinting || 0;
      const totalDistance = statMap.TotalDistance || 0;
      const playerName = playerNameMap[playerId] || `Player ${playerId}`;
      const teamName = playerTeamMap[playerId] || "Unknown";

      return {
        playerId,
        playerName,
        teamName,
        walking,
        jogging,
        running,
        sprinting,
        totalDistance: totalDistance / 1000, // Convert to km
      };
    })
    .filter((p) => p !== null && p.totalDistance > 0)
    .sort((a, b) => b.totalDistance - a.totalDistance)
    .slice(0, 12); // Top 12 players

  if (players.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "No player intensity data available";
    empty.style.padding = "20px";
    empty.style.textAlign = "center";
    empty.style.color = "var(--text-secondary)";
    return empty;
  }

  // Dimensions
  const width = Math.min(700, window.innerWidth - 40);
  const height = Math.max(300, players.length * 40);
  const margin = { top: 10, right: 100, bottom: 30, left: 160 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Scales
  const maxDistance = Math.max(
    ...players.map((p) => p.walking + p.jogging + p.running + p.sprinting)
  );
  const xScale = d3.scaleLinear().domain([0, maxDistance]).range([0, chartWidth]);

  const yScale = d3
    .scaleBand()
    .domain(players.map((p) => p.playerName))
    .range([0, chartHeight])
    .padding(0.5);

  const barHeight = yScale.bandwidth() * 0.7;

  // Create tooltip FIRST (before bars that reference it)
  const tooltip = document.createElement("div");
  tooltip.style.position = "fixed";
  tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
  tooltip.style.color = "white";
  tooltip.style.padding = "8px 12px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.fontSize = "0.75rem";
  tooltip.style.fontFamily = "DM Mono, monospace";
  tooltip.style.pointerEvents = "none";
  tooltip.style.display = "none";
  tooltip.style.zIndex = "10000";
  tooltip.style.lineHeight = "1.6";
  tooltip.style.border = "1px solid rgba(255,255,255,0.2)";
  document.body.appendChild(tooltip);

  // Tooltip positioning and formatting function with colored legend
  const showTooltip = (event, playerData) => {
    tooltip.innerHTML = `
      <div style="margin-bottom: 2px;">Team: ${playerData.teamName}</div>
      <div style="margin-bottom: 2px;">Total distance: ${Math.round(playerData.totalDistance * 1000)} metres</div>
      <div style="margin-bottom: 2px;"><span style="display: inline-block; width: 8px; height: 8px; background-color: #9ca3af; border-radius: 50%; margin-right: 6px; vertical-align: middle; opacity: 0.7;"></span>Walking: ${Math.round(playerData.walking)} metres</div>
      <div style="margin-bottom: 2px;"><span style="display: inline-block; width: 8px; height: 8px; background-color: #6b7280; border-radius: 50%; margin-right: 6px; vertical-align: middle; opacity: 0.8;"></span>Jogging: ${Math.round(playerData.jogging)} metres</div>
      <div style="margin-bottom: 2px;"><span style="display: inline-block; width: 8px; height: 8px; background-color: #60a5fa; border-radius: 50%; margin-right: 6px; vertical-align: middle; opacity: 0.9;"></span>Running: ${Math.round(playerData.running)} metres</div>
      <div><span style="display: inline-block; width: 8px; height: 8px; background-color: #1e40af; border-radius: 50%; margin-right: 6px; vertical-align: middle;"></span>Sprinting: ${Math.round(playerData.sprinting)} metres</div>
    `;

    tooltip.style.display = "block";
    // Use clientX/clientY directly (viewport coordinates for fixed positioning)
    tooltip.style.left = event.clientX + 10 + "px";
    tooltip.style.top = event.clientY - 30 + "px";
  };

  const hideTooltip = () => {
    tooltip.style.display = "none";
  };

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("style", "display: block; margin: 0 auto; height: auto;");

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left},${margin.top})`);

  // Color definitions for 4 intensity levels
  const colors = {
    walking: "#9ca3af", // light gray
    jogging: "#6b7280", // medium gray
    running: "#60a5fa", // light blue
    sprinting: "#1e40af", // dark blue
  };

  // Render stacked bars - walking
  players.forEach((p) => {
    const y = yScale(p.playerName);
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", 0);
    bar.setAttribute("y", y + (yScale.bandwidth() - barHeight) / 2);
    bar.setAttribute("width", xScale(p.walking));
    bar.setAttribute("height", barHeight);
    bar.setAttribute("fill", colors.walking);
    bar.setAttribute("opacity", "0.7");
    bar.style.cursor = "pointer";
    bar.addEventListener("mouseover", (e) => showTooltip(e, p));
    bar.addEventListener("mouseout", hideTooltip);
    g.appendChild(bar);
  });

  // Render jogging bars (offset by walking)
  players.forEach((p) => {
    const y = yScale(p.playerName);
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", xScale(p.walking));
    bar.setAttribute("y", y + (yScale.bandwidth() - barHeight) / 2);
    bar.setAttribute("width", xScale(p.jogging));
    bar.setAttribute("height", barHeight);
    bar.setAttribute("fill", colors.jogging);
    bar.setAttribute("opacity", "0.8");
    bar.style.cursor = "pointer";
    bar.addEventListener("mouseover", (e) => showTooltip(e, p));
    bar.addEventListener("mouseout", hideTooltip);
    g.appendChild(bar);
  });

  // Render running bars (offset by walking + jogging)
  players.forEach((p) => {
    const y = yScale(p.playerName);
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", xScale(p.walking + p.jogging));
    bar.setAttribute("y", y + (yScale.bandwidth() - barHeight) / 2);
    bar.setAttribute("width", xScale(p.running));
    bar.setAttribute("height", barHeight);
    bar.setAttribute("fill", colors.running);
    bar.setAttribute("opacity", "0.9");
    bar.style.cursor = "pointer";
    bar.addEventListener("mouseover", (e) => showTooltip(e, p));
    bar.addEventListener("mouseout", hideTooltip);
    g.appendChild(bar);
  });

  // Render sprinting bars (offset by walking + jogging + running)
  players.forEach((p) => {
    const y = yScale(p.playerName);
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", xScale(p.walking + p.jogging + p.running));
    bar.setAttribute("y", y + (yScale.bandwidth() - barHeight) / 2);
    bar.setAttribute("width", xScale(p.sprinting));
    bar.setAttribute("height", barHeight);
    bar.setAttribute("fill", colors.sprinting);
    bar.setAttribute("opacity", "1.0");
    bar.style.cursor = "pointer";
    bar.addEventListener("mouseover", (e) => showTooltip(e, p));
    bar.addEventListener("mouseout", hideTooltip);
    g.appendChild(bar);
  });

  // Y axis labels (player names)
  players.forEach((p) => {
    const y = yScale(p.playerName);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", -10);
    text.setAttribute("y", y + yScale.bandwidth() / 2);
    text.setAttribute("dy", "0.35em");
    text.setAttribute("text-anchor", "end");
    text.setAttribute("font-size", "11px");
    text.setAttribute("fill", "var(--text-secondary)");
    text.setAttribute("font-family", "Inter, sans-serif");
    text.textContent = p.playerName;
    g.appendChild(text);
  });

  // X axis
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", 0);
  xAxis.setAttribute("x2", chartWidth);
  xAxis.setAttribute("y1", chartHeight);
  xAxis.setAttribute("y2", chartHeight);
  xAxis.setAttribute("stroke", "var(--border)");
  xAxis.setAttribute("stroke-width", "1");
  g.appendChild(xAxis);

  // X axis labels
  for (let i = 0; i <= maxDistance; i += Math.ceil(maxDistance / 4)) {
    const x = xScale(i);
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x);
    label.setAttribute("y", chartHeight + 15);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "10px");
    label.setAttribute("fill", "var(--text-muted)");
    label.setAttribute("font-family", "DM Mono, monospace");
    label.textContent = (i / 1000).toFixed(1) + "km";
    g.appendChild(label);
  }

  // Append g to SVG
  svg.appendChild(g);

  // Legend
  const legend = document.createElement("div");
  legend.style.marginTop = "12px";
  legend.style.display = "flex";
  legend.style.gap = "20px";
  legend.style.fontSize = "0.75rem";
  legend.style.fontWeight = "500";
  legend.style.letterSpacing = "0.06em";
  legend.style.textTransform = "uppercase";
  legend.style.color = "var(--text-muted)";
  legend.style.justifyContent = "center";
  legend.style.flexWrap = "wrap";

  const items = [
    { color: "#9ca3af", label: "Walking" },
    { color: "#6b7280", label: "Jogging" },
    { color: "#60a5fa", label: "Running" },
    { color: "#1e40af", label: "Sprinting" },
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

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.appendChild(svg);
  container.appendChild(legend);

  return container;
}
