import * as XLSX from "xlsx";
import type { Bet } from "@/types/bet";
import { detectSchema } from "./schemaMap";
import { normalizeRows, type RawRow } from "./normalize";

export interface XlsxParseResult {
  bets: Bet[];
  errors: { rowIndex: number; reason: string }[];
  source: Bet["source"];
  totalRows: number;
}

export function parseXLSX(buffer: ArrayBuffer, existingIds: Set<string>): XlsxParseResult {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { bets: [], errors: [{ rowIndex: 0, reason: "No sheets found in workbook" }], source: "CUSTOM", totalRows: 0 };
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return { bets: [], errors: [{ rowIndex: 0, reason: "Sheet not found" }], source: "CUSTOM", totalRows: 0 };
  }

  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  if (rows.length === 0) {
    return { bets: [], errors: [{ rowIndex: 0, reason: "Empty sheet" }], source: "CUSTOM", totalRows: 0 };
  }

  const headers = Object.keys(rows[0] ?? {});
  const schema = detectSchema(headers);
  const source: Bet["source"] = schema === "FANDUEL_ACTIVITY"
    ? "FANDUEL_ACTIVITY"
    : schema === "FANDUEL_WINLOSS"
    ? "FANDUEL_WINLOSS"
    : "CUSTOM";

  const { bets, errors } = normalizeRows(rows, headers, schema, source, existingIds);

  return { bets, errors, source, totalRows: rows.length };
}
