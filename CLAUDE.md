# FIFA 2026 Dashboard

## Project Overview

Self-updating tournament dashboard for FIFA World Cup 2026. A Node.js scraper hits the official FIFA APIs every 12 hours and writes raw JSON to `scraped-data/`. Observable Framework reads those files at build time and serves two levels of views: a main aggregated dashboard (schedule, group standings, top scorers, power rankings) and one static page per match (timeline, team stats, player stats, pre/post power ranking).

The scraper and dashboard are decoupled — the scraper runs on a cron/GitHub Actions schedule and commits updated data; the dashboard just reads whatever's on disk. No database, no server-side logic.

## Agent Behavior

### Before starting a task

Create a branch for each task:

```bash
git checkout main
git pull
git checkout -b task/N-<short-slug>   # e.g. task/1-scaffold, task/7-standings-loader
```

Work entirely on that branch. Do not commit directly to `main`.

---

After completing **every task**, the agent must do all three of these steps — no exceptions, no batching:

### 1. Update `progress.md`

Append a new entry under `## Task Log` in this format:

```markdown
### Task N — <task name>
- **Completed:** YYYY-MM-DD HH:MM
- **Files changed:** list every file created or modified
- **What was done:** 1–3 sentences describing what was implemented
- **Verification:** what was run/checked to confirm it works
- **Acceptance criteria met:** checklist from plan.md (copy and mark ✅/❌)
```

Also update the summary table at the top of `progress.md` — replace the placeholder row or add a new row for the completed task.

### 2. Commit and push the branch

```bash
git add -A
git commit -m "feat: complete Task N — <task name>"
git push -u origin task/N-<short-slug>
```

### 3. Merge to main

```bash
git checkout main
git merge --no-ff task/N-<short-slug> -m "feat(task-N): <task name>

<2–4 sentence description of what was built, why it matters, and any notable decisions or trade-offs.>"
git push
```

All three steps are **required before starting the next task**. Do not skip or defer them.

---

## Task Source

Tasks are defined in `tasks/plan.md`. Work through them in order. Stop at each Checkpoint for human review — do not continue past a Checkpoint without explicit instruction.

## Design Reference

All visual decisions must follow `DESIGN.md` (typography, colour tokens, chart conventions, spacing system).

## Tech Stack

- Observable Framework (`npm run dev`, `npm run build`)
- Node.js scraper (`scripts/scrape.js`)
- Observable Plot for all charts
- Dark theme: `["dashboard", "near-midnight"]`
