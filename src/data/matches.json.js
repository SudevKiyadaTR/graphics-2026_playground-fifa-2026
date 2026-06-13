import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR_CANDIDATES = [
	path.join(process.cwd(), "scraped-data"),
	path.join(process.cwd(), "public", "scraped-data"),
	path.join(__dirname, "../../scraped-data"),
	path.join(__dirname, "../../public/scraped-data"),
];

function resolveDataDir() {
	for (const dir of DATA_DIR_CANDIDATES) {
		if (fs.existsSync(path.join(dir, "matches.json"))) {
			return dir;
		}
	}

	throw new Error("Unable to locate matches.json in scraped-data directories.");
}

const matches = JSON.parse(
	fs.readFileSync(path.join(resolveDataDir(), "matches.json"), "utf-8")
);

process.stdout.write(`${JSON.stringify(matches)}\n`);
