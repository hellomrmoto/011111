import Papa from "papaparse";
import type { Bet } from "@/types/bet";
import { detectSchema, mapHeader } from "./schemaMap";
import { normalizeRows, type RawRow } from "./normalize";

export interface ParseResult {
  bets: Bet[];
  errors: { rowIndex: number; reason: string }[];
  source: Bet["source"];
  totalRows: number;
}

export function parseCSV(text: string, existingIds: Set<string>): ParseResult {
  const result = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const headers = result.meta.fields ?? [];
  const schema = detectSchema(headers);
  const source: Bet["source"] = schema === "FANDUEL_ACTIVITY"
    ? "FANDUEL_ACTIVITY"
    : schema === "FANDUEL_WINLOSS"
    ? "FANDUEL_WINLOSS"
    : "CUSTOM";

  const { bets, errors } = normalizeRows(result.data, headers, schema, source, existingIds);

  return {
    bets,
    errors,
    source,
    totalRows: result.data.length,
  };
}

export function getUnmappedHeaders(headers: string[]): string[] {
  return headers.filter((h) => !mapHeader(h));
}
