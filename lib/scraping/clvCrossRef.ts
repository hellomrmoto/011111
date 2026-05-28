import type { Bet } from "@/types/bet";
import type { ClvPatch } from "@/types/scraping";
import type { PublicSportsProvider } from "./publicSportsApi";
import { computeClvBps } from "@/lib/analytics/clv";
import { rateLimiter } from "./publicSportsApi";
import { format, parseISO } from "date-fns";

export async function fetchClvForBets(
  bets: Bet[],
  provider: PublicSportsProvider
): Promise<ClvPatch[]> {
  const patches: ClvPatch[] = [];
  const eligible = bets.filter(
    (b) => (b.status === "WON" || b.status === "LOST") && !b.closingLineAmerican
  );

  for (const bet of eligible) {
    try {
      await rateLimiter.consume();
      const dateStr = format(parseISO(bet.placedAt), "yyyy-MM-dd");
      const gameId = `${bet.sport.toLowerCase()}-${dateStr}-0`;

      const closingLine = await provider.fetchClosingLines({
        sport: bet.sport,
        gameId,
        market: bet.selection.slice(0, 50),
      });

      if (closingLine) {
        const clvBps = computeClvBps(bet.oddsAmerican, closingLine.closingOddsAmerican);
        patches.push({
          betId: bet.betId,
          closingLineAmerican: closingLine.closingOddsAmerican,
          clvBps,
        });
      }
    } catch {
      // Skip this bet
    }
  }

  return patches;
}
