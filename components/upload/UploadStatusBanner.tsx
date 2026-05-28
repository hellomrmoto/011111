"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface UploadResult {
  fileName: string;
  imported: number;
  total: number;
  errors: { rowIndex: number; reason: string }[];
}

interface Props {
  results: UploadResult[];
  onDismiss: () => void;
}

export function UploadStatusBanner({ results, onDismiss }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (results.length === 0) return null;

  const totalImported = results.reduce((a, r) => a + r.imported, 0);
  const totalRejected = results.reduce((a, r) => a + r.errors.length, 0);
  const allErrors = results.flatMap((r) => r.errors);

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm",
        totalRejected > 0
          ? "border-yellow-500/30 bg-yellow-500/10"
          : "border-green-500/30 bg-green-500/10"
      )}
    >
      <div className="flex items-center gap-2">
        {totalRejected > 0 ? (
          <XCircle className="h-4 w-4 text-yellow-400 shrink-0" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
        )}
        <span className="flex-1 text-gray-200">
          Imported <strong>{totalImported}</strong> bets
          {totalRejected > 0 && (
            <>
              . <strong>{totalRejected}</strong> rows rejected.{" "}
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-yellow-400 underline hover:no-underline"
              >
                View details
                {expanded ? (
                  <ChevronUp className="inline h-3 w-3 ml-0.5" />
                ) : (
                  <ChevronDown className="inline h-3 w-3 ml-0.5" />
                )}
              </button>
            </>
          )}
        </span>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {expanded && allErrors.length > 0 && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded border border-white/10 bg-gray-900/50 p-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left py-1 pr-4 w-16">Row</th>
                <th className="text-left py-1">Reason</th>
              </tr>
            </thead>
            <tbody>
              {allErrors.slice(0, 100).map((e, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-0.5 pr-4 text-gray-400">{e.rowIndex}</td>
                  <td className="py-0.5 text-gray-300">{e.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
