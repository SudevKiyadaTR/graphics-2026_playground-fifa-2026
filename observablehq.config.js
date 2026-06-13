import * as fs from "fs/promises";
import * as path from "path";

export default {
  root: "src",
  title: "FIFA 2026 Dashboard",
  pages: [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Player Stats",
      path: "/player-stats",
    },
    {
      name: "Matches",
      path: "/matches/:id",
    },
  ],
  dynamicPaths: (async function* () {
    try {
      const matchesPath = path.join("scraped-data", "matches.json");
      const matchesData = JSON.parse(await fs.readFile(matchesPath, "utf-8"));
      for (const match of matchesData) {
        yield `/matches/${match.id}`;
      }
    } catch (err) {
      console.warn("dynamicPaths: Could not read matches.json; skipping match pages", err.message);
    }
  })(),
  theme: ["dashboard", "near-midnight"],
  search: true,
};
