import { computePosition, flip, shift, offset } from "@floating-ui/dom";

export function powerRankingViz(powerRankingData, d3) {
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

  // Extract team name in English
  const getTeamName = (teamNameArray) => {
    const enName = teamNameArray.find((n) => n.locale === "en-GB");
    return enName ? enName.description : teamNameArray[0]?.description || "Unknown";
  };

  // Extract player name in English
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
    attackingRank: p.attackingRank,
    defensiveRank: p.defensiveRank,
    creativityRank: p.creativityRank,
  }));

  // Color scheme for teams
  const teamColors = {
    USA: "#4fb3e8",
    Paraguay: "#e8394b",
    Mexico: "#2bb56a",
    Canada: "#f0c040",
  };

  const getTeamColor = (teamName) => {
    return teamColors[teamName] || "#8b5cf6";
  };

  // Create container for multiple visualizations
  const container = document.createElement("div");
  container.style.display = "grid";
  container.style.gap = "32px";
  container.style.width = "100%";

  // 1. Bubble chart: Attacking vs Defensive, sized by Creativity
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const width = 800;
  const height = 500;
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("style", "display: block; margin: 0 auto;");

  // Create scale functions manually since d3 might not be available
  const scaleX = (val) => (val / 10) * innerWidth;
  const scaleY = (val) => innerHeight - (val / 10) * innerHeight;
  const scaleR = (val) => Math.sqrt(val) * 2.5;

  // Add grid
  const grid = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
  grid.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);
  grid.setAttribute("stroke", "var(--border-subtle)");
  grid.setAttribute("stroke-width", "0.5");
  grid.setAttribute("opacity", "0.3");

  for (let i = 0; i <= 10; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", scaleX(i));
    line.setAttribute("x2", scaleX(i));
    line.setAttribute("y1", 0);
    line.setAttribute("y2", innerHeight);
    grid.appendChild(line);

    const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line2.setAttribute("x1", 0);
    line2.setAttribute("x2", innerWidth);
    line2.setAttribute("y1", scaleY(i));
    line2.setAttribute("y2", scaleY(i));
    grid.appendChild(line2);
  }

  // Add dots (bubbles) with tooltips
  const g = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
  g.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);

  // Create tooltips array to manage them all
  const tooltips = [];

  players.forEach((p, index) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", scaleX(p.attacking));
    circle.setAttribute("cy", scaleY(p.defensive));
    circle.setAttribute("r", scaleR(p.creativity));
    circle.setAttribute("fill", getTeamColor(p.teamName));
    circle.setAttribute("opacity", "0.7");
    circle.setAttribute("stroke", "var(--border)");
    circle.setAttribute("stroke-width", "1");
    circle.setAttribute("data-player-index", index);
    circle.style.cursor = "pointer";
    circle.style.transition = "opacity 0.2s ease";

    // Create tooltip element
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
      <div style="font-weight: 600; margin-bottom: 8px; color: var(--accent);">${p.playerName}</div>
      <div style="display: grid; gap: 4px; font-size: 11px; color: var(--text-secondary);">
        <div><span style="color: var(--series-1);">●</span> Team: ${p.teamName}</div>
        <div><span style="color: var(--series-2);">●</span> Attacking: <span style="color: var(--text-primary);">${p.attacking.toFixed(2)}</span></div>
        <div><span style="color: var(--series-1);">●</span> Defensive: <span style="color: var(--text-primary);">${p.defensive.toFixed(2)}</span></div>
        <div><span style="color: var(--positive);">●</span> Creativity: <span style="color: var(--text-primary);">${p.creativity.toFixed(2)}</span></div>
      </div>
    `;

    document.body.appendChild(tooltip);
    tooltips.push({ element: tooltip, circle: circle, player: p });

    // Mouse enter handler
    circle.addEventListener("mouseenter", async () => {
      tooltip.style.display = "block";
      circle.style.opacity = "1";
      circle.setAttribute("stroke-width", "2");
      circle.setAttribute("filter", "drop-shadow(0 0 6px rgba(232, 57, 75, 0.4))");

      // Get circle position on viewport
      const circleRect = circle.getBoundingClientRect();
      const r = parseFloat(circle.getAttribute("r"));

      // Calculate circle center on screen
      const circleScreenX = circleRect.left + circleRect.width / 2;
      const circleScreenY = circleRect.top + circleRect.height / 2;

      // Position tooltip to the right of circle
      let tooltipX = circleScreenX + r + 20;
      let tooltipY = circleScreenY - 45;

      // Measure tooltip to check bounds
      await new Promise((resolve) => setTimeout(resolve, 10));
      const tooltipRect = tooltip.getBoundingClientRect();
      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;

      // Flip left if too close to right edge
      if (tooltipX + tooltipWidth > window.innerWidth - 10) {
        tooltipX = circleScreenX - tooltipWidth - r - 20;
      }

      // Adjust vertically if too close to top/bottom
      if (tooltipY < 10) {
        tooltipY = circleScreenY + r + 20;
      } else if (tooltipY + tooltipHeight > window.innerHeight - 10) {
        tooltipY = window.innerHeight - tooltipHeight - 10;
      }

      tooltip.style.left = `${Math.max(5, tooltipX)}px`;
      tooltip.style.top = `${Math.max(5, tooltipY)}px`;
    });

    // Mouse leave handler
    circle.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
      circle.style.opacity = "0.7";
      circle.setAttribute("stroke-width", "1");
      circle.removeAttribute("filter");
    });

    g.appendChild(circle);
  });

  // Add labels for top performers
  const labels = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
  labels.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);
  labels.setAttribute("fill", "var(--text-primary)");
  labels.setAttribute("font-size", "10");
  labels.setAttribute("font-family", '"DM Mono", monospace');
  labels.setAttribute("text-anchor", "middle");

  const topPlayers = [...players].sort((a, b) => b.creativity - a.creativity).slice(0, 8);
  topPlayers.forEach((p) => {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", scaleX(p.attacking));
    text.setAttribute("y", scaleY(p.defensive) - scaleR(p.creativity) - 3);
    text.textContent = p.playerName.split(" ").pop();
    labels.appendChild(text);
  });

  // Add axes
  const axisGroup = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
  axisGroup.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);
  axisGroup.setAttribute("stroke", "var(--text-secondary)");
  axisGroup.setAttribute("font-family", '"DM Mono", monospace');
  axisGroup.setAttribute("font-size", "11");

  // X axis
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", 0);
  xAxis.setAttribute("x2", innerWidth);
  xAxis.setAttribute("y1", innerHeight);
  xAxis.setAttribute("y2", innerHeight);
  xAxis.setAttribute("stroke-width", "1");
  axisGroup.appendChild(xAxis);

  // Y axis
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", 0);
  yAxis.setAttribute("x2", 0);
  yAxis.setAttribute("y1", 0);
  yAxis.setAttribute("y2", innerHeight);
  yAxis.setAttribute("stroke-width", "1");
  axisGroup.appendChild(yAxis);

  // X labels
  for (let i = 0; i <= 10; i += 2) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", scaleX(i));
    text.setAttribute("y", innerHeight + 20);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "var(--text-secondary)");
    text.textContent = i;
    axisGroup.appendChild(text);
  }

  // Y labels
  for (let i = 0; i <= 10; i += 2) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", -10);
    text.setAttribute("y", scaleY(i) + 3);
    text.setAttribute("text-anchor", "end");
    text.setAttribute("fill", "var(--text-secondary)");
    text.textContent = i;
    axisGroup.appendChild(text);
  }

  // Axis labels
  const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  xLabel.setAttribute("x", margin.left + innerWidth / 2);
  xLabel.setAttribute("y", height - 10);
  xLabel.setAttribute("text-anchor", "middle");
  xLabel.setAttribute("fill", "var(--text-secondary)");
  xLabel.setAttribute("font-size", "12");
  xLabel.textContent = "Attacking Score";
  svg.appendChild(xLabel);

  const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yLabel.setAttribute(
    "transform",
    `rotate(-90) translate(${-(margin.top + innerHeight / 2)}, ${15})`
  );
  yLabel.setAttribute("text-anchor", "middle");
  yLabel.setAttribute("fill", "var(--text-secondary)");
  yLabel.setAttribute("font-size", "12");
  yLabel.textContent = "Defensive Score";
  svg.appendChild(yLabel);

  container.appendChild(svg);

  // 2. Top performers in each dimension
  const stats = ["attacking", "defensive", "creativity"];
  const statLabels = {
    attacking: "Attacking Leaders",
    defensive: "Defensive Leaders",
    creativity: "Creativity Leaders",
  };
  const statColors = {
    attacking: "var(--series-2)", // Red
    defensive: "var(--series-1)", // Blue
    creativity: "var(--positive)", // Green
  };

  const topPerformerContainer = document.createElement("div");
  topPerformerContainer.style.display = "grid";
  topPerformerContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))";
  topPerformerContainer.style.gap = "16px";

  stats.forEach((stat) => {
    const sorted = [...players].sort((a, b) => b[stat] - a[stat]).slice(0, 5);

    const card = document.createElement("div");
    card.style.background = "var(--bg-raised)";
    card.style.border = "1px solid var(--border)";
    card.style.borderRadius = "6px";
    card.style.padding = "16px";
    card.style.fontFamily = '"Inter", sans-serif';

    const title = document.createElement("h3");
    title.textContent = statLabels[stat];
    title.style.margin = "0 0 12px";
    title.style.fontSize = "0.95rem";
    title.style.fontWeight = "600";
    title.style.fontFamily = '"Inter", sans-serif';
    title.style.textTransform = "uppercase";
    title.style.letterSpacing = "0.06em";
    title.style.color = statColors[stat];
    card.appendChild(title);

    const list = document.createElement("ol");
    list.style.margin = "0";
    list.style.padding = "0 0 0 20px";
    list.style.fontSize = "0.82rem";

    sorted.forEach((p, i) => {
      const li = document.createElement("li");
      li.style.marginBottom = "8px";
      li.style.color = "var(--text-secondary)";

      const name = document.createElement("strong");
      name.textContent = p.playerName;
      name.style.color = "var(--text-primary)";
      name.style.display = "block";

      const score = document.createElement("span");
      score.textContent = `${p[stat].toFixed(2)} (${p.teamName})`;
      score.style.fontSize = "0.75rem";
      score.style.color = "var(--text-muted)";

      li.appendChild(name);
      li.appendChild(score);
      list.appendChild(li);
    });

    card.appendChild(list);
    topPerformerContainer.appendChild(card);
  });

  container.appendChild(topPerformerContainer);

  return container;
}
