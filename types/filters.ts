import type { Sport, BetType } from "./bet";

export interface DateRange {
  from: string | null;
  to: string | null;
}

export type DatePreset = "7D" | "30D" | "90D" | "YTD" | "ALL" | "CUSTOM";

export interface FilterState {
  datePreset: DatePreset;
  dateRange: DateRange;
  sports: Sport[];
  betTypes: BetType[];
}

export const DEFAULT_FILTERS: FilterState = {
  datePreset: "ALL",
  dateRange: { from: null, to: null },
  sports: ["NBA", "MLB", "OTHER"],
  betTypes: ["STRAIGHT", "PARLAY"],
};
