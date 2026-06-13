export function matchTimelineChart(match, events, d3) {
  const parseMinute = (minute) => {
    // Handle formats like "45'", "45'+5'"
    const match = minute.match(/(\d+)'(?:\+(\d+)')?/);
    if (!match) return 0;
    const base = parseInt(match[1]);
    const stoppage = match[2] ? parseInt(match[2]) : 0;
    return base + stoppage;
  };

  const eventCategories = {
    goal: { label: "Goals", types: [0], color: "#2bb56a" },
    yellowCard: { label: "Yellow Cards", types: [2], color: "#f0c040" },
    redCard: { label: "Red Cards", types: [3], color: "#e8394b" },
    substitution: { label: "Substitutions", types: [5], color: "#4fb3e8" },
    foul: { label: "Fouls", types: [18], color: "#7d95b0" },
  };

  const categorizeEvent = (event) => {
    for (const [cat, config] of Object.entries(eventCategories)) {
      if (config.types.includes(event.Type)) {
        return cat;
      }
    }
    return null;
  };

  const getTeamInfo = (eventTeamId) => {
    if (!eventTeamId) return null;
    let homeTeamId = null;
    let awayTeamId = null;

    for (const e of events) {
      if (e.TypeLocalized?.[0]?.Description === "Goal!") {
        if (e.HomeGoals === 1 && e.AwayGoals === 0) {
          homeTeamId = e.IdTeam;
        } else if (e.HomeGoals === 0 && e.AwayGoals === 1) {
          awayTeamId = e.IdTeam;
        }
        if (homeTeamId && awayTeamId) break;
      }
    }

    if (!homeTeamId || !awayTeamId) {
      const teamIds = new Set();
      for (const e of events) {
        if (e.IdTeam) teamIds.add(e.IdTeam);
      }
      const teamIdArray = Array.from(teamIds);
      if (!homeTeamId) homeTeamId = teamIdArray[0];
      if (!awayTeamId) awayTeamId = teamIdArray[1];
    }

    if (eventTeamId === homeTeamId) return match.homeTeam;
    if (eventTeamId === awayTeamId) return match.awayTeam;
    return null;
  };

  const parsedEvents = events
    .filter((e) => categorizeEvent(e) !== null)
    .map((e) => ({
      ...e,
      minute: parseMinute(e.MatchMinute),
      category: categorizeEvent(e),
      teamName: getTeamInfo(e.IdTeam),
    }))
    .sort((a, b) => a.minute - b.minute);

  const eventMinutes = parsedEvents.map((e) => e.minute).filter((m) => m <= 200);
  const maxEventMinute = eventMinutes.length > 0 ? Math.max(...eventMinutes) : 90;
  const maxMinute = Math.min(Math.max(maxEventMinute + 5, 95), 120);

  const width = 800;
  const timelineHeight = 63;
  const axisHeight = 50;
  const marginLeft = 40;
  const marginRight = 40;
  const marginTop = 0;
  const marginAxisTop = 8;
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = timelineHeight;

  const xScale = d3.scaleLinear().domain([0, maxMinute]).range([0, chartWidth]);

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;

  // Event type buttons
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
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

  const visibleCategories = new Set(Object.keys(eventCategories).filter((cat) => cat !== "foul"));

  for (const [cat, config] of Object.entries(eventCategories)) {
    const button = document.createElement("button");
    button.textContent = config.label;
    button.style.cssText = `
      padding: 6px 12px;
      border: 1.5px solid ${config.color};
      background: transparent;
      color: ${config.color};
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      font-family: Inter, sans-serif;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.2s ease;
      ${cat === "foul" ? "opacity: 0.4;" : ""}
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
        .attr("opacity", (d) => (visibleCategories.has(d.category) ? 1 : 0));
      svg
        .selectAll(".event-connector")
        .attr("opacity", (d) => (visibleCategories.has(d.category) ? 0.4 : 0));
      svg.selectAll(".goal-icon").attr("opacity", visibleCategories.has("goal") ? 1 : 0);
      svg.selectAll(".goal-connector").attr("opacity", visibleCategories.has("goal") ? 0.4 : 0);
      svg.selectAll(".goal-label").attr("opacity", visibleCategories.has("goal") ? 1 : 0);
    });

    buttonsContainer.appendChild(button);
  }

  wrapper.appendChild(buttonsContainer);

  // Timeline SVG
  const svg = d3
    .create("svg")
    .attr("width", "100%")
    .attr("height", timelineHeight)
    .attr("viewBox", `0 0 ${width} ${timelineHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("background", "transparent");

  const chart = svg.append("g").attr("transform", `translate(${marginLeft},${marginTop})`);

  // Timeline baseline segments (with opacity changes for delayed periods)
  const delayedEvents = events
    .filter((e) => e.TypeLocalized?.[0]?.Description === "Delay")
    .map((e) => ({ minute: parseMinute(e.MatchMinute) }));
  const resumeEvents = events
    .filter((e) => e.TypeLocalized?.[0]?.Description === "Resume")
    .map((e) => ({ minute: parseMinute(e.MatchMinute) }));

  const segments = [];
  let currentStart = 0;

  for (let i = 0; i < Math.max(delayedEvents.length, resumeEvents.length); i++) {
    const delayedEvent = delayedEvents[i];
    const resumeEvent = resumeEvents[i];

    if (delayedEvent) {
      const delayedX = xScale(delayedEvent.minute);
      segments.push({ start: currentStart, end: delayedX, opacity: 1 });

      if (resumeEvent) {
        const resumeX = xScale(resumeEvent.minute);
        segments.push({ start: delayedX, end: resumeX, opacity: 0 });
        currentStart = resumeX;
      } else {
        currentStart = delayedX;
      }
    }
  }

  segments.push({ start: currentStart, end: chartWidth, opacity: 1 });

  for (const segment of segments) {
    if (segment.end > segment.start) {
      chart
        .append("line")
        .attr("x1", segment.start)
        .attr("x2", segment.end)
        .attr("y1", chartHeight / 2)
        .attr("y2", chartHeight / 2)
        .attr("stroke", "var(--border)")
        .attr("stroke-width", 2)
        .attr("opacity", segment.opacity);
    }
  }

  // Goals - with football emoji marker and labels
  const goals = parsedEvents.filter((e) => e.category === "goal");
  const goalMarkerY = 13;

  for (const goal of goals) {
    const x = xScale(goal.minute);

    // Connector line from goal marker to baseline
    chart
      .append("line")
      .attr("class", "goal-connector")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", goalMarkerY)
      .attr("y2", chartHeight / 2)
      .attr("stroke", eventCategories.goal.color)
      .attr("stroke-width", 1)
      .attr("opacity", visibleCategories.has("goal") ? 0.4 : 0)
      .style("pointer-events", "none");

    // Football emoji marker
    chart
      .append("text")
      .attr("class", "goal-icon")
      .attr("x", x)
      .attr("y", goalMarkerY)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "18px")
      .attr("opacity", visibleCategories.has("goal") ? 1 : 0)
      .style("pointer-events", "none")
      .text("⚽");

    // Label: "Team @ 45'"
    chart
      .append("text")
      .attr("class", "goal-label")
      .attr("x", x)
      .attr("y", goalMarkerY - 18)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-family", "'DM Mono', monospace")
      .attr("font-variant-numeric", "tabular-nums")
      .attr("fill", "var(--text-primary)")
      .attr("opacity", visibleCategories.has("goal") ? 1 : 0)
      .style("pointer-events", "none")
      .text(`${goal.teamName} ${goal.MatchMinute}`);
  }

  // Other markers - simple dots with tooltips
  const otherEvents = parsedEvents.filter((e) => e.category !== "goal");
  const markerY = 28;

  // Connector lines from markers to baseline
  chart
    .selectAll(".event-connector")
    .data(otherEvents)
    .enter()
    .append("line")
    .attr("class", "event-connector")
    .attr("x1", (d) => xScale(d.minute))
    .attr("x2", (d) => xScale(d.minute))
    .attr("y1", markerY)
    .attr("y2", chartHeight / 2)
    .attr("stroke", (d) => eventCategories[d.category].color)
    .attr("stroke-width", 1)
    .attr("opacity", (d) => (visibleCategories.has(d.category) ? 0.4 : 0))
    .style("pointer-events", "none");

  chart
    .selectAll(".event-marker")
    .data(otherEvents)
    .enter()
    .append("circle")
    .attr("class", "event-marker")
    .attr("cx", (d) => xScale(d.minute))
    .attr("cy", markerY)
    .attr("r", 4)
    .attr("fill", (d) => eventCategories[d.category].color)
    .attr("opacity", (d) => (visibleCategories.has(d.category) ? 1 : 0))
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(150).attr("r", 6);

      const tooltip = document.createElement("div");
      const eventDesc = d.TypeLocalized?.[0]?.Description || d.category;
      tooltip.style.cssText = `
        position: fixed;
        background: var(--bg-raised);
        color: var(--text-primary);
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-family: "DM Mono", monospace;
        z-index: 1000;
        white-space: nowrap;
        border: 1px solid var(--border);
        left: ${event.pageX + 10}px;
        top: ${event.pageY + 10}px;
      `;
      tooltip.textContent = `${d.teamName} • ${eventDesc} @ ${d.MatchMinute}`;
      document.body.appendChild(tooltip);

      setTimeout(() => tooltip.remove(), 2000);
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(150).attr("r", 4);
    });

  wrapper.appendChild(svg.node());

  // Axis SVG
  const axisSvg = d3
    .create("svg")
    .attr("width", "100%")
    .attr("height", axisHeight)
    .attr("viewBox", `0 0 ${width} ${axisHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("background", "transparent");

  // X-axis with minute labels
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(d3.range(0, maxMinute + 1, 15))
    .tickFormat((d) => (d === 0 ? "0" : d))
    .tickSize(6)
    .tickPadding(8);

  const axisGroup = axisSvg
    .append("g")
    .attr("transform", `translate(${marginLeft},${marginAxisTop})`)
    .call(xAxis);

  axisGroup
    .selectAll("text")
    .style("font-family", "'DM Mono', monospace")
    .style("font-size", "11px")
    .style("font-variant-numeric", "tabular-nums")
    .style("fill", "var(--text-secondary)")
    .attr("dy", "0.5em");

  axisGroup.selectAll("line").style("stroke", "var(--border-subtle)").style("stroke-width", "1");

  axisGroup.selectAll("path").style("stroke", "none");

  axisSvg
    .append("text")
    .attr("x", marginLeft + chartWidth / 2)
    .attr("y", axisHeight - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-family", "Inter, sans-serif")
    .attr("font-weight", "500")
    .attr("letter-spacing", "0.05em")
    .attr("text-transform", "uppercase")
    .attr("fill", "var(--text-muted)")
    .text("MATCH MINUTES");

  wrapper.appendChild(axisSvg.node());

  return wrapper;
}
