import type { PublicSportsProvider } from "./publicSportsApi";
import type { Sport } from "@/types/bet";
import type { GameResult, ClosingLine } from "@/types/scraping";
import { format, parseISO, eachDayOfInterval } from "date-fns";

const NBA_TEAMS = [
  "Lakers", "Celtics", "Warriors", "Bucks", "Nets", "Heat",
  "76ers", "Suns", "Nuggets", "Clippers", "Knicks", "Bulls",
];

const MLB_TEAMS = [
  "Yankees", "Red Sox", "Dodgers", "Cubs", "Cardinals", "Braves",
  "Astros", "Giants", "Mets", "Phillies", "Blue Jays", "Padres",
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

function seedFromDate(dateStr: string): number {
  return dateStr.split("").reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0);
}

function generateGameId(sport: Sport, date: string, idx: number): string {
  return `${sport.toLowerCase()}-${date}-${idx}`;
}

export const mockProvider: PublicSportsProvider = {
  async fetchGameResults({ sport, fromISO, toISO }) {
    const days = eachDayOfInterval({
      start: parseISO(fromISO),
      end: parseISO(toISO),
    });

    const results: GameResult[] = [];
    const teams = sport === "NBA" ? NBA_TEAMS : MLB_TEAMS;

    for (const day of days) {
      const dateStr = format(day, "yyyy-MM-dd");
      const rng = seededRandom(seedFromDate(dateStr + sport));
      const gameCount = Math.floor(rng() * 4) + 2;

      for (let i = 0; i < gameCount; i++) {
        const homeIdx = Math.floor(rng() * teams.length);
        let awayIdx = Math.floor(rng() * teams.length);
        if (awayIdx === homeIdx) awayIdx = (homeIdx + 1) % teams.length;

        const homeTeam = teams[homeIdx] ?? "Team A";
        const awayTeam = teams[awayIdx] ?? "Team B";

        const homeScore = sport === "NBA"
          ? Math.floor(rng() * 40) + 90
          : Math.floor(rng() * 8) + 1;
        const awayScore = sport === "NBA"
          ? Math.floor(rng() * 40) + 90
          : Math.floor(rng() * 8) + 1;

        results.push({
          gameId: generateGameId(sport, dateStr, i),
          sport,
          gameDate: dateStr,
          homeTeam,
          awayTeam,
          homeScore,
          awayScore,
          isFinal: true,
        });
      }
    }

    return results;
  },

  async fetchClosingLines({ sport, gameId, market }) {
    const rng = seededRandom(seedFromDate(gameId + market));
    const closingOdds = rng() > 0.5
      ? -Math.floor(rng() * 150) - 100
      : Math.floor(rng() * 200) + 100;

    return {
      gameId,
      market,
      closingOddsAmerican: closingOdds,
      closingImpliedProb: closingOdds < 0
        ? Math.abs(closingOdds) / (Math.abs(closingOdds) + 100)
        : 100 / (closingOdds + 100),
    } satisfies ClosingLine;
  },
};
