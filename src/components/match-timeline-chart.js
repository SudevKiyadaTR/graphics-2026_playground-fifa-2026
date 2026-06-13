import { computePosition, flip, shift, offset } from "@floating-ui/dom";

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

  // Map team IDs to team names by analyzing the first few events
  const teamIdMap = new Map();
  for (const e of events) {
    if (e.IdTeam && e.EventDescription) {
      const desc = e.EventDescription[0]?.Description || "";
      const teamMatch = desc.match(/\(([^)]+)\)/);
      if (teamMatch) {
        const potentialTeamName = teamMatch[1];
        if (potentialTeamName === match.homeTeam || potentialTeamName === match.awayTeam) {
          teamIdMap.set(e.IdTeam, potentialTeamName);
        }
      }
    }
  }

  const getTeamInfo = (eventTeamId, eventDescription) => {
    if (!eventTeamId) return null;

    // First, try to extract team name from event description
    // Handles: "PLAYER (Czechia) commits a foul" and "PLAYER (in) ... (Korea Republic)"
    if (eventDescription) {
      // Find all parentheses content and check each one
      const matches = eventDescription.match(/\(([^)]+)\)/g);
      if (matches) {
        // Check from end to start to find team name
        for (let i = matches.length - 1; i >= 0; i--) {
          const content = matches[i].slice(1, -1); // remove parentheses
          if (content === match.homeTeam || content === match.awayTeam) {
            return content;
          }
        }
      }
    }

    // Second, try to use the team ID map we built
    if (teamIdMap.has(eventTeamId)) {
      return teamIdMap.get(eventTeamId);
    }

    // Fallback: try to map team IDs by looking at goal events
    let homeTeamId = null;
    let awayTeamId = null;

    for (const e of events) {
      if (e.TypeLocalized?.[0]?.Description === "Goal!" && e.IdTeam) {
        // Map by comparing HomeGoals and AwayGoals changes
        const prevGoalIndex = events.indexOf(e) - 1;
        let prevHome = 0;
        let prevAway = 0;

        if (prevGoalIndex >= 0) {
          const prevEvent = events[prevGoalIndex];
          if (prevEvent.HomeGoals !== undefined) {
            prevHome = prevEvent.HomeGoals - (e.HomeGoals > prevEvent.HomeGoals ? 1 : 0);
            prevAway = prevEvent.AwayGoals - (e.AwayGoals > prevEvent.AwayGoals ? 1 : 0);
          }
        }

        if (e.HomeGoals > prevHome && e.AwayGoals === prevAway) {
          homeTeamId = e.IdTeam;
        } else if (e.AwayGoals > prevAway && e.HomeGoals === prevHome) {
          awayTeamId = e.IdTeam;
        }

        if (homeTeamId && awayTeamId) break;
      }
    }

    // Last resort: use unique team IDs from events
    if (!homeTeamId || !awayTeamId) {
      const teamIds = new Set();
      for (const e of events) {
        if (e.IdTeam) teamIds.add(e.IdTeam);
      }
      const teamIdArray = Array.from(teamIds).sort();
      if (!homeTeamId && teamIdArray[0]) homeTeamId = teamIdArray[0];
      if (!awayTeamId && teamIdArray[1]) awayTeamId = teamIdArray[1];
    }

    if (eventTeamId === homeTeamId) return match.homeTeam;
    if (eventTeamId === awayTeamId) return match.awayTeam;
    return null;
  };

  const parsedEvents = events
    .filter((e) => categorizeEvent(e) !== null)
    .map((e) => {
      const eventDesc = e.EventDescription?.[0]?.Description || "";
      return {
        ...e,
        minute: parseMinute(e.MatchMinute),
        category: categorizeEvent(e),
        eventDescription: eventDesc,
        teamName: getTeamInfo(e.IdTeam, eventDesc),
      };
    })
    .sort((a, b) => a.minute - b.minute);

  const eventMinutes = parsedEvents.map((e) => e.minute).filter((m) => m <= 200);
  const maxEventMinute = eventMinutes.length > 0 ? Math.max(...eventMinutes) : 90;
  const maxMinute = Math.min(Math.max(maxEventMinute + 5, 95), 120);

  // Helper to convert minute to percentage
  const minuteToPercent = (minute) => (minute / maxMinute) * 100;

  const timelineHeight = 63;
  const axisHeight = 35;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 0;
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
    button.style.cssText = `
      padding: 6px 12px;
      border: 1.5px solid var(--border-subtle);
      background: transparent;
      color: var(--text-secondary);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      font-family: Inter, sans-serif;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      ${cat === "foul" ? "opacity: 0.4;" : ""}
    `;

    // Create marker element
    const markerSpan = document.createElement("span");
    if (cat === "goal") {
      markerSpan.textContent = "⚽";
      markerSpan.style.fontSize = "1.1em";
    } else {
      markerSpan.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: ${config.color};
        display: inline-block;
      `;
    }

    const labelSpan = document.createElement("span");
    labelSpan.textContent = config.label;

    button.appendChild(markerSpan);
    button.appendChild(labelSpan);

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

  // Combined Timeline + Axis SVG - percentage-based
  const totalHeight = timelineHeight + axisHeight;
  const svg = d3
    .create("svg")
    .attr("width", "100%")
    .attr("height", totalHeight)
    .style("background", "transparent")
    .style("margin", "0")
    .style("padding", "24px 0 0 0")
    .style("display", "block")
    .style("overflow", "visible");

  // X-axis with minute labels - percentage-based (create FIRST so it renders underneath)
  const axisGroup = svg.append("g").attr("transform", `translate(0,${timelineHeight - 30})`);

  // Generate tick values every 15 minutes
  const tickValues = d3.range(0, maxMinute + 1, 15);

  // Draw tick marks and labels
  for (const tickValue of tickValues) {
    const xPercent = minuteToPercent(tickValue);

    // Tick line connecting to timeline
    axisGroup
      .append("line")
      .attr("x1", `${xPercent}%`)
      .attr("x2", `${xPercent}%`)
      .attr("y1", -2)
      .attr("y2", 6)
      .attr("stroke", "var(--border)")
      .attr("stroke-width", 2)
      .style("vector-effect", "non-scaling-stroke");

    // Tick label
    axisGroup
      .append("text")
      .attr("x", `${xPercent}%`)
      .attr("y", 22)
      .attr("text-anchor", "middle")
      .style("font-family", "'DM Mono', monospace")
      .style("font-size", "11px")
      .style("font-variant-numeric", "tabular-nums")
      .style("fill", "var(--text-secondary)")
      .text(tickValue === 0 ? "0" : tickValue);
  }

  // Add tick mark for match duration
  const endPercent = minuteToPercent(maxMinute);
  axisGroup
    .append("line")
    .attr("x1", `${endPercent}%`)
    .attr("x2", `${endPercent}%`)
    .attr("y1", -2)
    .attr("y2", 6)
    .attr("stroke", "var(--border)")
    .attr("stroke-width", 2)
    .style("vector-effect", "non-scaling-stroke");

  // Add match duration label
  axisGroup
    .append("text")
    .attr("x", `${endPercent}%`)
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .style("font-family", "'DM Mono', monospace")
    .style("font-size", "11px")
    .style("font-variant-numeric", "tabular-nums")
    .style("fill", "var(--text-secondary)")
    .text(`${maxMinute}'`);

  // "MATCH MINUTES" label
  svg
    .append("text")
    .attr("x", "50%")
    .attr("y", totalHeight - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-family", "Inter, sans-serif")
    .attr("font-weight", "500")
    .attr("letter-spacing", "0.05em")
    .attr("text-transform", "uppercase")
    .attr("fill", "var(--text-muted)")
    .text("MATCH MINUTES");

  // Draw baseline segments spanning full width (0% to 100%)
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
      const delayedPercent = minuteToPercent(delayedEvent.minute);
      segments.push({ start: currentStart, end: delayedPercent, opacity: 1 });

      if (resumeEvent) {
        const resumePercent = minuteToPercent(resumeEvent.minute);
        segments.push({ start: delayedPercent, end: resumePercent, opacity: 0 });
        currentStart = resumePercent;
      } else {
        currentStart = delayedPercent;
      }
    }
  }

  segments.push({ start: currentStart, end: 100, opacity: 1 });

  // Draw baseline segments with percentage coordinates
  for (const segment of segments) {
    if (segment.end > segment.start) {
      svg
        .append("line")
        .attr("x1", `${segment.start}%`)
        .attr("x2", `${segment.end}%`)
        .attr("y1", timelineHeight / 2)
        .attr("y2", timelineHeight / 2)
        .attr("stroke", "var(--border)")
        .attr("stroke-width", 2)
        .attr("opacity", segment.opacity)
        .style("vector-effect", "non-scaling-stroke");
    }
  }

  const chart = svg.append("g");

  // Goals - with football emoji marker and labels
  const goals = parsedEvents.filter((e) => e.category === "goal");
  const goalMarkerY = 5;

  for (const goal of goals) {
    const xPercent = minuteToPercent(goal.minute);

    // Connector line from goal marker to baseline
    chart
      .append("line")
      .attr("class", "goal-connector")
      .attr("x1", `${xPercent}%`)
      .attr("x2", `${xPercent}%`)
      .attr("y1", goalMarkerY)
      .attr("y2", timelineHeight / 2)
      .attr("stroke", "var(--border)")
      .attr("stroke-width", 2)
      .attr("opacity", visibleCategories.has("goal") ? 1 : 0)
      .style("vector-effect", "non-scaling-stroke")
      .style("pointer-events", "none");

    // Football emoji marker with tooltip support
    chart
      .append("text")
      .attr("class", "goal-icon")
      .attr("x", `${xPercent}%`)
      .attr("y", goalMarkerY)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "18px")
      .attr("opacity", visibleCategories.has("goal") ? 1 : 0)
      .style("pointer-events", visibleCategories.has("goal") ? "auto" : "none")
      .style("cursor", "pointer")
      .style("z-index", "100")
      .on("mouseover", function () {
        // Show tooltip for goal
        if (!visibleCategories.has("goal")) {
          return;
        }

        try {
          // Create structured tooltip
          const tooltip = document.createElement("div");
          tooltip.style.cssText = `
            position: fixed;
            background: var(--bg-raised);
            color: var(--text-primary);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 12px;
            font-family: "Inter", sans-serif;
            z-index: 1000;
            pointer-events: none;
            min-width: 220px;
            max-width: 32ch;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          `;

          // Time header
          const timeHeader = document.createElement("div");
          timeHeader.style.cssText = `
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--border-subtle);
            font-variant-numeric: tabular-nums;
          `;
          timeHeader.textContent = goal.MatchMinute;
          tooltip.appendChild(timeHeader);

          // Team label
          const teamLabel = document.createElement("div");
          teamLabel.style.cssText = `
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
            margin-top: 4px;
            margin-bottom: 4px;
          `;
          teamLabel.textContent = goal.teamName || "Unknown Team";
          tooltip.appendChild(teamLabel);

          // Goal description
          const goalDesc = document.createElement("div");
          goalDesc.style.cssText = `
            font-size: 0.8rem;
            line-height: 1.4;
            color: var(--text-primary);
            padding-left: 12px;
            border-left: 2px solid ${eventCategories.goal.color};
          `;
          goalDesc.textContent = goal.eventDescription || eventCategories.goal.label || "Goal";
          tooltip.appendChild(goalDesc);

          // Add to DOM first so it can be measured for positioning
          document.body.appendChild(tooltip);

          // Track if this tooltip is still active (not removed by mouseout)
          tooltip.__isActive = true;

          // Use floating-ui for intelligent positioning
          const referenceElement = this; // The text element
          computePosition(referenceElement, tooltip, {
            placement: "right",
            middleware: [
              offset(10), // 10px offset from the marker
              flip(), // Flip to opposite side if near viewport edge
              shift({ padding: 8 }), // Shift if viewport collision, with 8px padding
            ],
          }).then(({ x, y }) => {
            // Only apply positioning if tooltip is still active
            if (tooltip.__isActive && tooltip.parentNode) {
              Object.assign(tooltip.style, {
                left: `${x}px`,
                top: `${y}px`,
              });
            }
          });

          // Store tooltip on the element for cleanup on mouseout
          d3.select(this).node().__tooltip = tooltip;
        } catch (err) {
          console.error("Error showing goal tooltip:", err);
        }
      })
      .on("mouseout", function () {
        if (this.__tooltip) {
          this.__tooltip.__isActive = false;
          if (this.__tooltip.parentNode) {
            this.__tooltip.remove();
          }
          delete this.__tooltip;
        }
      })
      .text("⚽");

    // Label: "Team @ 45'"
    chart
      .append("text")
      .attr("class", "goal-label")
      .attr("x", `${xPercent}%`)
      .attr("y", goalMarkerY - 18)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-family", "'DM Mono', monospace")
      .attr("font-variant-numeric", "tabular-nums")
      .attr("fill", "var(--text-primary)")
      .attr("opacity", visibleCategories.has("goal") ? 1 : 0)
      .style("pointer-events", "none")
      .style("z-index", "100")
      .text(`${goal.teamName} ${goal.MatchMinute}`);
  }

  // Other markers - simple dots with tooltips
  const otherEvents = parsedEvents.filter((e) => e.category !== "goal");
  const markerY = timelineHeight / 2;

  // Connector lines from markers to baseline (hidden - markers sit on line)
  chart
    .selectAll(".event-connector")
    .data(otherEvents)
    .enter()
    .append("line")
    .attr("class", "event-connector")
    .attr("x1", (d) => `${minuteToPercent(d.minute)}%`)
    .attr("x2", (d) => `${minuteToPercent(d.minute)}%`)
    .attr("y1", markerY)
    .attr("y2", markerY)
    .attr("stroke", (d) => eventCategories[d.category].color)
    .attr("stroke-width", 1)
    .attr("opacity", 0)
    .style("pointer-events", "none");

  chart
    .selectAll(".event-marker")
    .data(otherEvents)
    .enter()
    .append("circle")
    .attr("class", "event-marker")
    .attr("cx", (d) => `${minuteToPercent(d.minute)}%`)
    .attr("cy", markerY)
    .attr("r", 4)
    .attr("fill", (d) => eventCategories[d.category].color)
    .attr("opacity", (d) => (visibleCategories.has(d.category) ? 1 : 0))
    .attr("pointer-events", (d) => (visibleCategories.has(d.category) ? "auto" : "none"))
    .style("cursor", "pointer")
    .style("z-index", "100")
    .on("mouseover", function (event, d) {
      // Only show tooltip if marker is visible
      if (!visibleCategories.has(d.category)) {
        return;
      }

      try {
        d3.select(this).transition().duration(150).attr("r", 6);

        // Find all events at the same minute that are visible (not hidden by toggle)
        const eventsAtMinute = parsedEvents.filter(
          (e) => e.minute === d.minute && visibleCategories.has(e.category)
        );
        const minuteDisplay = d.MatchMinute || `${d.minute}'`;

        // Group events by team
        const eventsByTeam = {};
        for (const evt of eventsAtMinute) {
          const team = evt.teamName || "Unknown Team";
          if (!eventsByTeam[team]) {
            eventsByTeam[team] = [];
          }
          eventsByTeam[team].push(evt);
        }

        // Create structured tooltip
        const tooltip = document.createElement("div");
        tooltip.style.cssText = `
          position: fixed;
          background: var(--bg-raised);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 12px;
          font-family: "Inter", sans-serif;
          z-index: 1000;
          pointer-events: none;
          min-width: 220px;
          max-width: 32ch;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        // Time header
        const timeHeader = document.createElement("div");
        timeHeader.style.cssText = `
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
          font-variant-numeric: tabular-nums;
        `;
        timeHeader.textContent = minuteDisplay;
        tooltip.appendChild(timeHeader);

        // Events container
        const eventsContainer = document.createElement("div");
        eventsContainer.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 8px;
        `;

        // Group order: home team first, then away team
        const teamOrder = [match.homeTeam, match.awayTeam].filter((team) => team in eventsByTeam);
        const otherTeams = Object.keys(eventsByTeam).filter((team) => !teamOrder.includes(team));
        const orderedTeams = [...teamOrder, ...otherTeams];

        for (const team of orderedTeams) {
          const teamEvents = eventsByTeam[team];

          // Team label
          const teamLabel = document.createElement("div");
          teamLabel.style.cssText = `
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
            margin-top: 4px;
          `;
          teamLabel.textContent = team;
          eventsContainer.appendChild(teamLabel);

          // Events for this team
          for (const evt of teamEvents) {
            // Use detailed description first, then type label, then category
            const eventDesc =
              evt.eventDescription || evt.TypeLocalized?.[0]?.Description || evt.category;

            const eventItem = document.createElement("div");
            eventItem.style.cssText = `
              font-size: 0.8rem;
              line-height: 1.4;
              color: var(--text-primary);
              padding-left: 12px;
              border-left: 2px solid ${eventCategories[evt.category].color};
            `;
            eventItem.textContent = eventDesc;
            eventsContainer.appendChild(eventItem);
          }
        }

        tooltip.appendChild(eventsContainer);

        // Add to DOM first so it can be measured for positioning
        document.body.appendChild(tooltip);

        // Track if this tooltip is still active (not removed by mouseout)
        tooltip.__isActive = true;

        // Use floating-ui for intelligent positioning
        const referenceElement = this; // The SVG circle element
        computePosition(referenceElement, tooltip, {
          placement: "right",
          middleware: [
            offset(10), // 10px offset from the marker
            flip(), // Flip to opposite side if near viewport edge
            shift({ padding: 8 }), // Shift if viewport collision, with 8px padding
          ],
        }).then(({ x, y }) => {
          // Only apply positioning if tooltip is still active
          if (tooltip.__isActive && tooltip.parentNode) {
            Object.assign(tooltip.style, {
              left: `${x}px`,
              top: `${y}px`,
            });
          }
        });

        // Store tooltip on the circle element for cleanup on mouseout
        const circleElement = d3.select(this);
        circleElement.node().__tooltip = tooltip;
      } catch (err) {
        console.error("Tooltip error:", err);
      }
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(150).attr("r", 4);

      // Immediately remove tooltip on mouseout
      const circleElement = d3.select(this);
      const tooltip = circleElement.node().__tooltip;
      if (tooltip) {
        // Mark tooltip as inactive so floating-ui promise won't position it
        tooltip.__isActive = false;
        if (tooltip.parentNode) {
          tooltip.remove();
        }
      }
      circleElement.node().__tooltip = null;
    });

  wrapper.appendChild(svg.node());

  return wrapper;
}
