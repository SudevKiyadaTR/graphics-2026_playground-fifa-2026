# FIFA World Cup 2026 — Conventions & Rules Guide for LLMs

## Tournament Structure

### Format (2026 Expansion)

- **Groups:** 12 groups of 4 teams each (48 teams total, expanded from 32)
- **Group Stage:** June 10 - July 2, 2026
  - Each team plays 3 matches (one per opponent)
  - Win = 3 points, Draw = 1 point, Loss = 0 points
  - Top 2 teams advance to knockout stage
- **Knockout Stage:** July 3 - July 21, 2026
  - Round of 16 (16 teams)
  - Quarterfinals (8 teams)
  - Semifinals (4 teams)
  - Finals (2 teams) — July 21, 2026

### Hosts

USA, Canada, Mexico (three countries)

---

## Score Notation & Display

### Score Format

- **Notation:** `HomeScore-AwayScore` (e.g., "2-1" means home team scored 2, away team scored 1)
- **Null/Pending:** Unplayed matches display as "TBD" or "—" (not "0-0")
- **After Extra Time:** If applicable, show final score only (extra time is included in final)
- **Penalty Shootout:** Show as `ScoreAfterET (Penalties PenaltyScore)` or `2-2 (5-4 PSO)`

### Display Conventions

- Always use dash (`-`) as separator, not other characters
- Left side = home team, right side = away team
- Scores should be in bold/highlighted for emphasis
- Group stage scores are final; no need to distinguish from knockout

### Color Coding in Tables/Charts

