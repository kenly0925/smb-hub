import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { cn } from "@/lib/utils";
import { DM_Mono } from "next/font/google";
import {
  AlertTriangle,
  Database,
  File,
  FileClock,
  FileCode2,
  FileImage,
  FileTerminal,
  FileText,
  Move,
  Monitor,
  Package,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { QuarantineItem } from "@/lib/prototype2/types";

const quarantineMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

function truncateLabel(fileName: string) {
  if (fileName.length <= 28) {
    return fileName;
  }

  const extensionIndex = fileName.lastIndexOf(".");

  if (extensionIndex > 0) {
    const base = fileName.slice(0, extensionIndex);
    const extension = fileName.slice(extensionIndex);
    return `${base.slice(0, 20)}...${extension}`;
  }

  return `${fileName.slice(0, 24)}...`;
}

type ArenaTooltipPlacement = "top" | "right" | "left";

type ArenaLayoutItem = {
  id: string;
  leftPercent: number;
  topPercent: number;
  left: string;
  top: string;
  size: number;
  tooltipPlacement: ArenaTooltipPlacement;
};

const ARENA_BOUNDS = {
  left: 10,
  right: 90,
  top: 14,
  bottom: 84,
};

const QUARANTINE_EXIT_ANIMATION_DURATION_MS = 720;

type QuarantineTransitionTone = "released" | "deleted";

function clampPercent(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getArenaPosition(x: number, y: number, radius: number) {
  const leftPercent = 18 + ((x + 3.5) / 6.6) * 64;
  const topPercent = 16 + ((y + 2.3) / 4.6) * 62;
  const size = 88 + radius * 24;

  return {
    leftPercent: clampPercent(leftPercent, ARENA_BOUNDS.left, ARENA_BOUNDS.right),
    topPercent: clampPercent(topPercent, ARENA_BOUNDS.top, ARENA_BOUNDS.bottom),
    size,
  };
}

function getArenaItemBounds(item: Pick<ArenaLayoutItem, "leftPercent" | "topPercent">) {
  return {
    left: item.leftPercent - 10,
    right: item.leftPercent + 10,
    top: item.topPercent - 6,
    bottom: item.topPercent + 17,
  };
}

function getTooltipBounds(
  item: Pick<ArenaLayoutItem, "leftPercent" | "topPercent">,
  placement: ArenaTooltipPlacement,
) {
  if (placement === "top") {
    return {
      left: item.leftPercent - 15,
      right: item.leftPercent + 15,
      top: item.topPercent - 28,
      bottom: item.topPercent - 5,
    };
  }

  if (placement === "right") {
    return {
      left: item.leftPercent + 3,
      right: item.leftPercent + 30,
      top: item.topPercent - 10,
      bottom: item.topPercent + 10,
    };
  }

  return {
    left: item.leftPercent - 30,
    right: item.leftPercent - 3,
    top: item.topPercent - 10,
    bottom: item.topPercent + 10,
  };
}

function getBoundsOverflow(bounds: {
  left: number;
  right: number;
  top: number;
  bottom: number;
}) {
  return (
    Math.max(0, ARENA_BOUNDS.left - bounds.left) +
    Math.max(0, bounds.right - ARENA_BOUNDS.right) +
    Math.max(0, ARENA_BOUNDS.top - bounds.top) +
    Math.max(0, bounds.bottom - ARENA_BOUNDS.bottom)
  );
}

function getBoundsOverlap(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
) {
  const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);

  if (overlapWidth <= 0 || overlapHeight <= 0) {
    return 0;
  }

  return overlapWidth * overlapHeight;
}

function getTooltipPlacement(
  item: Pick<ArenaLayoutItem, "id" | "leftPercent" | "topPercent">,
  items: Array<Pick<ArenaLayoutItem, "id" | "leftPercent" | "topPercent">>,
): ArenaTooltipPlacement {
  const candidates: ArenaTooltipPlacement[] = ["top", "right", "left"];
  let bestPlacement: ArenaTooltipPlacement = "top";
  let bestScore = Number.POSITIVE_INFINITY;

  for (const placement of candidates) {
    const tooltipBounds = getTooltipBounds(item, placement);
    let score =
      getBoundsOverflow(tooltipBounds) * 10 +
      (placement === "top" ? 0 : 2);

    for (const candidate of items) {
      if (candidate.id === item.id) {
        continue;
      }

      score += getBoundsOverlap(tooltipBounds, getArenaItemBounds(candidate));
    }

    if (score < bestScore) {
      bestScore = score;
      bestPlacement = placement;
    }
  }

  return bestPlacement;
}

function getArenaLayout(items: QuarantineItem[]): ArenaLayoutItem[] {
  const layoutItems = items.map((item, index) => {
    const base = getArenaPosition(item.x, item.y, item.radius);

    return {
      id: item.id,
      index,
      leftPercent: base.leftPercent,
      topPercent: base.topPercent,
      size: base.size,
      tooltipPlacement: "top" as ArenaTooltipPlacement,
    };
  });

  for (let iteration = 0; iteration < 18; iteration += 1) {
    let changed = false;

    for (let leftIndex = 0; leftIndex < layoutItems.length; leftIndex += 1) {
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < layoutItems.length;
        rightIndex += 1
      ) {
        const leftItem = layoutItems[leftIndex];
        const rightItem = layoutItems[rightIndex];
        const deltaX = rightItem.leftPercent - leftItem.leftPercent;
        const deltaY = rightItem.topPercent - leftItem.topPercent;
        const minimumHorizontalGap = 17 + (leftItem.size + rightItem.size) / 64;
        const minimumVerticalGap = 19 + (leftItem.size + rightItem.size) / 74;
        const overlapX = minimumHorizontalGap - Math.abs(deltaX);
        const overlapY = minimumVerticalGap - Math.abs(deltaY);

        if (overlapX <= 0 || overlapY <= 0) {
          continue;
        }

        changed = true;

        if (overlapY <= overlapX) {
          const direction =
            deltaY === 0
              ? leftItem.index % 2 === 0
                ? -1
                : 1
              : Math.sign(deltaY);
          const push = overlapY / 2 + 0.35;

          leftItem.topPercent = clampPercent(
            leftItem.topPercent - direction * push,
            ARENA_BOUNDS.top,
            ARENA_BOUNDS.bottom,
          );
          rightItem.topPercent = clampPercent(
            rightItem.topPercent + direction * push,
            ARENA_BOUNDS.top,
            ARENA_BOUNDS.bottom,
          );
        } else {
          const direction =
            deltaX === 0
              ? leftItem.index % 2 === 0
                ? -1
                : 1
              : Math.sign(deltaX);
          const push = overlapX / 2 + 0.35;

          leftItem.leftPercent = clampPercent(
            leftItem.leftPercent - direction * push,
            ARENA_BOUNDS.left,
            ARENA_BOUNDS.right,
          );
          rightItem.leftPercent = clampPercent(
            rightItem.leftPercent + direction * push,
            ARENA_BOUNDS.left,
            ARENA_BOUNDS.right,
          );
        }
      }
    }

    if (!changed) {
      break;
    }
  }

  return layoutItems.map((item) => ({
    ...item,
    left: `${item.leftPercent}%`,
    top: `${item.topPercent}%`,
    tooltipPlacement: getTooltipPlacement(item, layoutItems),
  }));
}

