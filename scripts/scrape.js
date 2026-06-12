import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../scraped-data");
const MANIFEST_FILE = path.join(DATA_DIR, ".scrape-manifest.json");

const BASE_URL = "https://api.fifa.com/api/v3";
const STATS_BASE_URL = "https://fdh-api.fifa.com/v1";
const RATE_LIMIT_MS = 50;
const PER_MATCH_RATE_LIMIT_MS = 300;

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
  if (!fs.existsSync(MANIFEST_FILE)) {
    return { lastScrape: null, scrapedMatches: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));
  } catch {
    return { lastScrape: null, scrapedMatches: {} };
  }
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

function getMatchesToScrape(matches, manifest) {
  const now = new Date();

  return matches.filter((match) => {
    const matchDate = new Date(match.date);

    if (FORCE) return match.propertyId;

    if (!match.propertyId) return false;

    const alreadyScrapped = manifest.scrapedMatches[match.id];
    if (alreadyScrapped) return false;

    return matchDate <= now;
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
            homeScore: match.Home?.Score || null,
            awayScore: match.Away?.Score || null,
            stage,
            group,
          };
        });

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
  const timelinesDir = path.join(DATA_DIR, "timelines");
  await ensureDir(timelinesDir);

  console.log("\nFetching match timelines...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const filepath = path.join(timelinesDir, `${match.id}.json`);
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

async function fetchMatchStats(matches) {
  const statsDir = path.join(DATA_DIR, "match-stats");
  await ensureDir(statsDir);

  console.log("\nFetching match statistics...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const filepath = path.join(statsDir, `${match.id}.json`);
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
      console.warn(`Error processing match stats for ${match.id}: ${error.message}`);
    }
  }

  console.log(`✓ Fetched ${fetched} match statistics (skipped ${skipped} existing)`);
}

async function fetchTeamStats(matches) {
  const statsDir = path.join(DATA_DIR, "team-stats");
  await ensureDir(statsDir);

  console.log("\nFetching team statistics...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const filepath = path.join(statsDir, `${match.id}.json`);
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
      console.warn(`Error processing team stats for ${match.id}: ${error.message}`);
    }
  }

  console.log(`✓ Fetched ${fetched} team statistics (skipped ${skipped} existing)`);
}

async function fetchPlayerStats(matches) {
  const statsDir = path.join(DATA_DIR, "player-stats");
  await ensureDir(statsDir);

  console.log("\nFetching player statistics...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const filepath = path.join(statsDir, `${match.id}.json`);
    if (!shouldFetch(filepath)) {
      skipped++;
      continue;
    }

    const url = `${STATS_BASE_URL}/stats/match/${match.propertyId}/players.json`;

    try {
      const data = await fetchJson(url);
      if (data) {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        fetched++;
      }
      await sleep(PER_MATCH_RATE_LIMIT_MS);
    } catch (error) {
      console.warn(`Error processing player stats for ${match.id}: ${error.message}`);
    }
  }

  console.log(`✓ Fetched ${fetched} player statistics (skipped ${skipped} existing)`);
}

async function fetchPowerRanking(matches) {
  const powerDir = path.join(DATA_DIR, "power-ranking");
  await ensureDir(powerDir);

  console.log("\nFetching power rankings...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const filepath = path.join(powerDir, `${match.id}.json`);
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
    await fetchMatchStats(toScrape);
    await fetchTeamStats(toScrape);
    await fetchPlayerStats(toScrape);
    await fetchPowerRanking(toScrape);

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

main();
