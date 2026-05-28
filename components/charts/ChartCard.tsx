import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tooltip } from "@/components/ui/Tooltip";
import { Info } from "lucide-react";

interface ChartCardProps {
  title: string;
  tooltip?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  tooltip,
  loading,
  empty,
  emptyMessage,
  emptyIcon,
  children,
  className,
}: ChartCardProps) {
  return (
    <div className={`rounded-xl border border-white/10 bg-gray-900 p-4 ${className ?? ""}`}>
      <div className="flex items-center gap-1.5 mb-4">
        <span className="text-sm font-semibold text-gray-200">{title}</span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <Info className="h-3.5 w-3.5 text-gray-500 cursor-help" />
          </Tooltip>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : empty ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 text-gray-500">
          {emptyIcon && <span className="opacity-40">{emptyIcon}</span>}
          <p className="text-sm">{emptyMessage ?? "No data available"}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
