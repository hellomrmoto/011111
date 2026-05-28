import { format, parseISO } from "date-fns";
import type { Bet, Sport } from "@/types/bet";
import { netProfitCents, roi } from "./metrics";

export interface PnLPoint {
  date: string;
  dailyPnLCents: number;
  cumulativePnLCents: number;
  betCount: number;
}

export function buildPnLSeries(bets: Bet[]): PnLPoint[] {
  if (bets.length === 0) return [];

  const settled = bets.filter(
    (b) => b.status === "WON" || b.status === "LOST" || b.status === "PUSH"
  );

  const byDate = new Map<string, Bet[]>();
  for (const bet of settled) {
    const date = format(parseISO(bet.placedAt), "yyyy-MM-dd");
    const arr = byDate.get(date) ?? [];
    arr.push(bet);
    byDate.set(date, arr);
  }

  const sorted = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
  const points: PnLPoint[] = [];
  let cumulative = 0;

  for (const [date, dayBets] of sorted) {
    const daily = netProfitCents(dayBets);
    cumulative += daily;
    points.push({
      date,
      dailyPnLCents: daily,
      cumulativePnLCents: cumulative,
      betCount: dayBets.length,
    });
  }

  return points;
}

export interface LeagueRow {
  sport: Sport;
  roiPercent: number;
  totalRiskedCents: number;
  winRate: number;
  betCount: number;
}

export function buildLeagueBreakdown(bets: Bet[]): LeagueRow[] {
  const sports: Sport[] = ["NBA", "MLB"];
  return sports
    .map((sport) => {
      const sportBets = bets.filter((b) => b.sport === sport);
      const settled = sportBets.filter(
        (b) => b.status === "WON" || b.status === "LOST"
      );
      const wins = settled.filter((b) => b.status === "WON").length;
      const totalRisked = sportBets.reduce((a, b) => a + b.riskCents, 0);
      return {
        sport,
        roiPercent: roi(sportBets) * 100,
        totalRiskedCents: totalRisked,
        winRate: settled.length > 0 ? (wins / settled.length) * 100 : 0,
        betCount: sportBets.length,
      };
    })
    .filter((r) => r.betCount > 0);
}

export interface PropRow {
  prop: string;
  count: number;
  hitRate: number;
  netPnLCents: number;
  wins: number;
  losses: number;
}

export function buildPropGrid(bets: Bet[]): PropRow[] {
  const byProp = new Map<string, Bet[]>();

  for (const bet of bets) {
    const key = bet.selection.trim();
    const arr = byProp.get(key) ?? [];
    arr.push(bet);
    byProp.set(key, arr);
  }

  const rows: PropRow[] = [];
  for (const [prop, propBets] of byProp) {
    if (propBets.length < 3) continue;
    const wins = propBets.filter((b) => b.status === "WON").length;
    const losses = propBets.filter((b) => b.status === "LOST").length;
    const resolved = wins + losses;
    rows.push({
      prop,
      count: propBets.length,
      hitRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      netPnLCents: netProfitCents(propBets),
      wins,
      losses,
    });
  }

  return rows.sort((a, b) => b.hitRate - a.hitRate);
}
