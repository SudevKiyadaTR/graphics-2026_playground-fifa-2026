/**
 * Football Field Timeline Component
 * Displays a football field with event markers that can be scrubbed through a timeline.
 */

export function footballFieldTimeline(match, events, d3) {
  const container = d3.select(document.createElement("div"));
  container.style("width", "100%");

  // Standardized field dimensions for proper aspect ratio
  const fieldWidth = 1050; // Full width
  const fieldHeight = 680; // Full height - maintains proper soccer field proportions
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const chartWidth = fieldWidth + margin.left + margin.right;
  const chartHeight = fieldHeight + margin.top + margin.bottom;

  // Parse match duration from events (last event minute)
  const lastEvent = events[events.length - 1];
  const parseMinute = (minuteStr) => {
    const match = String(minuteStr).match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };
  const maxMinute = lastEvent ? parseMinute(lastEvent.MatchMinute) : 90;
  const matchDuration = Math.ceil(maxMinute / 5) * 5 || 90;

  // Filter events with position data
  const eventsWithPosition = events.filter(
    (e) =>
      e.PositionX !== undefined &&
      e.PositionY !== undefined &&
      !isNaN(e.PositionX) &&
      !isNaN(e.PositionY)
  );

  // Current time state (in minutes)
  let currentTime = 0;

  // Create main SVG with viewBox for proper responsive scaling
  const svg = d3
    .select(container.node())
    .append("svg")
    .attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .style("max-width", "100%")
    .style("border", "1px solid transparent");

  // Add background
  svg
    .append("rect")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("fill", "transparent");

  // Create field group
  const fieldGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Draw football field
  drawFootballField(fieldGroup, fieldWidth, fieldHeight);

  // Create clip path for points
  fieldGroup
    .append("defs")
    .append("clipPath")
    .attr("id", "field-clip")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", fieldWidth)
    .attr("height", fieldHeight);

  // Create points group
  const pointsGroup = fieldGroup
    .append("g")
    .attr("class", "event-points")
    .attr("clip-path", "url(#field-clip)");

  // Function to update visible points based on current time
  function updatePoints(time) {
    const visibleEvents = eventsWithPosition.filter((e) => parseMinute(e.MatchMinute) <= time);

    const points = pointsGroup.selectAll("circle").data(visibleEvents, (d) => d.EventId);

    // Enter
    points
      .enter()
      .append("circle")
      .attr("cx", (d) => (d.PositionX / 100) * fieldWidth)
      .attr("cy", (d) => (d.PositionY / 100) * fieldHeight)
      .attr("r", 5)
      .attr("fill", (d) => getEventColor(d))
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.7)
      .attr("class", "event-point")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("r", 7).attr("opacity", 1);
        showTooltip(event, d, this);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("r", 5).attr("opacity", 0.7);
        hideTooltip(this);
      });

    // Exit
    points.exit().remove();
  }

  const timelineContainer = d3
    .select(container.node())
    .append("div")
    .attr("style", "width: 100%; box-sizing: border-box;");

  const timelineSvg = timelineContainer
    .append("svg")
    .attr("viewBox", `0 0 ${chartWidth} 40`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto");

  const timelineY = 20;
  const timelineStart = margin.left;
  const timelineWidth = fieldWidth;

  // Draw timeline track
  timelineSvg
    .append("line")
    .attr("x1", timelineStart)
    .attr("y1", timelineY)
    .attr("x2", timelineStart + timelineWidth)
    .attr("y2", timelineY)
    .attr("stroke", "var(--border)")
    .attr("stroke-width", 2);

  // Draw timeline markers for events with color coding
  const eventsByMinute = {};
  eventsWithPosition.forEach((e) => {
    const minute = parseMinute(e.MatchMinute);
    if (!eventsByMinute[minute]) {
      eventsByMinute[minute] = [];
    }
    eventsByMinute[minute].push(e);
  });

  const uniqueMinutes = Object.keys(eventsByMinute)
    .map(Number)
    .sort((a, b) => a - b);
  timelineSvg
    .selectAll(".timeline-marker")
    .data(uniqueMinutes)
    .enter()
    .append("line")
    .attr("class", "timeline-marker")
    .attr("x1", (d) => timelineStart + (d / matchDuration) * timelineWidth)
    .attr("y1", timelineY - 4)
    .attr("x2", (d) => timelineStart + (d / matchDuration) * timelineWidth)
    .attr("y2", timelineY + 4)
    .attr("stroke", (d) => {
      // Use color of first event at this minute
      const firstEvent = eventsByMinute[d][0];
      return getEventColor(firstEvent);
    })
    .attr("stroke-width", 2)
    .attr("opacity", 0.8);

  // Scrubber handle
  const scrubberHandle = timelineSvg
    .append("circle")
    .attr("cx", timelineStart)
    .attr("cy", timelineY)
    .attr("r", 6)
    .attr("fill", "var(--accent)")
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  // Time labels - responsive alignment with timeline
  const timeLabel = timelineContainer
    .append("div")
    .attr(
      "style",
      `display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 0 ${margin.left}px; font: 400 0.75rem DM Mono, monospace; color: var(--text-secondary);`
    );

  timeLabel.append("span").text("0'");
  timeLabel
    .append("span")
    .attr("class", "current-time")
    .attr("style", "text-align: center;")
    .text("0'");
  timeLabel.append("span").attr("style", "text-align: right;").text(`${matchDuration}'`);

  // Make timeline interactive
  const timelineArea = timelineSvg
    .append("rect")
    .attr("x", timelineStart)
    .attr("y", timelineY - 10)
    .attr("width", timelineWidth)
    .attr("height", 20)
    .attr("fill", "transparent")
    .attr("cursor", "pointer");

  function handleTimelineClick(e) {
    const svgRect = timelineSvg.node().getBoundingClientRect();
    const x = e.clientX - svgRect.left - (timelineStart / chartWidth) * svgRect.width;
    const newTime = Math.max(
      0,
      Math.min(matchDuration, (x / ((timelineWidth / chartWidth) * svgRect.width)) * matchDuration)
    );
    currentTime = newTime;
    updateTimeline();
  }

  function handleTimelineDrag(e) {
    e.preventDefault();
    const svgRect = timelineSvg.node().getBoundingClientRect();
    const x = e.clientX - svgRect.left - (timelineStart / chartWidth) * svgRect.width;
    const newTime = Math.max(
      0,
      Math.min(matchDuration, (x / ((timelineWidth / chartWidth) * svgRect.width)) * matchDuration)
    );
    currentTime = newTime;
    updateTimeline();
  }

  timelineArea.on("click", handleTimelineClick);
  timelineArea.on("mousedown", () => {
    d3.select(window).on("mousemove", handleTimelineDrag);
    d3.select(window).on("mouseup", () => {
      d3.select(window).on("mousemove", null);
      d3.select(window).on("mouseup", null);
    });
  });

  function updateTimeline() {
    const xPos = timelineStart + (currentTime / matchDuration) * timelineWidth;
    scrubberHandle.attr("cx", xPos);
    timelineContainer.select(".current-time").text(`${Math.round(currentTime)}'`);
    updatePoints(currentTime);
  }

  // Initialize
  updatePoints(currentTime);

  return container.node();
}

