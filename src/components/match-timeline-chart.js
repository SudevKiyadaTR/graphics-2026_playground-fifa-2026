export function matchTimelineChart(match, events, d3, html) {
  // Parse match minutes from string format ("45'" -> 45)
  const parseMinute = (minute) => {
    const num = parseInt(minute.replace(/[^0-9]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Categorize events
  const eventCategories = {
    goal: { label: "Goals", types: [0], color: "#e8394b" },
    yellowCard: { label: "Yellow Cards", types: [2], color: "#f4b644" },
    redCard: { label: "Red Cards", types: [3], color: "#e8394b" },
    substitution: { label: "Substitutions", types: [5], color: "#4fb3e8" },
    foul: { label: "Fouls", types: [18], color: "#7d95b0" },
  };

  // Identify event type categories
  const categorizeEvent = (event) => {
    for (const [cat, config] of Object.entries(eventCategories)) {
      if (config.types.includes(event.Type)) {
        return cat;
      }
    }
    return null;
  };

  // Find team info for an event
  const getTeamInfo = (eventTeamId) => {
    if (!eventTeamId) return null;
    
    // Determine home/away team IDs by finding which team had the first goal
    // Or use the first team in events as home
    let homeTeamId = null;
    let awayTeamId = null;
    
    for (const e of events) {
      if (e.TypeLocalized?.[0]?.Description === "Goal!") {
        // If we find a goal, the team that scored when HomeGoals=1 and AwayGoals=0 is home
        if (e.HomeGoals === 1 && e.AwayGoals === 0) {
          homeTeamId = e.IdTeam;
        } else if (e.HomeGoals === 0 && e.AwayGoals === 1) {
          awayTeamId = e.IdTeam;
        }
        if (homeTeamId && awayTeamId) break;
      }
    }
    
    // If no goals found, use order of appearance
    if (!homeTeamId || !awayTeamId) {
      const teamIds = new Set();
      for (const e of events) {
        if (e.IdTeam) teamIds.add(e.IdTeam);
      }
      const teamIdArray = Array.from(teamIds);
      if (!homeTeamId) homeTeamId = teamIdArray[0];
      if (!awayTeamId) awayTeamId = teamIdArray[1];
    }
    
    if (eventTeamId === homeTeamId) return { name: match.homeTeam, id: "home" };
    if (eventTeamId === awayTeamId) return { name: match.awayTeam, id: "away" };
    return null;
  };

  // Parse events
  const parsedEvents = events
    .filter((e) => categorizeEvent(e) !== null)
    .map((e) => ({
      ...e,
      minute: parseMinute(e.MatchMinute),
      category: categorizeEvent(e),
      team: getTeamInfo(e.IdTeam),
    }))
    .sort((a, b) => a.minute - b.minute);

  // Identify delay/resume segments
  const delaySegments = [];
  let delayStart = null;
  for (const event of events) {
    const desc = event.TypeLocalized?.[0]?.Description || "";
    if (desc === "Delay") {
      delayStart = parseMinute(event.MatchMinute);
    } else if (desc === "Resume" && delayStart !== null) {
      delaySegments.push({ start: delayStart, end: parseMinute(event.MatchMinute) });
      delayStart = null;
    }
  }

  // Determine max minute - cap at 120 for standard matches + extra time
  const eventMinutes = parsedEvents.map((e) => e.minute).filter((m) => m <= 200);
  const maxEventMinute = eventMinutes.length > 0 ? Math.max(...eventMinutes) : 90;
  const maxMinute = Math.min(Math.max(maxEventMinute + 5, 95), 120);

  // SVG dimensions
  const width = 800;
  const height = 200;
  const marginTop = 20;
  const marginBottom = 40;
  const marginLeft = 40;
  const marginRight = 40;

  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;

  // Scale
  const xScale = d3.scaleLinear().domain([0, maxMinute]).range([0, chartWidth]);

  // Create SVG
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("font-family", "Inter, sans-serif");

  // Add background
  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "var(--bg-raised)")
    .attr("rx", 4);

  // Clip path for chart - allow line to start from 0
  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", 0)
    .attr("y", marginTop)
    .attr("width", width)
    .attr("height", chartHeight);

  // Create chart group - don't translate x, only y
  const chart = svg
    .append("g")
    .attr("transform", `translate(${marginLeft},${marginTop})`)
    .attr("clip-path", "url(#clip)");

  // Draw delay segments (background)
  chart
    .selectAll(".delay-segment")
    .data(delaySegments)
    .enter()
    .append("rect")
    .attr("class", "delay-segment")
    .attr("x", (d) => xScale(d.start))
    .attr("width", (d) => xScale(d.end) - xScale(d.start))
    .attr("height", chartHeight)
    .attr("fill", "var(--border-subtle)")
    .attr("opacity", 0.3);

  // Draw timeline baseline
  chart
    .append("line")
    .attr("x1", 0)
    .attr("x2", chartWidth)
    .attr("y1", chartHeight / 2)
    .attr("y2", chartHeight / 2)
    .attr("stroke", "var(--border)")
    .attr("stroke-width", 2);

  // Draw events
  chart
    .selectAll(".event-marker")
    .data(parsedEvents)
    .enter()
    .append("circle")
    .attr("class", "event-marker")
    .attr("cx", (d) => xScale(d.minute))
    .attr("cy", chartHeight / 2) // All events on same y-axis
    .attr("r", 5)
    .attr("fill", (d) => {
      // Fill color = event type
      const config = eventCategories[d.category];
      return config.color;
    })
    .attr("stroke", (d) => {
      // Stroke color = team (home=green, away=orange)
      return d.team?.id === "away" ? "#f97316" : "#10b981";
    })
    .attr("stroke-width", 3)
    .attr("opacity", 0.8)
    .on("mouseover", function (event, d) {
      d3.select(this)
        .attr("r", 7)
        .attr("opacity", 1);
      // Show tooltip
      const tooltip = document.createElement("div");
      tooltip.className = "timeline-tooltip";
      tooltip.textContent = `${d.MatchMinute} - ${d.TypeLocalized?.[0]?.Description || "Event"}`;
      tooltip.style.cssText = `
        position: absolute;
        background: var(--bg-surface);
        color: var(--text-primary);
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 0.75rem;
        border: 1px solid var(--border);
        pointer-events: none;
        z-index: 1000;
      `;
      document.body.appendChild(tooltip);
      setTimeout(() => tooltip.remove(), 2000);
    })
    .on("mouseout", function () {
      d3.select(this).attr("r", 5).attr("opacity", 0.8);
    });

  // Draw minute markers on x-axis
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(d3.range(0, maxMinute + 1, 15))
    .tickFormat((d) => (d === 0 ? "0'" : d + "'"));

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},${marginTop + chartHeight})`)
    .call(xAxis)
    .style("font-size", "11px")
    .style("color", "var(--text-secondary)")
    .selectAll("text")
    .style("fill", "var(--text-secondary)");

  // Add y-axis label
  svg
    .append("text")
    .attr("x", 15)
    .attr("y", marginTop + chartHeight / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("transform", `rotate(-90, 15, ${marginTop + chartHeight / 2})`)
    .style("font-size", "11px")
    .style("fill", "var(--text-secondary)")
    .text("Events");

  // Create wrapper container
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "width: 100%;";

  // Create legend
  const legendContainer = document.createElement("div");
  legendContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;
    align-items: center;
    font-size: 0.85rem;
  `;

  const teamLegend = document.createElement("div");
  teamLegend.style.cssText = `
    display: flex;
    gap: 20px;
    align-items: center;
  `;

  // Home team legend
  const homeLegend = document.createElement("div");
  homeLegend.style.cssText = "display: flex; gap: 8px; align-items: center;";
  const homeCircle = document.createElement("div");
  // Draw a circle with green border to show home team
  homeCircle.style.cssText = "width: 12px; height: 12px; border-radius: 50%; background: transparent; border: 2px solid #10b981;";
  const homeLabel = document.createElement("span");
  homeLabel.textContent = `${match.homeTeam} (green outline)`;
  homeLabel.style.color = "var(--text-secondary)";
  homeLegend.appendChild(homeCircle);
  homeLegend.appendChild(homeLabel);

  // Away team legend
  const awayLegend = document.createElement("div");
  awayLegend.style.cssText = "display: flex; gap: 8px; align-items: center;";
  const awayCircle = document.createElement("div");
  // Draw a circle with orange border to show away team
  awayCircle.style.cssText = "width: 12px; height: 12px; border-radius: 50%; background: transparent; border: 2px solid #f97316;";
  const awayLabel = document.createElement("span");
  awayLabel.textContent = `${match.awayTeam} (orange outline)`;
  awayLabel.style.color = "var(--text-secondary)";
  awayLegend.appendChild(awayCircle);
  awayLegend.appendChild(awayLabel);

  teamLegend.appendChild(homeLegend);
  teamLegend.appendChild(awayLegend);

  legendContainer.appendChild(teamLegend);

  // Add legend section explaining color scheme
  const schemeNote = document.createElement("div");
  schemeNote.style.cssText = `
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 8px;
    font-style: italic;
  `;
  schemeNote.textContent = "Marker color = event type • Outline color = team";
  legendContainer.appendChild(schemeNote);
  
  // Add some space
  const spacer = document.createElement("div");
  spacer.style.width = "100%";
  legendContainer.appendChild(spacer);
  
  // Create toggle buttons inside legend container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  `;

  const label = document.createElement("span");
  label.textContent = "Event Types:";
  label.style.cssText = `
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
  `;
  buttonsContainer.appendChild(label);

  const visibleCategories = new Set(
    Object.keys(eventCategories).filter((cat) => cat !== "foul")
  );
  const buttons = {};

  for (const [cat, config] of Object.entries(eventCategories)) {
    const button = document.createElement("button");
    button.textContent = config.label;
    button.style.cssText = `
      padding: 6px 12px;
      border: 1px solid ${config.color};
      background: transparent;
      color: ${config.color};
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: Inter, sans-serif;
    `;

    button.addEventListener("click", () => {
      if (visibleCategories.has(cat)) {
        visibleCategories.delete(cat);
        button.style.opacity = "0.5";
      } else {
        visibleCategories.add(cat);
        button.style.opacity = "1";
      }

      // Update marker visibility
      svg
        .selectAll(".event-marker")
        .transition()
        .duration(200)
        .attr("opacity", (d) => (visibleCategories.has(d.category) ? 0.8 : 0));
    });

    // Set initial opacity for disabled button (fouls)
    if (cat === "foul") {
      button.style.opacity = "0.5";
    }

    buttons[cat] = button;
    buttonsContainer.appendChild(button);
  }

  legendContainer.appendChild(buttonsContainer);
  wrapper.appendChild(legendContainer);
  wrapper.appendChild(svg.node());

  return wrapper;
}
