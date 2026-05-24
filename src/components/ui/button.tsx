import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary:
    "bg-ink-900 text-cream-100 hover:bg-ink-700 disabled:bg-ink-300",
  secondary:
    "bg-cream-200 text-ink-900 hover:bg-cream-300 disabled:opacity-50 border border-ink-200",
  ghost: "bg-transparent text-ink-700 hover:bg-cream-200 disabled:opacity-50",
  danger:
    "bg-transparent text-red-700 border border-red-700 hover:bg-red-700 hover:text-cream-100 disabled:opacity-50",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-base",
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-sans transition-colors duration-200 ease-quiet",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900",
        "disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
