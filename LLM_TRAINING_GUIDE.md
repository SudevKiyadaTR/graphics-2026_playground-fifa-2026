# Observable Framework, D3, and Observable Plot: Complete Guide for LLMs

## Table of Contents

1. Observable Framework Fundamentals
2. D3.js Core Concepts
3. Observable Plot Architecture
4. Integration Patterns
5. Common Use Cases

---

## 1. Observable Framework Fundamentals

### What is Observable Framework?

Observable Framework is an open-source static site generator for building data apps, dashboards, reports, and interactive visualizations. It combines reactive markdown with JavaScript for seamless interactivity.

**Key Features:**

- Write in Markdown with reactive JavaScript
- Data loaders supporting SQL, Python, R, and other languages
- Static site compilation with instant page loads
- Built-in preview and deployment
- 22+ integrated visualization libraries
- Responsive design with theming

### Quick Start

```bash
npx "@observablehq/framework@latest" create
```

### Project Structure

```
project/
├── observablehq.config.js    # Configuration file
├── src/
│   ├── index.md              # Home page
│   ├── data/
│   │   └── data.json.js      # Data loaders
│   └── components/           # Reusable components
└── public/                   # Static assets
```

### Core Concepts

**Reactive Markdown:**

- Mix Markdown prose with JavaScript code blocks
- Variables automatically update when dependencies change
- Perfect for dashboards and interactive reports

**Data Loaders:**
Data loaders execute at build time, not runtime. They support multiple languages:

```javascript
// src/data/dataset.json.js
import * as fs from "fs";
export default function () {
  return JSON.parse(fs.readFileSync("./source.json", "utf-8"));
}
```

**Page Structure:**
Pages are Markdown files with embedded JavaScript:

```markdown
# Dashboard Title

\`\`\`js
const data = await FileAttachment("./data.json").json();
\`\`\`

## Section

\`\`\`js
display(chart(data));
\`\`\`
```

**Configuration:**

```javascript
// observablehq.config.js
export default {
  title: "My Dashboard",
  pages: [
    { name: "Home", path: "/" },
    { name: "Details", path: "/details" },
  ],
  theme: "dark", // or "light" or ["dashboard", "near-midnight"]
  search: true,
};
```

### Built-in Input Components

- Button, Checkbox, Color, Date, File
- Form, Radio, Range, Search, Select
- Table, Text, Textarea, Toggle

---

## 2. D3.js Core Concepts

### What is D3?

D3 (Data-Driven Documents) is a JavaScript library for manipulating documents based on data. It uses modular architecture with 30+ specialized modules.

### Core Modules

**d3-scale:** Map data domains to visual ranges

```javascript
const x = d3.scaleLinear().domain([0, 100]).range([0, width]);

const timeScale = d3
  .scaleUtc()
  .domain([new Date("2023-01-01"), new Date("2024-01-01")])
  .range([marginLeft, width - marginRight]);
```

**d3-axis:** Generate axis components

```javascript
d3.axisBottom(x); // X-axis at bottom
d3.axisLeft(y); // Y-axis on left
d3.axisTop(x); // X-axis at top
d3.axisRight(y); // Y-axis on right
```

**d3-selection:** Manipulate DOM elements

```javascript
d3.select(element); // Select one element
d3.selectAll(elements); // Select multiple

// Chaining API
d3.select("svg")
  .selectAll("circle")
  .data(data)
  .join("circle")
  .attr("cx", (d) => x(d))
  .attr("cy", (d) => y(d))
  .attr("r", 5);
```

**d3-array:** Data processing utilities

- min, max, extent (domain calculation)
- group, rollup (aggregation)
- sort, shuffle, reverse (ordering)

**d3-shape:** SVG path generators

```javascript
const line = d3
  .line()
  .x((d) => x(d.date))
  .y((d) => y(d.value));

const area = d3
  .area()
  .x((d) => x(d.date))
  .y0(height)
  .y1((d) => y(d.value));
```

**d3-transition:** Smooth animations

```javascript
d3.select("circle").transition().duration(1000).attr("r", 10);
```

**d3-zoom:** Interactive panning and zooming
**d3-brush:** Selection ranges
**d3-drag:** Drag interaction

