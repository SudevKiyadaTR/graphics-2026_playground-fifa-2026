import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const dataDir = "./src/data";

describe("Data Files", () => {
  it("should have all required JSON files", () => {
    const files = [
      "matches.json",
      "standings.json",
      "top-scorers.json",
      "latest-power-ranking.json",
    ];
    files.forEach((file) => {
      const filepath = path.join(dataDir, file);
      expect(fs.existsSync(filepath), `${file} should exist`).toBe(true);
    });
  });

  it("should have valid JSON in all data files", () => {
    const files = ["matches.json", "standings.json", "top-scorers.json"];
    files.forEach((file) => {
      const content = fs.readFileSync(path.join(dataDir, file), "utf-8");
      expect(() => JSON.parse(content), `${file} should be valid JSON`).not.toThrow();
    });
  });
});

describe("Data Quality", () => {
  it("standings should have valid structure", () => {
    const standings = JSON.parse(fs.readFileSync(path.join(dataDir, "standings.json"), "utf-8"));
    expect(Array.isArray(standings)).toBe(true);
    standings.forEach((entry) => {
      expect(entry).toHaveProperty("team");
      expect(entry).toHaveProperty("group");
      expect(entry).toHaveProperty("pts");
      expect(entry.pts).toBeLessThanOrEqual(100);
      expect(isFinite(entry.pts)).toBe(true);
      expect(isNaN(entry.pts)).toBe(false);
    });
  });

  it("top-scorers should have valid structure", () => {
    const scorers = JSON.parse(fs.readFileSync(path.join(dataDir, "top-scorers.json"), "utf-8"));
    expect(Array.isArray(scorers)).toBe(true);
    scorers.forEach((entry) => {
      expect(entry).toHaveProperty("player");
      expect(entry).toHaveProperty("team");
      expect(entry).toHaveProperty("goals");
      expect(isFinite(entry.goals)).toBe(true);
      expect(isNaN(entry.goals)).toBe(false);
    });

    const uniquePlayers = new Set(scorers.map((entry) => entry.player));
    expect(uniquePlayers.size).toBe(scorers.length);
  });

  it("power ranking data should have valid structure", () => {
    const pr = JSON.parse(
      fs.readFileSync(path.join(dataDir, "latest-power-ranking.json"), "utf-8")
    );
    expect(pr).toHaveProperty("outfieldPlayers");
    expect(Array.isArray(pr.outfieldPlayers)).toBe(true);
    pr.outfieldPlayers.slice(0, 5).forEach((player) => {
      expect(typeof player.attackingScore).toBe("number");
      expect(typeof player.defensiveScore).toBe("number");
      expect(typeof player.creativityScore).toBe("number");
      expect(isFinite(player.attackingScore)).toBe(true);
      expect(isFinite(player.defensiveScore)).toBe(true);
      expect(isFinite(player.creativityScore)).toBe(true);
    });
  });
});

describe("Aggregation Logic", () => {
  it("should aggregate team power correctly", () => {
    const pr = JSON.parse(
      fs.readFileSync(path.join(dataDir, "latest-power-ranking.json"), "utf-8")
    );

    const teams = {};
    pr.outfieldPlayers.forEach((player) => {
      const teamName = player.teamName?.[0]?.description || "Unknown";
      const attackScore = player.attackingScore || 0;
      const defScore = player.defensiveScore || 0;
      const creScore = player.creativityScore || 0;

      if (!isFinite(attackScore) || !isFinite(defScore) || !isFinite(creScore)) {
        return;
      }

      if (!teams[teamName]) {
        teams[teamName] = { attacking: 0, defensive: 0, creativity: 0, count: 0 };
      }
      teams[teamName].attacking += attackScore;
      teams[teamName].defensive += defScore;
      teams[teamName].creativity += creScore;
      teams[teamName].count += 1;
    });

    const result = Object.entries(teams)
      .map(([team, scores]) => ({
        team,
        power:
          scores.count > 0
            ? (scores.attacking + scores.defensive + scores.creativity) / (3 * scores.count)
            : 0,
      }))
      .filter((t) => isFinite(t.power))
      .sort((a, b) => b.power - a.power);

    expect(result.length).toBeGreaterThan(0);
    result.forEach((entry) => {
      expect(isFinite(entry.power)).toBe(true);
      expect(isNaN(entry.power)).toBe(false);
      expect(entry.power).toBeGreaterThanOrEqual(0);
    });
  });
});
