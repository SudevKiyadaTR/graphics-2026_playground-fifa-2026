import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../scraped-data");

const BASE_URL = "https://api.fifa.com/api/v3";
const COMPETITION_ID = 17; // FIFA World Cup 2026
const RATE_LIMIT_MS = 50; // ms between requests

// Ensure output directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMatches() {
  const matches = [];
  let continuationToken = null;
  let pageCount = 0;

  console.log("Fetching matches from FIFA API...");

  do {
    try {
      const params = new URLSearchParams({
        language: "en",
        count: "500",
        idCompetition: COMPETITION_ID,
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
        const normalized = data.Results.map((match) => ({
          id: match.IdMatch,
          propertyId: match.Properties?.IdIFES || null,
          homeTeam: match.HomeTeam?.Country || "Unknown",
          awayTeam: match.AwayTeam?.Country || "Unknown",
          date: match.Date,
          homeScore: match.HomeTeam?.Score || null,
          awayScore: match.AwayTeam?.Score || null,
          stage: match.StageName || "Unknown",
          group: match.GroupName || null,
        }));

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

async function main() {
  try {
    const matches = await fetchMatches();

    const outputPath = path.join(DATA_DIR, "matches.json");
    fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2));

    console.log(`✓ Written ${matches.length} matches to ${outputPath}`);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
