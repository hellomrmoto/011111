"use client";

import { useBetStore } from "@/lib/state/useBetStore";
import type { Sport } from "@/types/bet";
import { cn } from "@/lib/utils/cn";

const SPORTS: { label: string; value: Sport }[] = [
  { label: "NBA", value: "NBA" },
  { label: "MLB", value: "MLB" },
  { label: "Other", value: "OTHER" },
];

export function SportToggle() {
  const { filters, setFilters } = useBetStore((s) => ({
    filters: s.filters,
    setFilters: s.setFilters,
  }));

  const toggle = (sport: Sport) => {
    const active = filters.sports.includes(sport);
    if (active && filters.sports.length === 1) return;
    const next = active
      ? filters.sports.filter((s) => s !== sport)
      : [...filters.sports, sport];
    setFilters({ sports: next });
  };

  return (
    <div className="flex gap-0.5">
      {SPORTS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            filters.sports.includes(value)
              ? "bg-indigo-600 text-white"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
