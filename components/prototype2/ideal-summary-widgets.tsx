"use client";

import { AdversaryIconCarousel } from "@/components/prototype2/final-pages";
import type { DeviceRecord, ThemeMode } from "@/lib/prototype2/types";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Sparkles,
} from "lucide-react";
import { DM_Mono } from "next/font/google";
import Image from "next/image";
import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { P2Button } from "@/components/prototype2/ui";

type EndpointKind =
  | "computer"
  | "desktop"
  | "laptop"
  | "mobile"
  | "server"
  | "vm";
type DetectionTone = "warning" | "danger" | null;

const summaryMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const adversaryBannerSlides = [
  "/prototype-2/adversary/adversary-cover-1.png",
  "/prototype-2/adversary/adversary-cover-2.png",
  "/prototype-2/adversary/adversary-cover-3.png",
  "/prototype-2/adversary/adversary-cover-4.png",
  "/prototype-2/adversary/adversary-cover-5.png",
  "/prototype-2/adversary/adversary-cover-6.png",
  "/prototype-2/adversary/adversary-cover-7.png",
] as const;

function truncateDeviceLabel(name: string) {
  if (name.length <= 20) {
    return name;
  }

  return `${name.slice(0, 17)}...`;
}

function getEndpointDescriptor(device: DeviceRecord) {
  const normalizedName = device.name.toUpperCase();

  if (normalizedName.includes("VM") || normalizedName.includes("VIRTUAL")) {
    return {
      endpointLabel: "Virtual machine",
      endpointKind: "vm" as EndpointKind,
    };
  }

  if (device.type === "Mobile") {
    return {
      endpointLabel: "Mobile",
      endpointKind: "mobile" as EndpointKind,
    };
  }

  if (device.type === "Server") {
    return {
      endpointLabel: "Server",
      endpointKind: "server" as EndpointKind,
    };
  }

  if (normalizedName.includes("LAPTOP")) {
    return {
      endpointLabel: "Laptop",
      endpointKind: "laptop" as EndpointKind,
    };
  }

  if (normalizedName.includes("DESKTOP")) {
    return {
      endpointLabel: "Desktop",
      endpointKind: "desktop" as EndpointKind,
    };
  }

  return {
    endpointLabel: "Computer",
    endpointKind: "computer" as EndpointKind,
  };
}

function getDeviceDetectionTone(device: DeviceRecord): DetectionTone {
  if (device.firstDetected) {
    return "danger";
  }

  if (device.status === "Connected recently") {
    return "warning";
  }

  return null;
}

