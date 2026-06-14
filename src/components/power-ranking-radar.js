export function powerRankingRadar(powerRankingData) {
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

  // Create a grid of individual radar charts
  const gridContainer = document.createElement("div");
  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
  gridContainer.style.gap = "24px";
  gridContainer.style.width = "100%";

  // Get top 12 performers by average score
  const topPlayers = [...players]
    .sort(
      (a, b) =>
        (b.attacking + b.defensive + b.creativity) / 3 -
        (a.attacking + a.defensive + a.creativity) / 3
    )
    .slice(0, 12);

  topPlayers.forEach((player) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const size = 280;
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("style", "display: block;");

    const center = size / 2;
    const radius = 80;

    // Three axes at 120° angles
    const angles = [
      -Math.PI / 2, // Top (Attacking)
      -Math.PI / 2 + (2 * Math.PI) / 3, // Bottom-left (Defensive)
      -Math.PI / 2 + (4 * Math.PI) / 3, // Bottom-right (Creativity)
    ];

    const vertices = angles.map((angle) => ({
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }));

    // Draw concentric hexagons (grid)
    const gridGroup = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
    gridGroup.setAttribute("stroke", "var(--border-subtle)");
    gridGroup.setAttribute("stroke-width", "1");
    gridGroup.setAttribute("opacity", "0.4");

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
      const labelRadius = radius + 30;
      const x = center + labelRadius * Math.cos(angle);
      const y = center + labelRadius * Math.sin(angle);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", x);
      label.setAttribute("y", y);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("font-family", '"DM Mono", monospace');
      label.setAttribute("font-size", "10");
      label.setAttribute("font-weight", "600");
      label.setAttribute("fill", color);
      label.textContent = name;
      svg.appendChild(label);
    });

    // Player data polygon
    const values = [player.attacking, player.defensive, player.creativity];
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

    const polygonPoints = angles.map((angle, i) => {
      const scale = values[i] / 10; // Normalize to 0-1 range
      const x = center + radius * scale * Math.cos(angle);
      const y = center + radius * scale * Math.sin(angle);
      return `${x},${y}`;
    });

    polygon.setAttribute("points", polygonPoints.join(" "));
    polygon.setAttribute("fill", getTeamColor(player.teamName));
    polygon.setAttribute("opacity", "0.3");
    polygon.setAttribute("stroke", getTeamColor(player.teamName));
    polygon.setAttribute("stroke-width", "2");
    svg.appendChild(polygon);

    // Dots at each axis point
    angles.forEach((angle, i) => {
      const scale = values[i] / 10;
      const x = center + radius * scale * Math.cos(angle);
      const y = center + radius * scale * Math.sin(angle);

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
      dot.setAttribute("r", "4");
      dot.setAttribute("fill", getTeamColor(player.teamName));
      dot.setAttribute("stroke", "var(--border)");
      dot.setAttribute("stroke-width", "1");
      svg.appendChild(dot);
    });

    // Card wrapper
    const card = document.createElement("div");
    card.style.background = "var(--bg-raised)";
    card.style.border = "1px solid var(--border)";
    card.style.borderRadius = "6px";
    card.style.padding = "16px";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.gap = "12px";

    // Player info
    const info = document.createElement("div");
    info.style.textAlign = "center";

    const name = document.createElement("div");
    name.style.fontFamily = '"DM Mono", monospace';
    name.style.fontWeight = "600";
    name.style.fontSize = "13px";
    name.style.color = "var(--text-primary)";
    name.textContent = player.playerName;
    info.appendChild(name);

    const team = document.createElement("div");
    team.style.fontFamily = '"Inter", sans-serif';
    team.style.fontSize = "11px";
    team.style.color = "var(--text-secondary)";
    team.textContent = player.teamName;
    info.appendChild(team);

    card.appendChild(info);

    // Stats table
    const statsDiv = document.createElement("div");
    statsDiv.style.display = "grid";
    statsDiv.style.gap = "6px";
    statsDiv.style.fontSize = "10px";
    statsDiv.style.fontFamily = '"DM Mono", monospace';

    const stats = [
      { label: "Attacking", value: player.attacking.toFixed(2), color: "var(--series-2)" },
      { label: "Defensive", value: player.defensive.toFixed(2), color: "var(--series-1)" },
      { label: "Creativity", value: player.creativity.toFixed(2), color: "var(--positive)" },
    ];

    stats.forEach(({ label, value, color }) => {
      const statRow = document.createElement("div");
      statRow.style.display = "flex";
      statRow.style.justifyContent = "space-between";
      statRow.style.alignItems = "center";

      const labelEl = document.createElement("span");
      labelEl.style.color = color;
      labelEl.textContent = `● ${label}`;

      const valueEl = document.createElement("span");
      valueEl.style.color = "var(--text-primary)";
      valueEl.style.fontWeight = "600";
      valueEl.textContent = value;

      statRow.appendChild(labelEl);
      statRow.appendChild(valueEl);
      statsDiv.appendChild(statRow);
    });

    card.appendChild(statsDiv);

    // Add SVG to card
    const svgWrapper = document.createElement("div");
    svgWrapper.style.display = "flex";
    svgWrapper.style.justifyContent = "center";
    svgWrapper.appendChild(svg);
    card.appendChild(svgWrapper);

    gridContainer.appendChild(card);
  });

  container.appendChild(gridContainer);
  return container;
}