function getFilePresentation(fileName: string): {
  badge: string;
  Icon: typeof File;
  severityLabel: "Low" | "Medium" | "High";
  severityColor: string;
} {
  const lower = fileName.toLowerCase();
  const extension = lower.includes(".") ? lower.split(".").pop() ?? "" : "";

  if (
    extension === "reg" ||
    lower.includes("registry") ||
    lower.includes("regedit")
  ) {
    return {
      badge: "REG",
      Icon: Database,
      severityLabel: "High",
      severityColor: "#ff6b74",
    };
  }

  if (["bat", "cmd", "ps1", "sh", "zsh"].includes(extension) || lower.includes("cli")) {
    return {
      badge: "CLI",
      Icon: FileTerminal,
      severityLabel: "High",
      severityColor: "#ff9b5c",
    };
  }

  if (
    ["pkg", "msi", "exe", "dmg"].includes(extension) ||
    lower.includes("installer")
  ) {
    return {
      badge: "PKG",
      Icon: Package,
      severityLabel: "High",
      severityColor: "#ff6b74",
    };
  }

  if (["html", "js", "ts", "jsx", "tsx", "json", "xml"].includes(extension)) {
    return {
      badge: extension.toUpperCase().slice(0, 4),
      Icon: FileCode2,
      severityLabel: "Medium",
      severityColor: "#f5b84a",
    };
  }

  if (["gif", "png", "jpg", "jpeg", "svg", "webp"].includes(extension)) {
    return {
      badge: extension.toUpperCase(),
      Icon: FileImage,
      severityLabel: "Medium",
      severityColor: "#7dc8ff",
    };
  }

  if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension)) {
    return {
      badge: extension.toUpperCase().slice(0, 4),
      Icon: FileText,
      severityLabel: "Low",
      severityColor: "#74d9ff",
    };
  }

  return {
    badge: extension ? extension.toUpperCase().slice(0, 4) : "FILE",
    Icon: File,
    severityLabel: "Medium",
    severityColor: "#9aa5b5",
  };
}

