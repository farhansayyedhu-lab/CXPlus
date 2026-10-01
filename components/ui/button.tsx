import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
          size === "lg" ? "h-11 px-6 text-base" : size === "sm" ? "h-9 px-3" : "h-10 px-4 py-2",
          variant === "outline" ? "border border-white/20 bg-transparent hover:bg-white/10" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
