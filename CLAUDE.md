# FIFA 2026 Dashboard

## Agent Behavior

After completing **every task**, the agent must do both of these steps — no exceptions, no batching:

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

### 2. Commit and push

```bash
git add -A
git commit -m "feat: complete Task N — <task name>"
git push
```

Both steps are **required before starting the next task**. Do not skip or defer them.

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
