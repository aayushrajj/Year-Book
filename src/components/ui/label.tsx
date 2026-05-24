import type * as React from "react";
import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  hint?: string;
  htmlFor: string; // required — labels must associate with a control
};

export function Label({ children, hint, className, htmlFor, ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("flex flex-col gap-1.5 text-sm font-medium text-ink-700", className)}
      {...props}
    >
      <span className="flex items-baseline justify-between">
        <span>{children}</span>
        {hint ? <span className="font-mono text-xs text-ink-300">{hint}</span> : null}
      </span>
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="font-mono text-xs text-red-700">{message}</span>;
}
