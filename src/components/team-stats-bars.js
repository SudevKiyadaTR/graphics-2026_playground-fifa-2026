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
    "DefensivePressuresApplied",
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
    DefensivePressuresApplied: "Pressures Applied",
    FoulsFor: "Fouls Committed",
    GKSaves: "Goalkeeper Saves",
  };

  // Value formatters for special cases
  const formatters = {
    Possession: (val) => Math.round(val * 100),
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

  // Build data array
  const data = statsToShow.map((stat) => ({
    stat: statLabels[stat],
    home: formatters[stat]
      ? formatters[stat](homeStatsMap.get(stat) || 0)
      : homeStatsMap.get(stat) || 0,
    away: formatters[stat]
      ? formatters[stat](awayStatsMap.get(stat) || 0)
      : awayStatsMap.get(stat) || 0,
  }));

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
      const maxVal = Math.max(d.home, d.away);
      const scale = createAttributeScale(maxVal);
      return centerX - margin.left - scale(d.home);
    })
    .attr("y", (d) => yScale(d.stat) + 22)
    .attr("width", (d) => {
      const maxVal = Math.max(d.home, d.away);
      const scale = createAttributeScale(maxVal);
      return scale(d.home);
    })
    .attr("height", barHeight)
    .style("fill", "var(--series-1)")
    .style("opacity", 0.8);

  // Add away team bars (right) - positioned below label
  g.selectAll(".away-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "away-bar")
    .attr("x", centerX - margin.left)
    .attr("y", (d) => yScale(d.stat) + 22)
    .attr("width", (d) => {
      const maxVal = Math.max(d.home, d.away);
      const scale = createAttributeScale(maxVal);
      return scale(d.away);
    })
    .attr("height", barHeight)
    .style("fill", "var(--series-2)")
    .style("opacity", 0.8);

  // Add home team values (on left)
  g.selectAll(".home-value")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "home-value")
    .attr("x", (d) => {
      const maxVal = Math.max(d.home, d.away);
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
      const maxVal = Math.max(d.home, d.away);
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