### Data Binding (Core D3 Pattern)

```javascript
const svg = d3.create("svg").attr("width", width).attr("height", height);

svg
  .selectAll("circle")
  .data(data)
  .join("circle")
  .attr("cx", (d, i) => x(i))
  .attr("cy", (d) => y(d))
  .attr("fill", (d) => (d.category === "A" ? "red" : "blue"));
```

### Common Patterns

**Basic Chart Structure:**

```javascript
// 1. Define dimensions
const width = 960,
  height = 600;
const margin = { top: 20, right: 20, bottom: 30, left: 60 };

// 2. Create scales
const x = d3
  .scaleLinear()
  .domain(d3.extent(data, (d) => d.x))
  .range([margin.left, width - margin.right]);

const y = d3
  .scaleLinear()
  .domain([0, d3.max(data, (d) => d.y)])
  .range([height - margin.bottom, margin.top]);

// 3. Create SVG
const svg = d3.create("svg").attr("width", width).attr("height", height);

// 4. Add axes
svg
  .append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x));

svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));

// 5. Add data elements
svg
  .selectAll("circle")
  .data(data)
  .join("circle")
  .attr("cx", (d) => x(d.x))
  .attr("cy", (d) => y(d.y))
  .attr("r", 4)
  .attr("fill", "steelblue");

return svg.node();
```

### Installation

**Observable (Recommended):**

```javascript
// D3 is available by default
const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");
```

**NPM:**

```bash
npm install d3
import * as d3 from "d3";
```

**CDN (ES Module):**

```html
<script type="module">
  import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
</script>
```

---

## 3. Observable Plot Architecture

### Design Philosophy

Plot uses a **declarative, layered approach** rather than predefined chart types:

- No "bar chart" type or "line chart" type
- Instead: layer geometric marks (bars, dots, lines) with data encodings
- Compose complex visualizations from simple building blocks

### Core Components

**Marks:** Geometric shapes that represent data

- Bar: rectangular marks for categorical comparison
- Dot: points for scatter plots
- Line: connected points for time series
- Area: filled regions
- Text: labels and annotations
- Rect: rectangles for heatmaps
- Rule: reference lines
- Tick: small marks for axes

**Scales:** Map data to visual properties

```javascript
Plot.plot({
  x: { type: "linear", domain: [0, 100] },
  y: { type: "log" },
  color: { scheme: "viridis" },
  opacity: { type: "linear", domain: [0, 1] },
});
```

**Data Encodings:** Bind data fields to visual channels

```javascript
Plot.mark(Plot.dot, {
  data: data,
  x: (d) => d.year, // x-position
  y: (d) => d.value, // y-position
  fill: (d) => d.category, // color
  r: (d) => d.importance, // radius (size)
});
```

### Basic Usage Pattern

```javascript
import * as Plot from "@observablehq/plot";

Plot.plot({
  title: "Chart Title",
  width: 800,
  height: 400,
  marginLeft: 60,
  marginBottom: 40,

  x: { type: "linear", label: "X Axis" },
  y: { type: "linear", label: "Y Axis" },
  color: { scheme: "tableau10" },

  marks: [
    // Data visualization layer
    Plot.dot(data, { x: "date", y: "value", fill: "category" }),

    // Grid lines
    Plot.gridX({ stroke: "#eee" }),
    Plot.gridY({ stroke: "#eee" }),

    // Axis labels
    Plot.axisX(),
    Plot.axisY(),
  ],
});
```

### Advanced Features

**Transforms:** Real-time data processing

```javascript
Plot.mark(Plot.bar, {
  data: data,
  transform: Plot.binX(), // Group by X values
  y: { reduce: "count" }, // Count within each group
});
```

**Faceting:** Small multiples for comparison

```javascript
Plot.plot({
  facetX: "category", // Split into columns
  marks: [Plot.dot(data, { x: "x", y: "y", fill: "category" })],
});
```

**Interactivity:**

```javascript
Plot.plot({
  marks: [
    Plot.dot(data, {
      x: "x",
      y: "y",
      tip: { format: { x: "d", y: ",.1f" } }, // Tooltip
    }),
  ],
});
```

**Projections:** Geographic data

