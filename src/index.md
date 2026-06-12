# FIFA 2026 Dashboard

Live tournament overview for FIFA World Cup 2026™.

```js
import { scheduleChart } from "./components/schedule-chart.js";

const matches = await FileAttachment("./data/matches.json").json();
```

## Match Schedule

```js
display(scheduleChart(matches));
```

## Tournament Stats

- **Total Matches:** ${matches.length}
- **Played:** ${matches.filter((m) => m.homeScore !== null).length}
- **Upcoming:** ${matches.filter((m) => m.homeScore === null).length}
