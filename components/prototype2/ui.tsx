"use client";

import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Dot,
  Info,
  Lock,
  MoreVertical,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function Prototype2ThemeRoot({
  theme,
  className,
  children,
}: {
  theme: "light" | "dark";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-p2-theme={theme}
      className={cn(
        theme === "dark" ? "p2-theme-dark" : "p2-theme-light",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function P2Surface({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-panel)] shadow-[var(--p2-shadow)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function P2TextLink({
  className,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className={cn(
        "inline-flex w-fit border-b border-current pb-px text-sm font-medium text-[var(--p2-link)] transition hover:opacity-90",
        className,
      )}
    >
      {children}
    </a>
  );
}

export type P2ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "link"
  | "danger";

export type P2ButtonSize = "sm" | "md" | "lg";

export function p2ButtonClasses({
  variant = "secondary",
  size = "md",
  className,
}: {
  variant?: P2ButtonVariant;
  size?: P2ButtonSize;
  className?: string;
} = {}) {
  const sizeClass =
    variant === "link"
      ? "h-auto px-0 text-sm"
      : size === "sm"
        ? "h-8 gap-1.5 px-3 text-xs"
        : size === "lg"
          ? "h-12 px-5 text-[15px]"
          : "min-h-10 h-10 px-4 text-sm";
  const variantClass =
    variant === "primary"
      ? "border border-[var(--p2-button-primary-border)] bg-[var(--p2-button-primary-bg)] text-[var(--p2-button-primary-text)] hover:bg-[var(--p2-button-primary-hover)] hover:text-[var(--p2-button-primary-text)] [&_svg]:text-[var(--p2-button-primary-text)]"
      : variant === "ghost"
        ? "border border-transparent bg-transparent text-[var(--p2-text)] hover:bg-[var(--p2-elevated)]"
        : variant === "outline"
          ? "border border-[var(--p2-accent)] bg-transparent text-[var(--p2-text)] hover:bg-[var(--p2-accent-soft)]"
          : variant === "link"
            ? "border-none bg-transparent text-[var(--p2-link)] hover:underline"
            : variant === "danger"
              ? "border border-[#ff4d57] bg-transparent text-[#ff4d57] hover:bg-[#ff4d57]/10"
              : "border border-[var(--p2-button-secondary-border)] bg-[var(--p2-button-secondary-bg)] text-[color:var(--p2-button-secondary-text)] hover:bg-[var(--p2-button-secondary-hover)]";

  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--p2-radius-button)] font-semibold leading-none transition focus:outline-none focus:ring-2 focus:ring-[var(--p2-accent)]/35 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0",
    sizeClass,
    variantClass,
    className,
  );
}

export function P2Button({
  className,
  variant = "secondary",
  size = "md",
  locked = false,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: P2ButtonVariant;
  size?: P2ButtonSize;
  locked?: boolean;
}) {
  return (
    <button
      {...props}
      className={p2ButtonClasses({ variant, size, className })}
    >
      {children}
      {locked ? <Lock className="h-3.5 w-3.5" /> : null}
    </button>
  );
}

function FieldFrame({
  label,
  error,
  disabled,
  locked,
  className,
  children,
}: {
  label?: string;
  error?: string;
  disabled?: boolean;
  locked?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      {label ? (
        <div className="mb-2 text-xs text-[var(--p2-text-muted)]">{label}</div>
      ) : null}
      <div
        className={cn(
          "flex min-h-10 items-center rounded-[var(--p2-radius-field)] border bg-[var(--p2-surface)] px-3 text-sm text-[var(--p2-text)] transition",
          error
            ? "border-[#ff4d57]"
            : disabled
              ? "border-[var(--p2-border-strong)] opacity-70"
              : "border-[var(--p2-border)] focus-within:border-[var(--p2-accent)]",
        )}
      >
        {children}
        {locked ? <Lock className="ml-auto h-3.5 w-3.5 text-[var(--p2-text-muted)]" /> : null}
      </div>
      {error ? (
        <div className="mt-1 text-xs text-[#ff4d57]">{error}</div>
      ) : null}
    </label>
  );
}

export function P2Input({
  label,
  error,
  locked = false,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  locked?: boolean;
}) {
  return (
    <FieldFrame
      label={label}
      error={error}
      disabled={props.disabled}
      locked={locked}
      className={className}
    >
      <input
        {...props}
        className="w-full bg-transparent outline-none placeholder:text-[var(--p2-text-muted)]"
      />
    </FieldFrame>
  );
}

export function P2Select({
  label,
  error,
  locked = false,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  locked?: boolean;
}) {
  return (
    <FieldFrame
      label={label}
      error={error}
      disabled={props.disabled}
      locked={locked}
      className={className}
    >
      <select
        {...props}
        className="w-full appearance-none bg-transparent pr-5 outline-none"
      >
        {children}
      </select>
      <ChevronDown className="h-4 w-4 text-[var(--p2-text-muted)]" />
    </FieldFrame>
  );
}

export function P2Checkbox({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
        className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded border transition",
        checked
          ? "border-[var(--p2-accent)] bg-[var(--p2-accent)] text-[var(--p2-accent-contrast)]"
          : "border-[var(--p2-border-strong)] bg-transparent text-transparent hover:border-[var(--p2-accent)]",
        className,
      )}
    >
      <Check className="h-3.5 w-3.5" />
    </button>
  );
}

