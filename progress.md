# FIFA 2026 Dashboard — Build Progress

## Summary

| Task | Status | Completed At | Notes                                      |
| ---- | ------ | ------------ | ------------------------------------------ |
| 1    | ✅     | 2026-06-12   | Scaffold project                           |
| 2    | ✅     | 2026-06-12   | Scraper — matches list                     |
| 3    | ✅     | 2026-06-12   | Matches data loader + schedule chart       |
| 4    | ✅     | 2026-06-12   | Scraper — per-match data                   |
| 5    | ✅     | 2026-06-12   | Per-match data loader                      |
| 6    | ✅     | 2026-06-12   | Schedule cron + GitHub Actions             |
| 7    | ✅     | 2026-06-12   | Derived loaders (standings, scorers)       |
| 8    | ✅     | 2026-06-12   | Heatmap + power rankings charts            |
| 9    | ✅     | 2026-06-12   | Standings tables + scorers leaderboard     |
| 10   | ✅     | 2026-06-12   | Match page scaffold + routing              |
| —    | ✅     | 2026-06-12   | Refactor: Data hierarchy restructuring     |
| —    | ✅     | 2026-06-12   | Feature: Player Stats (expanded 20 fields) |
| —    | ✅     | 2026-06-12   | Simplify homepage + loader cleanup         |
| —    | ✅     | 2026-06-14   | Feature: 6 Match Analytics Visualizations  |
| —    | ✅     | 2026-06-14   | Feature: Player Intensity Chart            |

---

## Task Log

_Entries appended after each completed task._

### Task 1 — Scaffold project

- **Completed:** 2026-06-12 16:42
- **Files changed:** `observablehq.config.js`, `src/index.md`, directories created (`scripts/`, `src/data/`, `src/components/`, `src/matches/`, `cron/`, `scraped-data/`, `.observablehq/`)
- **What was done:** Initialized Observable Framework project with minimal configuration. Created all required directories and set up root source directory. Built a blank homepage.
- **Verification:** `npm run build` succeeds, `npm run lint:fix` and `npm run format` pass clean
- **Acceptance criteria met:**
  - ✅ `npm run dev` starts Observable dev server without errors
  - ✅ `scraped-data/` directory exists (not git-ignored — it is committed)
  - ✅ `scripts/`, `src/data/`, `src/components/`, `src/matches/`, `cron/` directories exist
  - ✅ `observablehq.config.js` present with title and minimal config

### Task 2 — Scraper — matches list

- **Completed:** 2026-06-12 17:02
- **Files changed:** `scripts/scrape.js`, `scraped-data/matches.json`
- **What was done:** Wrote Node.js scraper that fetches matches from FIFA APIs with pagination support via ContinuationToken. Normalizes match data and writes to `scraped-data/matches.json`. Includes rate limiting (50ms between requests) and error handling.
- **Verification:** `node scripts/scrape.js` produces valid `scraped-data/matches.json` with normalized match entries
- **Acceptance criteria met:**
  - ✅ `node scripts/scrape.js` produces `scraped-data/matches.json` with matches
  - ✅ Each match entry preserves `IdMatch`, `Properties.IdIFES`, team names, scores, date, group/stage
  - ✅ File overwrites on subsequent runs
  - ✅ HTTP errors logged and handled gracefully

### Task 3 — Matches data loader + schedule chart

- **Completed:** 2026-06-12 17:15
- **Files changed:** `src/data/matches.json.js`, `src/components/schedule-chart.js`, `src/index.md`, `eslint.config.js`, `package.json`
- **What was done:** Created Observable data loader that reads normalized match data from `scraped-data/matches.json`. Built schedule visualization using Observable Plot showing matches grouped by date with scores. Updated main dashboard to display the chart with tournament stats.
- **Verification:** `npm run build` succeeds with no errors, dashboard renders with schedule chart showing all 104 matches
- **Acceptance criteria met:**
  - ✅ `npm run build` succeeds
  - ✅ Loader outputs valid JSON array with id, propertyId, homeTeam, awayTeam, date, stage, group, scores
  - ✅ `src/index.md` renders a match schedule chart with real match data

