# Implementation Plan: FIFA 2026 Dashboard

## Context

Build a self-updating FIFA 2026 tournament dashboard using Observable Framework. A Node.js scraper runs every 12 hours against the official FIFA APIs and writes raw JSON to a `scraped-data/` directory. Observable Framework data loaders read those files at build time and serve clean data to Markdown pages. The dashboard has two levels: a main aggregated view and one page per match.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Scraper is standalone | `scripts/scrape.js` (pure Node.js, no framework) | Runs independently of dashboard build; simpler to schedule |
| Data lives in `scraped-data/` | Flat JSON files per resource | Easy to inspect, diff, and re-run without full re-scrape |
| Observable data loaders | Thin transform layer reading `scraped-data/` | Keeps FIFA API knowledge in the scraper; loaders just reshape |
| Parameterized match pages | `src/matches/[id].md` + `src/data/match-[id].json.js` | Observable-native approach; generates static page per match at build time |
| `dynamicPaths` in config | Async function reading `scraped-data/matches.json` | Automatically picks up new matches as scraper runs |
| Scheduling | Shell script + cron (local) + GitHub Actions workflow (cloud) | Covers both local dev and CI/CD deployment |
| `scraped-data/` in git | Committed | Persists between CI runs; workflow commits updated files after each scrape |
| Theme | `["dashboard", "near-midnight"]` | Dark mode throughout |

---

## Dependency Graph

```
FIFA APIs
    │
    └── scripts/scrape.js
            │ writes
            ▼
        scraped-data/
            ├── matches.json
            ├── timelines/{id}.json
            ├── match-stats/{id}.json
            ├── team-stats/{id}.json
            ├── player-stats/{id}.json
            └── power-ranking/{id}.json
                    │
                    ├── src/data/matches.json.js ──────────────▶ src/index.md (main dashboard)
                    ├── src/data/standings.json.js ─────────────▶ src/index.md
                    ├── src/data/top-scorers.json.js ────────────▶ src/index.md
                    └── src/data/match-[id].json.js ─────────────▶ src/matches/[id].md
                                                                         │
                                                        observablehq.config.js (dynamicPaths)
```

---

## Project Structure

```
fifa-2026-dashboard/
├── package.json
├── observablehq.config.js
├── .gitignore
├── scripts/
│   └── scrape.js                     standalone Node.js scraper
├── cron/
│   └── schedule.sh                   wrapper script for cron/launchd
├── .github/
│   └── workflows/
│       └── scrape.yml                GitHub Actions: runs every 12h
├── scraped-data/                     committed to git, populated by scraper
│   ├── matches.json
│   ├── timelines/
│   ├── match-stats/
│   ├── team-stats/
│   ├── player-stats/
│   └── power-ranking/
└── src/
    ├── index.md                      main aggregated dashboard
    ├── matches/
    │   └── [id].md                   parameterized match page
    ├── data/
    │   ├── matches.json.js           loader: normalised match list
    │   ├── standings.json.js         loader: derives group standings
    │   ├── top-scorers.json.js       loader: aggregates player goals
    │   └── match-[id].json.js        loader: per-match data bundle
    └── components/
        ├── schedule-chart.js
        ├── standings-table.js
        ├── top-scorers-chart.js
        ├── power-rankings-chart.js
        ├── match-timeline.js
        ├── team-stats-comparison.js
        └── player-stats-table.js
```

---

## Key API Reference

| API | Key fields used |
|---|---|
| `GET /calendar/matches?language=en&count=500&idCompetition=17` | `IdMatch` (routing key), `Properties.IdIFES` (stats property ID), `HomeTeam`, `AwayTeam`, `Date`, `Score`, `StageName`, `GroupName` |
| `GET /timelines/{IdMatch}?language=en` | Event array: `Type` (goal/card/sub), `Minute`, `Team`, `Player` |
| `GET /calendar/{IdMatch}?language=en` | Full match object incl. venue, officials, `Properties.IdIFES` |
| `GET /v1/stats/match/{IdIFES}/teams.json` | Possession, shots, passes, fouls per team |
| `GET /v1/stats/match/{IdIFES}/players.json` | Goals, assists, distance, rating per player |
| `GET /v1/powerranking/match/{IdIFES}.json` | Pre/post-match power ranking per team |

