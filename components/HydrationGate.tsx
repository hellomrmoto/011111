"use client";

import { type ReactNode } from "react";
import { useBetStore } from "@/lib/state/useBetStore";
import { Skeleton } from "@/components/ui/Skeleton";

export function HydrationGate({ children }: { children: ReactNode }) {
  const hasHydrated = useBetStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="p-4 space-y-4">
        {/* Skeleton KPI grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-gray-900 p-4">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-7 w-28 mb-1" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>
        {/* Skeleton chart */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4">
          <Skeleton className="h-4 w-36 mb-4" />
          <Skeleton className="h-56 w-full" />
        </div>
        {/* Skeleton 2-col */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-gray-900 p-4">
            <Skeleton className="h-4 w-36 mb-4" />
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="rounded-xl border border-white/10 bg-gray-900 p-4">
            <Skeleton className="h-4 w-36 mb-4" />
            <Skeleton className="h-56 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