### Task 4 — Scraper — per-match data

- **Completed:** 2026-06-12 18:30
- **Files changed:** `scripts/scrape.js`, `scraped-data/timelines/*.json`, `scraped-data/match-stats/*.json`, `scraped-data/team-stats/*.json`, `scraped-data/player-stats/*.json`, `scraped-data/power-ranking/*.json`, `scraped-data/.scrape-manifest.json`
- **What was done:** Extended scraper to fetch five per-match endpoints (timelines, team/match/player stats, power rankings) for all played matches. Implemented incremental scraping with manifest (.scrape-manifest.json) tracking which matches have been scraped, eliminating redundant API calls. Only fetches matches that have finished since last scrape; skips unplayed matches (no propertyId).
- **Verification:** `node scripts/scrape.js` populates all five subdirectories; subsequent runs skip already-scraped matches; `node scripts/scrape.js --force` re-fetches everything
- **Acceptance criteria met:**
  - ✅ Running scraper populates all five subdirectories for played matches
  - ✅ Unplayed matches skipped implicitly (no propertyId check)
  - ✅ Each file is valid parseable JSON
  - ✅ Re-running skips existing files via manifest tracking (incremental)

### Task 5 — Per-match data loader

- **Completed:** 2026-06-12 18:45
- **Files changed:** `src/data/match-[id].json.js`
- **What was done:** Created parameterized Observable Framework data loader that reads the five per-match scraped files (timelines, team-stats, match-stats, player-stats, power-ranking) and merges them into a single bundle. Returns {meta, timeline, teamStats, playerStats, powerRanking} structure.
- **Verification:** Tested with real match IDs (400021441 has all data, 400021440 has only timeline); missing files return null instead of crashing
- **Acceptance criteria met:**
  - ✅ Loader outputs valid JSON with keys: meta, timeline, teamStats, playerStats, powerRanking
  - ✅ Missing files output null for that key instead of crashing

### Task 6 — Schedule cron / GitHub Actions

- **Completed:** 2026-06-12 18:50
- **Files changed:** `cron/schedule.sh`, `.github/workflows/scrape.yml`
- **What was done:** Created executable cron wrapper script (schedule.sh) that runs scraper and builds dashboard. Created GitHub Actions workflow (scrape.yml) with 12-hour schedule that fetches updated data and commits to git with timestamped message.
- **Verification:** Tested schedule.sh locally; verified .github/workflows/scrape.yml has valid YAML syntax and correct cron schedule (0 _/12 _ \* \*)
- **Acceptance criteria met:**
  - ✅ `cron/schedule.sh` is executable and runs without error
  - ✅ `.github/workflows/scrape.yml` is valid YAML with 12-hour schedule
  - ✅ Workflow commits changed files with timestamped message

### Task 7 — Derived loaders (standings, top scorers)

- **Completed:** 2026-06-12 19:15
- **Files changed:** `src/data/standings.json.js`, `src/data/top-scorers.json.js`
- **What was done:** Created two derived Observable data loaders that compute derived datasets from raw scraped data. Standings loader aggregates group standings from matches.json with win/loss/draw counts, goal differential, and points (3 per win, 1 per draw). Top scorers loader aggregates player goals and assists across all player-stats files, extracting stats from array-based format.
- **Verification:** `npm run build` succeeds without error; both loaders output correct JSON structure and sort order
- **Acceptance criteria met:**
  - ✅ Standings loader outputs correct structure (team, group, played, w, d, l, gf, ga, gd, pts)
  - ✅ Standings sorted by group → points descending → goal difference descending
  - ✅ Top scorers loader outputs correct structure (player, team, goals, assists)
  - ✅ Top scorers sorted by goals descending → assists descending
  - ✅ Both build without error

### Task 8 — Goals heatmap + power rankings chart

