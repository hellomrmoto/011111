"use client";

import { useState, useCallback } from "react";
import { useBetStore } from "@/lib/state/useBetStore";
import type { DatePreset } from "@/types/filters";
import { cn } from "@/lib/utils/cn";
import { Calendar } from "lucide-react";

const PRESETS: { label: string; value: DatePreset }[] = [
  { label: "7D", value: "7D" },
  { label: "30D", value: "30D" },
  { label: "90D", value: "90D" },
  { label: "YTD", value: "YTD" },
  { label: "All", value: "ALL" },
  { label: "Custom", value: "CUSTOM" },
];

export function DateRangePicker() {
  const { filters, setFilters } = useBetStore((s) => ({
    filters: s.filters,
    setFilters: s.setFilters,
  }));

  const [showCustom, setShowCustom] = useState(false);

  const selectPreset = useCallback(
    (preset: DatePreset) => {
      if (preset === "CUSTOM") {
        setShowCustom(true);
        setFilters({ datePreset: "CUSTOM" });
      } else {
        setShowCustom(false);
        setFilters({ datePreset: preset, dateRange: { from: null, to: null } });
      }
    },
    [setFilters]
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Calendar className="h-3.5 w-3.5 text-gray-400" />
      <div className="flex gap-0.5">
        {PRESETS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => selectPreset(value)}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              filters.datePreset === value
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {showCustom && (
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={filters.dateRange.from ? filters.dateRange.from.slice(0, 10) : ""}
            onChange={(e) =>
              setFilters({
                dateRange: {
                  ...filters.dateRange,
                  from: e.target.value ? new Date(e.target.value).toISOString() : null,
                },
              })
            }
            className="rounded border border-white/10 bg-gray-800 px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-gray-500 text-xs">to</span>
          <input
            type="date"
            value={filters.dateRange.to ? filters.dateRange.to.slice(0, 10) : ""}
            onChange={(e) =>
              setFilters({
                dateRange: {
                  ...filters.dateRange,
                  to: e.target.value ? new Date(e.target.value).toISOString() : null,
                },
              })
            }
            className="rounded border border-white/10 bg-gray-800 px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
