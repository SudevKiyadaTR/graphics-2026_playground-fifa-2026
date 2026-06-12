# FIFA 2026 Dashboard

Tournament calendar for FIFA World Cup 2026.

```js
import { scheduleChart } from "./components/schedule-chart.js";

const matches = await FileAttachment("./data/matches.json").json();
```

## Match Schedule

```js
display(scheduleChart(matches));
```
