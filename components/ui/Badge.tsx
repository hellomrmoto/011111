import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "danger" | "warning" | "neutral";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        {
          "bg-blue-500/20 text-blue-400": variant === "default",
          "bg-green-500/20 text-green-400": variant === "success",
          "bg-red-500/20 text-red-400": variant === "danger",
          "bg-yellow-500/20 text-yellow-400": variant === "warning",
          "bg-white/10 text-gray-400": variant === "neutral",
        },
        className
      )}
      {...props}
    />
  );
}
