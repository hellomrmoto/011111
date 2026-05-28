import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/Skeleton";

interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  tooltip: string;
  loading?: boolean;
}

export function KpiCard({ label, value, subValue, icon, trend, tooltip, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-gray-900 p-4">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-7 w-28 mb-1" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-gray-900 p-4">
      <Tooltip content={tooltip}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400 cursor-help">{label}</span>
          <span
            className={cn("text-gray-400", {
              "text-green-400": trend === "up",
              "text-red-400": trend === "down",
            })}
          >
            {icon}
          </span>
        </div>
      </Tooltip>
      <div
        className={cn("text-2xl font-bold", {
          "text-green-400": trend === "up",
          "text-red-400": trend === "down",
          "text-white": trend === "neutral" || !trend,
        })}
      >
        {value}
      </div>
      {subValue && (
        <div className="mt-0.5 text-xs text-gray-500">{subValue}</div>
      )}
    </div>
  );
}
