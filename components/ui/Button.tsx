import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-blue-600 text-white hover:bg-blue-700": variant === "default",
          "hover:bg-white/10 text-gray-300": variant === "ghost",
          "border border-white/20 text-gray-300 hover:bg-white/10": variant === "outline",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
        },
        {
          "h-7 px-2 text-xs": size === "sm",
          "h-9 px-4 text-sm": size === "md",
          "h-11 px-6 text-base": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
}
