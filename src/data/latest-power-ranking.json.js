import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");

export default function () {
  const powerRankingDir = path.join(DATA_DIR, "power-ranking");
  if (!fs.existsSync(powerRankingDir)) {
    return null;
  }

  const files = fs.readdirSync(powerRankingDir).sort().reverse();
  if (!files.length) {
    return null;
  }

  try {
    const latestFile = path.join(powerRankingDir, files[0]);
    return JSON.parse(fs.readFileSync(latestFile, "utf-8"));
  } catch {
    console.warn("Error reading latest power ranking");
    return null;
  }
}