/**
 * Draw a football field with proper FIFA dimensions
 */
function drawFootballField(group, width, height) {
  // Outer border
  group
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#1a472a")
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 2);

  // Center line (halfway line)
  group
    .append("line")
    .attr("x1", width / 2)
    .attr("y1", 0)
    .attr("x2", width / 2)
    .attr("y2", height)
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.7);

  // Center circle
  group
    .append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", 55)
    .attr("fill", "none")
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.7);

  // Center spot
  group
    .append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", 2.5)
    .attr("fill", "var(--text-secondary)")
    .attr("opacity", 0.7);

  // Goal lines and penalty areas - left side (x = 0)
  const penaltyAreaWidth = width * 0.165; // 16.5% of field width
  const penaltyAreaHeight = height * 0.68; // 68% of field height
  const penaltyAreaY = (height - penaltyAreaHeight) / 2;

  // Left penalty area
  group
    .append("rect")
    .attr("x", 0)
    .attr("y", penaltyAreaY)
    .attr("width", penaltyAreaWidth)
    .attr("height", penaltyAreaHeight)
    .attr("fill", "none")
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.7);

  // Right penalty area
  group
    .append("rect")
    .attr("x", width - penaltyAreaWidth)
    .attr("y", penaltyAreaY)
    .attr("width", penaltyAreaWidth)
    .attr("height", penaltyAreaHeight)
    .attr("fill", "none")
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.7);

  // Goal areas (smaller) - left side
  const goalAreaWidth = width * 0.055; // 5.5% of field width
  const goalAreaHeight = height * 0.44; // 44% of field height
  const goalAreaY = (height - goalAreaHeight) / 2;

  // Left goal area
  group
    .append("rect")
    .attr("x", 0)
    .attr("y", goalAreaY)
    .attr("width", goalAreaWidth)
    .attr("height", goalAreaHeight)
    .attr("fill", "none")
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.7);

  // Right goal area
  group
    .append("rect")
    .attr("x", width - goalAreaWidth)
    .attr("y", goalAreaY)
    .attr("width", goalAreaWidth)
    .attr("height", goalAreaHeight)
    .attr("fill", "none")
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.7);

  // Corner arcs - properly clipped inside field
  const cornerRadius = 13;

  // Top-left corner arc
  group
    .append("path")
    .attr("d", `M ${cornerRadius} 0 A ${cornerRadius} ${cornerRadius} 0 0 1 0 ${cornerRadius}`)
    .attr("fill", "none")
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.5);

  // Top-right corner arc
  group
    .append("path")
    .attr(
      "d",
      `M ${width - cornerRadius} 0 A ${cornerRadius} ${cornerRadius} 0 0 0 ${width} ${cornerRadius}`
    )
    .attr("fill", "none")
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.5);

  // Bottom-left corner arc
  group
    .append("path")
    .attr(
      "d",
      `M 0 ${height - cornerRadius} A ${cornerRadius} ${cornerRadius} 0 0 0 ${cornerRadius} ${height}`
    )
    .attr("fill", "none")
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.5);

  // Bottom-right corner arc
  group
    .append("path")
    .attr(
      "d",
      `M ${width - cornerRadius} ${height} A ${cornerRadius} ${cornerRadius} 0 0 0 ${width} ${height - cornerRadius}`
    )
    .attr("fill", "none")
    .attr("stroke", "var(--text-secondary)")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.5);
}

