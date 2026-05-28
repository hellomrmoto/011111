import type { Bet, Sport, BetType, BetStatus } from "@/types/bet";
import { americanToDecimal, americanToImpliedProb } from "./oddsConvert";
import { parseFlexDate } from "@/lib/utils/dates";
import { dollarsToCents } from "@/lib/utils/money";
import { mapHeader, type SourceSchema } from "./schemaMap";

export interface NormalizeResult {
  bets: Bet[];
  errors: { rowIndex: number; reason: string }[];
}

export interface RawRow {
  [key: string]: unknown;
}

function coerceSport(val: unknown): Sport {
  const s = String(val ?? "").toUpperCase().trim();
  if (s.includes("NBA") || s === "BASKETBALL") return "NBA";
  if (s.includes("MLB") || s === "BASEBALL") return "MLB";
  return "OTHER";
}

function coerceBetType(val: unknown, selection: string): BetType {
  const s = String(val ?? "").toUpperCase().trim();
  if (s.includes("PARLAY") || selection.toLowerCase().includes("parlay") || selection.includes("+")) {
    return "PARLAY";
  }
  return "STRAIGHT";
}

function coerceStatus(val: unknown): BetStatus {
  const s = String(val ?? "").toUpperCase().trim();
  if (s === "WON" || s === "WIN" || s === "W" || s === "WINNER") return "WON";
  if (s === "LOST" || s === "LOSS" || s === "L" || s === "LOSER") return "LOST";
  if (s === "PUSH" || s === "TIE" || s === "TIED") return "PUSH";
  if (s === "VOID" || s === "CANCELED" || s === "CANCELLED" || s === "NO ACTION") return "VOID";
  return "PENDING";
}

function coerceCents(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const s = String(val).replace(/[$,\s]/g, "");
  const n = parseFloat(s);
  if (isNaN(n) || n < 0) return null;
  return dollarsToCents(n);
}

function coerceOdds(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const s = String(val).replace(/\s/g, "");
  const n = parseInt(s, 10);
  if (isNaN(n) || n === 0 || n < -100000 || n > 100000) return null;
  return n;
}

function computeNetResult(status: BetStatus, riskCents: number, toWinCents: number): number | undefined {
  switch (status) {
    case "WON": return toWinCents;
    case "LOST": return -riskCents;
    case "PUSH": return 0;
    case "VOID": return 0;
    default: return undefined;
  }
}

function mapRowToFields(row: RawRow, headers: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const h of headers) {
    const canonical = mapHeader(h);
    if (canonical) {
      out[canonical] = row[h];
    }
  }
  return out;
}

export function normalizeRows(
  rows: RawRow[],
  headers: string[],
  schema: SourceSchema,
  source: Bet["source"],
  existingIds: Set<string>
): NormalizeResult {
  const bets: Bet[] = [];
  const errors: { rowIndex: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    if (!rawRow) continue;

    try {
      const fields = schema === "FANDUEL_ACTIVITY" || schema === "FANDUEL_WINLOSS"
        ? mapRowToFields(rawRow, headers)
        : mapRowToFields(rawRow, headers);

      // For FanDuel Win/Loss summary rows, skip (they're aggregates not individual bets)
      if (schema === "FANDUEL_WINLOSS") {
        errors.push({ rowIndex: i + 2, reason: "Win/Loss statement rows are aggregate summaries, not individual bets." });
        continue;
      }

      const betId = String(fields["betId"] ?? rawRow["Bet ID"] ?? rawRow["bet_id"] ?? rawRow["id"] ?? "").trim();
      if (!betId) {
        errors.push({ rowIndex: i + 2, reason: "Missing required field: betId" });
        continue;
      }
      if (existingIds.has(betId)) {
        errors.push({ rowIndex: i + 2, reason: `Duplicate betId: ${betId}` });
        continue;
      }

      const placedRaw = fields["placedAt"] ?? rawRow["Placed"] ?? rawRow["Date"] ?? rawRow["date"];
      const placedAt = placedRaw !== undefined ? parseFlexDate(placedRaw as string | number) : null;
      if (!placedAt) {
        errors.push({ rowIndex: i + 2, reason: "Missing or invalid date" });
        continue;
      }

      const settledRaw = fields["settledAt"] ?? rawRow["Settled"] ?? rawRow["settled"];
      const settledAt = settledRaw ? parseFlexDate(settledRaw as string | number) ?? undefined : undefined;

      const sportRaw = fields["sport"] ?? rawRow["Sport"] ?? rawRow["sport"];
      const sport = coerceSport(sportRaw);

      const leagueRaw = fields["league"] ?? rawRow["League"] ?? rawRow["league"];
      const league = leagueRaw ? String(leagueRaw).trim() : undefined;

      const selectionRaw = fields["selection"] ?? rawRow["Selection"] ?? rawRow["selection"] ?? rawRow["Bet"] ?? "";
      const selection = String(selectionRaw).trim();

      const betTypeRaw = fields["betType"] ?? rawRow["Bet Type"] ?? rawRow["bet_type"] ?? rawRow["type"];
      const betType = coerceBetType(betTypeRaw, selection);

      const riskRaw = fields["riskCents"] ?? rawRow["Wager"] ?? rawRow["Risk"] ?? rawRow["Stake"];
      const riskCents = coerceCents(riskRaw);
      if (riskCents === null) {
        errors.push({ rowIndex: i + 2, reason: "Missing or invalid wager/risk amount" });
        continue;
      }

      const toWinRaw = fields["toWinCents"] ?? rawRow["To Win"] ?? rawRow["to_win"] ?? rawRow["Win Amount"];
      const toWinCents = coerceCents(toWinRaw);
      if (toWinCents === null) {
        errors.push({ rowIndex: i + 2, reason: "Missing or invalid to-win amount" });
        continue;
      }

      const oddsRaw = fields["oddsAmerican"] ?? rawRow["Odds"] ?? rawRow["odds"];
      const oddsAmerican = coerceOdds(oddsRaw);
      if (oddsAmerican === null) {
        errors.push({ rowIndex: i + 2, reason: "Missing or invalid odds" });
        continue;
      }

      const statusRaw = fields["status"] ?? rawRow["Status"] ?? rawRow["Result"] ?? rawRow["Outcome"];
      const status = coerceStatus(statusRaw);

      const oddsDecimal = americanToDecimal(oddsAmerican);
      const impliedProb = americanToImpliedProb(oddsAmerican);
      const netResultCents = computeNetResult(status, riskCents, toWinCents);

      const bet: Bet = {
        betId,
        placedAt,
        settledAt,
        sport,
        league,
        betType,
        selection,
        riskCents,
        toWinCents,
        oddsAmerican,
        oddsDecimal,
        impliedProb,
        status,
        netResultCents,
        source,
      };

      existingIds.add(betId);
      bets.push(bet);
    } catch (err) {
      errors.push({ rowIndex: i + 2, reason: `Unexpected error: ${String(err)}` });
    }
  }

  return { bets, errors };
}
