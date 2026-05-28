// Maps known header variants (lowercase, trimmed) to canonical Bet field names
export const SCHEMA_MAP: Record<string, string> = {
  // betId
  "bet id": "betId",
  "bet_id": "betId",
  "id": "betId",
  "betid": "betId",

  // placedAt
  "placed": "placedAt",
  "placed at": "placedAt",
  "placed_at": "placedAt",
  "date": "placedAt",
  "timestamp": "placedAt",
  "datetime": "placedAt",

  // settledAt
  "settled": "settledAt",
  "settled at": "settledAt",
  "settled_at": "settledAt",
  "settlement date": "settledAt",

  // sport
  "sport": "sport",
  "league": "league",

  // betType
  "bet type": "betType",
  "bet_type": "betType",
  "type": "betType",
  "wager type": "betType",

  // selection
  "selection": "selection",
  "bet": "selection",
  "description": "selection",
  "pick": "selection",

  // riskCents / wager / stake / risk
  "wager": "riskCents",
  "risk": "riskCents",
  "stake": "riskCents",
  "amount wagered": "riskCents",
  "bet amount": "riskCents",

  // toWinCents
  "to win": "toWinCents",
  "to_win": "toWinCents",
  "win amount": "toWinCents",
  "potential winnings": "toWinCents",
  "payout": "toWinCents",

  // oddsAmerican
  "odds": "oddsAmerican",
  "american odds": "oddsAmerican",
  "american_odds": "oddsAmerican",
  "price": "oddsAmerican",

  // status
  "status": "status",
  "outcome": "status",
  "result": "status",
  "win/loss": "status",

  // wagers (FanDuel Win/Loss)
  "wagers": "totalWagers",
  "wins": "totalWins",
  "losses": "totalLosses",
  "net": "netAmount",
};

export function normalizeHeader(h: string): string {
  return h.toLowerCase().trim().replace(/\s+/g, " ");
}

export function mapHeader(h: string): string | null {
  const normalized = normalizeHeader(h);
  return SCHEMA_MAP[normalized] ?? null;
}

export type SourceSchema =
  | "FANDUEL_ACTIVITY"
  | "FANDUEL_WINLOSS"
  | "CUSTOM"
  | "UNKNOWN";

export function detectSchema(headers: string[]): SourceSchema {
  const normalized = headers.map(normalizeHeader);
  const hasAll = (...keys: string[]) => keys.every((k) => normalized.includes(k));

  if (hasAll("bet id", "placed", "settled", "sport", "bet type", "selection", "wager", "odds", "status")) {
    return "FANDUEL_ACTIVITY";
  }
  if (hasAll("date", "sport", "wagers", "wins", "losses", "net")) {
    return "FANDUEL_WINLOSS";
  }
  // Check if we can map enough required fields for CUSTOM
  const mapped = normalized.map((h) => SCHEMA_MAP[h]).filter(Boolean);
  const requiredFields = ["betId", "placedAt", "riskCents", "oddsAmerican", "status"];
  const hasRequired = requiredFields.every((f) => mapped.includes(f));
  if (hasRequired) return "CUSTOM";

  return "UNKNOWN";
}