function StatusChip({
  label,
  value,
  tone,
  isDark,
}: {
  label: string;
  value: number;
  tone: "released" | "deleted";
  isDark: boolean;
}) {
  const accent = tone === "released"
    ? isDark
      ? "#4ade80"
      : "#16a34a"
    : isDark
      ? "#f87171"
      : "#dc2626";
  const backgroundColor = tone === "released"
    ? isDark
      ? "#14532d"
      : "#dcfce7"
    : isDark
      ? "#7f1d1d"
      : "#fee2e2";

  return (
    <div
      className="inline-flex items-center rounded-[4px] border px-2 py-1 text-[10px] font-normal leading-none"
      style={{
        backgroundColor,
        borderColor: accent,
        color: accent,
      }}
    >
      <span>{label}: {value}</span>
    </div>
  );
}

function PrimaryToolButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[4px] text-sm transition",
          active
            ? "bg-[var(--p2-button-primary-bg)] text-[var(--p2-button-primary-text)]"
            : "bg-transparent text-[var(--p2-text-muted)] hover:bg-[var(--p2-surface)] hover:text-[var(--p2-text-soft)]",
        )}
        aria-label={label}
      >
        {children}
      </button>
      <div
        className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-[var(--p2-radius-popover)] px-3 py-2 text-[11px] font-medium text-[var(--p2-text-soft)] shadow-[var(--p2-shadow-popover)] group-hover:block"
        style={{ backgroundColor: "var(--p2-popover-bg)" }}
      >
        {label}
        <span
          className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45"
          style={{ backgroundColor: "var(--p2-popover-bg)" }}
        />
      </div>
    </div>
  );
}