API hosts:
- `https://api.fifa.com/api/v3/` — matches, timelines, calendar
- `https://fdh-api.fifa.com/v1/` — stats, power ranking

---

## Tasks

### Phase 1: Foundation + Thin Vertical Slice

#### Task 1: Scaffold project
**Description:** Initialise Observable Framework project; create all directories; add `.gitignore`; write minimal `package.json` with scraper deps (`node-fetch`).

**Acceptance criteria:**
- [ ] `npm run dev` starts Observable dev server without errors
- [ ] `scraped-data/` directory exists (not git-ignored — it is committed)
- [ ] `scripts/`, `src/data/`, `src/components/`, `src/matches/`, `cron/` directories exist
- [ ] `observablehq.config.js` present with title and minimal config

**Verification:** `npm run dev` → browser opens, blank index page renders

**Dependencies:** None  
**Files:** `package.json`, `observablehq.config.js`, `.gitignore`, directory stubs  
**Size:** S

---

#### Task 2: Scraper — matches list
**Description:** Write `scripts/scrape.js` that fetches the full matches list from `/calendar/matches`, handles pagination via `ContinuationToken`, and writes `scraped-data/matches.json`. Includes rate-limiting helper and error handling.

**Acceptance criteria:**
- [ ] `node scripts/scrape.js` produces `scraped-data/matches.json` with all FIFA 2026 matches
- [ ] Each match entry preserves `IdMatch`, `Properties.IdIFES`, team names, scores, date, group/stage
- [ ] Subsequent runs overwrite (not append) the file
- [ ] HTTP errors log a warning and continue (don't crash)

**Verification:** `node scripts/scrape.js && node -e "console.log(require('./scraped-data/matches.json').length, 'matches')"`

**Dependencies:** Task 1  
**Files:** `scripts/scrape.js`  
**Size:** S

---

#### Task 3: Matches data loader + schedule chart (thin E2E slice)
**Description:** Write `src/data/matches.json.js` that reads `scraped-data/matches.json` and outputs a normalised array. Build the schedule/bracket overview on `src/index.md` using Observable Plot — a timeline or grid of matches grouped by stage/group, coloured by match status.

**Acceptance criteria:**
- [ ] `npm run build` succeeds
- [ ] Loader outputs valid JSON array with at minimum: `id`, `propertyId`, `homeTeam`, `awayTeam`, `date`, `stage`, `group`, `homeScore`, `awayScore`
- [ ] `src/index.md` renders a match schedule chart in the browser

**Verification:** `npm run dev` → navigate to `/` → schedule chart visible with real match data

**Dependencies:** Task 2  
**Files:** `src/data/matches.json.js`, `src/index.md`, `src/components/schedule-chart.js`  
**Size:** M

---

### Checkpoint 1 — Foundation
- [ ] `node scripts/scrape.js` runs successfully
- [ ] `npm run dev` shows main dashboard with schedule chart
- [ ] `npm run build` exits 0
- **Human review before proceeding**

---

### Phase 2: Full Scraper + Per-Match Data Layer

#### Task 4: Scraper — per-match data
**Description:** Extend `scripts/scrape.js` to iterate all matches and fetch the five per-match endpoints, saving each to:
- `scraped-data/timelines/{id}.json`
- `scraped-data/match-stats/{id}.json`
- `scraped-data/team-stats/{id}.json`
- `scraped-data/player-stats/{id}.json`
- `scraped-data/power-ranking/{id}.json`

Skip matches with no `IdIFES` (unplayed). Add 300ms delay between requests.

**Acceptance criteria:**
- [ ] Running scraper populates all five subdirectories for played matches
- [ ] Unplayed matches (no `IdIFES`) are skipped with a log message
- [ ] Each file is valid parseable JSON
- [ ] Re-running only re-fetches if `--force` flag passed (otherwise skips existing files)

**Verification:** `node scripts/scrape.js && ls scraped-data/timelines/ | wc -l` shows count matching played matches

**Dependencies:** Task 2  
**Files:** `scripts/scrape.js` (extend)  
**Size:** M

---

#### Task 5: Per-match data loader
**Description:** Write `src/data/match-[id].json.js` — a parameterised Observable data loader that reads all five per-match scraped files and merges them into a single bundle. Uses `parseArgs` to extract `--id`.

**Acceptance criteria:**
- [ ] `node 'src/data/match-[id].json.js' --id=<real_id>` outputs valid JSON with keys: `meta`, `timeline`, `teamStats`, `playerStats`, `powerRanking`
- [ ] Missing files (unplayed match) output `null` for that key instead of crashing

**Verification:** Run loader directly for a known played match ID, inspect JSON output

**Dependencies:** Task 4  
**Files:** `src/data/match-[id].json.js`  
**Size:** S

---

#### Task 6: Schedule cron / GitHub Actions
**Description:** Write `cron/schedule.sh` (wrapper that cd's to project and runs scraper + build). Write `.github/workflows/scrape.yml` with `cron: '0 */12 * * *'` schedule, running scraper and committing updated `scraped-data/` files.

**Acceptance criteria:**
- [ ] `cron/schedule.sh` is executable and runs without error
- [ ] `.github/workflows/scrape.yml` is valid YAML with 12-hour schedule
- [ ] Workflow commits changed files with message `chore: scrape update {timestamp}`

**Verification:** `bash cron/schedule.sh` runs without error locally

**Dependencies:** Task 4  
**Files:** `cron/schedule.sh`, `.github/workflows/scrape.yml`  
**Size:** S

---

### Checkpoint 2 — Data Layer Complete
- [ ] All scraped-data subdirectories populated for played matches
- [ ] Per-match loader outputs valid bundle JSON
- [ ] Schedule script runs end-to-end without errors
- **Human review before proceeding**

---

### Phase 3: Main Dashboard Visualisations

#### Task 7: Derived loaders — standings + top scorers
**Description:** Write `src/data/standings.json.js` (derives group table from matches data) and `src/data/top-scorers.json.js` (aggregates goals per player across all `scraped-data/player-stats/*.json` files).

**Acceptance criteria:**
- [ ] Standings loader outputs `{group, team, played, w, d, l, gf, ga, gd, pts}[]`
- [ ] Top scorers loader outputs `{player, team, goals, assists}[]` sorted by goals desc
- [ ] Both build without error

**Verification:** Run each loader directly, inspect first few rows

**Dependencies:** Task 4  
**Files:** `src/data/standings.json.js`, `src/data/top-scorers.json.js`  
**Size:** S

---

#### Task 8: Main dashboard — goals heatmap + power rankings chart
**Description:** Add to `src/index.md`: (1) goals-per-match timeline heatmap (Plot.rect, x=date, colour=total goals, tooltip=match name+score); (2) team power rankings bar/lollipop chart.

**Acceptance criteria:**
- [ ] Goals heatmap visible with real data and tooltips
- [ ] Power rankings chart shows all teams sorted by ranking value

**Verification:** `npm run dev` → main page → both charts visible

**Dependencies:** Tasks 3, 7  
**Files:** `src/index.md`, `src/components/power-rankings-chart.js`  
**Size:** M

---

#### Task 9: Main dashboard — standings table + top scorers leaderboard
**Description:** Add to `src/index.md`: (1) group standings tables (one per group); (2) top scorers leaderboard (player, team, goals, assists).

**Acceptance criteria:**
- [ ] Standings table correct points/GD per group
- [ ] Top scorers shows at least top 10

**Verification:** `npm run dev` → main page → tables visible; cross-check one team's stats

**Dependencies:** Task 7  
**Files:** `src/index.md`, `src/components/standings-table.js`, `src/components/top-scorers-chart.js`  
**Size:** M

---

### Checkpoint 3 — Main Dashboard Complete
- [ ] All five main dashboard sections render with real data
- [ ] `npm run build` exits 0
- [ ] No console errors in browser
- **Human review before proceeding**

---

### Phase 4: Individual Match Pages

#### Task 10: Match page scaffold + routing
**Description:** Create `src/matches/[id].md` template. Configure `observablehq.config.js` `dynamicPaths` as an async function that reads `scraped-data/matches.json` and yields `/matches/{IdMatch}` for each match.

**Acceptance criteria:**
- [ ] `npm run build` generates a static page for every match
- [ ] Navigating to `/matches/{id}` renders the page
- [ ] Match title (`Home vs Away`) displays from loader data

**Verification:** `npm run build && ls dist/matches/ | wc -l` matches total match count

**Dependencies:** Task 5  
**Files:** `src/matches/[id].md`, `observablehq.config.js`  
**Size:** S

---

#### Task 11: Match page — timeline visualisation
**Description:** Build `src/components/match-timeline.js` — vertical timeline of goals, yellow cards, red cards, substitutions with minute markers, home left / away right.

**Acceptance criteria:**
- [ ] All four event types render with distinct icons/colours
- [ ] Events ordered by minute
- [ ] Works for 0-event matches (no crash)

**Verification:** Navigate to a played match, verify events match known results

**Dependencies:** Task 10  
**Files:** `src/matches/[id].md`, `src/components/match-timeline.js`  
**Size:** M

---

#### Task 12: Match page — team stats comparison + player stats table
**Description:** `src/components/team-stats-comparison.js` — horizontal diverging bar chart (possession, shots, passes, fouls). `src/components/player-stats-table.js` — sortable player stats table.

**Acceptance criteria:**
- [ ] Team stats chart renders correct values for both teams
- [ ] Player table sortable by goals and rating
- [ ] Both handle null data (unplayed match) gracefully

**Verification:** `npm run dev` → played match page → both components render

**Dependencies:** Task 10  
**Files:** `src/matches/[id].md`, `src/components/team-stats-comparison.js`, `src/components/player-stats-table.js`  
**Size:** M

---

#### Task 13: Match page — power ranking comparison
**Description:** `src/components/power-rankings.js` — before/after ranking comparison with directional arrow (green=up, red=down). Shows "Not yet played" for null data.

**Acceptance criteria:**
- [ ] Shows pre/post ranking for both teams
- [ ] Arrow direction/colour correct
- [ ] Null data handled gracefully

**Verification:** Completed match page → verify numbers match `scraped-data/power-ranking/{id}.json`

**Dependencies:** Task 10  
**Files:** `src/matches/[id].md`, `src/components/power-rankings.js`  
**Size:** S

---

### Checkpoint 4 — Match Pages Complete
- [ ] Every played match has a fully rendered page
- [ ] All four visualisation sections present
- [ ] `npm run build` exits 0, no broken links
- **Human review before proceeding**

---

### Phase 5: Config and Polish

#### Task 14: Full sidebar config + dark theme
**Description:** Complete `observablehq.config.js`: top-level pages (Home, Standings, Top Scorers), collapsible Matches section by stage, `theme: ["dashboard", "near-midnight"]`, `search: true`.

**Acceptance criteria:**
- [ ] Sidebar shows all main pages and collapsible Matches section
- [ ] Dark theme applied
- [ ] Search works

**Verification:** `npm run dev` → verify sidebar and theme

**Dependencies:** Task 13  
**Files:** `observablehq.config.js`  
**Size:** S

---

#### Task 15: README + setup docs
**Description:** Write `README.md` with: prerequisites, `npm install`, scraper usage, dev server, cron setup (macOS/Linux), deploy instructions.

**Acceptance criteria:**
- [ ] All setup steps covered
- [ ] Cron instructions correct for macOS/Linux

**Dependencies:** Task 14  
**Files:** `README.md`  
**Size:** XS

---

### Checkpoint 5 — Complete
- [ ] `node scripts/scrape.js && npm run build` produces working static site
- [ ] All dashboard sections populated with real data
- [ ] README accurate
- [ ] Ready for deployment

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| FIFA API rate limiting / blocking | High | 300ms delay between requests; `--force` flag skips existing files on re-run |
| `IdIFES` missing for future/unplayed matches | Med | Scraper skips with log; loaders output `null` for missing keys |
| Observable FileAttachment static string requirement | Med | Resolved by parameterised data loader `match-[id].json.js` which reads filesystem |
| FIFA API schema changes mid-tournament | Med | Data loaders are single normalisation point; only they need updating |
| Large match count slowing build | Low | Observable builds loaders lazily; only referenced IDs built |
