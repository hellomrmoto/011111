"use client";

import { useBetStore } from "@/lib/state/useBetStore";
import type { BetType } from "@/types/bet";
import { cn } from "@/lib/utils/cn";

const BET_TYPES: { label: string; value: BetType }[] = [
  { label: "Straights", value: "STRAIGHT" },
  { label: "Parlays", value: "PARLAY" },
];

export function BetStructureToggle() {
  const { filters, setFilters } = useBetStore((s) => ({
    filters: s.filters,
    setFilters: s.setFilters,
  }));

  const toggle = (type: BetType) => {
    const active = filters.betTypes.includes(type);
    if (active && filters.betTypes.length === 1) return;
    const next = active
      ? filters.betTypes.filter((t) => t !== type)
      : [...filters.betTypes, type];
    setFilters({ betTypes: next });
  };

  return (
    <div className="flex gap-0.5">
      {BET_TYPES.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            filters.betTypes.includes(value)
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