/**
 * Get color for event type
 */
function getEventColor(event) {
  const type = event.Type;

  // 1 = Goal
  if (type === 1) return "#e8394b";

  // 18 = Foul, 32 = Yellow Card, 33 = Red Card
  if (type === 18 || type === 32 || type === 33) return "#fbbf24";

  // 12 = Attempt at Goal, 57 = Goal Prevention
  if (type === 12 || type === 57) return "#4fb3e8";

  // 5 = Substitution
  if (type === 5) return "#a78bfa";

  // Default
  return "#7d95b0";
}

/**
 * Show tooltip on point hover using viewport-based positioning
 */
function showTooltip(event, data, element) {
  const tooltip = document.createElement("div");
  tooltip.style.cssText = `
    position: fixed;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 8px 12px;
    font: 400 0.75rem DM Mono, monospace;
    color: var(--text-primary);
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 280px;
    word-wrap: break-word;
    overflow-wrap: break-word;
  `;

  const typeDesc = data.TypeLocalized?.[0]?.Description || "Event";
  const minute = data.MatchMinute;
  const description = data.EventDescription?.[0]?.Description || typeDesc;

  tooltip.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px; word-wrap: break-word; overflow-wrap: break-word;">${typeDesc} – ${minute}</div>
    <div style="color: var(--text-secondary); font-size: 0.7rem; word-wrap: break-word; overflow-wrap: break-word;">${description}</div>
  `;

  // Add to DOM first so it can be measured
  document.body.appendChild(tooltip);

  // Calculate position relative to the event target (SVG circle)
  const rect = event.target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  let x = rect.left + rect.width / 2 - tooltipRect.width / 2;
  let y = rect.top - tooltipRect.height - 8;

  // Keep within viewport bounds
  const padding = 8;
  x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));

  if (y < padding) {
    // Flip to bottom if not enough space at top
    y = rect.bottom + 8;
  }

  Object.assign(tooltip.style, {
    left: `${x}px`,
    top: `${y}px`,
  });

  // Store reference for cleanup
  if (element.__eventTooltip) {
    element.__eventTooltip.remove();
  }
  element.__eventTooltip = tooltip;
}

/**
 * Hide tooltip on pointer leave
 */
function hideTooltip(element) {
  if (element && element.__eventTooltip) {
    element.__eventTooltip.remove();
    element.__eventTooltip = null;
  }
}
