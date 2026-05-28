import type { Bet } from "@/types/bet";
import type { FilterState } from "@/types/filters";
import { getPresetRange } from "@/lib/utils/dates";

export function applyFilters(bets: Bet[], filters: FilterState): Bet[] {
  let result = bets;

  // Sport filter
  if (filters.sports.length > 0) {
    result = result.filter((b) => filters.sports.includes(b.sport));
  }

  // BetType filter
  if (filters.betTypes.length > 0) {
    result = result.filter((b) => filters.betTypes.includes(b.betType));
  }

  // Date filter
  let from: string | null = null;
  let to: string | null = null;

  if (filters.datePreset === "CUSTOM") {
    from = filters.dateRange.from;
    to = filters.dateRange.to;
  } else if (filters.datePreset !== "ALL") {
    const range = getPresetRange(filters.datePreset);
    from = range.from;
    to = range.to;
  }

  if (from) {
    const fromMs = new Date(from).getTime();
    result = result.filter((b) => new Date(b.placedAt).getTime() >= fromMs);
  }
  if (to) {
    const toMs = new Date(to).getTime();
    result = result.filter((b) => new Date(b.placedAt).getTime() <= toMs);
  }

  return result;
}
