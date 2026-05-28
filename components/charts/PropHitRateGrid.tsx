"use client";

import { memo, useState, useMemo } from "react";
import { useBetStore } from "@/lib/state/useBetStore";
import { selectPropGrid } from "@/lib/state/selectors";
import { ChartCard } from "./ChartCard";
import { formatMoney } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";
import { ChevronUp, ChevronDown, Grid2x2 } from "lucide-react";
import type { PropRow } from "@/lib/analytics/aggregations";

type SortKey = keyof PropRow;

function PropHitRateGridInner() {
  const props = useBetStore(selectPropGrid);
  const [sortKey, setSortKey] = useState<SortKey>("hitRate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...props].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "desc" ? bv - av : av - bv;
      }
      return sortDir === "desc"
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
  }, [props, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (col !== sortKey) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return sortDir === "desc"
      ? <ChevronDown className="h-3 w-3" />
      : <ChevronUp className="h-3 w-3" />;
  };

  return (
    <ChartCard
      title="Prop Hit Rate Grid"
      tooltip="Props with ≥3 appearances. Hit rate colored green (>55%), red (<45%), neutral otherwise."
      empty={props.length === 0}
      emptyMessage="No repeated props yet (min 3 appearances)"
      emptyIcon={<Grid2x2 className="h-12 w-12" />}
    >
      <div className="overflow-auto max-h-60">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-900">
            <tr className="text-gray-400">
              {(
                [
                  ["prop", "Selection"],
                  ["count", "Count"],
                  ["hitRate", "Hit Rate"],
                  ["netPnLCents", "Net P/L"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th
                  key={key}
                  className="pb-2 text-left cursor-pointer select-none hover:text-gray-200"
                  onClick={() => toggleSort(key)}
                >
                  <span className="inline-flex items-center gap-0.5">
                    {label}
                    <SortIcon col={key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((row) => (
              <tr key={row.prop} className="hover:bg-white/5">
                <td className="py-1.5 pr-3 max-w-[180px] truncate text-gray-300" title={row.prop}>
                  {row.prop}
                </td>
                <td className="py-1.5 pr-3 text-gray-400">{row.count}</td>
                <td
                  className={cn("py-1.5 pr-3 font-medium", {
                    "text-green-400": row.hitRate > 55,
                    "text-red-400": row.hitRate < 45,
                    "text-gray-200": row.hitRate >= 45 && row.hitRate <= 55,
                  })}
                >
                  {row.hitRate.toFixed(1)}%
                </td>
                <td
                  className={cn("py-1.5 font-medium", {
                    "text-green-400": row.netPnLCents > 0,
                    "text-red-400": row.netPnLCents < 0,
                    "text-gray-400": row.netPnLCents === 0,
                  })}
                >
                  {formatMoney(row.netPnLCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

export const PropHitRateGrid = memo(PropHitRateGridInner);