export function P2Radio({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full border transition",
        checked
          ? "border-[var(--p2-accent)] text-[var(--p2-accent)]"
          : "border-[var(--p2-border-strong)] text-transparent hover:border-[var(--p2-accent)]",
        className,
      )}
    >
      <Dot className="h-5 w-5 fill-current" />
    </button>
  );
}

export function P2Switch({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 items-center rounded-[7px] border transition-colors duration-200",
        checked
          ? "border-[var(--p2-button-primary-border)] bg-[var(--p2-button-primary-bg)]"
          : "border-[var(--p2-switch-off-border)] bg-[var(--p2-switch-off-bg)]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute right-[7px] top-1/2 z-10 h-[10px] w-px -translate-y-1/2 rounded-full bg-[var(--p2-switch-line)] transition-opacity duration-200",
          checked ? "opacity-0" : "opacity-100",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute left-[3px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-[6px] bg-[var(--p2-switch-thumb)] shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function P2Pill({
  tone = "neutral",
  outline = false,
  className,
  children,
}: {
  tone?: "neutral" | "blue" | "red" | "yellow" | "green" | "teal";
  outline?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "blue"
      ? outline
        ? "border-[#8ab7ff] text-[#8ab7ff]"
        : "border-[#8ab7ff] bg-[#9fc2ff] text-[#17212f]"
      : tone === "red"
        ? outline
          ? "border-[#ff4d57] text-[#ff4d57]"
          : "border-[#ff4d57] bg-[#ff4d57] text-white"
        : tone === "yellow"
          ? outline
            ? "border-[#facc15] text-[#facc15]"
            : "border-[#facc15] bg-[#facc15] text-[#241d00]"
          : tone === "green"
            ? outline
              ? "border-[#34d399] text-[#34d399]"
              : "border-[#34d399] bg-[#34d399] text-[#072016]"
            : tone === "teal"
              ? outline
                ? "border-[#2dd4bf] text-[#2dd4bf]"
                : "border-[#2dd4bf] bg-[#2dd4bf] text-[#06211e]"
              : outline
                ? "border-[var(--p2-border-strong)] text-[var(--p2-text)]"
                : "border-[var(--p2-border)] bg-[var(--p2-elevated)] text-[var(--p2-text)]";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border px-2.5 py-1 text-xs font-semibold",
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function P2Tabs({
  tabs,
  activeId,
  onChange,
  className,
}: {
  tabs: Array<{ id: string; label: string; badge?: string }>;
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [trackStyle, setTrackStyle] = useState({ left: 0, width: 0 });
  const [hasMeasuredTrack, setHasMeasuredTrack] = useState(false);

  useLayoutEffect(() => {
    function updateTrackPosition() {
      const activeIndex = tabs.findIndex((tab) => tab.id === activeId);
      const activeTab = tabRefs.current[activeIndex >= 0 ? activeIndex : 0];

      if (!activeTab) {
        return;
      }

      setTrackStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
      setHasMeasuredTrack(true);
    }

    updateTrackPosition();
    window.addEventListener("resize", updateTrackPosition);

    return () => window.removeEventListener("resize", updateTrackPosition);
  }, [activeId, tabs]);

  return (
    <div
      className={cn(
        "w-full max-w-[48rem]",
        className,
      )}
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="relative flex items-stretch rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-tab-strip)] p-1 shadow-[var(--p2-shadow)]"
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-1 top-1 rounded-[4px] border border-[var(--p2-border)] bg-[var(--p2-tab-active)] shadow-[var(--p2-shadow)]",
            hasMeasuredTrack ? "transition-[left,width] duration-300 ease-out" : "opacity-0",
          )}
          style={{
            left: trackStyle.left,
            width: trackStyle.width,
          }}
        />
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          const dotBadge = tab.badge === "dot";

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              ref={(node) => {
                tabRefs.current[tabs.findIndex((candidate) => candidate.id === tab.id)] = node;
              }}
              className={cn(
                "relative z-10 flex h-11 min-w-[8.75rem] flex-1 items-center justify-center gap-2 px-3 text-[15px] font-semibold transition-colors duration-200",
                active
                  ? "text-[var(--p2-tab-active-text)]"
                  : "text-[var(--p2-text-muted)] hover:text-[var(--p2-text-soft)]",
              )}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge ? (
                dotBadge ? (
                  <span
                    aria-hidden
                    className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--p2-button-primary-bg)]"
                  />
                ) : (
                  <span
                    className={cn(
                      "inline-flex min-w-5 items-center justify-center rounded-[4px] px-1.5 py-0.5 text-[10px] leading-none transition-colors duration-200",
                      active
                        ? "bg-[var(--p2-accent)] text-[var(--p2-accent-contrast)]"
                        : "bg-[var(--p2-elevated)] text-[var(--p2-text-soft)]",
                    )}
                  >
                    {tab.badge}
                  </span>
                )
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function P2Tooltip({
  content,
  className,
}: {
  content: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center text-[var(--p2-text-muted)]"
        aria-label="Show tooltip"
      >
        <Info className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-80 -translate-x-1/2 rounded-[var(--p2-radius-popover)] bg-[var(--p2-tooltip-bg)] px-4 py-3 text-sm leading-6 text-[var(--p2-tooltip-text)] shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
          {content}
          <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 rotate-45 bg-[var(--p2-tooltip-bg)]" />
        </div>
      ) : null}
    </div>
  );
}

export function P2Menu({
  items,
  onSelect,
  align = "right",
  className,
}: {
  items: Array<{ id: string; label: string; checked?: boolean }>;
  onSelect: (id: string) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--p2-radius-button)] border border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text)] transition hover:bg-[var(--p2-elevated)]"
        aria-label="Open menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open ? (
        <div
          className={cn(
            "absolute top-[calc(100%+8px)] z-30 min-w-52 rounded-[var(--p2-radius-popover)] border border-[var(--p2-border)] bg-[var(--p2-popover-bg)] p-2 shadow-[var(--p2-shadow-popover)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-[var(--p2-radius-button)] px-3 py-2 text-left text-sm text-[var(--p2-text)] transition hover:bg-[var(--p2-elevated)]"
            >
              <span className="flex items-center gap-2">
                {item.checked ? <Check className="h-4 w-4 text-[var(--p2-accent)]" /> : null}
                {item.label}
              </span>
              {item.checked ? <Check className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function P2Table({
  headers,
  children,
  className,
  variant = "default",
  stickyHeader = true,
}: {
  headers: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "plain";
  stickyHeader?: boolean;
}) {
  return (
    <div
      className={cn(
        variant === "plain"
          ? "relative isolate rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-transparent"
          : "relative isolate rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-surface)]",
        className,
      )}
    >
      <table className="min-w-full border-collapse text-left text-sm [&_tbody_tr]:bg-[var(--p2-table-row)] [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[var(--p2-table-row-hover)] [&_td:last-child]:w-px [&_td:last-child]:whitespace-nowrap [&_th:last-child]:w-px [&_th:last-child]:whitespace-nowrap">
        <thead className="text-[var(--p2-text-soft)]">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={cn(
                  "h-16 bg-[var(--p2-table-head)] px-4 py-4 align-middle font-medium",
                  stickyHeader &&
                    "sticky top-0 z-20 shadow-[inset_0_-1px_0_var(--p2-border),0_10px_18px_rgba(0,0,0,0.12)]",
                  index === 0 && "rounded-tl-[var(--p2-radius-card)]",
                  index === headers.length - 1 &&
                    "rounded-tr-[var(--p2-radius-card)]",
                )}
              >
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