- **Completed:** 2026-06-12 19:45
- **Files changed:** `src/index.md`, `src/data/latest-power-ranking.json.js`
- **What was done:** Added two new visualizations to the main dashboard using Observable Plot. Goals heatmap shows total goals per match over time using Plot.rect with color intensity. Power rankings chart displays teams ranked by aggregated player power scores (attacking, defensive, creativity) from the latest match power ranking data. Created latest-power-ranking loader to fetch the most recent power ranking file.
- **Verification:** `npm run build` succeeds, `npm run lint:fix` passes with no warnings, visualizations render with real data and tooltips
- **Acceptance criteria met:**
  - ✅ Heatmap renders with Plot.rect showing matches colored by total goals
  - ✅ Heatmap includes tooltips showing teams and score
  - ✅ Power rankings bar chart displays top 16 teams with scores
  - ✅ Power rankings include text labels showing power scores
  - ✅ Both charts render with real data from matches and power ranking files

### Task 9 — Standings tables + top scorers leaderboard

- **Completed:** 2026-06-12 19:55
- **Files changed:** `src/index.md`
- **What was done:** Added two data table sections to the main dashboard. Group Standings displays one table per tournament group showing team records (played, wins, draws, losses, goals for/against, goal differential, points) sorted by points then goal differential. Top Scorers Leaderboard displays the top 15 scorers with player name, team, goals, and assists columns. Both tables use HTML table elements with color-coded values (green for positive GD/goals, gold for rankings/points).
- **Verification:** `npm run build` succeeds without error, `npm run lint:fix` and `npm run format` pass clean, tables render with real data from standings and top-scorers loaders
- **Acceptance criteria met:**
  - ✅ Group standings tables show correct points calculation (3 per win, 1 per draw)
  - ✅ Standings correctly sorted by group, then points, then goal differential
  - ✅ Top scorers leaderboard displays ≥15 scorers (exceeds ≥10 requirement)
  - ✅ Leaderboard shows player, team, goals, assists columns with correct values
  - ✅ Both tables render with real match and player data

### Data Hierarchy Restructuring — match-scoped data consolidation

- **Completed:** 2026-06-12 20:15
- **Files changed:** `scripts/scrape.js`, `src/data/top-scorers.json.js`, `src/data/power-ranking-players.json.js`, `src/data/match-[id].json.js`, all `scraped-data/` match files
- **What was done:** Reorganized scraped-data from flat directory layout (timelines/, player-stats/, etc.) to hierarchical structure where all match-related data is co-located under `scraped-data/matches/{id}/`. Updated scraper to write to new nested paths, migrated all existing match data files, and updated all data loaders to read from new structure. Cleaned up old flat directories after successful migration.
- **Verification:** `npm run build` succeeds without error, `npx vitest run` passes all data tests, Playwright test confirms dashboard renders correctly with new structure, all linting and formatting passes
- **Acceptance criteria met:**
  - ✅ Scraper writes to `scraped-data/matches/{id}/{timeline,player-stats,power-ranking,match-stats,team-stats}.json`
  - ✅ All data loaders read from new nested paths
  - ✅ Existing data successfully migrated to new structure
  - ✅ Old flat directory structure cleaned up
  - ✅ Dashboard renders correctly with no missing data
  - ✅ All tests pass with deduplication regression test included

### Feature — Player Stats (expanded 20 fields)

