"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 border border-white/10 px-2 py-1 text-xs text-gray-200 shadow-lg z-50 pointer-events-none">
          {content}
        </span>
      )}
    </span>
  );
}
