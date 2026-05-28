import type { Bet, BetStatus } from "@/types/bet";
import type { GameResult } from "@/types/scraping";
import type { PublicSportsProvider } from "./publicSportsApi";
import { format, parseISO } from "date-fns";
import { cacheGameResult } from "./publicSportsApi";

function fuzzyMatchTeam(selection: string, teamName: string): boolean {
  const s = selection.toLowerCase();
  const t = teamName.toLowerCase();
  return s.includes(t) || t.includes(s.split(" ").find((w) => w.length > 3) ?? "");
}

function gradeAgainstResult(bet: Bet, result: GameResult): BetStatus | null {
  const selection = bet.selection.toLowerCase();
  const homeTeam = result.homeTeam.toLowerCase();
  const awayTeam = result.awayTeam.toLowerCase();

  const homeScore = result.homeScore;
  const awayScore = result.awayScore;

  // Moneyline detection
  const isHome = selection.includes(homeTeam) || fuzzyMatchTeam(selection, result.homeTeam);
  const isAway = selection.includes(awayTeam) || fuzzyMatchTeam(selection, result.awayTeam);

  if (isHome && !isAway) {
    if (homeScore > awayScore) return "WON";
    if (homeScore < awayScore) return "LOST";
    return "PUSH";
  }
  if (isAway && !isHome) {
    if (awayScore > homeScore) return "WON";
    if (awayScore < homeScore) return "LOST";
    return "PUSH";
  }

  return null;
}

export async function gradePendingBets(
  bets: Bet[],
  provider: PublicSportsProvider
): Promise<Bet[]> {
  const pending = bets.filter((b) => b.status === "PENDING");
  if (pending.length === 0) return bets;

  // Fetch results for the range of pending bets
  const dates = pending.map((b) => b.placedAt).sort();
  const from = dates[0] ?? new Date().toISOString();
  const to = dates[dates.length - 1] ?? new Date().toISOString();

  const sports = [...new Set(pending.map((b) => b.sport))].filter(
    (s) => s === "NBA" || s === "MLB"
  ) as ("NBA" | "MLB")[];

  const allResults: GameResult[] = [];
  for (const sport of sports) {
    try {
      const results = await provider.fetchGameResults({ sport, fromISO: from, toISO: to });
      results.forEach(cacheGameResult);
      allResults.push(...results);
    } catch {
      // Silently fail - leave bets as PENDING
    }
  }

  const updated = bets.map((bet) => {
    if (bet.status !== "PENDING") return bet;

    const betDate = format(parseISO(bet.placedAt), "yyyy-MM-dd");
    const candidates = allResults.filter(
      (r) => r.sport === bet.sport && r.gameDate === betDate && r.isFinal
    );

    for (const result of candidates) {
      const newStatus = gradeAgainstResult(bet, result);
      if (newStatus) {
        let netResultCents: number | undefined;
        if (newStatus === "WON") netResultCents = bet.toWinCents;
        else if (newStatus === "LOST") netResultCents = -bet.riskCents;
        else if (newStatus === "PUSH") netResultCents = 0;

        return { ...bet, status: newStatus, netResultCents };
      }
    }

    return bet;
  });

  return updated;
}