- **Played match:** Green (#10b981 or `--positive`) for completed scores
- **Pending/TBD:** Gray/muted (#9ca3af or `--series-3`) for unplayed matches
- **Draw:** May be visually distinct from wins/losses depending on context

---

## Football/Soccer Rules (Key Basics)

### Match Duration

- **Group/Knockout:** 90 minutes (two 45-minute halves)
- **Extra Time (Knockout only):** 30 minutes (two 15-minute periods) if tied after 90 min
- **Penalty Shootout:** If still tied after extra time, each team takes 5 penalties; sudden death if needed

### Scoring

- **Goal:** Ball crosses goal line between goalposts (awarded 1 point)
- **Own Goal:** Defender scores on own team (counts as goal for opposing team)
- **No Offside in Throw-Ins:** Players can be ahead of all opponents during throw-in

### Key Rules

- **Offside:** Attacking player is in illegal position if nearer to goal line than both ball and defending team's last two players (applies at moment ball is played to them)
- **Handball:** Deliberate hand contact results in penalty kick or free kick
- **Fouls:** Tackle from behind, excessive force, or contact with opposing player before ball
- **Yellow Card:** Caution (two yellows = red card ejection)
- **Red Card:** Direct ejection (serious foul, violent conduct, or two yellows)
- **Substitutions:** 3-5 allowed per team per match (rules vary by tournament)

### Playoff/Knockout Tiebreaker

1. Goals scored in 90 minutes
2. Away goals (only applicable in two-leg ties; not used in single-match 2026 format)
3. Extra time (30 min)
4. Penalty shootout

---

## 2026 World Cup Specific Rules

### Group Stage Advancement

- **Top 2 from each group advance** (12 groups = 24 teams advancing)
- **Tiebreaker within group:**
  1. Points (W=3, D=1, L=0)
  2. Goal difference (goals for - goals against)
  3. Goals scored
  4. Head-to-head record (if applicable)
  5. Fair play (yellow/red cards)
  6. FIFA ranking

### Expanded Format Implications

- More matches overall (80 total vs. 64 in 2022)
- Knockout stage larger (16→8→4→2 instead of 16→8→4→2)
- Some group stage matches may be simultaneous to prevent collusion

### VAR (Video Assistant Referee)

- Used for clear and obvious errors only
- Reviewed for: goals, penalties, red cards, mistaken identity
- Decisions are final; no coach challenges

---

## Terminology & Conventions

### Team References

- **Home Team:** Listed first in score notation (e.g., "USA vs Mexico" → USA is home)
- **Away Team:** Listed second (opponent traveling to match)
- **Neutral Venue:** Both teams technically "away" but one is designated home for scheduling

### Match Classification

- **Group Match:** Regular season play (GS, Gr., or "Group Stage")
- **Round of 16:** First knockout round (R16, KO Round 1)
- **Quarterfinal:** 8 teams remain (QF)
- **Semifinal:** 4 teams remain (SF)
- **Final:** 2 teams remain (Championship)
- **Third Place:** Semifinal losers play for 3rd place (optional in some tournaments)

### Player Stats

- **Goals:** Number of goals scored (sum across all matches in tournament or per match)
- **Assists:** Passes leading directly to a goal
- **Yellow/Red:** Disciplinary record
- **Minutes Played:** Total or per match

### Team Stats

- **Possession:** Percentage of time team controlled ball
- **Shots:** Total attempts on goal (includes shots off target)
- **Shots on Target:** Attempts that would score if not blocked/saved
- **Passes:** Total or completion percentage
- **Tackles:** Defensive challenges won
- **Fouls Committed:** Total rule violations

---

## Data Display Standards

### Match Schedule Table

- **Columns:** Date, Match (Home vs Away), Score, Stage
- **Sort:** Chronological (earliest first)
- **Date Format:** "Jun 10" or "Jun 10, 2026" (context-dependent)
- **Time:** Optional (include if timezone-relevant)

### Group Standings Table

- **Columns:** Rank, Team, Matches Played (MP), Wins (W), Draws (D), Losses (L), Goals For (GF), Goals Against (GA), Goal Difference (GD), Points (Pts)
- **Sort:** By points (descending), then goal difference (descending)
- **Highlight:** Top 2 teams advancing

### Top Scorers Table

- **Columns:** Rank, Player, Team, Goals, Matches Played, Assists (optional)
- **Sort:** By goals (descending), then by matches (ascending) for efficiency metric

---

## Edge Cases & Conventions

### Unplayed Matches

- Display score as **"TBD"** or **"—"** (not "0-0" or "vs")
- Color differently from completed matches
- Do not count toward player/team statistics until completed

### Postponed/Cancelled Matches

- Mark as "Postponed" with rescheduled date if known
- Exclude from standings until rescheduled date passes

### Penalty Shootout Notation

- **Option A:** "2-2 (4-5 PSO)" — shows 90-min score, then penalties
- **Option B:** "2-2 AET, 4-5 PSO" — more explicit
- Use Option A for brevity in dashboards

### Goal Scorers

- List as: **Player Name (Team) — Minute'**
- If own goal: **Player Name (Own Goal) — Minute'**

### Multi-Match Days

- Group multiple matches on same date in chronological order (by kickoff time if available)
- Group by stage if visual separation needed

---

## Common Mistakes to Avoid

1. **Score reversal:** Always verify home/away order; "USA vs Mexico 3-0" ≠ "Mexico vs USA 3-0"
2. **TBD as zero:** Never show "0-0" for unplayed matches; use "TBD"
3. **Goal difference calculation:** GF - GA (not GA - GF)
4. **Penalty shootout winner determination:** Winner is team with more penalties scored (not based on 90-min score)
5. **Group advancement:** Only top 2 (not 3) teams advance in 2026 format
6. **Date/timezone confusion:** Always specify timezone or use UTC for clarity
7. **Player duplication:** Same player on same team counted once (not duplicated across matches)

---

## References

- **Tournament Format:** 2026 FIFA World Cup official rules
- **Scoring System:** 3 points for win, 1 for draw, 0 for loss
- **Tiebreaker:** Points → GD → GF → H2H → Fair Play → FIFA Ranking
- **Venues:** 12 stadiums across USA, Canada, Mexico
- **Dates:** June 10 - July 21, 2026
