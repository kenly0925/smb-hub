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
import {
  Children,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

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
  focusBorderClassName,
  className,
  children,
}: {
  label?: string;
  error?: string;
  disabled?: boolean;
  locked?: boolean;
  focusBorderClassName?: string;
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
                : cn(
                    "border-[var(--p2-border)]",
                    focusBorderClassName ?? "focus-within:border-[var(--p2-accent)]",
                  ),
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

function getDropdownPosition({
  triggerBounds,
  menuWidth,
  menuHeight,
  align = "left",
}: {
  triggerBounds: DOMRect;
  menuWidth: number;
  menuHeight: number;
  align?: "left" | "right";
}) {
  const viewportPadding = 12;
  const verticalOffset = 12;
  const alignedLeft =
    align === "right" ? triggerBounds.right - menuWidth : triggerBounds.left;
  const left = Math.min(
    window.innerWidth - menuWidth - viewportPadding,
    Math.max(viewportPadding, alignedLeft),
  );
  const canOpenDown =
    triggerBounds.bottom + verticalOffset + menuHeight <=
    window.innerHeight - viewportPadding;
  const canOpenUp =
    triggerBounds.top - verticalOffset - menuHeight >= viewportPadding;
  const top = canOpenDown
    ? triggerBounds.bottom + verticalOffset
    : canOpenUp
      ? triggerBounds.top - menuHeight - verticalOffset
      : Math.max(viewportPadding, window.innerHeight - menuHeight - viewportPadding);

  return { left, top };
}

function getSelectOptions(children: React.ReactNode) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child) || child.type !== "option") {
      return [];
    }

    const option = child as React.ReactElement<
      React.OptionHTMLAttributes<HTMLOptionElement>
    >;
    const value = option.props.value?.toString() ?? option.props.children?.toString() ?? "";

    return [
      {
        value,
        label: option.props.children,
        disabled: option.props.disabled,
      },
    ];
  });
}

function getPrototypeThemeClass(element: HTMLElement | null) {
  const themeRoot = element?.closest("[data-p2-theme]");
  const theme = themeRoot?.getAttribute("data-p2-theme");

  return theme === "light" ? "p2-theme-light" : "p2-theme-dark";
}

function getDropdownSurfaceClassName(themeClass: string) {
  return cn(
    "fixed z-[80] overflow-hidden rounded-[10px] border shadow-[var(--p2-shadow-popover)]",
    themeClass === "p2-theme-light"
      ? "border-zinc-200 bg-white"
      : "border-[var(--p2-border)] bg-[var(--p2-surface)]",
  );
}

