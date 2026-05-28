"use client";

import { useBetStore } from "@/lib/state/useBetStore";
import { HydrationGate } from "@/components/HydrationGate";
import { DropZone } from "@/components/upload/DropZone";
import { FilterBar } from "@/components/filters/FilterBar";
import { KpiGrid } from "@/components/kpis/KpiGrid";
import { CumulativePnLChart } from "@/components/charts/CumulativePnLChart";
import { LeagueBreakdownChart } from "@/components/charts/LeagueBreakdownChart";
import { PropHitRateGrid } from "@/components/charts/PropHitRateGrid";
import { BetLogTable } from "@/components/tables/BetLogTable";
import { PendingBetsTable } from "@/components/tables/PendingBetsTable";

export function DashboardClient() {
  const hasBets = useBetStore((s) => s.bets.length > 0);

  return (
    <HydrationGate>
      <div className="p-4 space-y-4">
        {/* Drop zone — visible always on empty, collapsible when data loaded */}
        {!hasBets && <DropZone />}
        {hasBets && (
          <details className="group">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 select-none list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              Import more data
            </summary>
            <div className="mt-3">
              <DropZone />
            </div>
          </details>
        )}

        {hasBets && (
          <>
            <FilterBar />
            <KpiGrid />
            <CumulativePnLChart />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <LeagueBreakdownChart />
              <PropHitRateGrid />
            </div>
            <PendingBetsTable />
            <BetLogTable />
          </>
        )}
      </div>
    </HydrationGate>
  );
}
