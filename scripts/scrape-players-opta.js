import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Player stats from the Thomson Reuters / Opta feed, for all positions (not just
// goalkeepers — see scrape-goalkeepers.js). Writes both per-match rows and a
// tournament-consolidated table to scraped-data/players-opta.json; the
// player-stats-opta page reads that file directly.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../scraped-data");
const OUT_FILE = path.join(DATA_DIR, "players-opta.json");

const OPTA_BASE =
  "https://graphics.thomsonreuters.com/data/2026/opta/soccer/873cbl9cd9butm4air0mugxzo";
const RATE_LIMIT_MS = 120;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// stat[] is [{type, value}]; values are numeric strings. Missing types default to 0.
function statMap(player) {
  const m = {};
  for (const s of player.stat || []) m[s.type] = Number(s.value);
  return m;
}

async function main() {
  const matchesDoc = await fetchJson(`${OPTA_BASE}/matches.json`);
  const allMatches = matchesDoc?.matches?.match ?? [];
  const played = allMatches.filter(
    (m) => m.liveData?.matchDetails?.matchStatus === "Played"
  );
  console.log(`Found ${played.length} played matches (of ${allMatches.length}).`);

  const teamById = new Map();
  for (const m of allMatches) {
    for (const c of m.matchInfo?.contestant ?? []) {
      teamById.set(c.id, { name: c.name, code: c.code });
    }
  }

  const matchRows = [];
  const consolidated = new Map();
  let scanned = 0;

  for (const m of played) {
    const id = m.matchInfo.id;
    const stats = await fetchJson(`${OPTA_BASE}/match-stats/${id}.json`);
    await sleep(RATE_LIMIT_MS);
    if (!stats) {
      console.warn(`  skip ${id} (no stats)`);
      continue;
    }
    scanned++;

    for (const team of Object.values(stats)) {
      const teamInfo = teamById.get(team.contestantId) || { name: "Unknown", code: "" };
      for (const p of team.player || []) {
        const s = statMap(p);
        if (!(s.minsPlayed > 0)) continue;

        const playerName = p.knownName || p.matchName || `${p.firstName} ${p.lastName}`.trim();
        matchRows.push({
          matchId: id,
          playerName,
          teamName: teamInfo.name,
          teamCode: teamInfo.code,
          ...s,
        });

        if (!consolidated.has(p.playerId)) {
          consolidated.set(p.playerId, {
            playerName,
            teamName: teamInfo.name,
            teamCode: teamInfo.code,
            matchCount: 0,
          });
        }
        const row = consolidated.get(p.playerId);
        row.matchCount += 1;
        for (const [k, v] of Object.entries(s)) {
          row[k] = (row[k] ?? 0) + v;
        }
      }
    }
  }

  const consolidatedRows = Array.from(consolidated.values()).sort(
    (a, b) => (b.goals ?? 0) - (a.goals ?? 0)
  );

  fs.writeFileSync(OUT_FILE, JSON.stringify({ matchRows, consolidatedRows }, null, 2));
  console.log(
    `✓ Wrote ${matchRows.length} match rows / ${consolidatedRows.length} players from ${scanned} matches to ${OUT_FILE}`
  );
}

function selfCheck() {
  const assert = (c, m) => {
    if (!c) throw new Error(`selfCheck failed: ${m}`);
  };
  const s = statMap({ stat: [{ type: "goals", value: "2" }, { type: "totalPass", value: "34" }] });
  assert(s.goals === 2 && s.totalPass === 34, "statMap parses numeric strings");
  console.log("✓ selfCheck passed");
}

if (process.argv.includes("--selfcheck")) {
  selfCheck();
} else {
  main();
}
