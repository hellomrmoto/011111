"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, FileCheck, FileWarning, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBetStore } from "@/lib/state/useBetStore";
import { parseCSV } from "@/lib/parsing/csvParser";
import { parseXLSX } from "@/lib/parsing/xlsxParser";
import { mockProvider } from "@/lib/scraping/mockProvider";
import { gradePendingBets } from "@/lib/scraping/grader";
import { fetchClvForBets } from "@/lib/scraping/clvCrossRef";
import { UploadStatusBanner, type UploadResult } from "./UploadStatusBanner";

const MAX_BYTES = 25 * 1024 * 1024;
const WORKER_THRESHOLD = 5 * 1024 * 1024;

type DropState = "idle" | "hover" | "parsing" | "success" | "error";

export function DropZone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropState, setDropState] = useState<DropState>("idle");
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const { bets, addBets, setGradingInFlight, setClvInFlight, applyGrading, applyClv } = useBetStore((s) => ({
    bets: s.bets,
    addBets: s.addBets,
    setGradingInFlight: s.setGradingInFlight,
    setClvInFlight: s.setClvInFlight,
    applyGrading: s.applyGrading,
    applyClv: s.applyClv,
  }));

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const results: UploadResult[] = [];

    setDropState("parsing");

    for (const file of fileArr) {
      if (file.size > MAX_BYTES) {
        results.push({
          fileName: file.name,
          imported: 0,
          total: 0,
          errors: [{ rowIndex: 0, reason: `File exceeds 25MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)` }],
        });
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase();
      const existingIds = new Set(bets.map((b) => b.betId));

      try {
        let parseResult;

        if (file.size > WORKER_THRESHOLD && ext === "csv") {
          // Use Web Worker for large files
          const text = await file.text();
          parseResult = await parseInWorker("csv", text, existingIds);
        } else if (ext === "xlsx" || ext === "xls") {
          const buf = await file.arrayBuffer();
          if (file.size > WORKER_THRESHOLD) {
            parseResult = await parseInWorker("xlsx", buf, existingIds);
          } else {
            parseResult = parseXLSX(buf, existingIds);
          }
        } else {
          const text = await file.text();
          parseResult = parseCSV(text, existingIds);
        }

        addBets(parseResult.bets, {
          fileNames: [file.name],
          rejectedRowCount: parseResult.errors.length,
          rejectionReasons: parseResult.errors,
        });

        results.push({
          fileName: file.name,
          imported: parseResult.bets.length,
          total: parseResult.totalRows,
          errors: parseResult.errors,
        });

        // Background grading and CLV
        const allBets = [...bets, ...parseResult.bets];
        runBackgroundGrading(allBets, setGradingInFlight, setClvInFlight, applyGrading, applyClv);
      } catch (err) {
        results.push({
          fileName: file.name,
          imported: 0,
          total: 0,
          errors: [{ rowIndex: 0, reason: String(err) }],
        });
      }
    }

    setUploadResults(results);
    const hasErrors = results.some((r) => r.errors.length > 0 && r.imported === 0);
    setDropState(hasErrors ? "error" : "success");
    setTimeout(() => setDropState("idle"), 3000);
  }, [bets, addBets, setGradingInFlight, setClvInFlight, applyGrading, applyClv]);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDropState("parsing");
      void processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropState("hover");
  };

  const onDragLeave = () => setDropState("idle");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void processFiles(e.target.files);
    }
  };

  const Icon = dropState === "parsing" ? Loader2
    : dropState === "success" ? FileCheck
    : dropState === "error" ? FileWarning
    : Upload;

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
          {
            "border-white/10 hover:border-white/20 hover:bg-white/5": dropState === "idle",
            "border-blue-400 bg-blue-500/10": dropState === "hover",
            "border-yellow-400/50 bg-yellow-500/5": dropState === "parsing",
            "border-green-400/50 bg-green-500/5": dropState === "success",
            "border-red-400/50 bg-red-500/5": dropState === "error",
          }
        )}
      >
        <Icon
          className={cn("mb-3 h-10 w-10", {
            "text-gray-400": dropState === "idle",
            "text-blue-400": dropState === "hover",
            "text-yellow-400 animate-spin": dropState === "parsing",
            "text-green-400": dropState === "success",
            "text-red-400": dropState === "error",
          })}
        />
        <p className="text-sm text-gray-300 font-medium">
          {dropState === "parsing"
            ? "Parsing file…"
            : dropState === "success"
            ? "Import complete"
            : dropState === "error"
            ? "Import failed"
            : "Drop a FanDuel statement or custom tracker to get started"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          .csv, .xlsx, .xls · up to 25MB per file
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {uploadResults.length > 0 && (
        <UploadStatusBanner
          results={uploadResults}
          onDismiss={() => setUploadResults([])}
        />
      )}
    </div>
  );
}

async function parseInWorker(
  type: "csv" | "xlsx",
  data: string | ArrayBuffer,
  existingIds: Set<string>
): Promise<{ bets: import("@/types/bet").Bet[]; errors: { rowIndex: number; reason: string }[]; source: import("@/types/bet").Bet["source"]; totalRows: number }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../../workers/parseWorker.ts", import.meta.url));
    worker.postMessage({ type, data, existingIds: [...existingIds] });
    worker.onmessage = (e: MessageEvent<{ ok: boolean; bets?: import("@/types/bet").Bet[]; errors?: { rowIndex: number; reason: string }[]; source?: import("@/types/bet").Bet["source"]; totalRows?: number; error?: string }>) => {
      worker.terminate();
      if (e.data.ok) {
        resolve({ bets: e.data.bets ?? [], errors: e.data.errors ?? [], source: e.data.source ?? "CUSTOM", totalRows: e.data.totalRows ?? 0 });
      } else {
        reject(new Error(e.data.error ?? "Worker parse failed"));
      }
    };
    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
  });
}

function runBackgroundGrading(
  bets: import("@/types/bet").Bet[],
  setGradingInFlight: (v: boolean) => void,
  setClvInFlight: (v: boolean) => void,
  applyGrading: (bets: import("@/types/bet").Bet[]) => void,
  applyClv: (patches: import("@/types/scraping").ClvPatch[]) => void
) {
  void (async () => {
    try {
      setGradingInFlight(true);
      const graded = await gradePendingBets(bets, mockProvider);
      applyGrading(graded);
    } finally {
      setGradingInFlight(false);
    }
    try {
      setClvInFlight(true);
      const clvPatches = await fetchClvForBets(bets, mockProvider);
      applyClv(clvPatches);
    } finally {
      setClvInFlight(false);
    }
  })();
}
