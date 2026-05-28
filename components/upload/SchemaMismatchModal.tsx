"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SCHEMA_MAP, normalizeHeader } from "@/lib/parsing/schemaMap";

interface Props {
  fileName: string;
  headers: string[];
  onClose: () => void;
  onConfirm: (mapping: Record<string, string>) => void;
}

const REQUIRED_CANONICAL = ["betId", "placedAt", "riskCents", "toWinCents", "oddsAmerican", "status"];
const CANONICAL_LABELS: Record<string, string> = {
  betId: "Bet ID",
  placedAt: "Placed At (date)",
  sport: "Sport",
  betType: "Bet Type",
  selection: "Selection",
  riskCents: "Risk / Wager",
  toWinCents: "To Win",
  oddsAmerican: "American Odds",
  status: "Status / Outcome",
  settledAt: "Settled At (date)",
  league: "League",
};

export function SchemaMismatchModal({ fileName, headers, onClose, onConfirm }: Props) {
  const initialMapping = Object.fromEntries(
    headers.map((h) => [h, SCHEMA_MAP[normalizeHeader(h)] ?? ""])
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const mapping: Record<string, string> = {};
    headers.forEach((h) => {
      const val = (form.elements.namedItem(h) as HTMLSelectElement)?.value ?? "";
      if (val) mapping[h] = val;
    });
    onConfirm(mapping);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <h2 className="font-semibold text-white">Column Mapping Required</h2>
            <p className="text-xs text-gray-400 mt-0.5">{fileName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-sm text-gray-300 mb-4">
            We could not auto-detect the column schema. Map your columns to the required fields below.
          </p>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {headers.map((h) => (
              <div key={h} className="flex items-center gap-3">
                <span className="w-36 truncate text-xs text-gray-300 font-mono" title={h}>
                  {h}
                </span>
                <span className="text-gray-500 text-xs">→</span>
                <select
                  name={h}
                  defaultValue={initialMapping[h] ?? ""}
                  className="flex-1 rounded border border-white/10 bg-gray-800 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">— skip —</option>
                  {Object.entries(CANONICAL_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                      {REQUIRED_CANONICAL.includes(key) ? " *" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">* Required fields</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Apply Mapping</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
