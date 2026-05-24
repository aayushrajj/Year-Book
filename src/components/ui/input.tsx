import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-ink-200 bg-cream-50 px-3 text-base text-ink-900",
        "placeholder:text-ink-300",
        "focus:border-ink-700 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors duration-150",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[88px] w-full rounded-md border border-ink-200 bg-cream-50 p-3 text-base text-ink-900",
        "placeholder:text-ink-300",
        "focus:border-ink-700 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors duration-150",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

// Select moved to ./select.tsx (Radix-based, styled to match the design system).
// Use `import { Select, SelectItem, SelectGroup } from "@/components/ui/select"`.
