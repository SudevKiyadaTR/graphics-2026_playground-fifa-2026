import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data/matches");

const liveData = {};

// Read all match directories and load live.json files
const matchIds = fs.readdirSync(DATA_DIR).filter((f) => {
  return fs.statSync(path.join(DATA_DIR, f)).isDirectory();
});

for (const id of matchIds) {
  try {
    const filePath = path.join(DATA_DIR, id, "live.json");
    if (fs.existsSync(filePath)) {
      liveData[id] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (e) {
    console.error(`Failed to load live data for match ${id}:`, e);
  }
}

process.stdout.write(`${JSON.stringify(liveData)}\n`);
