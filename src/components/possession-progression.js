export function possessionProgression(teamStats, match, d3) {
  const container = document.createElement("div");
  container.style.width = "100%";

  // Main description
  const description = document.createElement("p");
  description.style.fontSize = "0.85rem";
  description.style.color = "#7d95b0";
  description.style.marginBottom = "20px";
  description.style.lineHeight = "1.5";
  description.textContent = "Possession progression measures the team's ability to move the ball forward through the pitch. Ball progression tracks completed passes vs attempts. Linebreaks show offensive organization across defensive, midfield, and attacking zones.";
  container.appendChild(description);

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

  // Legend
  const legend = document.createElement("div");
  legend.style.marginBottom = "16px";
  legend.style.display = "flex";
  legend.style.gap = "20px";
  legend.style.fontSize = "0.75rem";
  legend.style.color = "#7d95b0";

  [{ label: "Attempted", color: "#4fb3e8", opacity: "0.3" }, { label: "Completed", color: "#2bb56a", opacity: "1" }].forEach(({ label, color, opacity }) => {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "6px";

    const box = document.createElement("div");
    box.style.width = "12px";
    box.style.height = "12px";
    box.style.backgroundColor = color;
    box.style.opacity = opacity;

    item.appendChild(box);
    item.appendChild(document.createTextNode(label));
    legend.appendChild(item);
  });

  overallSection.appendChild(legend);

  // Get max value across both teams for consistent scale
  const maxProgressValue = Math.max(...overallData.flatMap((d) => [d.attempted, d.completed])) || 1;

  // Overall progression bars (stacked overlay style)
  overallData.forEach((d) => {
    const completion = d.attempted > 0 ? (d.completed / d.attempted) * 100 : 0;

    // Team row
    const teamRow = document.createElement("div");
    teamRow.style.marginBottom = "16px";

    // Team name
    const teamLabel = document.createElement("div");
    teamLabel.textContent = d.team;
    teamLabel.style.fontSize = "0.9rem";
    teamLabel.style.fontWeight = "600";
    teamLabel.style.fontFamily = "DM Mono, monospace";
    teamLabel.style.color = "var(--text-primary)";
    teamLabel.style.marginBottom = "8px";
    teamRow.appendChild(teamLabel);

    // Bar container (stacked overlay)
    const barContainer = document.createElement("div");
    barContainer.style.display = "flex";
    barContainer.style.width = "100%";
    barContainer.style.height = "36px";
    barContainer.style.position = "relative";
    barContainer.style.borderRadius = "4px";
    barContainer.style.overflow = "hidden";

    // Background bar (Attempted - muted)
    const attemptedBar = document.createElement("div");
    attemptedBar.style.position = "absolute";
    attemptedBar.style.top = "0";
    attemptedBar.style.left = "0";
    attemptedBar.style.height = "100%";
    attemptedBar.style.width = `${(d.attempted / maxProgressValue) * 100}%`;
    attemptedBar.style.backgroundColor = "#4fb3e8";
    attemptedBar.style.opacity = "0.3";
    barContainer.appendChild(attemptedBar);

    // Overlay bar (Completed - full opacity)
    const completedBar = document.createElement("div");
    completedBar.style.position = "absolute";
    completedBar.style.top = "0";
    completedBar.style.left = "0";
    completedBar.style.height = "100%";
    completedBar.style.width = `${(d.completed / maxProgressValue) * 100}%`;
    completedBar.style.backgroundColor = "#2bb56a";
    completedBar.style.display = "flex";
    completedBar.style.alignItems = "center";
    completedBar.style.justifyContent = "center";
    completedBar.style.fontSize = "0.9rem";
    completedBar.style.fontWeight = "700";
    completedBar.style.fontFamily = "DM Mono, monospace";
    completedBar.style.color = "transparent";
    completedBar.style.textShadow = "none";
    barContainer.appendChild(completedBar);

    teamRow.appendChild(barContainer);
    overallSection.appendChild(teamRow);
  });

  const spacer = document.createElement("div");
  spacer.style.marginBottom = "24px";
  overallSection.appendChild(spacer);

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
