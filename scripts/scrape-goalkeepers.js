import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Goalkeeper stats come from the Thomson Reuters / Opta feed (separate from the FIFA
// scraper in scrape.js). We pull the tournament match list, then per-match player stats,
// keep only players at position "Goalkeeper", and aggregate a tournament-wide table
// written to scraped-data/goalkeepers.json. The page reads that file directly.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../scraped-data");
const OUT_FILE = path.join(DATA_DIR, "goalkeepers.json");

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
    // Unplayed fixtures 404 with an XML body; treat any parse/network failure as "skip".
    return null;
  }
}

// stat[] is [{type, value}]; values are numeric strings. Missing types default to 0.
function statMap(player) {
  const m = {};
  for (const s of player.stat || []) m[s.type] = Number(s.value);
  return m;
}

// saves + goalsConceded is the standard save% denominator (on-target shots faced).
// null when the keeper faced nothing on target, so it drops out of ranked charts.
function ratio(num, den) {
  return den > 0 ? num / den : null;
}

async function main() {
  const matchesDoc = await fetchJson(`${OPTA_BASE}/matches.json`);
  const allMatches = matchesDoc?.matches?.match ?? [];
  const played = allMatches.filter(
    (m) => m.liveData?.matchDetails?.matchStatus === "Played"
  );
  console.log(`Found ${played.length} played matches (of ${allMatches.length}).`);

  // contestantId -> {name, code} from the match list; match-stats teams carry contestantId.
  const teamById = new Map();
  for (const m of allMatches) {
    for (const c of m.matchInfo?.contestant ?? []) {
      teamById.set(c.id, { name: c.name, code: c.code });
    }
  }

  const gks = new Map();
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
        if (p.position !== "Goalkeeper") continue;
        const s = statMap(p);
        // Only count keepers who were actually on the pitch this match.
        if (!(s.minsPlayed > 0)) continue;

        if (!gks.has(p.playerId)) {
          gks.set(p.playerId, {
            playerId: p.playerId,
            playerName: p.knownName || p.matchName || `${p.firstName} ${p.lastName}`.trim(),
            teamName: teamInfo.name,
            teamCode: teamInfo.code,
            appearances: 0,
            minsPlayed: 0,
            saves: 0,
            goalsConceded: 0,
            cleanSheets: 0,
            goalKicks: 0,
            penaltyFaced: 0,
            penaltySave: 0,
            totalClearance: 0,
            passes: 0,
            accuratePasses: 0,
          });
        }
        const gk = gks.get(p.playerId);
        gk.appearances += 1;
        gk.minsPlayed += s.minsPlayed || 0;
        gk.saves += s.saves || 0;
        gk.goalsConceded += s.goalsConceded || 0;
        gk.cleanSheets += s.cleanSheet || 0;
        gk.goalKicks += s.goalKicks || 0;
        gk.penaltyFaced += s.penaltyFaced || 0;
        gk.penaltySave += s.penaltySave || 0;
        gk.totalClearance += s.totalClearance || 0;
        gk.passes += s.totalPass || 0;
        gk.accuratePasses += s.accuratePass || 0;
      }
    }
  }

  const table = Array.from(gks.values())
    .map((gk) => ({
      ...gk,
      shotsFaced: gk.saves + gk.goalsConceded,
      savePct: ratio(gk.saves, gk.saves + gk.goalsConceded),
      passPct: ratio(gk.accuratePasses, gk.passes),
    }))
    .sort((a, b) => b.saves - a.saves);

  fs.writeFileSync(OUT_FILE, JSON.stringify(table, null, 2));
  console.log(`✓ Wrote ${table.length} goalkeepers from ${scanned} matches to ${OUT_FILE}`);
}

function selfCheck() {
  const assert = (c, m) => {
    if (!c) throw new Error(`selfCheck failed: ${m}`);
  };
  assert(ratio(3, 4) === 0.75, "save% = saves/(saves+conceded)");
  assert(ratio(0, 0) === null, "no shots faced -> null");
  const s = statMap({ stat: [{ type: "saves", value: "5" }, { type: "goalKicks", value: "4" }] });
  assert(s.saves === 5 && s.goalKicks === 4, "statMap parses numeric strings");
  console.log("✓ selfCheck passed");
}

if (process.argv.includes("--selfcheck")) {
  selfCheck();
} else {
  main();
}
