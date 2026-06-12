import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../../scraped-data/matches.json");

export default function () {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}
