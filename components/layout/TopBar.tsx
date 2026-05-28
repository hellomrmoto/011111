"use client";

import { TrendingUp, Settings, Database } from "lucide-react";
import { useBetStore } from "@/lib/state/useBetStore";

export function TopBar() {
  const { bets, filters, gradingInFlight, clvInFlight } = useBetStore((s) => ({
    bets: s.bets,
    filters: s.filters,
    gradingInFlight: s.gradingInFlight,
    clvInFlight: s.clvInFlight,
  }));

  const activeFilters: string[] = [];
  if (filters.sports.length < 3) activeFilters.push(filters.sports.join(", "));
  if (filters.betTypes.length < 2) activeFilters.push(filters.betTypes.join(", "));
  if (filters.datePreset !== "ALL") activeFilters.push(filters.datePreset);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/10 bg-gray-950/90 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-400" />
        <span className="font-bold text-white">FD Analytics</span>
      </div>

      <div className="flex-1" />

      {(gradingInFlight || clvInFlight) && (
        <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
          <Database className="h-3 w-3 animate-pulse" />
          {gradingInFlight ? "Grading bets…" : "Fetching CLV…"}
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="hidden items-center gap-1 text-xs text-gray-400 sm:flex">
          Filtered:
          {activeFilters.map((f) => (
            <span key={f} className="rounded bg-white/10 px-1.5 py-0.5 text-gray-300">
              {f}
            </span>
          ))}
        </div>
      )}

      <span className="text-xs text-gray-500">{bets.length} bets loaded</span>

      <button className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
        <Settings className="h-4 w-4" />
      </button>
    </header>
  );
}