function EndpointGlyph({
  kind,
  color,
}: {
  kind: EndpointKind;
  color: string;
}) {
  if (kind === "mobile") {
    return (
      <svg viewBox="-16 -16 32 32" aria-hidden className="h-7 w-7 overflow-visible">
        <rect
          x="-6.5"
          y="-12"
          width="13"
          height="24"
          rx="4"
          fill="none"
          stroke={color}
          strokeWidth="1.6"
        />
        <circle cx="0" cy="7.5" r="1.5" fill={color} />
        <path d="M -3.5 -8.5 L 3.5 -8.5" fill="none" stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }

  if (kind === "server") {
    return (
      <svg viewBox="-16 -16 32 32" aria-hidden className="h-7 w-7 overflow-visible">
        <rect
          x="-13"
          y="-11"
          width="26"
          height="6.5"
          rx="3"
          fill="none"
          stroke={color}
          strokeWidth="1.4"
        />
        <rect
          x="-13"
          y="-2"
          width="26"
          height="6.5"
          rx="3"
          fill={`${color}12`}
          stroke={color}
          strokeWidth="1.4"
        />
        <rect
          x="-13"
          y="7"
          width="26"
          height="6.5"
          rx="3"
          fill="none"
          stroke={color}
          strokeWidth="1.4"
        />
        <circle cx="8" cy="-8" r="1.3" fill={color} />
        <circle cx="8" cy="1" r="1.3" fill={color} />
        <circle cx="8" cy="10" r="1.3" fill={color} />
      </svg>
    );
  }

  if (kind === "vm") {
    return (
      <svg viewBox="-16 -16 32 32" aria-hidden className="h-7 w-7 overflow-visible">
        <rect
          x="-13"
          y="-10.5"
          width="26"
          height="17"
          rx="4"
          fill="none"
          stroke={color}
          strokeWidth="1.6"
        />
        <rect
          x="-6.5"
          y="-4.5"
          width="13"
          height="9"
          rx="2"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
        />
        <path d="M -3.5 9 L 3.5 9" fill="none" stroke={color} strokeWidth="1.4" />
        <path d="M 0 6.5 L 0 10.5" fill="none" stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }

  if (kind === "laptop") {
    return (
      <svg viewBox="-16 -16 32 32" aria-hidden className="h-7 w-7 overflow-visible">
        <rect
          x="-11"
          y="-10"
          width="22"
          height="13"
          rx="3"
          fill="none"
          stroke={color}
          strokeWidth="1.6"
        />
        <path
          d="M -13 6.5 L 13 6.5 L 10 9.5 L -10 9.5 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "desktop") {
    return (
      <svg viewBox="-16 -16 32 32" aria-hidden className="h-7 w-7 overflow-visible">
        <rect
          x="-12"
          y="-10"
          width="18"
          height="14"
          rx="3"
          fill="none"
          stroke={color}
          strokeWidth="1.6"
        />
        <rect
          x="8"
          y="-7"
          width="5.5"
          height="14"
          rx="2"
          fill="none"
          stroke={color}
          strokeWidth="1.4"
        />
        <path d="M -1 6.5 L -1 10.5" fill="none" stroke={color} strokeWidth="1.4" />
        <path d="M -6.5 10.5 L 4.5 10.5" fill="none" stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="-16 -16 32 32" aria-hidden className="h-7 w-7 overflow-visible">
      <rect
        x="-13"
        y="-10.5"
        width="26"
        height="17"
        rx="3"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
      />
      <path d="M -3.5 9 L 3.5 9" fill="none" stroke={color} strokeWidth="1.4" />
      <path d="M 0 6.5 L 0 10.5" fill="none" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

function EndpointObject({
  device,
  theme,
}: {
  device: DeviceRecord;
  theme: ThemeMode;
}) {
  const { endpointKind, endpointLabel } = getEndpointDescriptor(device);
  const detectionTone = getDeviceDetectionTone(device);
  const isDark = theme === "dark";
  const deviceNameColor = isDark ? "#e4e4e7" : "#27272a";
  const deviceIconColor = isDark ? "#d4d4d8" : "#52525b";
  const deviceBadgeFill = isDark
    ? "rgba(24, 24, 27, 0.9)"
    : "rgba(255, 255, 255, 0.94)";
  const deviceBadgeStroke = isDark
    ? "rgba(255, 255, 255, 0.09)"
    : "rgba(24, 24, 27, 0.08)";
  const deviceBadgeText = isDark ? "#d4d4d8" : "#52525b";
  const deviceShellFill = isDark
    ? "rgba(24, 24, 27, 0.94)"
    : "rgba(255, 255, 255, 0.96)";
  const deviceShellStroke = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(24, 24, 27, 0.08)";
  const toneColor = detectionTone === "danger" ? "#fb7185" : "#fbbf24";
  const badgeWidth = Math.max(52, Math.ceil(endpointLabel.length * 5.9 + 24));

  return (
    <div className={summaryMono.className}>
      <div className="flex w-[118px] flex-col items-center text-center">
        <div
          className="inline-flex h-5 items-center justify-center rounded-full border px-3 text-[10px] font-bold leading-none"
          style={{
            minWidth: badgeWidth,
            backgroundColor: deviceBadgeFill,
            borderColor: deviceBadgeStroke,
            color: deviceBadgeText,
          }}
        >
          {endpointLabel}
        </div>

        <div
          className="relative mt-3 flex h-12 w-12 items-center justify-center rounded-[10px] border"
          style={{
            backgroundColor: deviceShellFill,
            borderColor: deviceShellStroke,
          }}
        >
          <EndpointGlyph kind={endpointKind} color={deviceIconColor} />
          {detectionTone ? (
            <span
              className="absolute right-[-1px] top-[-1px] h-[9px] w-[9px] rounded-full border-[1.4px]"
              style={{
                backgroundColor: toneColor,
                borderColor: deviceShellFill,
              }}
            />
          ) : null}
        </div>

        <div
          className="mt-2 w-[118px] text-[11px] leading-none"
          style={{ color: deviceNameColor }}
        >
          {truncateDeviceLabel(device.name)}
        </div>
      </div>
    </div>
  );
}

export function AdversaryUniverseSummaryCard({
  theme,
}: {
  theme: ThemeMode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDark = theme === "dark";

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % adversaryBannerSlides.length);
    }, 4800);

    return () => window.clearInterval(intervalId);
  }, []);

  function showPreviousSlide() {
    setActiveIndex((current) =>
      current === 0 ? adversaryBannerSlides.length - 1 : current - 1,
    );
  }

  function showNextSlide() {
    setActiveIndex((current) => (current + 1) % adversaryBannerSlides.length);
  }

  return (
      <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-[15px] font-semibold text-[var(--p2-text)]">
          <Sparkles className="h-4 w-4" />
          Adversary universe
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={showPreviousSlide}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text-muted)] transition hover:text-[var(--p2-text-soft)]"
            aria-label="Show previous adversary banner"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={showNextSlide}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text-muted)] transition hover:text-[var(--p2-text-soft)]"
            aria-label="Show next adversary banner"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative -mx-4 mt-4 min-h-0 flex-1 overflow-hidden border-y border-[var(--p2-border)]">
        {adversaryBannerSlides.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Adversary universe banner ${index + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className={`object-cover object-top transition-opacity duration-500 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            priority={index === 0}
          />
        ))}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(10,10,12,0.05) 0%, rgba(10,10,12,0.2) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.18) 100%)",
          }}
        />
      </div>

      <div className="mt-4 flex w-full items-center justify-between gap-3 rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-panel)] px-4 py-3">
        <div className="text-[12px] font-medium text-[var(--p2-text-muted)]">
          Tracked adversaries
        </div>
        <AdversaryIconCarousel />
      </div>
    </div>
  );
}

export function DetectionStatusSummaryCard({
  theme,
  devices,
}: {
  theme: ThemeMode;
  devices: DeviceRecord[];
}) {
  const chartReady = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const gradientId = useId().replace(/:/g, "");
  const isDark = theme === "dark";
  const dangerCount = useMemo(
    () => devices.filter((device) => getDeviceDetectionTone(device) === "danger").length,
    [devices],
  );
  const warningCount = useMemo(
    () => devices.filter((device) => getDeviceDetectionTone(device) === "warning").length,
    [devices],
  );
  const highSeverityCount = Math.min(2, Math.max(0, dangerCount || 2));
  const series = useMemo(
    () => {
      const seededSeries = [
        { month: "Jan", detections: 8 },
        { month: "Feb", detections: 11 },
        { month: "Mar", detections: 16 },
        { month: "Apr", detections: 10 },
        { month: "May", detections: 12 },
        { month: "Jun", detections: 9 },
        { month: "Jul", detections: 13 },
        { month: "Aug", detections: 11 },
        { month: "Sep", detections: 15 },
        { month: "Oct", detections: 10 },
        { month: "Nov", detections: 12 },
        { month: "Dec", detections: 9 },
      ].map((entry) => ({
        ...entry,
        detections: entry.detections + warningCount,
      }));
      const flaggedMonths = ["Mar", "Sep"].slice(0, highSeverityCount);
      const highSeverityMonths = new Set(flaggedMonths);

      return seededSeries.map((entry) => ({
        ...entry,
        detections: entry.detections + (highSeverityMonths.has(entry.month) ? 2 : 0),
        highSeverity: highSeverityMonths.has(entry.month),
      }));
    },
    [highSeverityCount, warningCount],
  );
  const latestDetections = series[series.length - 1]?.detections ?? 0;
  const maxDetections = Math.max(...series.map((entry) => entry.detections), 0);
  const lineColor = isDark ? "#7cc3ff" : "#3478f6";
  const destructiveColor = isDark ? "#fb7185" : "#ef4444";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)";
  const axisColor = isDark ? "#71717a" : "#71717a";
  const tooltipBackground = isDark ? "rgba(24,24,27,0.96)" : "rgba(255,255,255,0.96)";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(24,24,27,0.08)";
  const subtleHoverFill = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.05)";
  const dangerBadgeClassName = isDark
    ? "border-[#7f1d1d] bg-[#451a1a]/70 text-[#fca5a5]"
    : "border-[#fecaca] bg-[#fef2f2] text-[#dc2626]";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-[15px] font-semibold text-[var(--p2-text)]">
            <Monitor className="h-4 w-4" />
            Detection activity
          </div>
          <div className={`${summaryMono.className} mt-3 text-[30px] font-medium leading-none text-[var(--p2-text-soft)]`}>
            {latestDetections}
          </div>
          <div className="mt-1 text-sm text-[var(--p2-text-muted)]">
            Monthly activity
          </div>
        </div>

        <div
          className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${dangerBadgeClassName}`}
        >
          {highSeverityCount} high severity
        </div>
      </div>

      <div className="mt-4 min-h-[168px] flex-1">
        {chartReady ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id={`${gradientId}-default`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.88} />
                  <stop offset="55%" stopColor={lineColor} stopOpacity={0.54} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`${gradientId}-danger`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={destructiveColor} stopOpacity={0.94} />
                  <stop offset="55%" stopColor={destructiveColor} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={destructiveColor} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 10 }}
                interval={0}
              />
              <YAxis
                domain={[0, maxDetections + 4]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 11 }}
                width={30}
              />
              <Tooltip
                cursor={{ fill: subtleHoverFill }}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: tooltipBorder,
                  backgroundColor: tooltipBackground,
                  boxShadow: isDark
                    ? "0 12px 24px rgba(0,0,0,0.22)"
                    : "0 12px 24px rgba(15,23,42,0.08)",
                }}
                labelStyle={{ color: "var(--p2-text-muted)", fontSize: 11 }}
                itemStyle={{ color: "var(--p2-text-soft)", fontSize: 12 }}
                formatter={(value) => [`${value ?? 0}`, "Detections"]}
              />
              <Bar
                dataKey="detections"
                radius={[6, 6, 0, 0]}
                maxBarSize={18}
              >
                {series.map((entry) => (
                  <Cell
                    key={entry.month}
                    fill={
                      entry.highSeverity
                        ? `url(#${gradientId}-danger)`
                        : `url(#${gradientId}-default)`
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-surface)]/50" />
        )}
      </div>
    </div>
  );
}

export function HighSeverityEndpointsSummaryCard({
  theme,
  devices,
  onOpenDevices,
}: {
  theme: ThemeMode;
  devices: DeviceRecord[];
  onOpenDevices: () => void;
}) {
  const highSeverityDevices = useMemo(
    () => devices.filter((device) => getDeviceDetectionTone(device) === "danger").slice(0, 4),
    [devices],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 text-[15px] font-semibold text-[var(--p2-text)]">
        <AlertTriangle className="h-4 w-4" />
        High severity endpoints
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        {highSeverityDevices.length > 0 ? (
          <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
            {highSeverityDevices.map((device) => (
              <EndpointObject key={device.id} device={device} theme={theme} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-[var(--p2-text-muted)]">
            No high severity endpoints right now.
          </div>
        )}
      </div>

      <div className="mt-auto flex justify-end pt-4">
        <P2Button variant="secondary" onClick={onOpenDevices}>
          Open devices
        </P2Button>
      </div>
    </div>
  );
}
