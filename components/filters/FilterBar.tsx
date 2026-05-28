"use client";

import { useBetStore } from "@/lib/state/useBetStore";
import { DateRangePicker } from "./DateRangePicker";
import { SportToggle } from "./SportToggle";
import { BetStructureToggle } from "./BetStructureToggle";
import { Button } from "@/components/ui/Button";
import { RotateCcw } from "lucide-react";

export function FilterBar() {
  const { resetFilters } = useBetStore((s) => ({ resetFilters: s.resetFilters }));

  return (
    <div className="sticky top-14 z-30 flex flex-wrap items-center gap-3 border-b border-white/10 bg-gray-950/90 px-4 py-2 backdrop-blur">
      <DateRangePicker />
      <SportToggle />
      <BetStructureToggle />
      <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto">
        <RotateCcw className="mr-1.5 h-3 w-3" />
        Reset
      </Button>
    </div>
  );
}
