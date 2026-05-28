"use client";

import { create } from "zustand";
import { persist, subscribeWithSelector, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import type { Bet } from "@/types/bet";
import type { FilterState } from "@/types/filters";
import type { ClvPatch } from "@/types/scraping";
import { DEFAULT_FILTERS } from "@/types/filters";

const idbStorage = {
  getItem: async (k: string): Promise<string | null> => {
    const val = await get<string>(k);
    return val ?? null;
  },
  setItem: async (k: string, v: string): Promise<void> => {
    await set(k, v);
  },
  removeItem: async (k: string): Promise<void> => {
    await del(k);
  },
};

export interface IngestionMeta {
  fileNames: string[];
  lastIngestedAt: string | null;
  rejectedRowCount: number;
  rejectionReasons: { rowIndex: number; reason: string }[];
}

export interface BetStore {
  bets: Bet[];
  ingestionMeta: IngestionMeta;
  filters: FilterState;
  hasHydrated: boolean;
  gradingInFlight: boolean;
  clvInFlight: boolean;

  addBets: (incoming: Bet[], meta?: Partial<IngestionMeta>) => void;
  removeAllBets: () => void;
  applyGrading: (graded: Bet[]) => void;
  applyClv: (clvUpdates: ClvPatch[]) => void;
  setFilters: (next: Partial<FilterState>) => void;
  resetFilters: () => void;
  setGradingInFlight: (v: boolean) => void;
  setClvInFlight: (v: boolean) => void;
  _setHasHydrated: (v: boolean) => void;
}

const DEFAULT_META: IngestionMeta = {
  fileNames: [],
  lastIngestedAt: null,
  rejectedRowCount: 0,
  rejectionReasons: [],
};

export const useBetStore = create<BetStore>()(
  subscribeWithSelector(
    persist(
      (storeSet) => ({
        bets: [],
        ingestionMeta: DEFAULT_META,
        filters: DEFAULT_FILTERS,
        hasHydrated: false,
        gradingInFlight: false,
        clvInFlight: false,

        addBets: (incoming, meta) => {
          storeSet((state) => {
            const existingIds = new Set(state.bets.map((b) => b.betId));
            const newBets = incoming.filter((b) => !existingIds.has(b.betId));
            return {
              bets: [...state.bets, ...newBets],
              ingestionMeta: {
                fileNames: [
                  ...state.ingestionMeta.fileNames,
                  ...(meta?.fileNames ?? []),
                ],
                lastIngestedAt: new Date().toISOString(),
                rejectedRowCount:
                  state.ingestionMeta.rejectedRowCount +
                  (meta?.rejectedRowCount ?? 0),
                rejectionReasons: [
                  ...state.ingestionMeta.rejectionReasons,
                  ...(meta?.rejectionReasons ?? []),
                ],
              },
            };
          });
        },

        removeAllBets: () => {
          storeSet({
            bets: [],
            ingestionMeta: DEFAULT_META,
          });
        },

        applyGrading: (graded) => {
          storeSet((state) => {
            const gradedMap = new Map(graded.map((b) => [b.betId, b]));
            return {
              bets: state.bets.map((b) => gradedMap.get(b.betId) ?? b),
            };
          });
        },

        applyClv: (clvUpdates) => {
          storeSet((state) => {
            const patchMap = new Map(clvUpdates.map((p) => [p.betId, p]));
            return {
              bets: state.bets.map((b) => {
                const patch = patchMap.get(b.betId);
                if (!patch) return b;
                return {
                  ...b,
                  closingLineAmerican: patch.closingLineAmerican,
                  clvBps: patch.clvBps,
                };
              }),
            };
          });
        },

        setFilters: (next) => {
          storeSet((state) => ({
            filters: { ...state.filters, ...next },
          }));
        },

        resetFilters: () => {
          storeSet({ filters: DEFAULT_FILTERS });
        },

        setGradingInFlight: (v) => storeSet({ gradingInFlight: v }),
        setClvInFlight: (v) => storeSet({ clvInFlight: v }),

        _setHasHydrated: (v) => storeSet({ hasHydrated: v }),
      }),
      {
        name: "fd-dash-v1",
        storage: createJSONStorage(() => idbStorage),
        partialize: (state) => ({
          bets: state.bets,
          filters: state.filters,
          ingestionMeta: state.ingestionMeta,
          version: 1,
        }),
        onRehydrateStorage: () => (state) => {
          state?._setHasHydrated(true);
        },
        version: 1,
        migrate: (persistedState) => {
          return persistedState as { bets: Bet[]; filters: FilterState; ingestionMeta: IngestionMeta; version: number };
        },
      }
    )
  )
);
