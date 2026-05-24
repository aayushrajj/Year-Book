"use client";

import * as RadixSelect from "@radix-ui/react-select";
import type * as React from "react";
import { cn } from "@/lib/utils";

// ---- Compound API: <Select> wraps Radix; <SelectItem> for options. ---------

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  children: React.ReactNode;
  id?: string;
  /** Aria label when no visible label is wired through htmlFor. */
  "aria-label"?: string;
  className?: string;
};

export function Select({
  value,
  defaultValue,
  onValueChange,
  name,
  required,
  disabled,
  placeholder,
  children,
  id,
  className,
  ...rest
}: SelectProps) {
  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      required={required}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        id={id}
        aria-label={rest["aria-label"]}
        className={cn(
          "group flex h-11 w-full items-center justify-between gap-2 rounded-md border border-ink-200 bg-cream-50 px-3 text-left text-base text-ink-900",
          "data-[placeholder]:text-ink-300",
          "hover:border-ink-300",
          "focus:border-ink-700 focus:outline-none",
          "data-[state=open]:border-ink-700",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-150",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="text-ink-500 transition-transform duration-200 group-data-[state=open]:rotate-180">
          <ChevronIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)]",
            "overflow-hidden rounded-md border border-ink-200 bg-cream-50 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          )}
        >
          <RadixSelect.ScrollUpButton className="flex h-7 cursor-default items-center justify-center bg-cream-50 text-ink-500">
            <ChevronIcon className="rotate-180" />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="flex h-7 cursor-default items-center justify-center bg-cream-50 text-ink-500">
            <ChevronIcon />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

export function SelectItem({ value, children, disabled, className }: SelectItemProps) {
  return (
    <RadixSelect.Item
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-3 text-sm text-ink-900",
        "outline-none",
        "data-[highlighted]:bg-cream-200 data-[highlighted]:text-ink-900",
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-300",
        "transition-colors",
        className,
      )}
    >
      <RadixSelect.ItemIndicator className="absolute left-2 inline-flex items-center justify-center text-ink-700">
        <CheckIcon />
      </RadixSelect.ItemIndicator>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}

export function SelectGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <RadixSelect.Group>
      <RadixSelect.Label className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-widest text-ink-300">
        {label}
      </RadixSelect.Label>
      {children}
    </RadixSelect.Group>
  );
}

export function SelectSeparator() {
  return <RadixSelect.Separator className="my-1 h-px bg-ink-200/60" />;
}

// ---- icons -----------------------------------------------------------------

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      className={className}
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12">
      <path
        d="M3 8.5l3 3 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
