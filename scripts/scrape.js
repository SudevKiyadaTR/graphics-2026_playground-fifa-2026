import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../scraped-data");
const MANIFEST_FILE = path.join(DATA_DIR, ".scrape-manifest.json");

const BASE_URL = "https://api.fifa.com/api/v3";
const STATS_BASE_URL = "https://fdh-api.fifa.com/v1";
// Live match endpoint: https://api.fifa.com/api/v3/live/football/{matchId}?language=en
// Returns full squad rosters with player names, IDs, positions, and team assignments.
// Preferred source for player identity data — more complete than power-ranking or timeline.
const RATE_LIMIT_MS = 50;
const PER_MATCH_RATE_LIMIT_MS = 300;

// A finalized match's player-stats has full stat records (~112 fields) for players who
// featured. Truncated scrapes (feed not yet published) cap every record well below this.
// We treat a file as complete if ANY player has a full record — bench-player stubs, which
// are legitimately tiny, don't trip it because starters still carry full records.
const MIN_FULL_PLAYER_KEYS = 100;
// Cap re-fetches of a still-incomplete match so a permanently-thin upstream feed can't
// trigger an unbounded retry loop across daily runs.
const MAX_PLAYER_STATS_RETRIES = 5;

const FORCE = process.argv.includes("--force");

// Ensure output directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`HTTP ${response.status} fetching ${url}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Error fetching ${url}: ${error.message}`);
    return null;
  }
}

function shouldFetch(filepath) {
  if (FORCE) return true;
  return !fs.existsSync(filepath);
}

function loadManifest() {
  const empty = { lastScrape: null, scrapedMatches: {}, playerStatsRetries: {} };
  if (!fs.existsSync(MANIFEST_FILE)) return empty;
  try {
    return { ...empty, ...JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8")) };
  } catch {
    return empty;
  }
}

// True when the file exists and holds at least one full player record — i.e. the match's
// stats feed was finalized when scraped, not a truncated/pre-publish snapshot.
function recordsComplete(data) {
  return Object.values(data || {}).some(
    (r) => Array.isArray(r) && r.length >= MIN_FULL_PLAYER_KEYS
  );
}

function playerStatsComplete(filepath) {
  if (!fs.existsSync(filepath)) return false;
  try {
    return recordsComplete(JSON.parse(fs.readFileSync(filepath, "utf-8")));
  } catch {
    return false;
  }
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

function isFinishedMatch(match) {
  return (
    match.winner !== null || Number(match.period || 0) >= 10 || Number(match.resultType || 0) > 0
  );
}

function getMatchesToScrape(matches, manifest) {
  if (FORCE) return matches.filter((m) => m.propertyId && isFinishedMatch(m));

  return matches.filter((match) => {
    if (!match.propertyId) return false;
    if (!isFinishedMatch(match)) return false;
    if (!manifest.scrapedMatches[match.id]) return true;
    // Already scraped: revisit only if player-stats came back incomplete and we still
    // have retries left (lets the data self-heal if FIFA finalizes the feed later).
    const filepath = path.join(DATA_DIR, "matches", String(match.id), "player-stats.json");
    const retries = manifest.playerStatsRetries[match.id] ?? 0;
    return !playerStatsComplete(filepath) && retries < MAX_PLAYER_STATS_RETRIES;
  });
}

async function fetchMatches() {
  const matches = [];
  let continuationToken = null;
  let pageCount = 0;

  console.log("Fetching 2026 FIFA World Cup matches...");

  do {
    try {
      const params = new URLSearchParams({
        from: "2026-06-10",
        to: "2026-07-21",
        language: "en",
        count: "500",
        idCompetition: "17",
      });

      if (continuationToken) {
        params.append("ContinuationToken", continuationToken);
      }

      const url = `${BASE_URL}/calendar/matches?${params}`;
      console.log(`Fetching page ${pageCount + 1}...`);

      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`HTTP ${response.status} fetching matches page ${pageCount + 1}`);
        break;
      }

      const data = await response.json();
      pageCount++;

      if (data.Results && Array.isArray(data.Results)) {
        const normalized = data.Results.map((match) => {
          const stage = Array.isArray(match.StageName)
            ? match.StageName[0]?.Description || "Unknown"
            : match.StageName || "Unknown";
          const group = Array.isArray(match.GroupName)
            ? match.GroupName[0]?.Description || null
            : match.GroupName || null;

          return {
            id: match.IdMatch,
            propertyId: match.Properties?.IdIFES || null,
            homeTeam:
              match.Home?.TeamName?.[0]?.Description || match.Home?.ShortClubName || "Unknown",
            awayTeam:
              match.Away?.TeamName?.[0]?.Description || match.Away?.ShortClubName || "Unknown",
            date: match.Date,
            // Use nullish coalescing so legitimate zero scores are preserved.
            homeScore: match.Home?.Score ?? null,
            awayScore: match.Away?.Score ?? null,
            winner: match.Winner ?? null,
            period: match.Period ?? null,
            resultType: match.ResultType ?? null,
            stage,
            group,
          };
        });

        const nowMs = Date.now();
        for (const match of normalized) {
          if (!match.propertyId) continue;

          const kickoffMs = Date.parse(match.date);
          const isPastKickoff = Number.isFinite(kickoffMs) && kickoffMs <= nowMs;
          const hasCompletePair = match.homeScore !== null && match.awayScore !== null;
          if (!isPastKickoff || hasCompletePair) continue;

          const live = await fetchJson(`${BASE_URL}/live/football/${match.id}?language=en`);
          if (!live) continue;

          const liveHomeScore = live.HomeTeam?.Score ?? null;
          const liveAwayScore = live.AwayTeam?.Score ?? null;
          const liveWinner = live.Winner ?? null;
          const livePeriod = live.Period ?? null;
          const liveResultType = live.ResultType ?? null;

          const hasLiveResultSignal =
            liveHomeScore !== null ||
            liveAwayScore !== null ||
            liveWinner !== null ||
            Number(livePeriod || 0) >= 10 ||
            Number(liveResultType || 0) > 0;

          if (!hasLiveResultSignal) continue;

          const resultLooksFinal =
            liveWinner !== null || Number(livePeriod || 0) >= 10 || Number(liveResultType || 0) > 0;

          if (resultLooksFinal) {
            match.homeScore = liveHomeScore ?? match.homeScore ?? 0;
            match.awayScore = liveAwayScore ?? match.awayScore ?? 0;
          } else {
            if (liveHomeScore !== null) match.homeScore = liveHomeScore;
            if (liveAwayScore !== null) match.awayScore = liveAwayScore;
          }

          match.winner = liveWinner;
          match.period = livePeriod;
          match.resultType = liveResultType;

          await sleep(RATE_LIMIT_MS);
        }

        matches.push(...normalized);
      }

      continuationToken = data.ContinuationToken || null;

      // Rate limiting
      if (continuationToken) {
        await sleep(RATE_LIMIT_MS);
      }
    } catch (error) {
      console.warn(`Error fetching page ${pageCount + 1}: ${error.message}`);
      break;
    }
  } while (continuationToken);

  console.log(`Fetched ${matches.length} matches across ${pageCount} pages`);
  return matches;
}

