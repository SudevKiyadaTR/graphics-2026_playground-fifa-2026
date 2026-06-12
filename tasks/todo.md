# FIFA 2026 Dashboard — Task List

## Phase 1: Foundation + Thin Vertical Slice

- [ ] **Task 1** — Scaffold project (Observable Framework init, directories, `.gitignore`, `package.json`)
- [ ] **Task 2** — Scraper: fetch matches list → `scraped-data/matches.json`
- [ ] **Task 3** — Matches data loader + schedule chart on `src/index.md` (thin E2E slice)

### Checkpoint 1

- [ ] Scraper runs, dev server shows schedule chart, build passes — **human review**

---

## Phase 2: Full Scraper + Per-Match Data Layer

- [ ] **Task 4** — Scraper: per-match data (timeline, stats, team stats, player stats, power ranking)
- [ ] **Task 5** — Parameterised per-match data loader (`src/data/match-[id].json.js`)
- [ ] **Task 6** — Schedule: `cron/schedule.sh` + `.github/workflows/scrape.yml` (every 12h)

### Checkpoint 2

- [ ] All scraped-data subdirectories populated, loader outputs valid bundle, schedule script works — **human review**

---

## Phase 3: Main Dashboard Visualisations

- [ ] **Task 7** — Derived loaders: `standings.json.js` + `top-scorers.json.js`
- [ ] **Task 8** — Main dashboard: goals heatmap + power rankings chart
- [ ] **Task 9** — Main dashboard: standings table + top scorers leaderboard

### Checkpoint 3

- [ ] All five main dashboard sections render with real data — **human review**

---

## Phase 4: Individual Match Pages

- [ ] **Task 10** — Match page scaffold: `src/matches/[id].md` + `dynamicPaths` config
- [ ] **Task 11** — Match page: timeline visualisation (goals, cards, subs)
- [ ] **Task 12** — Match page: team stats comparison + player stats table
- [ ] **Task 13** — Match page: power ranking before/after comparison

### Checkpoint 4

- [ ] Every played match renders with all four sections — **human review**

---

## Phase 5: Config and Polish

- [ ] **Task 14** — Full sidebar config + dark theme (`near-midnight`)
- [ ] **Task 15** — README + setup docs (scraper usage, cron, deploy)

### Checkpoint 5

- [ ] Full `scrape → build` pipeline works, all sections populated, README accurate — **ready to deploy**
