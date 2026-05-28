"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Percent, Trophy, Hash, Flame, Target } from "lucide-react";
import { useBetStore } from "@/lib/state/useBetStore";
import { selectKpis } from "@/lib/state/selectors";
import { KpiCard } from "./KpiCard";
import { formatMoney } from "@/lib/utils/money";

export function KpiGrid() {
  const kpis = useBetStore(selectKpis);
  const hasData = useBetStore((s) => s.bets.length > 0);

  const cards = useMemo(() => {
    const { netProfitCents, roiPercent, winRatePercent, totalWagers, pendingCount, streak, avgClvBps } = kpis;
    const profitPositive = netProfitCents >= 0;

    return [
      {
        label: "Net P/L",
        value: formatMoney(netProfitCents),
        icon: profitPositive
          ? <TrendingUp className="h-4 w-4" />
          : <TrendingDown className="h-4 w-4" />,
        trend: (profitPositive ? "up" : "down") as "up" | "down",
        tooltip: "Total profit/loss on all settled bets (wins − stakes on losses)",
      },
      {
        label: "ROI",
        value: `${roiPercent >= 0 ? "+" : ""}${roiPercent.toFixed(2)}%`,
        icon: <Percent className="h-4 w-4" />,
        trend: (roiPercent >= 0 ? "up" : "down") as "up" | "down",
        tooltip: "Return on investment: net profit ÷ total amount risked",
      },
      {
        label: "Win Rate",
        value: `${winRatePercent.toFixed(1)}%`,
        subValue: "of settled bets",
        icon: <Trophy className="h-4 w-4" />,
        trend: (winRatePercent >= 50 ? "up" : "down") as "up" | "down",
        tooltip: "Wins ÷ (wins + losses), excluding pushes and voids",
      },
      {
        label: "Total Wagers",
        value: totalWagers.toLocaleString(),
        subValue: pendingCount > 0 ? `+${pendingCount} pending` : undefined,
        icon: <Hash className="h-4 w-4" />,
        trend: "neutral" as const,
        tooltip: "Count of settled bets. Parenthetical shows pending bets awaiting results.",
      },
      {
        label: "Active Streak",
        value: streak.type === "NONE" ? "—" : `${streak.type[0]}${streak.count}`,
        icon: <Flame className={`h-4 w-4 ${streak.type === "WIN" && streak.count >= 3 ? "text-orange-400" : ""}`} />,
        trend: (streak.type === "WIN" ? "up" : streak.type === "LOSS" ? "down" : "neutral") as "up" | "down" | "neutral",
        tooltip: "Current consecutive win or loss streak on settled bets",
      },
      {
        label: "Avg CLV",
        value: avgClvBps !== null ? `${avgClvBps > 0 ? "+" : ""}${avgClvBps} bps` : "—",
        icon: <Target className="h-4 w-4" />,
        trend: avgClvBps !== null ? (avgClvBps >= 0 ? "up" : "down") as "up" | "down" : "neutral" as const,
        tooltip: "Average closing line value in basis points. Positive = beat the close.",
      },
    ];
  }, [kpis]);

  if (!hasData) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <KpiCard key={c.label} {...c} loading />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <KpiCard key={c.label} {...c} />
      ))}
    </div>
  );
}
