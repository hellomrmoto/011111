import { parseCSV } from "@/lib/parsing/csvParser";
import { parseXLSX } from "@/lib/parsing/xlsxParser";
import type { Bet } from "@/types/bet";

export interface WorkerInput {
  type: "csv" | "xlsx";
  data: string | ArrayBuffer;
  existingIds: string[];
}

export interface WorkerOutput {
  bets: Bet[];
  errors: { rowIndex: number; reason: string }[];
  source: Bet["source"];
  totalRows: number;
}

self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const { type, data, existingIds } = event.data;
  const idSet = new Set(existingIds);

  try {
    let result: WorkerOutput;
    if (type === "csv") {
      result = parseCSV(data as string, idSet);
    } else {
      result = parseXLSX(data as ArrayBuffer, idSet);
    }
    self.postMessage({ ok: true, ...result });
  } catch (err) {
    self.postMessage({ ok: false, error: String(err) });
  }
};
