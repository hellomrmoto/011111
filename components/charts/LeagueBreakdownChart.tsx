"use client";

import { memo, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { useBetStore } from "@/lib/state/useBetStore";
import { selectLeagueBreakdown } from "@/lib/state/selectors";
import { ChartCard } from "./ChartCard";
import { formatMoney } from "@/lib/utils/money";

interface TPayload {
  sport: string;
  roiPercent: number;
  totalRiskedCents: number;
  winRate: number;
  betCount: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: TPayload }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-gray-900 p-3 shadow-xl text-xs">
      <p className="font-medium text-gray-200 mb-2">{d.sport}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-gray-400">ROI</span>
          <span className={d.roiPercent >= 0 ? "text-green-400" : "text-red-400"}>
            {d.roiPercent.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-400">Volume</span>
          <span className="text-gray-200">{formatMoney(d.totalRiskedCents)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-400">Win Rate</span>
          <span className="text-gray-200">{d.winRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-400">Bets</span>
          <span className="text-gray-200">{d.betCount}</span>
        </div>
      </div>
    </div>
  );
}

const MemoTooltip = memo(CustomTooltip);

function LeagueBreakdownChartInner() {
  const breakdown = useBetStore(selectLeagueBreakdown);

  const data = useMemo(
    () =>
      breakdown.map((r) => ({
        ...r,
        volumeDollars: r.totalRiskedCents / 100,
      })),
    [breakdown]
  );

  const isEmpty = data.length === 0;

  return (
    <ChartCard
      title="League Breakdown"
      tooltip="ROI % and volume by sport. Only NBA and MLB shown."
      empty={isEmpty}
      emptyMessage="No league data to display"
      emptyIcon={<BarChart2 className="h-12 w-12" />}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="sport" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<MemoTooltip />} />
          <Legend wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
          <Bar yAxisId="left" dataKey="roiPercent" name="ROI %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="volumeDollars" name="Volume ($)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export const LeagueBreakdownChart = memo(LeagueBreakdownChartInner);
