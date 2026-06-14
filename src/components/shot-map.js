export function shotMap(teamStats, timeline, match, d3) {
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";

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

  // Responsive sizing
  const width = Math.min(600, window.innerWidth - 40);
  const height = width * 0.52; // Field aspect ratio

  // Field dimensions in SVG coordinates
  const fieldWidth = 105;
  const fieldHeight = 68;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${fieldWidth} ${fieldHeight}`);
  svg.setAttribute(
    "style",
    "border: 1px solid var(--border); border-radius: 4px; background: linear-gradient(to bottom, #1a3a1a, #0d2009);"
  );

  // Draw field
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  // Center line
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", fieldWidth / 2);
  line.setAttribute("y1", 0);
  line.setAttribute("x2", fieldWidth / 2);
  line.setAttribute("y2", fieldHeight);
  line.setAttribute("stroke", "#3a6a3a");
  line.setAttribute("stroke-width", "0.3");
  g.appendChild(line);

  // Center circle
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", fieldWidth / 2);
  circle.setAttribute("cy", fieldHeight / 2);
  circle.setAttribute("r", 9.15);
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke", "#3a6a3a");
  circle.setAttribute("stroke-width", "0.3");
  g.appendChild(circle);

  // Penalty areas
  const penaltyWidth = 40.32;
  const penaltyHeight = 16.5;
  for (const x of [0, fieldWidth - penaltyWidth]) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", (fieldHeight - penaltyHeight) / 2);
    rect.setAttribute("width", penaltyWidth);
    rect.setAttribute("height", penaltyHeight);
    rect.setAttribute("fill", "none");
    rect.setAttribute("stroke", "#3a6a3a");
    rect.setAttribute("stroke-width", "0.3");
    g.appendChild(rect);
  }

  // Extract shot data from timeline
  const shots = [];
  if (timeline && timeline.Event) {
    timeline.Event.forEach((event) => {
      if (event.Type === 14 || event.Type === 18) {
        // Type 14 = Goal, Type 18 = Attempt at Goal
        const qualifiers = event.Qualifiers || [];
        let x = qualifiers.find((q) => q.qualifierId === 140)?.value || null;
        let y = qualifiers.find((q) => q.qualifierId === 141)?.value || null;

        if (x !== null && y !== null) {
          x = (x / 100) * fieldWidth;
          y = (y / 100) * fieldHeight;

          const isGoal = event.Type === 14;
          const isOnTarget = qualifiers.some((q) => q.qualifierId === 321); // On target
          const teamId = event.IdTeam;

          shots.push({
            x,
            y,
            isGoal,
            isOnTarget,
            teamId,
            isHome: teamId === homeTeamId,
          });
        }
      }
    });
  }

  // Draw shots
  shots.forEach((shot) => {
    const shotGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Circle for shot
    const shotCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    shotCircle.setAttribute("cx", shot.isHome ? shot.x : fieldWidth - shot.x);
    shotCircle.setAttribute("cy", shot.y);
    shotCircle.setAttribute("r", shot.isGoal ? "1.2" : "0.8");

    if (shot.isGoal) {
      shotCircle.setAttribute("fill", "#2bb56a");
      shotCircle.setAttribute("stroke", "#4fb3e8");
      shotCircle.setAttribute("stroke-width", "0.2");
    } else if (shot.isOnTarget) {
      shotCircle.setAttribute("fill", "#e8394b");
      shotCircle.setAttribute("opacity", "0.8");
    } else {
      shotCircle.setAttribute("fill", "none");
      shotCircle.setAttribute("stroke", "#e8394b");
      shotCircle.setAttribute("stroke-width", "0.2");
      shotCircle.setAttribute("opacity", "0.5");
    }

    shotGroup.appendChild(shotCircle);
    g.appendChild(shotGroup);
  });

  svg.appendChild(g);
  container.appendChild(svg);

  // Legend
  const legend = document.createElement("div");
  legend.style.marginTop = "12px";
  legend.style.display = "flex";
  legend.style.gap = "16px";
  legend.style.fontSize = "0.75rem";
  legend.style.color = "var(--text-secondary)";
  legend.style.justifyContent = "center";
  legend.style.flexWrap = "wrap";

  const legends = [
    { color: "#2bb56a", label: "Goal" },
    { color: "#e8394b", label: "On Target" },
    { color: "#e8394b", label: "Off Target (outline)" },
  ];

  legends.forEach((leg) => {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "6px";

    const dot = document.createElement("div");
    dot.style.width = "8px";
    dot.style.height = "8px";
    dot.style.borderRadius = "50%";
    dot.style.backgroundColor = leg.color;
    if (leg.label === "Off Target (outline)") {
      dot.style.backgroundColor = "transparent";
      dot.style.border = "1px solid " + leg.color;
    }

    item.appendChild(dot);
    item.appendChild(document.createTextNode(leg.label));
    legend.appendChild(item);
  });

  container.appendChild(legend);
  return container;
}
