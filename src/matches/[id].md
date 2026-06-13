# Match

```js
// Load match metadata from matches.json.
const matches = await FileAttachment("../data/matches.json").json();

// During SSR there is no browser location; fallback to the first match.
const pathname = typeof location === "undefined" ? "/matches/:id" : location.pathname;
const rawId = pathname.split("/").filter(Boolean).pop();
const matchId = rawId && rawId !== ":id" ? rawId : String(matches[0]?.id ?? "");

const match =
  matches.find((m) => String(m.id) === String(matchId)) ??
  matches[0] ?? {
    id: "",
    homeTeam: "Unknown",
    awayTeam: "Unknown",
    homeScore: null,
    awayScore: null,
    stage: "Unknown",
    date: new Date().toISOString()
  };

const matchData = {
  meta: match,
  timeline: null,
  teamStats: null,
  playerStats: null,
  powerRanking: null
};
```

## Match Details

```js
display(html`
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 16px 0; text-align: center;">
    <div>
      <div style="font-size: 20px; font-weight: 600;">${matchData.meta.homeTeam}</div>
      <div style="font-size: 32px; font-weight: 700; margin-top: 8px;">
        ${matchData.meta.homeScore !== null ? matchData.meta.homeScore : "—"}
      </div>
    </div>
    <div>
      <div style="font-size: 14px; color: var(--theme-foreground-muted); margin-bottom: 8px;">
        ${matchData.meta.stage}
      </div>
      <div style="font-size: 12px; color: var(--theme-foreground-muted);">
        ${new Date(matchData.meta.date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
    <div>
      <div style="font-size: 20px; font-weight: 600;">${matchData.meta.awayTeam}</div>
      <div style="font-size: 32px; font-weight: 700; margin-top: 8px;">
        ${matchData.meta.awayScore !== null ? matchData.meta.awayScore : "—"}
      </div>
    </div>
  </div>
`);
```

## Timeline

```js
display(html`<div style="color: var(--theme-foreground-muted);">
  ${matchData.timeline ? `${matchData.timeline.events?.length ?? 0} events` : "No timeline data"}
</div>`);
```

## Team Stats

```js
display(html`<div style="color: var(--theme-foreground-muted);">
  ${matchData.teamStats ? "Team stats available" : "Team stats not yet available"}
</div>`);
```

## Player Stats

```js
display(html`<div style="color: var(--theme-foreground-muted);">
  ${matchData.playerStats ? `${matchData.playerStats.length ?? 0} players tracked` : "Player stats not yet available"}
</div>`);
```

## Power Rankings

```js
display(html`<div style="color: var(--theme-foreground-muted);">
  ${matchData.powerRanking ? "Power ranking data available" : "Power ranking not yet available"}
</div>`);
```
