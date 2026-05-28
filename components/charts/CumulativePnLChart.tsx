"use client";

import { memo, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import { useBetStore } from "@/lib/state/useBetStore";
import { selectPnLSeries } from "@/lib/state/selectors";
import { ChartCard } from "./ChartCard";
import { formatMoney } from "@/lib/utils/money";
import { formatDisplayFull } from "@/lib/utils/dates";

interface TooltipPayload {
  date: string;
  dailyPnLCents: number;
  cumulativePnLCents: number;
  betCount: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: TooltipPayload }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-gray-900 p-3 shadow-xl text-xs">
      <p className="font-medium text-gray-200 mb-2">{formatDisplayFull(d.date)}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-gray-400">Daily P/L</span>
          <span className={d.dailyPnLCents >= 0 ? "text-green-400" : "text-red-400"}>
            {formatMoney(d.dailyPnLCents)}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-400">Cumulative</span>
          <span className={d.cumulativePnLCents >= 0 ? "text-green-400" : "text-red-400"}>
            {formatMoney(d.cumulativePnLCents)}
          </span>
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

function CumulativePnLChartInner() {
  const series = useBetStore(selectPnLSeries);

  const data = useMemo(
    () =>
      series.map((p) => ({
        ...p,
        cumulativeDollars: p.cumulativePnLCents / 100,
        dailyDollars: p.dailyPnLCents / 100,
      })),
    [series]
  );

  const isEmpty = data.length === 0;

  return (
    <ChartCard
      title="Cumulative P/L"
      tooltip="Running profit/loss over time based on settled bets"
      empty={isEmpty}
      emptyMessage="Upload a bet log to see your P/L curve"
      emptyIcon={<LineChartIcon className="h-12 w-12" />}
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
          <defs>
            <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v >= 0 ? "" : ""}${v.toFixed(0)}`}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 2" />
          <Tooltip content={<MemoTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulativeDollars"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#pnlGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export const CumulativePnLChart = memo(CumulativePnLChartInner);
