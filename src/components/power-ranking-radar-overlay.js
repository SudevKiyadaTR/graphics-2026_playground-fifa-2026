export function powerRankingRadarOverlay(powerRankingData, homeTeam, awayTeam) {
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

  // Get team color based on home/away match
  const getTeamColor = (teamName) => {
    if (teamName === homeTeam) {
      return "var(--series-1)"; // Home team color (cool blue)
    } else if (teamName === awayTeam) {
      return "var(--series-2)"; // Away team color (red)
    }
    return "var(--series-1)"; // Default fallback
  };

  // Container
  const container = document.createElement("div");
  container.style.display = "grid";
  container.style.gap = "32px";
  container.style.width = "100%";

  // SVG Setup
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const size = 600;
  svg.setAttribute("width", size);
  svg.setAttribute("viewBox", "50 45 500 400");
  svg.setAttribute("style", "display: block; margin: 0 auto; height: auto;");

  const center = size / 2;
  const radius = 200;

  // Three axes at 120° angles
  const angles = [
    -Math.PI / 2, // Top (Attacking)
    -Math.PI / 2 + (2 * Math.PI) / 3, // Bottom-left (Defensive)
    -Math.PI / 2 + (4 * Math.PI) / 3, // Bottom-right (Creativity)
  ];

  // Draw concentric hexagons (grid)
  const gridGroup = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
  gridGroup.setAttribute("stroke", "var(--border-subtle)");
  gridGroup.setAttribute("stroke-width", "1");
  gridGroup.setAttribute("opacity", "0.3");

  for (let i = 1; i <= 5; i++) {
    const scale = i / 5;
    const hexPoints = angles.map((angle) => {
      const x = center + radius * scale * Math.cos(angle);
      const y = center + radius * scale * Math.sin(angle);
      return `${x},${y}`;
    });

    const hexagon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hexagon.setAttribute("points", hexPoints.join(" "));
    hexagon.setAttribute("fill", "none");
    hexagon.setAttribute("stroke", "inherit");
    hexagon.setAttribute("stroke-width", "inherit");
    hexagon.setAttribute("opacity", "inherit");
    gridGroup.appendChild(hexagon);
  }

  // Draw axes
  const axisGroup = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
  axisGroup.setAttribute("stroke", "var(--text-secondary)");
  axisGroup.setAttribute("stroke-width", "1.5");

  angles.forEach((angle) => {
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", center);
    line.setAttribute("y1", center);
    line.setAttribute("x2", x);
    line.setAttribute("y2", y);
    axisGroup.appendChild(line);
  });

  // Axis labels
  const labels = [
    { name: "Attacking", color: "var(--series-2)" },
    { name: "Defensive", color: "var(--series-1)" },
    { name: "Creativity", color: "var(--positive)" },
  ];

  labels.forEach(({ name, color }, i) => {
    const angle = angles[i];
    const labelRadius = radius + 35;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x);
    label.setAttribute("y", y);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("font-family", '"DM Mono", monospace');
    label.setAttribute("font-size", "16");
    label.setAttribute("font-weight", "600");
    label.setAttribute("fill", "#ffffff");
    label.textContent = name;
    svg.appendChild(label);
  });

  // Score labels on axes
  for (let i = 2; i <= 10; i += 2) {
    const scale = i / 10;
    angles.forEach((angle) => {
      const x = center + radius * scale * Math.cos(angle);
      const y = center + radius * scale * Math.sin(angle);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", x);
      label.setAttribute("y", y - 6);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-family", '"DM Mono", monospace');
      label.setAttribute("font-size", "10");
      label.setAttribute("fill", "var(--text-muted)");
      label.textContent = i;
      svg.appendChild(label);
    });
  }

  // Plot all player outlines
  const polygonsGroup = svg.appendChild(
    document.createElementNS("http://www.w3.org/2000/svg", "g")
  );
  const allPolygons = []; // Store all polygons for hover effects

  players.forEach((player, index) => {
    const values = [player.attacking, player.defensive, player.creativity];

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
    tooltip.style.whiteSpace = "nowrap";
    tooltip.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
    tooltip.style.backdropFilter = "blur(4px)";

    tooltip.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px; color: var(--accent);">${player.playerName}</div>
      <div style="display: grid; gap: 4px; font-size: 11px; color: var(--text-secondary);">
        <div><span style="color: var(--series-2);">●</span> Team: ${player.teamName}</div>
        <div><span style="color: var(--series-2);">●</span> Attacking: <span style="color: var(--text-primary);">${player.attacking.toFixed(2)}</span></div>
        <div><span style="color: var(--series-1);">●</span> Defensive: <span style="color: var(--text-primary);">${player.defensive.toFixed(2)}</span></div>
        <div><span style="color: var(--positive);">●</span> Creativity: <span style="color: var(--text-primary);">${player.creativity.toFixed(2)}</span></div>
      </div>
    `;

    document.body.appendChild(tooltip);

    // Create polygon
    const polygonPoints = angles.map((angle) => {
      const scale = Math.min(1, values[angles.indexOf(angle)] / 10);
      const x = center + radius * scale * Math.cos(angle);
      const y = center + radius * scale * Math.sin(angle);
      return `${x},${y}`;
    });

    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", polygonPoints.join(" "));
    polygon.setAttribute("fill", "none");
    polygon.setAttribute("stroke", getTeamColor(player.teamName));
    polygon.setAttribute("stroke-width", "1.5");
    polygon.setAttribute("opacity", "0.6");
    polygon.style.cursor = "pointer";
    polygon.style.transition = "opacity 0.2s ease, stroke-width 0.2s ease";

    allPolygons.push(polygon);

    // Track mouse position for tooltip positioning
    let mouseX = 0;
    let mouseY = 0;

    // Event listeners
    polygon.addEventListener("mouseenter", () => {
      // Brighten this polygon
      polygon.style.opacity = "1";
      polygon.setAttribute("stroke-width", "2.5");

      // Dim all other polygons
      allPolygons.forEach((p) => {
        if (p !== polygon) {
          p.style.opacity = "0.15";
        }
      });

      tooltip.style.display = "block";
    });

    polygon.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Position tooltip to the right of mouse with offset
      let tooltipX = mouseX + 16; // 16px to the right
      let tooltipY = mouseY - 8; // Slightly above mouse

      tooltip.style.display = "block";
      setTimeout(() => {
        const tooltipRect = tooltip.getBoundingClientRect();

        // Check if tooltip goes off right edge
        if (tooltipX + tooltipRect.width > window.innerWidth - 10) {
          tooltipX = mouseX - tooltipRect.width - 16; // Show on left side instead
        }

        // Check if tooltip goes off bottom edge
        if (tooltipY + tooltipRect.height > window.innerHeight - 10) {
          tooltipY = window.innerHeight - tooltipRect.height - 10;
        }

        // Ensure not off top
        if (tooltipY < 10) {
          tooltipY = 10;
        }

        tooltip.style.left = `${Math.max(5, tooltipX)}px`;
        tooltip.style.top = `${Math.max(5, tooltipY)}px`;
      }, 0);
    });

    polygon.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";

      // Restore all polygons to normal opacity
      allPolygons.forEach((p) => {
        p.style.opacity = "0.6";
        p.setAttribute("stroke-width", "1.5");
      });
    });

    polygonsGroup.appendChild(polygon);
  });

  // Add legend
  const legendContainer = document.createElement("div");
  legendContainer.style.display = "grid";
  legendContainer.style.gap = "24px";
  legendContainer.style.marginBottom = "24px";
  legendContainer.style.width = "100%";

  // Team legend
  const teams = [...new Set(players.map((p) => p.teamName))];
  const teamLegend = document.createElement("div");
  teamLegend.style.display = "flex";
  teamLegend.style.gap = "24px";
  teamLegend.style.flexWrap = "wrap";
  teamLegend.style.fontSize = "12px";
  teamLegend.style.fontFamily = '"DM Mono", monospace';

  teams.forEach((team) => {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "8px";

    const dot = document.createElement("div");
    dot.style.width = "12px";
    dot.style.height = "12px";
    dot.style.borderRadius = "2px";
    dot.style.backgroundColor = getTeamColor(team);
    item.appendChild(dot);

    const label = document.createElement("span");
    label.style.color = "var(--text-secondary)";
    label.textContent = team;
    item.appendChild(label);

    teamLegend.appendChild(item);
  });

  legendContainer.appendChild(teamLegend);
  container.appendChild(legendContainer);
  container.appendChild(svg);

  return container;
}