async function fetchTimelines(matches) {
  console.log("\nFetching match timelines...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const matchDir = path.join(DATA_DIR, "matches", String(match.id));
    await ensureDir(matchDir);
    const filepath = path.join(matchDir, "timeline.json");
    if (!shouldFetch(filepath)) {
      skipped++;
      continue;
    }

    const url = `${BASE_URL}/timelines/${match.id}?language=en`;

    try {
      const data = await fetchJson(url);
      if (data) {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        fetched++;
      }
      await sleep(PER_MATCH_RATE_LIMIT_MS);
    } catch (error) {
      console.warn(`Error processing timeline for ${match.id}: ${error.message}`);
    }
  }

  console.log(`✓ Fetched ${fetched} timelines (skipped ${skipped} existing)`);
}

async function fetchTeamsEndpoint(matches, label, filename) {
  console.log(`\nFetching ${label}...`);
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const matchDir = path.join(DATA_DIR, "matches", String(match.id));
    await ensureDir(matchDir);
    const filepath = path.join(matchDir, filename);
    if (!shouldFetch(filepath)) {
      skipped++;
      continue;
    }

    const url = `${STATS_BASE_URL}/stats/match/${match.propertyId}/teams.json`;

    try {
      const data = await fetchJson(url);
      if (data) {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        fetched++;
      }
      await sleep(PER_MATCH_RATE_LIMIT_MS);
    } catch (error) {
      console.warn(`Error processing ${label} for ${match.id}: ${error.message}`);
    }
  }

  console.log(`✓ Fetched ${fetched} ${label} (skipped ${skipped} existing)`);
}

