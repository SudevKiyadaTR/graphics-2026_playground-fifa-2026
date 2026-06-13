export function matchTimelineChart(match, events, d3, html) {
  const parseMinute = (minute) => {
    const num = parseInt(minute.replace(/[^0-9]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const eventCategories = {
    goal: { label: "Goals", types: [0], color: "#e8394b" },
    yellowCard: { label: "Yellow Cards", types: [2], color: "#f4b644" },
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
  const height = 280;
  const marginTop = 20;
  const marginBottom = 60;
  const marginLeft = 40;
  const marginRight = 40;
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;

  const xScale = d3.scaleLinear().domain([0, maxMinute]).range([0, chartWidth]);

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    background: var(--bg-raised);
    border-radius: 6px;
    padding: 16px;
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

  const visibleCategories = new Set(
    Object.keys(eventCategories).filter((cat) => cat !== "foul")
  );

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
      ${cat === "foul" ? "opacity: 0.5;" : ""}
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
      svg.selectAll(".event-marker").attr("opacity", (d) => 
        visibleCategories.has(d.category) ? 1 : 0
      );
      svg.selectAll(".goal-label").attr("opacity", (d) =>
        visibleCategories.has(d.category) ? 1 : 0
      );
      svg.selectAll(".goal-icon").attr("opacity", (d) =>
        visibleCategories.has(d.category) ? 1 : 0
      );
    });

    buttonsContainer.appendChild(button);
  }

  wrapper.appendChild(buttonsContainer);

  // SVG
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "var(--bg-surface)")
    .style("border-radius", "4px");

  const chart = svg
    .append("g")
    .attr("transform", `translate(${marginLeft},${marginTop})`);

  // Timeline baseline
  chart
    .append("line")
    .attr("x1", 0)
    .attr("x2", chartWidth)
    .attr("y1", chartHeight / 2)
    .attr("y2", chartHeight / 2)
    .attr("stroke", "var(--border)")
    .attr("stroke-width", 2);

  // Goals - with football icon and labels
  const goals = parsedEvents.filter((e) => e.category === "goal");
  
  for (const goal of goals) {
    const x = xScale(goal.minute);
    const y = chartHeight / 2;

    // Football icon (⚽)
    chart
      .append("text")
      .attr("class", "goal-icon")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "16px")
      .attr("opacity", visibleCategories.has("goal") ? 1 : 0)
      .text("⚽");

    // Label: "Team @ 45'"
    chart
      .append("text")
      .attr("class", "goal-label")
      .attr("x", x)
      .attr("y", y - 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "var(--text-primary)")
      .attr("opacity", visibleCategories.has("goal") ? 1 : 0)
      .style("pointer-events", "none")
      .text(`${goal.teamName} ${goal.MatchMinute}`);
  }

  // Other markers - simple dots with tooltips
  const otherEvents = parsedEvents.filter((e) => e.category !== "goal");
  
  const markers = chart
    .selectAll(".event-marker")
    .data(otherEvents)
    .enter()
    .append("circle")
    .attr("class", "event-marker")
    .attr("cx", (d) => xScale(d.minute))
    .attr("cy", chartHeight / 2)
    .attr("r", 5)
    .attr("fill", (d) => eventCategories[d.category].color)
    .attr("opacity", (d) => (visibleCategories.has(d.category) ? 1 : 0))
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(200).attr("r", 7);

      const tooltip = document.createElement("div");
      const eventDesc = d.TypeLocalized?.[0]?.Description || d.category;
      tooltip.style.cssText = `
        position: fixed;
        background: var(--bg-raised);
        color: var(--text-primary);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
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
      d3.select(this).transition().duration(200).attr("r", 5);
    });

  // X-axis with minute labels
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

  svg
    .append("text")
    .attr("x", marginLeft + chartWidth / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "11px")
    .attr("fill", "var(--text-muted)")
    .text("Match Minutes");

  wrapper.appendChild(svg.node());

  return wrapper;
}
