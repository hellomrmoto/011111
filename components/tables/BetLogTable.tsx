"use client";

import { useState, useMemo, memo } from "react";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { useBetStore } from "@/lib/state/useBetStore";
import { selectFilteredBets } from "@/lib/state/selectors";
import { formatMoney } from "@/lib/utils/money";
import { formatDisplay } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import type { Bet } from "@/types/bet";

const PAGE_SIZE = 50;

type SortField = "placedAt" | "sport" | "betType" | "oddsAmerican" | "riskCents" | "netResultCents" | "clvBps";

function statusBadge(status: Bet["status"]) {
  const map: Record<Bet["status"], { variant: "success" | "danger" | "warning" | "neutral" | "default"; label: string }> = {
    WON: { variant: "success", label: "Won" },
    LOST: { variant: "danger", label: "Lost" },
    PENDING: { variant: "warning", label: "Pending" },
    PUSH: { variant: "neutral", label: "Push" },
    VOID: { variant: "neutral", label: "Void" },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function BetLogTableInner() {
  const filtered = useBetStore(selectFilteredBets);
  const gradingInFlight = useBetStore((s) => s.gradingInFlight);
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("placedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;

      switch (sortField) {
        case "placedAt":
          av = a.placedAt;
          bv = b.placedAt;
          break;
        case "sport":
          av = a.sport;
          bv = b.sport;
          break;
        case "betType":
          av = a.betType;
          bv = b.betType;
          break;
        case "oddsAmerican":
          av = a.oddsAmerican;
          bv = b.oddsAmerican;
          break;
        case "riskCents":
          av = a.riskCents;
          bv = b.riskCents;
          break;
        case "netResultCents":
          av = a.netResultCents ?? 0;
          bv = b.netResultCents ?? 0;
          break;
        case "clvBps":
          av = a.clvBps ?? 0;
          bv = b.clvBps ?? 0;
          break;
      }

      if (typeof av === "string") {
        return sortDir === "asc" ? av.localeCompare(String(bv)) : String(bv).localeCompare(av);
      }
      return sortDir === "asc" ? av - (bv as number) : (bv as number) - av;
    });
  }, [filtered, sortField, sortDir]);

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const pageSlice = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return <ChevronDown className="h-3 w-3 opacity-30 inline" />;
    return sortDir === "desc"
      ? <ChevronDown className="h-3 w-3 inline" />
      : <ChevronUp className="h-3 w-3 inline" />;
  };

  const hasClv = filtered.some((b) => b.clvBps !== undefined);

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-gray-900 p-8 text-center">
        <p className="text-sm text-gray-400">
          No bets match the current filters.{" "}
          <button
            className="text-blue-400 underline hover:no-underline"
            onClick={() => useBetStore.getState().resetFilters()}
          >
            Reset filters
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-gray-200">
          Bet Log
          <span className="ml-2 text-xs text-gray-500">
            {filtered.length.toLocaleString()} bets
          </span>
        </span>
        {gradingInFlight && (
          <span className="flex items-center gap-1 text-xs text-yellow-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Grading…
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-800/50">
            <tr className="text-gray-400">
              {(
                [
                  ["placedAt", "Date"],
                  ["sport", "Sport"],
                  ["betType", "Type"],
                  [null, "Selection"],
                  ["oddsAmerican", "Odds"],
                  ["riskCents", "Risk"],
                  [null, "Result"],
                  ["netResultCents", "Net"],
                  ...(hasClv ? [["clvBps", "CLV"]] as [string | null, string][] : []),
                ] as [SortField | null, string][]
              ).map(([field, label]) => (
                <th
                  key={label}
                  className={cn(
                    "py-2 px-3 text-left font-medium",
                    field && "cursor-pointer select-none hover:text-gray-200"
                  )}
                  onClick={() => field && toggleSort(field as SortField)}
                >
                  {label}
                  {field && <SortIcon field={field as SortField} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pageSlice.map((bet) => (
              <tr
                key={bet.betId}
                className={cn("hover:bg-white/5", {
                  "animate-pulse": bet.status === "PENDING",
                })}
              >
                <td className="py-2 px-3 text-gray-400 whitespace-nowrap">{formatDisplay(bet.placedAt)}</td>
                <td className="py-2 px-3">
                  <span className={cn("font-medium", {
                    "text-blue-400": bet.sport === "NBA",
                    "text-green-400": bet.sport === "MLB",
                    "text-gray-400": bet.sport === "OTHER",
                  })}>
                    {bet.sport}
                  </span>
                </td>
                <td className="py-2 px-3 text-gray-400">{bet.betType === "PARLAY" ? "Parlay" : "Straight"}</td>
                <td className="py-2 px-3 max-w-[200px]">
                  <Tooltip content={bet.selection}>
                    <span className="truncate block max-w-[200px] text-gray-300 cursor-default">{bet.selection}</span>
                  </Tooltip>
                </td>
                <td className={cn("py-2 px-3 whitespace-nowrap font-mono", {
                  "text-green-400": bet.oddsAmerican > 0,
                  "text-gray-300": bet.oddsAmerican < 0,
                })}>
                  {bet.oddsAmerican > 0 ? "+" : ""}{bet.oddsAmerican}
                </td>
                <td className="py-2 px-3 text-gray-300 whitespace-nowrap">{formatMoney(bet.riskCents)}</td>
                <td className="py-2 px-3">
                  {bet.status === "PENDING" && gradingInFlight
                    ? <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />
                    : statusBadge(bet.status)
                  }
                </td>
                <td className={cn("py-2 px-3 font-medium whitespace-nowrap", {
                  "text-green-400": (bet.netResultCents ?? 0) > 0,
                  "text-red-400": (bet.netResultCents ?? 0) < 0,
                  "text-gray-400": bet.netResultCents === undefined || bet.netResultCents === 0,
                })}>
                  {bet.netResultCents !== undefined ? formatMoney(bet.netResultCents) : "—"}
                </td>
                {hasClv && (
                  <td className={cn("py-2 px-3 whitespace-nowrap", {
                    "text-green-400": (bet.clvBps ?? 0) > 0,
                    "text-red-400": (bet.clvBps ?? 0) < 0,
                    "text-gray-400": bet.clvBps === undefined,
                  })}>
                    {bet.clvBps !== undefined
                      ? `${bet.clvBps > 0 ? "+" : ""}${bet.clvBps} bps`
                      : "—"
                    }
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2">
          <span className="text-xs text-gray-500">
            Page {page + 1} of {pageCount}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
            >
              ← Prev
            </button>
            <button
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const BetLogTable = memo(BetLogTableInner);