async function fetchPlayerStats(matches, manifest) {
  console.log("\nFetching player statistics...");
  let fetched = 0;
  let skipped = 0;
  let stillIncomplete = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const matchDir = path.join(DATA_DIR, "matches", String(match.id));
    await ensureDir(matchDir);
    const filepath = path.join(matchDir, "player-stats.json");
    const complete = playerStatsComplete(filepath);
    // Skip only files that are already present AND complete (unless --force).
    if (!FORCE && fs.existsSync(filepath) && complete) {
      skipped++;
      continue;
    }

    const url = `${STATS_BASE_URL}/stats/match/${match.propertyId}/players.json`;

    try {
      const data = await fetchJson(url);
      if (data) {
        const newComplete = recordsComplete(data);
        // Never overwrite a complete file with an incomplete refetch (guards --force too).
        if (!fs.existsSync(filepath) || !complete || newComplete) {
          fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
          fetched++;
        }
        if (newComplete) {
          delete manifest.playerStatsRetries[match.id];
        } else {
          manifest.playerStatsRetries[match.id] = (manifest.playerStatsRetries[match.id] ?? 0) + 1;
          stillIncomplete++;
        }
      }
      await sleep(PER_MATCH_RATE_LIMIT_MS);
    } catch (error) {
      console.warn(`Error processing player stats for ${match.id}: ${error.message}`);
    }
  }

  const tail = stillIncomplete ? `, ${stillIncomplete} still incomplete upstream` : "";
  console.log(`✓ Fetched ${fetched} player statistics (skipped ${skipped} complete${tail})`);
}

async function fetchLiveMatchData(matches) {
  console.log("\nFetching live match data (player rosters)...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    const matchDir = path.join(DATA_DIR, "matches", String(match.id));
    await ensureDir(matchDir);
    const filepath = path.join(matchDir, "live.json");
    if (!shouldFetch(filepath)) {
      skipped++;
      continue;
    }

    const url = `${BASE_URL}/live/football/${match.id}?language=en`;

    try {
      const data = await fetchJson(url);
      if (data) {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        fetched++;
      }
      await sleep(PER_MATCH_RATE_LIMIT_MS);
    } catch (error) {
      console.warn(`Error processing live data for ${match.id}: ${error.message}`);
    }
  }

  console.log(`✓ Fetched ${fetched} live match records (skipped ${skipped} existing)`);
}

async function fetchPowerRanking(matches) {
  console.log("\nFetching power rankings...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const matchDir = path.join(DATA_DIR, "matches", String(match.id));
    await ensureDir(matchDir);
    const filepath = path.join(matchDir, "power-ranking.json");
    if (!shouldFetch(filepath)) {
      skipped++;
      continue;
    }

    const url = `${STATS_BASE_URL}/powerranking/match/${match.propertyId}.json`;

    try {
      const data = await fetchJson(url);
      if (data) {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        fetched++;
      }
      await sleep(PER_MATCH_RATE_LIMIT_MS);
    } catch (error) {
      console.warn(`Error processing power ranking for ${match.id}: ${error.message}`);
    }
  }

  console.log(`✓ Fetched ${fetched} power rankings (skipped ${skipped} existing)`);
}

async function main() {
  try {
    const manifest = loadManifest();
    const matches = await fetchMatches();

    const outputPath = path.join(DATA_DIR, "matches.json");
    fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2));
    console.log(`✓ Written ${matches.length} matches to ${outputPath}`);

    const toScrape = getMatchesToScrape(matches, manifest);
    console.log(`\nProcessing ${toScrape.length} matches for per-match data...`);

    if (toScrape.length === 0) {
      console.log("No new matches to scrape.");
      process.exit(0);
    }

    await fetchTimelines(toScrape);
    await fetchTeamsEndpoint(toScrape, "match statistics", "match-stats.json");
    await fetchTeamsEndpoint(toScrape, "team statistics", "team-stats.json");
    await fetchPlayerStats(toScrape, manifest);
    await fetchPowerRanking(toScrape);
    await fetchLiveMatchData(toScrape);

    toScrape.forEach((m) => {
      manifest.scrapedMatches[m.id] = true;
    });
    manifest.lastScrape = new Date().toISOString();
    saveManifest(manifest);

    console.log("\n✓ Scraping complete");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

function selfCheck() {
  const full = Array.from({ length: MIN_FULL_PLAYER_KEYS }, (_, i) => [`k${i}`, 0]);
  const stub = [["TimePlayed", 14.2]];
  const assert = (c, m) => {
    if (!c) throw new Error(`selfCheck failed: ${m}`);
  };
  // A file with any full record is complete, even alongside bench stubs.
  assert(recordsComplete({ a: full, b: stub }), "full+stub should be complete");
  // All-thin (truncated scrape) is incomplete; so is an empty payload.
  assert(!recordsComplete({ a: stub, b: stub }), "all-stub should be incomplete");
  assert(!recordsComplete({}), "empty should be incomplete");
  console.log("✓ selfCheck passed");
}

if (process.argv.includes("--selfcheck")) {
  selfCheck();
} else {
  main();
}
