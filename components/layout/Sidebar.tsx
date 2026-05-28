"use client";

import { TrendingUp, BarChart2, Table2, Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  return (
    <aside className="hidden w-14 flex-col items-center gap-4 border-r border-white/10 bg-gray-950 py-4 lg:flex">
      <TrendingUp className="h-6 w-6 text-blue-400" />
      <nav className="flex flex-col items-center gap-3 mt-4">
        <SidebarIcon icon={BarChart2} label="Dashboard" active />
        <SidebarIcon icon={Table2} label="Bet Log" />
        <SidebarIcon icon={Upload} label="Import" />
      </nav>
    </aside>
  );
}

function SidebarIcon({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
