export function teamStatsBars(teamStatsData, homeTeam, awayTeam, d3) {
  // Key stats to display
  const statsToShow = [
    "Passes",
    "Possession",
    "AttemptAtGoal",
    "AttemptAtGoalOnTarget",
    "Crosses",
    "CrossesCompleted",
    "Corners",
    "TotalPressure",
    "BallRecoveryTime",
    "FoulsFor",
    "GKSaves",
  ];

  // Labels for display
  const statLabels = {
    Passes: "Passes",
    Possession: "Possession %",
    AttemptAtGoal: "Shots",
    AttemptAtGoalOnTarget: "Shots on Target",
    Crosses: "Crosses",
    CrossesCompleted: "Crosses Completed",
    Corners: "Corners",
    TotalPressure: "Total Pressure",
    BallRecoveryTime: "Avg Recovery Time (s)",
    FoulsFor: "Fouls Committed",
    GKSaves: "Goalkeeper Saves",
  };

  // Value formatters for special cases
  const formatters = {
    Possession: (val) => Math.round(val * 100),
    BallRecoveryTime: (val) => Math.round(val * 10) / 10,
  };

  // Extract team IDs from the data
  const teamIds = Object.keys(teamStatsData);
  if (teamIds.length < 2) {
    return document.createElement("div");
  }

  const homeTeamId = teamIds[0];
  const awayTeamId = teamIds[1];

  const homeStats = teamStatsData[homeTeamId];
  const awayStats = teamStatsData[awayTeamId];

  // Create a map of stat name to value for each team
  const homeStatsMap = new Map(homeStats.map(([name, value]) => [name, value]));
  const awayStatsMap = new Map(awayStats.map(([name, value]) => [name, value]));

  // Map virtual stat names to actual data fields
  const statFieldMap = {
    TotalPressure: "DefensivePressuresApplied",
    BallRecoveryTime: "BallRecoveryTime",
  };

  // Build data array
  const data = statsToShow.map((stat) => {
    const sourceField = statFieldMap[stat] || stat;
    return {
      stat: statLabels[stat],
      statKey: stat,
      home: formatters[stat]
        ? formatters[stat](homeStatsMap.get(sourceField) || 0)
        : homeStatsMap.get(sourceField) || 0,
      away: formatters[stat]
        ? formatters[stat](awayStatsMap.get(sourceField) || 0)
        : awayStatsMap.get(sourceField) || 0,
    };
  });

  // Calculate direct pressure for overlay (not displayed as separate row)
  const directPressureHome = homeStatsMap.get("DirectDefensivePressuresApplied") || 0;
  const directPressureAway = awayStatsMap.get("DirectDefensivePressuresApplied") || 0;

  // For pressure stats, calculate the max of total pressure for scaling
  const pressureData = data.find((d) => d.statKey === "TotalPressure");
  const pressureMaxVal = pressureData ? Math.max(pressureData.home, pressureData.away) : 0;

  // Dimensions
  const width = 700;
  const height = data.length * 70 + 80; // Add space for legend at top
  const margin = { top: 50, right: 80, bottom: 20, left: 80 };
  const centerX = width / 2;
  const chartWidth = (width - margin.left - margin.right) / 2;
  const chartHeight = height - margin.top - margin.bottom;

  // Create a scale factory for per-attribute scaling
  const createAttributeScale = (maxVal) => {
    return d3.scaleLinear().domain([0, maxVal]).range([0, chartWidth]);
  };

  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.stat))
    .range([0, chartHeight])
    .padding(0.5);

  const barHeight = yScale.bandwidth() * 0.4;

  // Create SVG
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Add center line
  g.append("line")
    .attr("x1", centerX - margin.left)
    .attr("x2", centerX - margin.left)
    .attr("y1", 0)
    .attr("y2", chartHeight)
    .style("stroke", "var(--border)")
    .style("stroke-width", 1)
    .style("opacity", 0.5);

  // Add stat labels in center (above the bars)
  g.selectAll(".stat-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "stat-label")
    .attr("x", centerX - margin.left)
    .attr("y", (d) => yScale(d.stat) + 5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("fill", "var(--text-primary)")
    .style("font-family", "Inter, sans-serif")
    .style("font-weight", "600")
    .text((d) => d.stat);

  // Add home team bars (left, extending negative) - positioned below label
  g.selectAll(".home-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "home-bar")
    .attr("x", (d) => {
      const maxVal = d.statKey === "TotalPressure" ? pressureMaxVal : Math.max(d.home, d.away);
      const scale = createAttributeScale(maxVal);
      return centerX - margin.left - scale(d.home);
    })
    .attr("y", (d) => yScale(d.stat) + 22)
    .attr("width", (d) => {
      const maxVal = d.statKey === "TotalPressure" ? pressureMaxVal : Math.max(d.home, d.away);
      const scale = createAttributeScale(maxVal);
      return scale(d.home);
    })
    .attr("height", barHeight)
    .style("fill", "var(--series-1)")
    .style("opacity", (d) => (d.statKey === "TotalPressure" ? 0.2 : 0.8));

  // Add away team bars (right) - positioned below label
  g.selectAll(".away-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "away-bar")
    .attr("x", centerX - margin.left)
    .attr("y", (d) => yScale(d.stat) + 22)
    .attr("width", (d) => {
      const maxVal = d.statKey === "TotalPressure" ? pressureMaxVal : Math.max(d.home, d.away);
      const scale = createAttributeScale(maxVal);
      return scale(d.away);
    })
    .attr("height", barHeight)
    .style("fill", "var(--series-2)")
    .style("opacity", (d) => (d.statKey === "TotalPressure" ? 0.2 : 0.8));

  // Add direct pressure overlays on top of total pressure (home team, left)
  const totalPressureRow = data.find((d) => d.statKey === "TotalPressure");
  if (totalPressureRow) {
    const pressureScale = createAttributeScale(pressureMaxVal);

    // Calculate direct pressure width as a proportion of each team's total pressure
    const homeDirectWidth = pressureScale(directPressureHome);
    const awayDirectWidth = pressureScale(directPressureAway);

    // Home team direct pressure overlay (nested within total pressure bar)
    g.append("rect")
      .attr("class", "home-direct-pressure")
      .attr("x", centerX - margin.left - homeDirectWidth)
      .attr("y", yScale(totalPressureRow.stat) + 22)
      .attr("width", homeDirectWidth)
      .attr("height", barHeight)
      .style("fill", "var(--series-1)")
      .style("opacity", 0.8);

    // Away team direct pressure overlay (nested within total pressure bar)
    g.append("rect")
      .attr("class", "away-direct-pressure")
      .attr("x", centerX - margin.left)
      .attr("y", yScale(totalPressureRow.stat) + 22)
      .attr("width", awayDirectWidth)
      .attr("height", barHeight)
      .style("fill", "var(--series-2)")
      .style("opacity", 0.8);

    // Home direct pressure value
    g.append("text")
      .attr("class", "direct-pressure-value")
      .attr("x", centerX - margin.left - homeDirectWidth - 5)
      .attr("y", yScale(totalPressureRow.stat) + 22 + barHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("fill", "var(--text-primary)")
      .style("font-family", "DM Mono, monospace")
      .style("font-weight", "500")
      .text(directPressureHome);

    // Away direct pressure value
    g.append("text")
      .attr("class", "direct-pressure-value")
      .attr("x", centerX - margin.left + awayDirectWidth + 5)
      .attr("y", yScale(totalPressureRow.stat) + 22 + barHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .style("fill", "var(--text-primary)")
      .style("font-family", "DM Mono, monospace")
      .style("font-weight", "500")
      .text(directPressureAway);
  }

  // Add home team values (on left)
  g.selectAll(".home-value")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "home-value")
    .attr("x", (d) => {
      const maxVal = d.statKey === "TotalPressure" ? pressureMaxVal : Math.max(d.home, d.away);
      const scale = createAttributeScale(maxVal);
      return centerX - margin.left - scale(d.home) - 5;
    })
    .attr("y", (d) => yScale(d.stat) + 22 + barHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .style("fill", "var(--text-primary)")
    .style("font-family", "DM Mono, monospace")
    .style("font-weight", "600")
    .text((d) => d.home);

  // Add away team values (on right)
  g.selectAll(".away-value")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "away-value")
    .attr("x", (d) => {
      const maxVal = d.statKey === "TotalPressure" ? pressureMaxVal : Math.max(d.home, d.away);
      const scale = createAttributeScale(maxVal);
      return centerX - margin.left + scale(d.away) + 5;
    })
    .attr("y", (d) => yScale(d.stat) + 22 + barHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .style("font-size", "12px")
    .style("fill", "var(--text-primary)")
    .style("font-family", "DM Mono, monospace")
    .style("font-weight", "600")
    .text((d) => d.away);

  // Add legend - horizontal at the top
  const legend = svg.append("g").attr("transform", `translate(${width / 2 - 80},${15})`);

  // Home team legend item
  legend.append("rect").attr("width", 14).attr("height", 14).style("fill", "var(--series-1)");

  legend
    .append("text")
    .attr("x", 20)
    .attr("y", 12)
    .style("font-size", "12px")
    .style("fill", "var(--text-secondary)")
    .style("font-family", "Inter, sans-serif")
    .text(homeTeam);

  // Away team legend item
  legend
    .append("rect")
    .attr("x", 120)
    .attr("width", 14)
    .attr("height", 14)
    .style("fill", "var(--series-2)");

  legend
    .append("text")
    .attr("x", 140)
    .attr("y", 12)
    .style("font-size", "12px")
    .style("fill", "var(--text-secondary)")
    .style("font-family", "Inter, sans-serif")
    .text(awayTeam);

  return svg.node();
}
