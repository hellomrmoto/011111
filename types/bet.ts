export type Sport = "NBA" | "MLB" | "OTHER";
export type BetType = "STRAIGHT" | "PARLAY";
export type BetStatus = "WON" | "LOST" | "PENDING" | "PUSH" | "VOID";

export interface Bet {
  betId: string;
  placedAt: string;
  settledAt?: string;
  sport: Sport;
  league?: string;
  betType: BetType;
  selection: string;
  riskCents: number;
  toWinCents: number;
  oddsAmerican: number;
  oddsDecimal: number;
  impliedProb: number;
  status: BetStatus;
  netResultCents?: number;
  closingLineAmerican?: number;
  clvBps?: number;
  source: "FANDUEL_ACTIVITY" | "FANDUEL_WINLOSS" | "CUSTOM";
}
