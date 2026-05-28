"use client";

import { memo } from "react";
import { Loader2 } from "lucide-react";
import { useBetStore } from "@/lib/state/useBetStore";
import { formatMoney } from "@/lib/utils/money";
import { formatDisplay } from "@/lib/utils/dates";

function PendingBetsTableInner() {
  const pending = useBetStore((s) => s.bets.filter((b) => b.status === "PENDING"));

  if (pending.length === 0) return null;

  return (
    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-yellow-500/20">
        <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-400">
          {pending.length} Pending Bet{pending.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-yellow-500/5">
            <tr className="text-gray-400">
              <th className="py-2 px-3 text-left">Date</th>
              <th className="py-2 px-3 text-left">Selection</th>
              <th className="py-2 px-3 text-left">Odds</th>
              <th className="py-2 px-3 text-left">Risk</th>
              <th className="py-2 px-3 text-left">To Win</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pending.map((bet) => (
              <tr key={bet.betId} className="animate-pulse hover:bg-white/5">
                <td className="py-2 px-3 text-gray-400">{formatDisplay(bet.placedAt)}</td>
                <td className="py-2 px-3 text-gray-300 max-w-[200px] truncate">{bet.selection}</td>
                <td className="py-2 px-3 text-gray-300">
                  {bet.oddsAmerican > 0 ? "+" : ""}{bet.oddsAmerican}
                </td>
                <td className="py-2 px-3 text-gray-300">{formatMoney(bet.riskCents)}</td>
                <td className="py-2 px-3 text-gray-300">{formatMoney(bet.toWinCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const PendingBetsTable = memo(PendingBetsTableInner);
