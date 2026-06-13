import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");

const matches = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "matches.json"), "utf-8"));

process.stdout.write(`${JSON.stringify(matches)}\n`);
