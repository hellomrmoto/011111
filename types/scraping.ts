import type { Sport } from "./bet";

export interface GameResult {
  gameId: string;
  sport: Sport;
  gameDate: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  isFinal: boolean;
}

export interface MarketLine {
  gameId: string;
  market: string;
  openingOddsAmerican: number;
  closingOddsAmerican: number;
  timestamp: string;
}

export interface ClosingLine {
  gameId: string;
  market: string;
  closingOddsAmerican: number;
  closingImpliedProb: number;
}

export interface ClvPatch {
  betId: string;
  closingLineAmerican: number;
  clvBps: number;
}
