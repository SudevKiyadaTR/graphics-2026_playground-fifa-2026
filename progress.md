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
| —    | ✅     | 2026-06-12   | Refactor: Data hierarchy restructuring     |
| —    | ✅     | 2026-06-12   | Feature: Player Stats (expanded 20 fields) |
| —    | ✅     | 2026-06-12   | Simplify homepage + loader cleanup         |

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