- **Completed:** 2026-06-12 20:45
- **Files changed:** `src/data/player-stats.json.js` (renamed from `top-scorers.json.js`), `src/data/player-stats.json` (regenerated), `src/data/power-ranking-players.json` (generated), `src/index.md`
- **What was done:** Renamed "Top Scorers" to "Player Stats" and expanded from 4 to 20 fields. Loader now aggregates sum stats (goals, assists, passes, passesCompleted, penalties, penaltiesScored, speedRuns, sprints, timePlayed, totalDistance, 5 distance breakdowns) and average stats (avgSpeed, threat, topSpeed) across all matches per player. Dashboard table shows 12 key columns. Fixed syntax error (`\?.` → `?.`) in src/index.md that prevented module initialization. Generated `power-ranking-players.json` from loader.
- **Verification:** `npm run build` succeeds, `npm run lint:fix` and `npm run format` pass clean with zero warnings, Playwright debug test confirms 3 tables render with 0 errors in HTML output
- **Acceptance criteria met:**
  - ✅ Top Scorers renamed to Player Stats throughout
  - ✅ 15 new sum fields added (passes, passesCompleted, penalties, penaltiesScored, speedRuns, sprints, timePlayed, totalDistance, 5 distance breakdowns)
  - ✅ 3 average fields added (avgSpeed, threat, topSpeed)
  - ✅ Aggregation correctly sums integer stats and averages speed/threat stats
  - ✅ Dashboard table renders with 12 columns and no errors

### Feature — Homepage calendar-only + related loader cleanup

- **Completed:** 2026-06-12 21:05
- **Files changed:** `src/index.md`, `src/player-stats.md`, `observablehq.config.js`, `src/data/latest-power-ranking.json`, `src/data/standings.json`, `src/data/match-[id].json.js`
- **What was done:** Simplified the homepage so it only renders the match calendar/schedule chart. Kept player metrics on a dedicated `/player-stats` page and removed unused homepage-related data artifacts/loaders that were no longer referenced.
- **Verification:** `npm run build` succeeds and renders `/index` and `/player-stats`; runtime asset copy no longer includes removed data files.
- **Acceptance criteria met:**
  - ✅ Homepage contains only calendar/schedule content
  - ✅ Player stats are on a dedicated page
  - ✅ Unused loader/data artifacts tied to removed dashboard sections deleted
  - ✅ Build succeeds after cleanup

### Task 10 — Match page scaffold + routing

- **Completed:** 2026-06-12 21:30
- **Files changed:** `observablehq.config.js`, `src/matches/[id].md`
- **What was done:** Created parameterized match page template `src/matches/[id].md` that loads match metadata from matches.json and dynamically fetches per-match data files (timeline, team-stats, player-stats, power-ranking). Updated `observablehq.config.js` to add `dynamicPaths` async generator that reads all matches from `scraped-data/matches.json` and yields route paths for each match. Configured parametrized page entry for `/matches/:id`.
- **Verification:** `npm run build` succeeds, page template renders with match data lookup and error handling for missing per-match files. Dev server routes to specific match pages (e.g., `/matches/400021441`) with page.params.id populated.
- **Acceptance criteria met:**
  - ✅ `npm run build` succeeds
  - ✅ Parameterized page template created at `src/matches/[id].md`
  - ✅ `dynamicPaths` configured as async generator reading `scraped-data/matches.json`
  - ✅ Match metadata loads from matches.json; title renders as "Home Team vs Away Team"
  - ✅ Per-match data bundles load gracefully (null if missing)

### Feature — Match timeline tooltips: vertical multi-event layout

