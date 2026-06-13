import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../scraped-data");
const MANIFEST_FILE = path.join(DATA_DIR, ".scrape-manifest.json");
const STADIUMS_FILE = path.join(__dirname, "stadium-coordinates.json");

const BASE_URL = "https://api.fifa.com/api/v3";
const STATS_BASE_URL = "https://fdh-api.fifa.com/v1";
// Live match endpoint: https://api.fifa.com/api/v3/live/football/{matchId}?language=en
// Returns full squad rosters with player names, IDs, positions, and team assignments.
// Preferred source for player identity data — more complete than power-ranking or timeline.
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

function isFinishedMatch(match) {
  return (
    match.winner !== null || Number(match.period || 0) >= 10 || Number(match.resultType || 0) > 0
  );
}

function getMatchesToScrape(matches, manifest) {
  if (FORCE) return matches.filter((m) => m.propertyId && isFinishedMatch(m));

  return matches.filter((match) => {
    if (!match.propertyId) return false;
    if (manifest.scrapedMatches[match.id]) return false;
    // Only scrape finished matches.
    return isFinishedMatch(match);
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

        const finishedOnly = normalized.filter((match) => isFinishedMatch(match));
        matches.push(...finishedOnly);
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

async function fetchMatchStats(matches) {
  console.log("\nFetching match statistics...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const matchDir = path.join(DATA_DIR, "matches", String(match.id));
    await ensureDir(matchDir);
    const filepath = path.join(matchDir, "match-stats.json");
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
  console.log("\nFetching team statistics...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const matchDir = path.join(DATA_DIR, "matches", String(match.id));
    await ensureDir(matchDir);
    const filepath = path.join(matchDir, "team-stats.json");
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
  console.log("\nFetching player statistics...");
  let fetched = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.propertyId) {
      continue;
    }

    const matchDir = path.join(DATA_DIR, "matches", String(match.id));
    await ensureDir(matchDir);
    const filepath = path.join(matchDir, "player-stats.json");
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

async function enrichWeatherData(matches) {
  console.log("\nEnriching match data with historical weather...");

  const stadiums = JSON.parse(fs.readFileSync(STADIUMS_FILE, "utf-8")).stadiums;
  let enriched = 0;

  for (const match of matches) {
    const matchDir = path.join(DATA_DIR, "matches", String(match.id));
    const liveFile = path.join(matchDir, "live.json");

    if (!fs.existsSync(liveFile)) continue;

    try {
      const liveData = JSON.parse(fs.readFileSync(liveFile, "utf-8"));

      // Skip if weather already populated
      if (liveData.Weather && liveData.Weather.Temperature !== null) {
        continue;
      }

      // Get stadium coordinates
      const stadiumName = liveData.Stadium?.Name?.[0]?.Description;
      if (!stadiumName || !stadiums[stadiumName]) {
        continue;
      }

      const { lat, lon } = stadiums[stadiumName];
      const matchDate = liveData.LocalDate
        ? new Date(liveData.LocalDate).toISOString().split("T")[0]
        : null;

      if (!matchDate) continue;

      // Fetch historical weather from Open-Meteo
      const weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${matchDate}&end_date=${matchDate}&hourly=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`;

      const response = await fetch(weatherUrl);
      if (!response.ok) {
        console.warn(`Could not fetch weather for ${stadiumName}`);
        continue;
      }

      const weatherData = await response.json();

      if (weatherData.hourly && weatherData.hourly.temperature_2m.length > 0) {
        // Get the temperature at match time (noon as default)
        const matchHour = 12;
        const tempIndex = Math.min(matchHour, weatherData.hourly.temperature_2m.length - 1);

        const temperature = weatherData.hourly.temperature_2m[tempIndex];
        const humidity = weatherData.hourly.relative_humidity_2m[tempIndex];
        const windSpeed = weatherData.hourly.wind_speed_10m[tempIndex];
        const weatherCode = weatherData.hourly.weather_code[tempIndex];

        // Map weather code to description
        const weatherTypes = {
          0: "Clear sky",
          1: "Mainly clear",
          2: "Partly cloudy",
          3: "Overcast",
          45: "Foggy",
          48: "Foggy",
          51: "Light drizzle",
          53: "Moderate drizzle",
          55: "Dense drizzle",
          61: "Slight rain",
          63: "Moderate rain",
          65: "Heavy rain",
          71: "Slight snow",
          73: "Moderate snow",
          75: "Heavy snow",
          77: "Snow grains",
          80: "Slight rain showers",
          81: "Moderate rain showers",
          82: "Violent rain showers",
          85: "Slight snow showers",
          86: "Heavy snow showers",
          95: "Thunderstorm",
          96: "Thunderstorm with hail",
          99: "Thunderstorm with hail",
        };

        liveData.Weather = {
          Temperature: Math.round(temperature * 10) / 10,
          Humidity: humidity,
          WindSpeed: Math.round(windSpeed * 10) / 10,
          Type: weatherTypes[weatherCode] || "Unknown",
          TypeLocalized: [{ Locale: "en-GB", Description: weatherTypes[weatherCode] || "Unknown" }],
        };

        fs.writeFileSync(liveFile, JSON.stringify(liveData, null, 2));
        enriched++;
        console.log(
          `  ✓ Weather for match ${match.id} (${stadiumName}): ${liveData.Weather.Temperature}°C, ${liveData.Weather.Type}`
        );
      }

      await sleep(200); // Rate limit for Open-Meteo
    } catch (error) {
      console.warn(`Error enriching weather for match ${match.id}: ${error.message}`);
    }
  }

  console.log(`✓ Enriched ${enriched} matches with weather data`);
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
    await fetchMatchStats(toScrape);
    await fetchTeamStats(toScrape);
    await fetchPlayerStats(toScrape);
    await fetchPowerRanking(toScrape);
    await fetchLiveMatchData(toScrape);
    await enrichWeatherData(toScrape);

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
