export function matchTimelineChart(match, events, d3, html) {
  // Parse match minutes from string format ("45'" -> 45)
  const parseMinute = (minute) => {
    const num = parseInt(minute.replace(/[^0-9]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Categorize events
  const eventCategories = {
    goal: { label: "Goals", types: [0], color: "#e8394b" },
    yellowCard: { label: "Yellow Cards", types: [24], color: "#f4b644" },
    redCard: { label: "Red Cards", types: [25], color: "#e8394b" },
    substitution: { label: "Substitutions", types: [19, 20, 21], color: "#4fb3e8" },
    foul: { label: "Fouls", types: [18], color: "#7d95b0" },
    corner: { label: "Corners", types: [16], color: "#2bb56a" },
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
    // Map based on the events we see - first team is home, second is away
    const teamIds = new Set();
    for (const e of events) {
      if (e.IdTeam) teamIds.add(e.IdTeam);
    }
    const teamIdArray = Array.from(teamIds);
    if (eventTeamId === teamIdArray[0]) return { name: match.homeTeam, id: "home" };
    if (eventTeamId === teamIdArray[1]) return { name: match.awayTeam, id: "away" };
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
    .attr("cy", (d, i) => {
      // Stagger markers vertically to avoid overlap
      return chartHeight / 2 - 30 + ((i % 4) * 15);
    })
    .attr("r", 5)
    .attr("fill", (d) => {
      const config = eventCategories[d.category];
      if (d.team?.id === "away") {
        // Lighter shade for away team
        return d3.color(config.color).brighter(0.5).hex();
      }
      return config.color;
    })
    .attr("stroke", "var(--bg-raised)")
    .attr("stroke-width", 2)
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
  homeCircle.style.cssText =
    "width: 12px; height: 12px; border-radius: 50%; background: var(--accent);";
  const homeLabel = document.createElement("span");
  homeLabel.textContent = `${match.homeTeam} (darker)`;
  homeLabel.style.color = "var(--text-secondary)";
  homeLegend.appendChild(homeCircle);
  homeLegend.appendChild(homeLabel);

  // Away team legend
  const awayLegend = document.createElement("div");
  awayLegend.style.cssText = "display: flex; gap: 8px; align-items: center;";
  const awayCircle = document.createElement("div");
  awayCircle.style.cssText =
    "width: 12px; height: 12px; border-radius: 50%; background: " +
    d3.color("#e8394b").brighter(0.5).hex() +
    ";";
  const awayLabel = document.createElement("span");
  awayLabel.textContent = `${match.awayTeam} (lighter)`;
  awayLabel.style.color = "var(--text-secondary)";
  awayLegend.appendChild(awayCircle);
  awayLegend.appendChild(awayLabel);

  teamLegend.appendChild(homeLegend);
  teamLegend.appendChild(awayLegend);

  legendContainer.appendChild(teamLegend);
  
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

  const visibleCategories = new Set(Object.keys(eventCategories));
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

    buttons[cat] = button;
    buttonsContainer.appendChild(button);
  }

  legendContainer.appendChild(buttonsContainer);
  wrapper.appendChild(legendContainer);
  wrapper.appendChild(svg.node());

  return wrapper;
}