- **Completed:** 2026-06-13 14:50
- **Files changed:** `src/components/match-timeline-chart.js`
- **What was done:** Redesigned tooltip component to display events in a vertical, team-grouped format. When hovering over timeline markers, tooltip now shows: time header (e.g. "76'"), team labels (uppercase, secondary color), and all events at that minute grouped by team with color-coded left borders matching event type. Handles multi-team scenarios naturally (e.g., 76' marker showing 4 Mexico events + 2 South Africa events). Groups teams by match order (home first, then away). Improved visual hierarchy with better spacing, typography, and shadow treatment.
- **Verification:** Hovered over markers at various times (17', 74', 76', 79', 84') on localhost:3000/matches/400021443. Tooltips correctly display: (1) single events with time, team, description; (2) multiple events per team at same minute; (3) multi-team events at same minute with proper grouping. Color-coded borders match event category colors (blue for substitution, yellow for yellow card, gray for foul, etc.). `npm run lint:fix` and `npm run format` pass clean.
- **Acceptance criteria met:**
  - ✅ Tooltip displays in vertical format: time → team → events
  - ✅ Multiple events at same minute are grouped and displayed
  - ✅ Multi-team events handled with separate team labels
  - ✅ Event descriptions show from EventDescription.Description field
  - ✅ Color-coded left borders match event type colors
  - ✅ Tooltip positioning, shadow, and typography match dark theme design
  - ✅ No console errors or warnings

### Feature — Tooltip polish: instant hide + full event descriptions

- **Completed:** 2026-06-13 15:05
- **Files changed:** `src/components/match-timeline-chart.js`
- **What was done:** Polished tooltip behavior for better UX. (1) Removed 2.5-second auto-hide timeout; tooltip now disappears instantly when pointer leaves marker via mouseout handler. (2) Changed description priority to show full detailed event text (e.g., "Alexis VEGA (in) comes off the bench to replace Julian QUINONES (out) (Mexico)") instead of just event type labels (e.g., "Substitution"). Event description now takes priority over TypeLocalized, ensuring rich context is always visible.
- **Verification:** Tested on localhost:3000/matches/400021443. (1) Moved pointer away from markers at 76'; tooltip disappeared within 100ms (instant). (2) Hovered over 76' marker; tooltip shows full substitution descriptions with player names, actions, and team. Tested with fouls, substitutions, and yellow cards—all show complete event text. `npm run lint:fix` and `npm run format` pass clean.
- **Acceptance criteria met:**
  - ✅ Tooltip hides instantly on mouseout (no delay)
  - ✅ Event descriptions show full text from EventDescription.Description field
  - ✅ Substitution events show player names and actions
  - ✅ Foul events show player name and action text
  - ✅ Team grouping and color-coded borders preserved
  - ✅ Pointer-events properly managed on circle elements

### Feature — Tooltip positioning with @floating-ui/dom

- **Completed:** 2026-06-13 15:25
- **Files changed:** `src/components/match-timeline-chart.js`, `package.json`
- **What was done:** Integrated `@floating-ui/dom` library for intelligent tooltip positioning that automatically handles viewport collisions. Tooltips now position to the right of markers by default, with middleware stack: `offset(10)` for 10px spacing, `flip()` to switch to opposite side if near viewport edge, and `shift({ padding: 8 })` to prevent edge clipping. Resolved async/instant-hide conflict by tracking tooltip lifecycle with `tooltip.__isActive` flag—checked before applying positions from Promise resolution, preventing race conditions when user quickly moves pointer away.
- **Verification:** Tested on localhost:3000/matches/400021443 across multiple screen positions. (1) Tooltips position to right of marker by default. (2) When marker near right edge, tooltip flips to left side. (3) When marker near vertical edges, tooltip shifts within padding. (4) Instant hide still works despite async positioning—tooltip disappears within 100ms and no stale positions apply. (5) Full event descriptions render correctly with floating-ui positioning. `npm run lint:fix && npm run format` pass clean with no warnings in match-timeline-chart.js.
- **Acceptance criteria met:**
  - ✅ Tooltip positions with floating-ui library (offset 10px, flip/shift middleware)
  - ✅ Tooltips position right by default, flip left at viewport edge
  - ✅ Tooltips shift vertically if near top/bottom edge
  - ✅ Instant hide works correctly (no lingering stale tooltips)
  - ✅ Async Promise doesn't cause positioning race conditions
  - ✅ Full event descriptions display with correct positioning
  - ✅ No console errors or linting warnings
  - ✅ Package.json includes @floating-ui/dom dependency

### Feature — 6 Match Analytics Visualizations

- **Completed:** 2026-06-14 12:45
- **Files changed:** `src/components/shot-map.js`, `src/components/possession-progression.js`, `src/components/pressing-intensity.js`, `src/components/cross-efficiency.js`, `src/components/player-distance.js`, `src/components/defensive-actions.js`, `src/matches/[id].md`, `src/data/power-ranking.json.js`, `src/data/team-stats.json.js`
- **What was done:** Implemented comprehensive analytics suite for match detail pages with six new visualizations. Shot Map displays shot locations on soccer field with outcome classification (goal/on-target/off-target). Possession Progression compares ball progression efficiency with grouped bar charts. Pressing Intensity shows defensive pressure profile with recovery time metrics. Cross Efficiency tracks crossing effectiveness and goal-scoring from crosses. Player Workload visualizes player movement intensity across five speed categories. Defensive Actions displays fouls, turnovers, and cards with matrix layout. All components implement responsive sizing using Math.min() viewport calculations and SVG viewBox scaling. Integrated into match page template with conditional rendering based on data availability and graceful fallback messages for missing data.
- **Verification:** Tested on multiple match pages (400021458, 400021449) with `npm run dev` on localhost:3000. All 6 visualizations render correctly with real match data. Page reloads without console errors. Responsive layout tested with grid auto-fit and minmax(500px, 1fr). Data binding verified with null checks and graceful fallbacks. `npm run lint:fix && npm run format` pass with minor unused variable warnings (non-blocking).
- **Acceptance criteria met:**
  - ✅ Shot Map renders soccer field with shot locations and outcome legend
  - ✅ Possession Progression shows attempted vs completed passes for both teams
  - ✅ Pressing Intensity displays pressure counts and recovery time metrics
  - ✅ Cross Efficiency tracks crosses, completions, and goals from crosses
  - ✅ Player Workload visualizes player movement intensity (or shows "No player distance data")
  - ✅ Defensive Actions shows fouls, turnovers, and card indicators
  - ✅ All components use responsive sizing with Math.min() and viewBox
  - ✅ All components handle missing data gracefully
  - ✅ Integrated into match page template with conditional rendering
  - ✅ Tested across multiple match pages with real data
  - ✅ No console errors on page load or during interaction

### Feature — Player Intensity Chart

- **Completed:** 2026-06-14 15:30
- **Files changed:** `src/components/player-intensity.js` (created), `src/data/match-player-stats.json.js` (created), `src/matches/[id].md` (updated to integrate component)
- **What was done:** Implemented Player Intensity visualization component displaying top 12 players by total distance covered in a match. Chart shows stacked horizontal bars with four distinct intensity segments: Walking (light gray #9ca3af), Jogging (medium gray #6b7280), Running (light blue #60a5fa), and Sprinting (dark blue #1e40af). Player names extracted from liveData team rosters instead of generic P1/P2 labels. Each bar segment positioned cumulatively using D3 scales. On hover, tooltips display exact distance values per intensity category with format "Segment: X.XXkm". Created match-player-stats.json.js data loader aggregating per-match player statistics from scraped data into playerStatsMap keyed by playerId. Component handles missing data gracefully with empty state message.
- **Verification:** Tested on match pages 400021441, 400021443, 400021447 with `npm run dev` on localhost:3000. All 12 player names display correctly. Four-segment bars render with correct colors and opacity levels. Tooltips appear on hover showing correct intensity type and distance value (e.g., "Running: 1.82km", "Sprinting: 0.08km"). Bar segments accumulate correctly from left to right. `npm run build` succeeds without errors. `npm run lint:fix` and `npm run format` pass clean with no warnings in player-intensity.js.
- **Acceptance criteria met:**
  - ✅ Component displays top 12 players by total distance covered
  - ✅ Four movement intensity categories rendered as stacked bar segments
  - ✅ Colors correct: Walking (light gray), Jogging (medium gray), Running (light blue), Sprinting (dark blue)
  - ✅ Player names extracted from liveData instead of generic labels
  - ✅ Hover tooltips show exact distance per segment in format "Segment: X.XXkm"
  - ✅ Bar segments positioned cumulatively left to right
  - ✅ Responsive SVG sizing with viewBox
  - ✅ Legend displayed with all four intensity categories
  - ✅ Data loader aggregates player stats correctly from scraped data
  - ✅ Gracefully handles missing data
  - ✅ Tested on multiple match pages with real data
  - ✅ No console errors; lint and format pass clean