export function QuarantineArena({
  theme,
}: {
  theme: "light" | "dark";
}) {
  const {
    state,
    setQuarantineAction,
    releaseQuarantineItem,
    deleteQuarantineItem,
    resetQuarantineItems,
  } = usePrototype2Demo();
  const [moveMode, setMoveMode] = useState(true);
  const [spaceMoveActive, setSpaceMoveActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cursor, setCursor] = useState({
    x: 0,
    y: 0,
    active: false,
  });
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [toolbarHovered, setToolbarHovered] = useState(false);
  const [viewport, setViewport] = useState({ x: 0, y: 0 });
  const [itemTransitions, setItemTransitions] = useState<
    Record<string, QuarantineTransitionTone>
  >({});
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    viewportX: number;
    viewportY: number;
  } | null>(null);
  const itemTransitionTimersRef = useRef<Record<string, number>>({});
  const isDark = theme === "dark";
  const activeItems = useMemo(
    () => state.quarantine.items.filter((item) => item.status === "quarantined"),
    [state.quarantine.items],
  );
  const arenaLayout = useMemo(() => getArenaLayout(activeItems), [activeItems]);
  const arenaLayoutById = useMemo(
    () => new Map(arenaLayout.map((item) => [item.id, item])),
    [arenaLayout],
  );
  const releasedCount = useMemo(
    () => state.quarantine.items.filter((item) => item.status === "released").length,
    [state.quarantine.items],
  );
  const deletedCount = useMemo(
    () => state.quarantine.items.filter((item) => item.status === "deleted").length,
    [state.quarantine.items],
  );
  const effectiveTool =
    spaceMoveActive || moveMode ? "move" : state.quarantine.action;
  const actionAccent =
    effectiveTool === "delete"
      ? "#ff6b74"
      : effectiveTool === "release"
        ? "#22c55e"
        : "#71717a";
  const boardBackground = isDark ? "#09090b" : "#fafafa";
  const boardBorder = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(24,24,27,0.08)";
  const cardBorder = isDark ? "#3f3f46" : "#d4d4d8";
  const cardText = isDark ? "#f4f4f5" : "#18181b";
  const cardMuted = isDark ? "#a1a1aa" : "#71717a";
  const chipBackground = isDark ? "rgba(24,24,27,0.78)" : "rgba(255,255,255,0.92)";
  const iconBackground = isDark ? "rgba(24,24,27,0.8)" : "rgba(255,255,255,0.96)";
  const floatingShellBackground = isDark
    ? "rgba(24,24,27,0.88)"
    : "rgba(255,255,255,0.92)";
  const tooltipBackground = isDark ? "var(--p2-popover-bg)" : "var(--p2-panel)";
  const gridLineColor = isDark
    ? "rgba(255,255,255,0.03)"
    : "rgba(24,24,27,0.08)";

  function clearItemTransitionTimer(id: string) {
    const timer = itemTransitionTimersRef.current[id];

    if (timer) {
      window.clearTimeout(timer);
      delete itemTransitionTimersRef.current[id];
    }
  }

  function clearAllItemTransitions() {
    for (const id of Object.keys(itemTransitionTimersRef.current)) {
      clearItemTransitionTimer(id);
    }

    setItemTransitions({});
  }

  function beginItemTransition(id: string, tone: QuarantineTransitionTone) {
    setHoveredItemId((current) => (current === id ? null : current));
    setItemTransitions((current) =>
      current[id]
        ? current
        : {
            ...current,
            [id]: tone,
          },
    );
    clearItemTransitionTimer(id);
    itemTransitionTimersRef.current[id] = window.setTimeout(() => {
      if (tone === "released") {
        releaseQuarantineItem(id);
      } else {
        deleteQuarantineItem(id);
      }

      clearItemTransitionTimer(id);
      setItemTransitions((current) => {
        if (!current[id]) {
          return current;
        }

        const next = { ...current };
        delete next[id];
        return next;
      });
    }, QUARANTINE_EXIT_ANIMATION_DURATION_MS);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        setHoveredItemId(null);
        setSpaceMoveActive(true);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code === "Space") {
        setSpaceMoveActive(false);
        setIsDragging(false);
        dragStateRef.current = null;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const itemTransitionTimers = itemTransitionTimersRef;

    return () => {
      for (const id of Object.keys(itemTransitionTimers.current)) {
        window.clearTimeout(itemTransitionTimers.current[id]);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        quarantineMono.className,
        "relative h-full overflow-hidden rounded-[var(--p2-radius-canvas)] border",
      )}
      style={{
        backgroundColor: boardBackground,
        borderColor: boardBorder,
        cursor:
          toolbarHovered
            ? "default"
            : effectiveTool === "move"
            ? isDragging
              ? "grabbing"
              : "grab"
            : "none",
      }}
      onMouseDownCapture={(event) => {
        if (effectiveTool !== "move" || event.button !== 0) {
          return;
        }

        setHoveredItemId(null);
        dragStateRef.current = {
          startX: event.clientX,
          startY: event.clientY,
          viewportX: viewport.x,
          viewportY: viewport.y,
        };
        setIsDragging(true);
      }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();

        setCursor({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          active: true,
        });

        if (effectiveTool !== "move" || !dragStateRef.current) {
          return;
        }

        const deltaX = event.clientX - dragStateRef.current.startX;
        const deltaY = event.clientY - dragStateRef.current.startY;

        setViewport({
          x: dragStateRef.current.viewportX + deltaX,
          y: dragStateRef.current.viewportY + deltaY,
        });
      }}
      onMouseUp={() => {
        setIsDragging(false);
        dragStateRef.current = null;
      }}
      onMouseLeave={() => {
        setCursor((current) => ({
          ...current,
          active: false,
        }));
        setHoveredItemId(null);
        setIsDragging(false);
        dragStateRef.current = null;
      }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            `linear-gradient(${gridLineColor} 1px, transparent 1px), linear-gradient(90deg, ${gridLineColor} 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.025), transparent 28%)",
        }}
      />

      <div
        className="absolute left-6 top-6 z-20 font-sans text-[15px] font-normal leading-none text-[var(--p2-text)]"
      >
        Quarantine Files
      </div>

      <div
        className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-[var(--p2-radius-popover)] px-2.5 py-2 text-[var(--p2-text-soft)] shadow-[var(--p2-shadow-popover)] backdrop-blur-sm"
        style={{ backgroundColor: floatingShellBackground }}
      >
        <div className="flex items-center gap-1.5">
          <StatusChip
            label="Released"
            value={releasedCount}
            tone="released"
            isDark={isDark}
          />
          <StatusChip
            label="Deleted"
            value={deletedCount}
            tone="deleted"
            isDark={isDark}
          />
        </div>
        <div
          aria-hidden
          className="w-px self-stretch"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(24,24,27,0.14)",
          }}
        />
        <div className="text-[10px] font-medium text-[var(--p2-text-muted)]">
          {activeItems.length} remaining total
        </div>
      </div>

      <div
        className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-[var(--p2-radius-button)] p-1 shadow-[var(--p2-shadow-popover)] backdrop-blur-sm"
        style={{ backgroundColor: floatingShellBackground }}
        onMouseEnter={() => setToolbarHovered(true)}
        onMouseLeave={() => setToolbarHovered(false)}
      >
        <PrimaryToolButton
          label="Move canvas"
          active={effectiveTool === "move"}
          onClick={() => {
            setHoveredItemId(null);
            setMoveMode(true);
          }}
        >
          <Move className="h-4 w-4" />
        </PrimaryToolButton>
        <PrimaryToolButton
          label="Release tool"
          active={effectiveTool === "release"}
          onClick={() => {
            setMoveMode(false);
            setQuarantineAction("release");
          }}
        >
          <ShieldCheck className="h-4 w-4" />
        </PrimaryToolButton>
        <PrimaryToolButton
          label="Delete tool"
          active={effectiveTool === "delete"}
          onClick={() => {
            setMoveMode(false);
            setQuarantineAction("delete");
          }}
        >
          <Trash2 className="h-4 w-4" />
        </PrimaryToolButton>
        <PrimaryToolButton
          label="Replay arena"
          onClick={() => {
            clearAllItemTransitions();
            resetQuarantineItems();
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </PrimaryToolButton>
      </div>

      <div
        className="absolute inset-0 z-10"
        style={{ transform: `translate(${viewport.x}px, ${viewport.y}px)` }}
      >
        {activeItems.map((item) => {
          const position = arenaLayoutById.get(item.id);

          if (!position) {
            return null;
          }

          const { badge, Icon, severityLabel, severityColor } = getFilePresentation(
            item.fileName,
          );
          const draining = Boolean(itemTransitions[item.id]);
          const hovered =
            !draining && effectiveTool !== "move" && hoveredItemId === item.id;
          const iconSize = Math.max(44, Math.min(58, Math.round(position.size * 0.5)));
          const tooltipPlacement = position.tooltipPlacement;
          const sideTooltipOffset = Math.round(iconSize / 2) + 4;
          const tooltipStyle =
            tooltipPlacement === "right"
              ? {
                  backgroundColor: tooltipBackground,
                  left: `calc(50% + ${sideTooltipOffset}px)`,
                }
              : tooltipPlacement === "left"
                ? {
                    backgroundColor: tooltipBackground,
                    right: `calc(50% + ${sideTooltipOffset}px)`,
                  }
                : {
                    backgroundColor: tooltipBackground,
                  };

          return (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => {
                if (!draining && effectiveTool !== "move") {
                  setHoveredItemId(item.id);
                }
              }}
              onMouseLeave={() =>
                setHoveredItemId((current) => (current === item.id ? null : current))
              }
              onClick={() => {
                if (effectiveTool === "move" || draining) {
                  return;
                }

                if (state.quarantine.action === "release") {
                  beginItemTransition(item.id, "released");
                } else {
                  beginItemTransition(item.id, "deleted");
                }
              }}
              className={cn(
                "group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none",
                draining && "pointer-events-none",
              )}
              style={{
                left: position.left,
                top: position.top,
                zIndex: draining ? 60 : hovered ? 40 : 10,
              }}
              aria-disabled={draining}
              aria-label={`${state.quarantine.action === "release" ? "Release" : "Delete"} ${item.fileName}`}
            >
              <div
                className={cn(
                  "relative flex flex-col items-center px-2 py-1",
                  draining && "p2-quarantine-item-drain",
                )}
              >
                <div className="flex justify-center">
                  <span
                    className="inline-flex items-center rounded-[4px] border px-2 py-1 text-[10px] font-semibold leading-none"
                    style={{
                      borderColor: cardBorder,
                      color: cardMuted,
                      backgroundColor: chipBackground,
                    }}
                  >
                    {badge}
                  </span>
                </div>
                <div className="mt-3 flex justify-center">
                  <div className="relative flex items-center justify-center">
                    <span
                      className="relative flex items-center justify-center rounded-full border transition-colors duration-150"
                      style={{
                        borderColor: hovered ? actionAccent : cardBorder,
                        backgroundColor: iconBackground,
                        color: cardMuted,
                        height: iconSize,
                        width: iconSize,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                </div>
                <div
                  className="mx-auto mt-3 w-[12rem] text-center text-[13px] font-medium leading-[1.25] transition-colors duration-150"
                  style={{
                    color: hovered ? actionAccent : cardText,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {truncateLabel(item.fileName)}
                </div>
              </div>

              {hovered ? (
                <div
                  className={cn(
                    "pointer-events-none absolute z-50 w-[248px] rounded-[var(--p2-radius-popover)] px-4 py-3 text-left shadow-[var(--p2-shadow-popover)] backdrop-blur-sm",
                    tooltipPlacement === "top"
                      ? "bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2"
                      : tooltipPlacement === "right"
                        ? "top-1/2 -translate-y-1/2"
                        : "top-1/2 -translate-y-1/2",
                  )}
                  style={tooltipStyle}
                >
                  <div className="break-all text-sm font-semibold leading-5 text-[var(--p2-text-soft)]">
                    {item.fileName}
                  </div>
                  <div className="mt-3 flex items-start gap-2 text-xs font-medium text-[var(--p2-text)]">
                    <AlertTriangle
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: severityColor }}
                    />
                    <span className="min-w-0 break-words">{severityLabel} severity signal</span>
                  </div>
                  <div className="mt-2 flex items-start gap-2 text-xs text-[var(--p2-text-muted)]">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 break-words">{badge} classified file</span>
                  </div>
                  <div className="mt-1.5 flex items-start gap-2 text-xs text-[var(--p2-text-muted)]">
                    <Monitor className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 break-all">Device {item.deviceId}</span>
                  </div>
                  <div className="mt-1.5 flex items-start gap-2 text-xs text-[var(--p2-text-muted)]">
                    <FileClock className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 break-words">Quarantined {item.quarantinedAt}</span>
                  </div>
                  <span
                    className={cn(
                      "absolute h-3 w-3 rotate-45",
                      tooltipPlacement === "top"
                        ? "left-1/2 top-full -translate-x-1/2 -translate-y-1/2"
                        : tooltipPlacement === "right"
                          ? "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          : "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
                    )}
                    style={{ backgroundColor: tooltipBackground }}
                  />
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {activeItems.length === 0 ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <div
            className="max-w-sm rounded-[var(--p2-radius-popover)] px-5 py-4 text-center text-[var(--p2-text-soft)] shadow-[var(--p2-shadow-popover)] backdrop-blur-sm"
            style={{ backgroundColor: floatingShellBackground }}
          >
            <div className="text-lg font-semibold">Arena cleared</div>
            <div className="mt-2 text-sm leading-6 text-[var(--p2-text-muted)]">
              All quarantined files have been handled. Use the replay tool to restore the file set for the demo.
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-30 transition-opacity duration-100",
          cursor.active && effectiveTool !== "move" && !toolbarHovered
            ? "opacity-100"
            : "opacity-0",
        )}
      >
        <div
          className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 border-2"
          style={{
            left: cursor.x,
            top: cursor.y,
            borderColor: actionAccent,
            boxShadow: `0 0 0 1px ${actionAccent}22`,
          }}
        />
        <div
          className="absolute h-px w-12 -translate-x-1/2 -translate-y-1/2"
          style={{ left: cursor.x, top: cursor.y, backgroundColor: actionAccent }}
        />
        <div
          className="absolute h-12 w-px -translate-x-1/2 -translate-y-1/2"
          style={{ left: cursor.x, top: cursor.y, backgroundColor: actionAccent }}
        />
        <div
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2"
          style={{ left: cursor.x, top: cursor.y, backgroundColor: actionAccent }}
        />
      </div>
    </div>
  );
}