function getDropdownItemClassName(themeClass: string, active = false) {
  return cn(
    "flex h-10 w-full items-center border-0 border-b px-3 text-left text-sm font-normal outline-none transition-colors focus:outline-none focus-visible:outline-none last:border-b-0 disabled:cursor-not-allowed disabled:text-[var(--p2-text-muted)]",
    themeClass === "p2-theme-light"
      ? "border-zinc-200 bg-white text-[var(--p2-text)] hover:bg-zinc-100"
      : "border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text)] hover:bg-[var(--p2-elevated)]",
    active &&
      (themeClass === "p2-theme-light" ? "bg-zinc-100" : "bg-[var(--p2-elevated)]"),
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
  const {
    value,
    defaultValue,
    disabled,
    onChange,
    name,
  } = props;
  const options = useMemo(() => getSelectOptions(children), [children]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number; width: number } | null>(
    null,
  );
  const [portalThemeClass, setPortalThemeClass] = useState("p2-theme-dark");
  const initialValue =
    defaultValue?.toString() ?? value?.toString() ?? options[0]?.value ?? "";
  const [internalValue, setInternalValue] = useState(initialValue);
  const isControlled = value !== undefined;
  const selectedValue = isControlled
    ? value?.toString() ?? ""
    : options.some((option) => option.value === internalValue)
      ? internalValue
      : options[0]?.value ?? "";
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? options[0] ?? null;

  useLayoutEffect(() => {
    setPortalThemeClass(getPrototypeThemeClass(rootRef.current));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    function updateMenuPosition() {
      const triggerBounds =
        rootRef.current?.parentElement?.getBoundingClientRect() ??
        rootRef.current?.getBoundingClientRect();

      if (!triggerBounds) {
        return;
      }

      const menuWidth = Math.max(triggerBounds.width, 160);
      const menuHeight = options.length * 40;
      const nextPosition = getDropdownPosition({
        triggerBounds,
        menuWidth,
        menuHeight,
      });

      setMenuPosition({
        ...nextPosition,
        width: menuWidth,
      });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        !rootRef.current?.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <FieldFrame
      label={label}
      error={error}
      disabled={disabled}
      locked={locked}
      focusBorderClassName="focus-within:border-[var(--p2-border)]"
      className={className}
    >
      <div ref={rootRef} className="w-full">
        {name ? <input type="hidden" name={name} value={selectedValue} /> : null}
        <button
          type="button"
          onClick={() => {
            if (!disabled && !locked) {
              setOpen((current) => !current);
            }
          }}
          disabled={disabled}
          className="flex w-full appearance-none items-center gap-3 border-0 bg-transparent text-left outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              selectedOption ? "text-[var(--p2-text)]" : "text-[var(--p2-text-muted)]",
            )}
          >
            {selectedOption?.label ?? ""}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[var(--p2-text-muted)]",
            )}
          />
        </button>
      </div>
      {open && menuPosition && typeof document !== "undefined"
        ? createPortal(
            <div className={portalThemeClass}>
              <div
                ref={menuRef}
                className={getDropdownSurfaceClassName(portalThemeClass)}
                style={{
                  left: menuPosition.left,
                  top: menuPosition.top,
                  width: menuPosition.width,
                }}
                role="listbox"
              >
                {options.map((option) => {
                  const active = option.value === selectedValue;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      disabled={option.disabled}
                      onClick={() => {
                        if (!isControlled) {
                          setInternalValue(option.value);
                        }

                        onChange?.({
                          target: {
                            value: option.value,
                            name: name ?? "",
                          },
                          currentTarget: {
                            value: option.value,
                            name: name ?? "",
                          },
                        } as React.ChangeEvent<HTMLSelectElement>);
                        setOpen(false);
                      }}
                      className={cn(
                        getDropdownItemClassName(portalThemeClass, active),
                        "justify-start",
                      )}
                      aria-selected={active}
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
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
  const activeIndex = tabs.findIndex((tab) => tab.id === activeId);
  const tabsSignature = tabs
    .map((tab) => `${tab.id}:${tab.label}:${tab.badge ?? ""}`)
    .join("|");

  useLayoutEffect(() => {
    function updateTrackPosition() {
      const activeTab = tabRefs.current[activeIndex >= 0 ? activeIndex : 0];

      if (!activeTab) {
        return;
      }

      const nextLeft = activeTab.offsetLeft;
      const nextWidth = activeTab.offsetWidth;

      setTrackStyle((current) =>
        current.left === nextLeft && current.width === nextWidth
          ? current
          : {
              left: nextLeft,
              width: nextWidth,
            },
      );
      setHasMeasuredTrack((current) => (current ? current : true));
    }

    updateTrackPosition();
    window.addEventListener("resize", updateTrackPosition);

    return () => window.removeEventListener("resize", updateTrackPosition);
  }, [activeIndex, tabsSignature]);

  return (
    <div
      className={cn(
        "w-full max-w-[34rem]",
        className,
      )}
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="relative flex items-stretch rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-tab-strip)] p-1"
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-1 top-1 rounded-[4px] border border-[var(--p2-border)] bg-[var(--p2-tab-active)]",
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
                "relative z-10 flex h-11 min-w-[7.25rem] flex-1 items-center justify-center gap-2 px-4 text-[15px] font-semibold transition-colors duration-200",
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
  items: Array<{
    id: string;
    label: string;
    checked?: boolean;
    tone?: "default" | "danger";
  }>;
  onSelect: (id: string) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(
    null,
  );
  const [portalThemeClass, setPortalThemeClass] = useState("p2-theme-dark");

  useLayoutEffect(() => {
    setPortalThemeClass(getPrototypeThemeClass(rootRef.current));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    function updateMenuPosition() {
      const triggerBounds = buttonRef.current?.getBoundingClientRect();

      if (!triggerBounds) {
        return;
      }

      const nextPosition = getDropdownPosition({
        triggerBounds,
        menuWidth: 208,
        menuHeight: items.length * 40,
        align,
      });

      setMenuPosition(nextPosition);
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [align, items.length, open]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        !rootRef.current?.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 w-10 appearance-none items-center justify-center rounded-[var(--p2-radius-button)] border border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text)] outline-none ring-0 transition hover:bg-[var(--p2-elevated)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        aria-label="Open menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && menuPosition && typeof document !== "undefined"
        ? createPortal(
            <div className={portalThemeClass}>
              <div
                ref={menuRef}
                className={cn(
                  getDropdownSurfaceClassName(portalThemeClass),
                  "min-w-52",
                )}
                style={{
                  left: menuPosition.left,
                  top: menuPosition.top,
                  width: 208,
                }}
              >
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.id);
                      setOpen(false);
                    }}
                    className={cn(
                      getDropdownItemClassName(portalThemeClass, item.checked),
                      "justify-start",
                      item.tone === "danger" &&
                        (portalThemeClass === "p2-theme-light"
                          ? "text-[#d92d3a]"
                          : "text-[#ff6b74]"),
                    )}
                  >
                    <span className="min-w-0 truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function P2Table({
  headers,
  children,
  className,
  tableClassName,
  colGroup,
  variant = "default",
  stickyHeader = true,
}: {
  headers: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
  tableClassName?: string;
  colGroup?: React.ReactNode;
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
      <table
        className={cn(
          "min-w-full border-collapse text-left text-sm [&_tbody_tr]:bg-[var(--p2-table-row)] [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[var(--p2-table-row-hover)] [&_td:last-child]:w-px [&_td:last-child]:whitespace-nowrap [&_th:last-child]:w-px [&_th:last-child]:whitespace-nowrap",
          tableClassName,
        )}
      >
        {colGroup}
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