```javascript
Plot.plot({
  projection: "mercator",
  marks: [Plot.geo(geojson, { stroke: "currentColor" })],
});
```

---

## 4. Integration Patterns

### Observable Framework + Plot

**Simplest Integration:**

```javascript
// src/index.md
import * as Plot from "@observablehq/plot";

const data = await FileAttachment("./data.json").json();

\`\`\`js
display(Plot.plot({
  marks: [Plot.dot(data, { x: "x", y: "y" })]
}))
\`\`\`
```

**With Data Loader:**

```javascript
// src/data/processed.json.js
import fs from "fs";
export default function () {
  const raw = JSON.parse(fs.readFileSync("raw.json"));
  return raw.map((d) => ({
    ...d,
    year: new Date(d.date).getFullYear(),
  }));
}

// src/index.md
const data = await FileAttachment("./data/processed.json").json();
```

### Observable Framework + D3

**Direct DOM Manipulation:**

```javascript
// src/components/chart.js
import * as d3 from "d3";

export function chart(data) {
  const width = 800, height = 400;
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x))
    .range([40, width - 20]);

  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.x))
    .attr("cy", (d, i) => 50 + i * 10)
    .attr("r", 3);

  return svg.node();
}

// src/index.md
import { chart } from "./components/chart.js";
\`\`\`js
display(chart(data))
\`\`\`
```

### Plot vs D3: When to Use Each

**Use Plot when:**

- Building dashboards quickly
- Want declarative, concise syntax
- Don't need custom DOM manipulation
- Prefer data-driven composition

**Use D3 when:**

- Need low-level SVG control
- Building custom interactions
- Working with non-standard visualizations
- Prefer direct DOM manipulation

**Combine them:**

```javascript
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Use Plot for main chart
const main = Plot.plot({ marks: [...] });

// Use D3 for annotations or custom elements
d3.select(main).selectAll("circle").attr("stroke", "red");
```

---

## 5. Common Use Cases

### Dashboard: Key Metrics + Time Series

```javascript
// src/index.md
const data = await FileAttachment("./metrics.json").json();

# Dashboard

## Key Metrics

\`\`\`js
html\`
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
    <div>Revenue: \${data[data.length-1].revenue.toLocaleString()}</div>
    <div>Users: \${data[data.length-1].users.toLocaleString()}</div>
    <div>Growth: \${(growth * 100).toFixed(1)}%</div>
  </div>
\`
\`\`

## Time Series

\`\`\`js
Plot.plot({
  y: { label: "Revenue", zero: true },
  marks: [
    Plot.line(data, { x: "date", y: "revenue", stroke: "steelblue" }),
    Plot.dot(data, { x: "date", y: "revenue" })
  ]
})
\`\`\`
```

### Interactive Comparison: Faceted Scatter

```javascript
Plot.plot({
  facetX: "category",
  marks: [
    Plot.dot(data, {
      x: "x",
      y: "y",
      fill: (d) => (d.value > threshold ? "red" : "blue"),
      tip: true,
    }),
  ],
});
```

### Data Table with Sorting

```javascript
\`\`\`js
const sorted = data.sort((a, b) => b.value - a.value);

html\`
  <table style="width: 100%; border-collapse: collapse;">
    \${sorted.map(d => html\`
      <tr>
        <td>\${d.name}</td>
        <td>\${d.value.toLocaleString()}</td>
      </tr>
    \`)}
  </table>
\`
\`\`
```

### Heatmap with Plot

```javascript
Plot.plot({
  x: { scale: "band", label: "Hour" },
  y: { scale: "band", label: "Day" },
  color: { type: "linear", scheme: "viridis" },
  marks: [
    Plot.rect(data, {
      x: "hour",
      y: "day",
      fill: "temperature",
    }),
  ],
});
```

---

## Key Takeaways

1. **Observable Framework** is the fastest way to build interactive dashboards with reactive markdown
2. **Observable Plot** is the modern choice for declarative, data-driven visualizations
3. **D3** remains powerful for custom interactions and complex visualizations
4. **Combine** them: Plot for quick charts, D3 for advanced control
5. **Data loaders** separate data fetching from visualization rendering
6. **Composition** over chart types: layer simple marks to build complex visualizations
