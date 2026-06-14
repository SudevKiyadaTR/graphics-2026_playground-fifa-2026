export function powerRankingTriangle(powerRankingData) {
  if (
    !powerRankingData ||
    !powerRankingData.outfieldPlayers ||
    powerRankingData.outfieldPlayers.length === 0
  ) {
    const empty = document.createElement("div");
    empty.textContent = "No power ranking data available";
    empty.style.padding = "20px";
    empty.style.textAlign = "center";
    empty.style.color = "var(--text-secondary)";
    return empty;
  }

  // Extract names in English
  const getTeamName = (teamNameArray) => {
    const enName = teamNameArray.find((n) => n.locale === "en-GB");
    return enName ? enName.description : teamNameArray[0]?.description || "Unknown";
  };

  const getPlayerName = (playerNameArray) => {
    const enName = playerNameArray.find((n) => n.locale === "en-GB");
    return enName ? enName.description : playerNameArray[0]?.description || "Unknown";
  };

  // Process player data
  const players = powerRankingData.outfieldPlayers.map((p) => ({
    playerName: getPlayerName(p.playerName),
    teamName: getTeamName(p.teamName),
    attacking: p.attackingScore,
    defensive: p.defensiveScore,
    creativity: p.creativityScore,
  }));

  // Team colors
  const teamColors = {
    USA: "#4fb3e8",
    Paraguay: "#e8394b",
    Mexico: "#2bb56a",
    Canada: "#f0c040",
  };

  const getTeamColor = (teamName) => teamColors[teamName] || "#8b5cf6";

  // Container
  const container = document.createElement("div");
  container.style.display = "grid";
  container.style.gap = "32px";
  container.style.width = "100%";

  // SVG Setup
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const size = 600;
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("style", "display: block; margin: 0 auto;");

  const center = size / 2;
  const radius = 200; // Distance from center to vertex

  // Calculate triangle vertices (equilateral)
  const angle1 = Math.PI / 2; // Top
  const angle2 = Math.PI / 2 + (2 * Math.PI) / 3; // Bottom left
  const angle3 = Math.PI / 2 + (4 * Math.PI) / 3; // Bottom right

  const v1 = {
    x: center + radius * Math.cos(angle1),
    y: center + radius * Math.sin(angle1),
  }; // Attacking (top)
  const v2 = {
    x: center + radius * Math.cos(angle2),
    y: center + radius * Math.sin(angle2),
  }; // Defensive (bottom-left)
  const v3 = {
    x: center + radius * Math.cos(angle3),
    y: center + radius * Math.sin(angle3),
  }; // Creativity (bottom-right)

  // Helper function to convert (attacking, defensive, creativity) scores to (x, y)
  const scaleToTriangle = (attacking, defensive, creativity) => {
    // Sum the three scores
    const total = attacking + defensive + creativity;

    // Normalize to proper barycentric coordinates (must sum to 1)
    const a = attacking / total; // Weight for v1 (Attacking vertex)
    const d = defensive / total; // Weight for v2 (Defensive vertex)
    const c = creativity / total; // Weight for v3 (Creativity vertex)

    // Calculate position using barycentric coordinates
    const x = a * v1.x + d * v2.x + c * v3.x;
    const y = a * v1.y + d * v2.y + c * v3.y;
    return { x, y };
  };

  // Draw triangle grid (background)
  const gridGroup = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
  gridGroup.setAttribute("stroke", "var(--border-subtle)");
  gridGroup.setAttribute("stroke-width", "1");
  gridGroup.setAttribute("opacity", "0.4");

  // Draw concentric triangles for grid
  for (let i = 1; i <= 10; i++) {
    const scale = i / 10;
    const gv1 = {
      x: center + radius * scale * Math.cos(angle1),
      y: center + radius * scale * Math.sin(angle1),
    };
    const gv2 = {
      x: center + radius * scale * Math.cos(angle2),
      y: center + radius * scale * Math.sin(angle2),
    };
    const gv3 = {
      x: center + radius * scale * Math.cos(angle3),
      y: center + radius * scale * Math.sin(angle3),
    };

    const gridTriangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    gridTriangle.setAttribute("points", `${gv1.x},${gv1.y} ${gv2.x},${gv2.y} ${gv3.x},${gv3.y}`);
    gridTriangle.setAttribute("fill", "none");
    gridTriangle.setAttribute("stroke", "inherit");
    gridTriangle.setAttribute("stroke-width", "inherit");
    gridTriangle.setAttribute("opacity", "inherit");
    gridGroup.appendChild(gridTriangle);
  }

  // Draw axis lines and labels
  const axisGroup = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
  axisGroup.setAttribute("stroke", "var(--text-secondary)");
  axisGroup.setAttribute("stroke-width", "1.5");

  // Lines from center to vertices
  const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line1.setAttribute("x1", center);
  line1.setAttribute("y1", center);
  line1.setAttribute("x2", v1.x);
  line1.setAttribute("y2", v1.y);
  axisGroup.appendChild(line1);

  const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line2.setAttribute("x1", center);
  line2.setAttribute("y1", center);
  line2.setAttribute("x2", v2.x);
  line2.setAttribute("y2", v2.y);
  axisGroup.appendChild(line2);

  const line3 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line3.setAttribute("x1", center);
  line3.setAttribute("y1", center);
  line3.setAttribute("x2", v3.x);
  line3.setAttribute("y2", v3.y);
  axisGroup.appendChild(line3);

  // Triangle outline
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  outline.setAttribute("points", `${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`);
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "var(--border)");
  outline.setAttribute("stroke-width", "2");
  axisGroup.appendChild(outline);

  // Axis labels
  const labelOffset = 35;
  const labels = [
    { pos: v1, text: "Attacking", color: "var(--series-2)" },
    { pos: v2, text: "Defensive", color: "var(--series-1)" },
    { pos: v3, text: "Creativity", color: "var(--positive)" },
  ];

  labels.forEach(({ pos, text, color }) => {
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const angle = Math.atan2(pos.y - center, pos.x - center);
    const labelX = pos.x + labelOffset * Math.cos(angle);
    const labelY = pos.y + labelOffset * Math.sin(angle);

    label.setAttribute("x", labelX);
    label.setAttribute("y", labelY);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("font-family", '"DM Mono", monospace');
    label.setAttribute("font-size", "14");
    label.setAttribute("font-weight", "600");
    label.setAttribute("fill", color);
    label.textContent = text;
    svg.appendChild(label);
  });

  // Score labels on axes
  for (let i = 2; i <= 10; i += 2) {
    const scale = i / 10;

    // Attacking axis label
    const attackPos = {
      x: center + radius * scale * Math.cos(angle1),
      y: center + radius * scale * Math.sin(angle1),
    };
    const attackLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    attackLabel.setAttribute("x", attackPos.x - 15);
    attackLabel.setAttribute("y", attackPos.y);
    attackLabel.setAttribute("text-anchor", "end");
    attackLabel.setAttribute("dominant-baseline", "middle");
    attackLabel.setAttribute("font-family", '"DM Mono", monospace');
    attackLabel.setAttribute("font-size", "10");
    attackLabel.setAttribute("fill", "var(--text-muted)");
    attackLabel.textContent = i;
    svg.appendChild(attackLabel);

    // Defensive axis label
    const defPos = {
      x: center + radius * scale * Math.cos(angle2),
      y: center + radius * scale * Math.sin(angle2),
    };
    const defLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    defLabel.setAttribute("x", defPos.x + 15);
    defLabel.setAttribute("y", defPos.y + 8);
    defLabel.setAttribute("text-anchor", "start");
    defLabel.setAttribute("font-family", '"DM Mono", monospace');
    defLabel.setAttribute("font-size", "10");
    defLabel.setAttribute("fill", "var(--text-muted)");
    defLabel.textContent = i;
    svg.appendChild(defLabel);

    // Creativity axis label
    const crePos = {
      x: center + radius * scale * Math.cos(angle3),
      y: center + radius * scale * Math.sin(angle3),
    };
    const creLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    creLabel.setAttribute("x", crePos.x + 15);
    creLabel.setAttribute("y", crePos.y + 8);
    creLabel.setAttribute("text-anchor", "start");
    creLabel.setAttribute("font-family", '"DM Mono", monospace');
    creLabel.setAttribute("font-size", "10");
    creLabel.setAttribute("fill", "var(--text-muted)");
    creLabel.textContent = i;
    svg.appendChild(creLabel);
  }

  // Plot players as points with tooltips
  const dotsGroup = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
  dotsGroup.setAttribute("id", "player-dots");

  players.forEach((player) => {
    const pos = scaleToTriangle(player.attacking, player.defensive, player.creativity);

    // Create circle for player
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", pos.x);
    circle.setAttribute("cy", pos.y);
    circle.setAttribute("r", "6");
    circle.setAttribute("fill", getTeamColor(player.teamName));
    circle.setAttribute("opacity", "0.8");
    circle.setAttribute("stroke", "var(--border)");
    circle.setAttribute("stroke-width", "1");
    circle.style.cursor = "pointer";

    // Create tooltip
    const tooltip = document.createElement("div");
    tooltip.style.position = "fixed";
    tooltip.style.background = "var(--bg-raised)";
    tooltip.style.border = "1px solid var(--border)";
    tooltip.style.borderRadius = "6px";
    tooltip.style.padding = "12px 16px";
    tooltip.style.fontFamily = '"DM Mono", monospace';
    tooltip.style.fontSize = "12px";
    tooltip.style.color = "var(--text-primary)";
    tooltip.style.zIndex = "10000";
    tooltip.style.display = "none";
    tooltip.style.pointerEvents = "none";
    tooltip.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
    tooltip.style.backdropFilter = "blur(4px)";

    tooltip.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px; color: var(--accent);">${player.playerName}</div>
      <div style="display: grid; gap: 4px; font-size: 11px;">
        <div><span style="color: var(--series-2);">●</span> Team: <span style="color: var(--text-secondary);">${player.teamName}</span></div>
        <div><span style="color: var(--series-2);">●</span> Attacking: <span style="color: var(--text-primary);">${player.attacking.toFixed(2)}</span></div>
        <div><span style="color: var(--series-1);">●</span> Defensive: <span style="color: var(--text-primary);">${player.defensive.toFixed(2)}</span></div>
        <div><span style="color: var(--positive);">●</span> Creativity: <span style="color: var(--text-primary);">${player.creativity.toFixed(2)}</span></div>
      </div>
    `;

    document.body.appendChild(tooltip);

    // Event listeners
    circle.addEventListener("mouseenter", () => {
      tooltip.style.display = "block";
      circle.style.opacity = "1";
      circle.setAttribute("stroke-width", "2");
      circle.setAttribute("r", "8");

      const circleRect = circle.getBoundingClientRect();
      let tooltipX = circleRect.left + 15;
      let tooltipY = circleRect.top - 60;

      // Bounds checking
      tooltip.style.display = "block";
      setTimeout(() => {
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipX + tooltipRect.width > window.innerWidth - 10) {
          tooltipX = circleRect.left - tooltipRect.width - 15;
        }
        if (tooltipY < 10) {
          tooltipY = circleRect.top + 15;
        }
        tooltip.style.left = `${Math.max(5, tooltipX)}px`;
        tooltip.style.top = `${Math.max(5, tooltipY)}px`;
      }, 0);
    });

    circle.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
      circle.style.opacity = "0.8";
      circle.setAttribute("stroke-width", "1");
      circle.setAttribute("r", "6");
    });

    dotsGroup.appendChild(circle);
  });

  container.appendChild(svg);
  return container;
}
