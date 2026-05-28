import type { Bet, BetStatus } from "@/types/bet";

const SETTLED: BetStatus[] = ["WON", "LOST", "PUSH", "VOID"];

export function settledBets(bets: Bet[]): Bet[] {
  return bets.filter((b) => SETTLED.includes(b.status));
}

export function netProfitCents(bets: Bet[]): number {
  return bets.reduce((acc, b) => {
    if (b.status === "WON") return acc + (b.netResultCents ?? b.toWinCents);
    if (b.status === "LOST") return acc - b.riskCents;
    return acc;
  }, 0);
}

export function totalWagersRun(bets: Bet[]): number {
  return bets.filter((b) => SETTLED.includes(b.status)).length;
}

export function totalPendingCount(bets: Bet[]): number {
  return bets.filter((b) => b.status === "PENDING").length;
}

export function totalRiskedCents(bets: Bet[]): number {
  return settledBets(bets).reduce((acc, b) => acc + b.riskCents, 0);
}

export function roi(bets: Bet[]): number {
  const risked = totalRiskedCents(bets);
  if (risked === 0) return 0;
  return netProfitCents(bets) / risked;
}

export function winRate(bets: Bet[]): number {
  const resolved = bets.filter((b) => b.status === "WON" || b.status === "LOST");
  if (resolved.length === 0) return 0;
  const wins = resolved.filter((b) => b.status === "WON").length;
  return wins / resolved.length;
}

export function activeStreak(bets: Bet[]): { type: "WIN" | "LOSS" | "NONE"; count: number } {
  const settled = bets
    .filter((b) => b.status === "WON" || b.status === "LOST" || b.status === "PUSH" || b.status === "VOID")
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

  let count = 0;
  let streakType: "WIN" | "LOSS" | null = null;

  for (const bet of settled) {
    if (bet.status === "PUSH" || bet.status === "VOID") break;
    const outcome = bet.status === "WON" ? "WIN" : "LOSS";
    if (streakType === null) {
      streakType = outcome;
      count = 1;
    } else if (streakType === outcome) {
      count++;
    } else {
      break;
    }
  }

  if (streakType === null) return { type: "NONE", count: 0 };
  return { type: streakType, count };
}

export function avgOddsAmerican(bets: Bet[]): number {
  if (bets.length === 0) return 0;
  const sum = bets.reduce((acc, b) => acc + b.oddsAmerican, 0);
  return Math.round(sum / bets.length);
}

export function avgClvBps(bets: Bet[]): number | null {
  const withClv = bets.filter((b) => b.clvBps !== undefined && b.clvBps !== null);
  if (withClv.length === 0) return null;
  const sum = withClv.reduce((acc, b) => acc + (b.clvBps ?? 0), 0);
  return Math.round(sum / withClv.length);
}

export interface KpiBundle {
  netProfitCents: number;
  roiPercent: number;
  winRatePercent: number;
  totalWagers: number;
  pendingCount: number;
  streak: { type: "WIN" | "LOSS" | "NONE"; count: number };
  avgClvBps: number | null;
  avgOdds: number;
}

export function computeKpis(bets: Bet[]): KpiBundle {
  return {
    netProfitCents: netProfitCents(bets),
    roiPercent: roi(bets) * 100,
    winRatePercent: winRate(bets) * 100,
    totalWagers: totalWagersRun(bets),
    pendingCount: totalPendingCount(bets),
    streak: activeStreak(bets),
    avgClvBps: avgClvBps(bets),
    avgOdds: avgOddsAmerican(bets),
  };
}
