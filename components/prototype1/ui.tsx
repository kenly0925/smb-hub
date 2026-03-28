"use client";

import { LEVEL_OPTIONS } from "@/lib/prototype1/data";
import { PolicyLevel } from "@/lib/prototype1/types";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Circle } from "lucide-react";

export function ShellCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-md border border-[var(--p1-border)] bg-[var(--p1-surface)] shadow-[var(--p1-shadow)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Button({
  className,
  variant = "secondary",
  children,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variantClass =
    variant === "primary"
      ? "border border-[#d8e5ff] bg-[#c8dcfe] text-[#2f3340] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(0,0,0,0.28)] hover:bg-[#d2e1ff]"
      : variant === "ghost"
        ? "border border-transparent bg-transparent text-[var(--p1-text-soft)] hover:bg-white/6"
        : "border border-[#4a4a54] bg-[#5a5a68] text-[var(--p1-text-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.28)] hover:bg-[#646472]";

  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-5 py-2 text-sm font-bold leading-none tracking-[0.01em] transition focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 [&_img]:h-4 [&_img]:w-4 [&_img]:shrink-0 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
        variantClass,
        className,
      )}
      style={{
        fontWeight: 700,
        fontVariationSettings: '"wght" 700',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
      : tone === "warning"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
        : "border-[var(--p1-border)] bg-[var(--p1-surface-2)] text-[var(--p1-text-soft)]";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-3 py-1 text-xs font-medium",
        toneClass,
      )}
    >
      {children}
    </span>
  );
}

export function StatTile({
  label,
  value,
  note,
  className,
}: {
  label: string;
  value: string | number;
  note?: React.ReactNode;
  className?: string;
}) {
  return (
    <ShellCard className={cn("flex h-full flex-col p-5", className)}>
      <div className="text-sm font-medium text-[var(--p1-text-muted)]">{label}</div>
      <div className="mt-auto text-[7.5rem] font-light leading-none tracking-[-0.05em] text-[var(--p1-text-soft)]">
        {value}
      </div>
      {note ? (
        <div className="mt-4 text-xs text-[var(--p1-text-muted)]">{note}</div>
      ) : null}
    </ShellCard>
  );
}

export function DataTable({
  headers,
  children,
  tableClassName,
}: {
  headers: string[];
  children: React.ReactNode;
  tableClassName?: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--p1-border)]">
      <table
        className={cn("min-w-full border-collapse text-left text-[15px]", tableClassName)}
      >
        <thead className="bg-[var(--p1-surface-2)] text-[var(--p1-text-muted)]">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full border transition",
        checked
          ? "border-[#6f84ff] bg-[#6f84ff]"
          : "border-[#7d8289] bg-[var(--p1-surface-3)]",
      )}
    >
      <span
        className={cn(
          "absolute h-5 w-5 rounded-full bg-[#f4f5f8] shadow transition",
          checked ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}

export function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded border transition",
        checked
          ? "border-[#c8dcfe] bg-[#c8dcfe] text-[#22242d]"
          : "border-[#8e939c] bg-transparent text-transparent",
      )}
    >
      <Check className="h-3.5 w-3.5" />
    </button>
  );
}

export function Radio({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full border transition",
        checked
          ? "border-[#c8dcfe] bg-[#c8dcfe] text-[#2b2e39]"
          : "border-[#8e939c] bg-transparent text-transparent",
      )}
    >
      <Circle className="h-2.5 w-2.5 fill-current" />
    </button>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border border-[#111114] bg-[var(--p1-bg)] px-3 py-2.5 text-sm text-[var(--p1-text-soft)] outline-none transition placeholder:text-[var(--p1-text-muted)] focus:border-[#1a1a1f] focus:bg-[var(--p1-bg)]",
        props.className,
      )}
    />
  );
}

export function SelectField(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { className, ...selectProps } = props;

  return (
    <div className="relative w-full">
      <select
        {...selectProps}
        className={cn(
          "w-full appearance-none rounded-md border border-[#111114] bg-[var(--p1-bg)] px-3 py-2.5 pr-11 text-sm text-[var(--p1-text-soft)] outline-none transition focus:border-[#1a1a1f]",
          className,
        )}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--p1-text-muted)]" />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--p1-text-muted)]">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="mt-2 text-[2.125rem] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--p1-text-soft)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-4xl text-base leading-7 text-[var(--p1-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function SegmentedLevelControl({
  value,
  onChange,
  tone,
}: {
  value: PolicyLevel;
  onChange: (value: PolicyLevel) => void;
  tone: "detection" | "prevention";
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {LEVEL_OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md border px-3 py-4 text-center text-xs transition",
              isActive
                ? tone === "detection"
                  ? "border-[#c8dcfe]/40 bg-[#c8dcfe]/14 text-[#e9f1ff]"
                  : "border-emerald-500/30 bg-emerald-500/12 text-emerald-50"
                : "border-white/10 bg-[var(--p1-surface-2)] text-[var(--p1-text-muted)] hover:bg-[var(--p1-surface-3)]",
            )}
          >
            <div className="font-medium uppercase tracking-[0.16em]">
              {option.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function PageTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-[var(--p1-border)] bg-[var(--p1-surface-2)] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-sm px-4 py-2 text-sm transition",
            active === tab.value
              ? "bg-[var(--p1-surface-4)] text-white"
              : "text-[var(--p1-text-muted)] hover:text-white",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
