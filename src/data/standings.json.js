import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../scraped-data");

export default function () {
  const matches = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "matches.json"), "utf-8")
  );

  const groupStats = {};

  matches.forEach((match) => {
    if (!match.group || match.homeScore === null || match.awayScore === null) {
      return;
    }

    if (!groupStats[match.group]) {
      groupStats[match.group] = {};
    }

    const group = groupStats[match.group];

    [
      { team: match.homeTeam, goals: match.homeScore, conceded: match.awayScore },
      { team: match.awayTeam, goals: match.awayScore, conceded: match.homeScore },
    ].forEach(({ team, goals, conceded }) => {
      if (!group[team]) {
        group[team] = { team, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
      }

      group[team].played += 1;
      group[team].gf += goals;
      group[team].ga += conceded;

      if (goals > conceded) {
        group[team].w += 1;
      } else if (goals === conceded) {
        group[team].d += 1;
      } else {
        group[team].l += 1;
      }
    });
  });

  const standings = [];

  Object.entries(groupStats).forEach(([groupName, teams]) => {
    Object.values(teams).forEach((team) => {
      team.gd = team.gf - team.ga;
      team.pts = team.w * 3 + team.d;
      team.group = groupName;
      standings.push(team);
    });
  });

  standings.sort((a, b) => {
    if (a.group !== b.group) {
      return a.group.localeCompare(b.group);
    }
    if (b.pts !== a.pts) {
      return b.pts - a.pts;
    }
    if (b.gd !== a.gd) {
      return b.gd - a.gd;
    }
    return b.gf - a.gf;
  });

  return standings;
}
