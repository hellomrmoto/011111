"use client";

import type { BetStore } from "./useBetStore";
import { applyFilters } from "@/lib/analytics/filters";
import { computeKpis } from "@/lib/analytics/metrics";
import { buildPnLSeries, buildLeagueBreakdown, buildPropGrid } from "@/lib/analytics/aggregations";
import type { KpiBundle } from "@/lib/analytics/metrics";
import type { PnLPoint, LeagueRow, PropRow } from "@/lib/analytics/aggregations";
import type { Bet } from "@/types/bet";

// Memoization cache
let lastBets: Bet[] | null = null;
let lastFiltersKey = "";
let cachedFiltered: Bet[] = [];

function getFilteredBets(state: BetStore): Bet[] {
  const filtersKey = JSON.stringify(state.filters);
  if (state.bets === lastBets && filtersKey === lastFiltersKey) {
    return cachedFiltered;
  }
  cachedFiltered = applyFilters(state.bets, state.filters);
  lastBets = state.bets;
  lastFiltersKey = filtersKey;
  return cachedFiltered;
}

export function selectFilteredBets(state: BetStore): Bet[] {
  return getFilteredBets(state);
}

export function selectKpis(state: BetStore): KpiBundle {
  return computeKpis(getFilteredBets(state));
}

export function selectPnLSeries(state: BetStore): PnLPoint[] {
  return buildPnLSeries(getFilteredBets(state));
}

export function selectLeagueBreakdown(state: BetStore): LeagueRow[] {
  return buildLeagueBreakdown(getFilteredBets(state));
}

export function selectPropGrid(state: BetStore): PropRow[] {
  return buildPropGrid(getFilteredBets(state));
}
