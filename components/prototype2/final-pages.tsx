"use client";

import {
  getUserInitials,
  pickUsernameBackground,
  prototype2UserName,
} from "@/components/prototype2/console-topbar";
import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import {
  P2Button,
  P2Checkbox,
  P2Input,
  P2Menu,
  P2Pill,
  P2Select,
  P2Surface,
  P2Switch,
  P2Table,
  P2TextLink,
  P2Tooltip,
  p2ButtonClasses,
} from "@/components/prototype2/ui";
import {
  formatProtectionLevel,
  getProtectionShieldSrc,
  getUsbControlIconSrc,
} from "@/lib/prototype2/presentation";
import {
  Download,
  Laptop,
  Monitor,
  MoreVertical,
  Package,
  Server,
  ShieldCheck,
  Smartphone,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const adversaryIcons = [
  {
    name: "Ember Bear",
    src: "/prototype-2/adversary/adversary-icon-ember-bear.png",
  },
  {
    name: "Ethereal Panda",
    src: "/prototype-2/adversary/adversary-icon-ethereal-panda.png",
  },
  {
    name: "Gossamer Bear",
    src: "/prototype-2/adversary/adversary-icon-gossamer-bear.png",
  },
  {
    name: "Primitive Bear",
    src: "/prototype-2/adversary/adversary-icon-primitive-bear.png",
  },
  {
    name: "Sunrise Panda",
    src: "/prototype-2/adversary/adversary-icon-sunrise-panda.png",
  },
  {
    name: "Wicked Panda",
    src: "/prototype-2/adversary/adversary-icon-wicked-panda.png",
  },
] as const;

const FINAL_CONTENT_RADIUS_CLASS = "rounded-[12px]";
type Prototype2DemoStateValue = ReturnType<typeof usePrototype2Demo>["state"];

function countByType(
  items: Prototype2DemoStateValue["devices"]["items"],
) {
  return {
    workstations: items.filter((item) => item.type === "Workstation").length,
    servers: items.filter((item) => item.type === "Server").length,
    mobile: items.filter((item) => item.type === "Mobile").length,
  };
}

function getFinalOnboardingView(state: Prototype2DemoStateValue) {
  const devices = state.finalOnboarding.devices;
  const users = state.finalOnboarding.users;
  const hasConnectedDevices = devices.length > 0;

  return {
    hasConnectedDevices,
    summary: {
      statusLabel: hasConnectedDevices ? "Protected" : "unconfigured",
      deviceCount: devices.length,
      licenseUsed: devices.length,
      licenseTotal: state.summary.licenseTotal,
      threatsPrevented: 0,
      detectionsPrevented: 0,
      quickViewEnabled: state.summary.quickViewEnabled,
    },
    quarantine: {
      totalFiles: 0,
      items: [] as Prototype2DemoStateValue["quarantine"]["items"],
    },
    usbControl: {
      monitoringLabel: hasConnectedDevices
        ? "Actively monitoring..."
        : "Ready for first device activity",
      categories: state.usbControl.categories,
      filesWritten: [] as Prototype2DemoStateValue["usbControl"]["filesWritten"],
      recentDevices: [] as Prototype2DemoStateValue["usbControl"]["recentDevices"],
    },
    devices,
    users,
  };
}

function FinalPolygonBadge({
  icon,
  backdropClassName = "bg-[var(--p2-panel)]",
}: {
  icon: React.ReactNode;
  backdropClassName?: string;
}) {
  const { state } = usePrototype2Demo();
  const lightMode = state.theme.final === "light";

  return (
    <div className="relative h-[116px] w-[96px] shrink-0">
      <div className="absolute inset-x-0 top-0 flex justify-center">
        <Image
          src="/prototype-2/polygon-outline.svg"
          alt=""
          width={88}
          height={100}
          className="h-[100px] w-[88px] object-contain"
        />
      </div>
      <div className="absolute left-1/2 top-[49px] z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[var(--p2-text-soft)] [&_svg]:h-6 [&_svg]:w-6">
        {icon}
      </div>
      <div
        className={`absolute left-1/2 top-[74px] z-20 -translate-x-1/2 rounded-full p-1 ${backdropClassName}`}
      >
        <div className="relative h-9 w-9">
          <span className="absolute inset-0 rounded-full border-[2.5px] border-[var(--p2-border)] opacity-80" />
          <span
            className="absolute inset-0 rounded-full border-[2.5px] border-transparent animate-[spin_4.4s_linear_infinite]"
            style={{
              borderTopColor: "#06E5B7",
              borderBottomColor: "#06E5B7",
            }}
          />
          {lightMode ? (
            <span
              className="absolute left-1/2 top-1/2 z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-[#06E5B7]"
              style={{ borderColor: "#ffffff" }}
            >
              <svg
                viewBox="0 0 14 11"
                aria-hidden
                className="h-3.5 w-3.5 text-[#242427]"
              >
                <path
                  d="M13 1.5 5.75 9 1 4.75"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : (
            <Image
              src="/prototype-2/checkmark-filled.svg"
              alt=""
              width={28}
              height={28}
              className="absolute left-1/2 top-1/2 z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FinalCountBadge({
  icon,
  value,
  label,
  badgeBackdropClassName,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  badgeBackdropClassName?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <FinalPolygonBadge
        icon={icon}
        backdropClassName={badgeBackdropClassName}
      />
      <div>
        <div className="text-4xl font-semibold leading-none text-[var(--p2-text-soft)]">
          {value}
        </div>
        <div className="mt-1 text-[17px] font-medium leading-tight text-[var(--p2-text)]">
          {label}
        </div>
      </div>
    </div>
  );
}

function AdversaryIconCarousel() {
  const repeatedIcons = [...adversaryIcons, ...adversaryIcons];

  return (
    <div className="relative w-[188px] overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--p2-panel)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--p2-panel)] to-transparent" />
      <div
        className="flex w-max items-center gap-3"
        style={{ animation: "p2-adversary-scroll 32s linear infinite" }}
      >
        {repeatedIcons.map((icon, index) => (
          <Image
            key={`${icon.name}-${index}`}
            src={icon.src}
            alt={index < adversaryIcons.length ? icon.name : ""}
            aria-hidden={index >= adversaryIcons.length}
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
          />
        ))}
      </div>
    </div>
  );
}

function DownloadSensorButton({ returnTo }: { returnTo: "ideal" | "final" }) {
  return (
    <div>
      <Link
        href={`/prototype-2/windows-desktop?returnTo=${returnTo}`}
        className={p2ButtonClasses({
          variant: "primary",
          className: "gap-3",
        })}
        style={{ color: "var(--p2-button-primary-text)" }}
      >
        <Download className="h-4 w-4 text-[var(--p2-button-primary-text)]" />
        <span className="text-[var(--p2-button-primary-text)]">
          Download sensor
        </span>
        <div
          className="ml-2 flex items-center gap-2 opacity-75"
          style={{ color: "var(--p2-button-primary-text)" }}
        >
          <Laptop className="h-4 w-4" />
          <Smartphone className="h-4 w-4" />
        </div>
      </Link>
      <div className="mt-3">
        <P2TextLink href="#">Watch installation tutorials</P2TextLink>
      </div>
    </div>
  );
}

function FinalPreventionOption({
  id,
  title,
  copy,
  selected,
  onSelect,
}: {
  id: "basic" | "enhanced" | "maximum";
  title: string;
  copy: string;
  selected: boolean;
  onSelect: (id: "basic" | "enhanced" | "maximum") => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`flex min-h-[188px] flex-1 flex-col justify-between px-5 py-5 text-left transition ${
        selected
          ? "bg-[var(--p2-elevated)]"
          : "bg-transparent hover:bg-[var(--p2-elevated)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-2xl font-semibold text-[var(--p2-text-soft)]">
          {title}
        </div>
        {id === "maximum" ? <P2Pill tone="neutral">Best protection</P2Pill> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--p2-text-muted)]">{copy}</p>
      <div className="mt-6 text-sm font-medium text-[var(--p2-text-muted)]">
        {selected ? "Selected" : "Select this level"}
      </div>
    </button>
  );
}

function FinalSummaryMetric({
  icon,
  value,
  label,
  detail,
  centered = false,
  badgeBackdropClassName = "bg-[var(--p2-surface)]",
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  detail?: string;
  centered?: boolean;
  badgeBackdropClassName?: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 ${centered ? "justify-center text-center" : ""}`}
    >
      <FinalPolygonBadge
        icon={icon}
        backdropClassName={badgeBackdropClassName}
      />
      <div>
        <div className="text-[34px] font-semibold leading-none text-[var(--p2-text-soft)]">
          {value}
        </div>
        <div className="mt-1 text-[16px] font-semibold leading-tight text-[var(--p2-text)]">
          {label}
        </div>
        {detail ? (
          <div className="mt-1 text-[15px] font-medium leading-5 text-[var(--p2-text-muted)]">
            {detail}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FinalEmptyState({
  icon,
  title,
  copy,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full items-center justify-center rounded-[var(--p2-radius-card)] border border-dashed border-[var(--p2-border-strong)] bg-[var(--p2-surface)] px-8 py-14 text-center">
      <div className="max-w-[440px]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--p2-border)] bg-[var(--p2-panel)] text-[var(--p2-text-soft)] [&_svg]:h-6 [&_svg]:w-6">
          {icon}
        </div>
        <div className="mt-5 text-balance text-[28px] font-semibold leading-tight text-[var(--p2-text-soft)]">
          {title}
        </div>
        <p className="mt-3 text-balance text-[15px] leading-7 text-[var(--p2-text-muted)]">
          {copy}
        </p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}

function FinalProtectionHero({
  theme,
  statusLabel,
  deviceCount,
  shieldSrc,
  statusDetail,
}: {
  theme: "light" | "dark";
  statusLabel: string;
  deviceCount: number;
  shieldSrc: string;
  statusDetail?: string;
}) {
  const [glowPosition, setGlowPosition] = useState({
    x: 50,
    y: 45,
    active: false,
  });
  const patternSrc =
    theme === "dark"
      ? "/prototype-2/background-pattern-dark.svg"
      : "/prototype-2/background-pattern-light.svg";
  const glowFill =
    theme === "dark"
      ? "rgba(34, 224, 186, 0.38)"
      : "rgba(42, 190, 152, 0.22)";
  const heroOverlay =
    theme === "dark"
      ? "linear-gradient(180deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.16))"
      : "transparent";

  return (
    <section
      className="relative min-h-0 overflow-hidden border-b border-[var(--p2-border)]"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        setGlowPosition({ x, y, active: true });
      }}
      onPointerLeave={() => {
        setGlowPosition((current) => ({ ...current, active: false }));
      }}
      style={{
        backgroundColor: theme === "light" ? "#ffffff" : "var(--p2-panel)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[96px] transition-[left,top,opacity] duration-200 ease-out"
          style={{
            left: `${glowPosition.x}%`,
            top: `${glowPosition.y}%`,
            opacity: glowPosition.active ? 0.95 : 0.7,
            background: glowFill,
          }}
        />
        <div
          className="absolute -inset-x-10 -inset-y-6 opacity-[0.84]"
          style={{
            backgroundImage: `url(${patternSrc})`,
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: heroOverlay,
          }}
        />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-6 py-10">
        <div className="relative flex w-full max-w-[940px] flex-col items-center justify-center gap-6 lg:flex-row">
          <div className="w-full max-w-[264px] lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2">
            <div className="rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-surface)]/92 p-4 shadow-[var(--p2-shadow)] backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Image
                  src="/prototype-2/checkmark-filled.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
                <div className="text-[11px] font-medium text-[var(--p2-text-muted)]">
                  Status
                </div>
              </div>
              <div className="mt-2 text-balance text-2xl font-semibold text-[var(--p2-text-soft)]">
                {statusLabel}
              </div>
              <div className="mt-4 h-px bg-[var(--p2-border)]" />
              <div className="mt-3 text-balance text-sm text-[var(--p2-text-soft)]">
                {statusDetail ??
                  `${deviceCount} device${deviceCount === 1 ? "" : "s"} detected`}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 items-center justify-center">
            <Image
              src={shieldSrc}
              alt={`${statusLabel} shield`}
              width={620}
              height={620}
              className="h-full max-h-[340px] w-full max-w-[360px] object-contain drop-shadow-[0_28px_80px_rgba(0,0,0,0.22)]"
              unoptimized={shieldSrc.endsWith(".gif")}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Prototype2FinalSummaryPage() {
  const { state, setQuickViewEnabled } = usePrototype2Demo();
  const finalView = getFinalOnboardingView(state);
  const shieldSrc = getProtectionShieldSrc(
    state.prevention.level,
    finalView.summary.statusLabel,
    { animated: finalView.hasConnectedDevices },
  );

  return (
    <div
      className={`grid min-h-0 flex-1 grid-rows-[minmax(0,7fr)_minmax(0,2fr)_minmax(0,1fr)] overflow-hidden border border-[var(--p2-border)] bg-[var(--p2-panel)] shadow-[var(--p2-shadow)] ${FINAL_CONTENT_RADIUS_CLASS}`}
    >
      <FinalProtectionHero
        theme={state.theme.final}
        statusLabel={finalView.summary.statusLabel}
        deviceCount={finalView.summary.deviceCount}
        shieldSrc={shieldSrc}
        statusDetail={
          finalView.hasConnectedDevices ? undefined : "No devices connected yet"
        }
      />

      <section className="grid min-h-0 border-b border-[var(--p2-border)] lg:grid-cols-[1fr_1fr_0.92fr_1.12fr]">
        <div className="flex items-center justify-center border-b border-[var(--p2-border)] px-6 py-5 text-center lg:border-b-0 lg:border-r">
          <div>
            <div className="text-[13px] font-medium tracking-[0.02em] text-[var(--p2-text-muted)]">
              Next-gen antivirus
            </div>
            <div className="mt-2 text-[16px] font-medium text-[var(--p2-text-muted)]">
              Prevention level
            </div>
            <div className="mt-1 text-[24px] font-semibold text-[var(--p2-text-soft)]">
              {finalView.hasConnectedDevices
                ? formatProtectionLevel(state.prevention.level)
                : "\u00A0"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center border-b border-[var(--p2-border)] px-6 py-5 text-center lg:border-b-0 lg:border-r">
          <div className="flex flex-col items-center">
            <DownloadSensorButton returnTo="final" />
          </div>
        </div>

        <div className="flex items-center justify-center border-b border-[var(--p2-border)] px-6 py-5 lg:border-b-0 lg:border-r">
          <FinalSummaryMetric
            icon={<Monitor className="h-6 w-6" />}
            value={finalView.summary.licenseUsed.toLocaleString()}
            label="License used"
            detail={`of ${finalView.summary.licenseTotal} available`}
            badgeBackdropClassName="bg-[var(--p2-panel)]"
            centered
          />
        </div>

        <div className="flex items-center justify-center px-6 py-5">
          <FinalSummaryMetric
            icon={<ShieldCheck className="h-6 w-6" />}
            value={finalView.summary.threatsPrevented.toLocaleString()}
            label="Threats prevented"
            detail={
              finalView.hasConnectedDevices
                ? `${finalView.summary.detectionsPrevented.toLocaleString()} detections`
                : "Starts after the first sensor check-in"
            }
            badgeBackdropClassName="bg-[var(--p2-panel)]"
            centered
          />
        </div>
      </section>

      <section className="flex min-h-0 flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--p2-text-muted)]">
            Use Quick view as default
          </span>
          <P2Switch
            checked={finalView.summary.quickViewEnabled}
            onChange={setQuickViewEnabled}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] font-medium text-[var(--p2-text-muted)]">
              Adversary
            </div>
            <div className="text-[11px] font-medium text-[var(--p2-text-muted)]">
              Universe
            </div>
          </div>
          <AdversaryIconCarousel />
        </div>
      </section>
    </div>
  );
}

export function Prototype2FinalNextGenAvPage() {
  const {
    state,
    setProtectionLevel,
    releaseQuarantineItem,
    deleteQuarantineItem,
  } = usePrototype2Demo();
  const finalView = getFinalOnboardingView(state);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const activeItems = finalView.quarantine.items.filter(
    (item) => item.status === "quarantined",
  );

  return (
    <P2Surface
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${FINAL_CONTENT_RADIUS_CLASS}`}
    >
        <section className="grid shrink-0 border-b border-[var(--p2-border)] xl:grid-cols-[0.88fr_1.12fr]">
          <div className="flex flex-col justify-center border-b border-[var(--p2-border)] px-6 py-6 xl:border-b-0 xl:border-r">
            <div className="text-[15px] font-semibold text-[var(--p2-text)]">
              Protection status
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
              <FinalCountBadge
                icon={<ShieldCheck className="h-7 w-7" />}
                value={finalView.summary.threatsPrevented.toLocaleString()}
                label="threats prevented"
              />
              <FinalCountBadge
                icon={<Package className="h-7 w-7" />}
                value={finalView.quarantine.totalFiles.toLocaleString()}
                label="files quarantined"
              />
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="text-[15px] font-semibold text-[var(--p2-text)]">
              Prevention level
            </div>
            <div className="mt-5 flex min-h-0 flex-col divide-y divide-[var(--p2-border)] border border-[var(--p2-border)] md:flex-row md:divide-x md:divide-y-0">
              <FinalPreventionOption
                id="basic"
                title="Basic"
                copy="Only includes detection, so you will be relying on your other antivirus service for prevention."
                selected={state.prevention.level === "basic"}
                onSelect={setProtectionLevel}
              />
              <FinalPreventionOption
                id="enhanced"
                title="Enhanced"
                copy="Level up security. Remove other antivirus, monitor false positives, and prepare for highest protection."
                selected={state.prevention.level === "enhanced"}
                onSelect={setProtectionLevel}
              />
              <FinalPreventionOption
                id="maximum"
                title="Maximum"
                copy="The most aggressive security level, providing both detection and prevention."
                selected={state.prevention.level === "maximum"}
                onSelect={setProtectionLevel}
              />
            </div>
            <div className="mt-4">
              <P2TextLink href="#">Learn about the prevention levels</P2TextLink>
            </div>
          </div>
        </section>

        <section className="min-h-0 flex flex-1 flex-col">
          <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 pt-5">
            <div className="text-[26px] font-semibold text-[var(--p2-text-soft)]">
              Quarantined files
            </div>
            <div className="w-[180px]">
              <P2Select defaultValue="last-week">
                <option value="last-week">Last week</option>
                <option value="last-month">Last month</option>
              </P2Select>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto overscroll-contain px-6 pb-5">
            {activeItems.length > 0 ? (
              <P2Table
                stickyHeader
                headers={[
                  <P2Checkbox
                    key="select-all"
                    checked={
                      activeItems.length > 0 &&
                      selectedRows.length === activeItems.length
                    }
                    onChange={(checked) =>
                      setSelectedRows(checked ? activeItems.map((item) => item.id) : [])
                    }
                  />,
                  "File name",
                  <>
                    Date of quarantine <P2Tooltip content="Demo quarantine timestamps." />
                  </>,
                  "Device ID",
                  "Actions",
                ]}
              >
                {activeItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-[var(--p2-border)] text-[var(--p2-text)]"
                  >
                    <td className="px-4 py-3">
                      <P2Checkbox
                        checked={selectedRows.includes(item.id)}
                        onChange={(checked) =>
                          setSelectedRows((current) =>
                            checked
                              ? [...current, item.id]
                              : current.filter((value) => value !== item.id),
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">{item.fileName}</td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">
                      {item.quarantinedAt}
                    </td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">
                      {item.deviceId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <P2Button
                          variant="danger"
                          onClick={() => deleteQuarantineItem(item.id)}
                        >
                          Delete
                        </P2Button>
                        <P2Button
                          variant="secondary"
                          onClick={() => releaseQuarantineItem(item.id)}
                        >
                          Release
                        </P2Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </P2Table>
            ) : (
              <FinalEmptyState
                icon={<ShieldCheck />}
                title={
                  finalView.hasConnectedDevices
                    ? "No quarantined files yet"
                    : "Protection activity will appear here"
                }
                copy={
                  finalView.hasConnectedDevices
                    ? "Your first device is connected, but nothing has been quarantined yet."
                    : "Finish the first sensor install to populate detections, prevented threats, and quarantine actions."
                }
                action={
                  finalView.hasConnectedDevices ? undefined : (
                    <DownloadSensorButton returnTo="final" />
                  )
                }
              />
            )}
          </div>
        </section>
    </P2Surface>
  );
}

export function Prototype2FinalUsbControlPage() {
  const { state, toggleUsbCategory, allowListUsbDevice, setUsbTableView } =
    usePrototype2Demo();
  const finalView = getFinalOnboardingView(state);
  const showingFiles = state.usbControl.tableView === "files-written";

  return (
    <P2Surface
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${FINAL_CONTENT_RADIUS_CLASS}`}
    >
        <section className="shrink-0 border-b border-[var(--p2-border)]">
          <div className="flex flex-wrap items-center gap-3 px-6 py-5">
            <div className="text-[30px] font-semibold text-[var(--p2-text-soft)]">
              Device types
            </div>
            <P2Pill tone="teal" outline>
              {finalView.usbControl.monitoringLabel}
            </P2Pill>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-6">
            {finalView.usbControl.categories.map((category) => (
              <div
                key={category.id}
                className="flex min-h-[168px] flex-col justify-center bg-[var(--p2-panel)] px-5 py-6"
              >
                <div className="mb-5 flex justify-center">
                  <Image
                    src={getUsbControlIconSrc(category.id, category.allow)}
                    alt={`${category.label} ${category.allow ? "allowed" : "disallowed"}`}
                    width={36}
                    height={36}
                    className="h-9 w-9"
                  />
                </div>
                <div className="text-center text-base font-medium text-[var(--p2-text-soft)]">
                  {category.label}
                </div>
                <div className="mt-5 flex items-center justify-center gap-3 text-sm text-[var(--p2-text-muted)]">
                  <span className={category.allow ? "text-[var(--p2-text-soft)]" : ""}>
                    Allow
                  </span>
                  <P2Switch
                    checked={category.allow}
                    onChange={() => toggleUsbCategory(category.id)}
                  />
                  <span className={!category.allow ? "text-[var(--p2-text-soft)]" : ""}>
                    Block
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="min-h-0 flex flex-1 flex-col">
          <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 pt-5">
            <div className="flex rounded-[var(--p2-radius-button)] bg-[var(--p2-tab-strip)] p-1">
              <button
                type="button"
                onClick={() => setUsbTableView("files-written")}
                className={`rounded-[4px] px-4 py-2 text-[15px] font-semibold transition ${
                  showingFiles
                    ? "bg-[var(--p2-tab-active)] text-[var(--p2-tab-active-text)]"
                    : "text-[var(--p2-text)]"
                }`}
              >
                Files written to USB
              </button>
              <button
                type="button"
                onClick={() => setUsbTableView("recent-devices")}
                className={`rounded-[4px] px-4 py-2 text-[15px] font-semibold transition ${
                  !showingFiles
                    ? "bg-[var(--p2-tab-active)] text-[var(--p2-tab-active-text)]"
                    : "text-[var(--p2-text)]"
                }`}
              >
                Recently seen USB devices
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="w-[140px]">
                <P2Select defaultValue="all-file-types">
                  <option value="all-file-types">File type</option>
                </P2Select>
              </div>
              <div className="w-[140px]">
                <P2Select defaultValue="all-devices">
                  <option value="all-devices">Device</option>
                </P2Select>
              </div>
              <div className="w-[150px]">
                <P2Select defaultValue="last-week">
                  <option value="last-week">Last week</option>
                </P2Select>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto overscroll-contain px-6 pb-5">
            {showingFiles ? (
              finalView.usbControl.filesWritten.length > 0 ? (
                <P2Table
                  stickyHeader
                  headers={[
                    "Date written",
                    "File name",
                    "File type detected",
                    "USB device name",
                    "Device ID",
                  ]}
                >
                  {finalView.usbControl.filesWritten.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-[var(--p2-border)] text-[var(--p2-text)]"
                    >
                      <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.writtenAt}</td>
                      <td className="px-4 py-3">{row.fileName}</td>
                      <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.detectedType}</td>
                      <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.usbDeviceName}</td>
                      <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.deviceId}</td>
                    </tr>
                  ))}
                </P2Table>
              ) : (
                <FinalEmptyState
                  icon={<Package />}
                  title="No files written to USB yet"
                  copy={
                    finalView.hasConnectedDevices
                      ? "USB write events will appear here after the first removable storage action is detected."
                      : "Set your USB rules now and this view will fill in once the first sensor starts reporting activity."
                  }
                  action={
                    finalView.hasConnectedDevices ? undefined : (
                      <DownloadSensorButton returnTo="final" />
                    )
                  }
                />
              )
            ) : (
              finalView.usbControl.recentDevices.length > 0 ? (
                <P2Table
                  stickyHeader
                  headers={[
                    "USB device",
                    "Vendor",
                    "Connected at",
                    "Last user",
                    "Device ID",
                    "Actions",
                  ]}
                >
                  {finalView.usbControl.recentDevices.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-[var(--p2-border)] text-[var(--p2-text)]"
                    >
                      <td className="px-4 py-3">{row.deviceName}</td>
                      <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.vendor}</td>
                      <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.connectedAt}</td>
                      <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.lastUser}</td>
                      <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.deviceId}</td>
                      <td className="px-4 py-3">
                        <P2Menu
                          align="right"
                          items={[
                            {
                              id: "allow-list",
                              label: row.allowListed
                                ? "Added to allow list"
                                : "Add to allow list",
                              checked: row.allowListed,
                            },
                          ]}
                          onSelect={() => {
                            if (!row.allowListed) {
                              allowListUsbDevice(row.id);
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </P2Table>
              ) : (
                <FinalEmptyState
                  icon={<Monitor />}
                  title="No USB devices have checked in yet"
                  copy={
                    finalView.hasConnectedDevices
                      ? "Trusted USB devices will start appearing here as soon as the first endpoint reports them."
                      : "This onboarding route stays empty until the first device connects, so you can demo the setup flow cleanly."
                  }
                  action={
                    finalView.hasConnectedDevices ? undefined : (
                      <DownloadSensorButton returnTo="final" />
                    )
                  }
                />
              )
            )}
          </div>
        </section>
    </P2Surface>
  );
}

export function Prototype2FinalDevicesPage() {
  const { state, setDeviceSearch } = usePrototype2Demo();
  const finalView = getFinalOnboardingView(state);
  const counts = countByType(finalView.devices);
  const filteredDevices = useMemo(() => {
    const search = state.devices.search.trim().toLowerCase();

    if (!search) {
      return finalView.devices;
    }

    return finalView.devices.filter(
      (item) =>
        item.id.toLowerCase().includes(search) ||
        item.name.toLowerCase().includes(search) ||
        item.os.toLowerCase().includes(search),
    );
  }, [finalView.devices, state.devices.search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <P2Surface
        className={`flex min-h-0 flex-1 flex-col overflow-hidden p-5 ${FINAL_CONTENT_RADIUS_CLASS}`}
      >
          <div className="mb-6 w-full shrink-0 border-b border-[var(--p2-border)] pb-8">
            <div className="grid w-full gap-px overflow-hidden rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-border)] sm:grid-cols-3">
              <div className="flex items-center justify-center bg-[var(--p2-panel)] px-6 py-6">
                <FinalCountBadge
                  icon={<Monitor className="h-7 w-7" />}
                  value={counts.workstations}
                  label="Workstations"
                />
              </div>
              <div className="flex items-center justify-center bg-[var(--p2-panel)] px-6 py-6">
                <FinalCountBadge
                  icon={<Server className="h-7 w-7" />}
                  value={counts.servers}
                  label="Servers"
                />
              </div>
              <div className="flex items-center justify-center bg-[var(--p2-panel)] px-6 py-6">
                <FinalCountBadge
                  icon={<Smartphone className="h-7 w-7" />}
                  value={counts.mobile}
                  label="Mobile"
                />
              </div>
            </div>
          </div>

          <div className="mb-3 flex shrink-0 flex-wrap items-start justify-between gap-5">
            <div className="text-[26px] font-semibold text-[var(--p2-text-soft)]">
              Devices ({filteredDevices.length})
            </div>
            <div className="flex w-full max-w-[720px] flex-col items-start gap-3 lg:items-end">
              <div className="flex w-full flex-wrap items-center gap-3 lg:justify-end">
                <div className="w-full max-w-[320px]">
                  <P2Input
                    value={state.devices.search}
                    onChange={(event) => setDeviceSearch(event.target.value)}
                    placeholder="Search device info"
                  />
                </div>
                <Link
                  href="/prototype-2/windows-desktop?returnTo=final"
                  className={p2ButtonClasses({
                    variant: "primary",
                    className: "gap-3",
                  })}
                  style={{ color: "var(--p2-button-primary-text)" }}
                >
                  <Download className="h-4 w-4 text-[var(--p2-button-primary-text)]" />
                  <span className="text-[var(--p2-button-primary-text)]">
                    Download sensor
                  </span>
                  <div
                    className="ml-2 flex items-center gap-2 opacity-75"
                    style={{ color: "var(--p2-button-primary-text)" }}
                  >
                    <Laptop className="h-4 w-4" />
                    <Smartphone className="h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
            {filteredDevices.length > 0 ? (
              <P2Table
                stickyHeader
                headers={["Device ID", "Type", "OS System", "Last seen", "Uninstallation token"]}
              >
                {filteredDevices.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-[var(--p2-border)] text-[var(--p2-text)]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span>{item.id}</span>
                        {item.firstDetected ? <P2Pill tone="blue" outline>First detected</P2Pill> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{item.type}</td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{item.os}</td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{item.lastSeen}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <P2Button variant="secondary">
                          {item.uninstallToken}
                        </P2Button>
                        <button
                          type="button"
                          className={p2ButtonClasses({ className: "w-10 px-0" })}
                          aria-label={`Open actions for ${item.name}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </P2Table>
            ) : (
              <FinalEmptyState
                icon={<Monitor />}
                title={
                  state.devices.search.trim()
                    ? "No devices match this search"
                    : "No devices connected yet"
                }
                copy={
                  state.devices.search.trim()
                    ? "Try another search term once more devices have been added to the workspace."
                    : "The final version now starts with an empty device inventory so the onboarding story begins from zero."
                }
                action={
                  state.devices.search.trim() ? undefined : (
                    <DownloadSensorButton returnTo="final" />
                  )
                }
              />
            )}
          </div>
      </P2Surface>
    </div>
  );
}

export function Prototype2FinalUsersPage() {
  const { state, setUserSearch, setUserRole } = usePrototype2Demo();
  const finalView = getFinalOnboardingView(state);
  const avatarBackgroundSrc = useMemo(
    () => pickUsernameBackground(`${prototype2UserName}-final-users`),
    [],
  );
  const userInitials = useMemo(() => getUserInitials(prototype2UserName), []);
  const filteredUsers = useMemo(() => {
    const search = state.users.search.trim().toLowerCase();

    if (!search) {
      return finalView.users;
    }

    return finalView.users.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search),
    );
  }, [finalView.users, state.users.search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <P2Surface
        className={`flex min-h-0 flex-1 flex-col p-5 ${FINAL_CONTENT_RADIUS_CLASS}`}
      >
          <div className="grid min-h-0 flex-1 gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="shrink-0 space-y-5">
              <div className="space-y-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-[var(--p2-radius-card)]">
                  <Image
                    src={avatarBackgroundSrc}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-white">
                    {userInitials}
                  </div>
                </div>
                <P2Pill tone="neutral">Administrator</P2Pill>
                <div className="space-y-1.5">
                  <div className="text-[28px] font-semibold leading-tight text-[var(--p2-text-soft)]">
                    {prototype2UserName}
                  </div>
                  <div className="text-base text-[var(--p2-text-muted)]">
                    christie.burke@email.com
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex min-h-0 flex-col">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[30px] font-semibold text-[var(--p2-text-soft)]">
                  Active users ({filteredUsers.length})
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[260px]">
                    <P2Input
                      value={state.users.search}
                      onChange={(event) => setUserSearch(event.target.value)}
                      placeholder="Search by name"
                    />
                  </div>
                  <P2Button variant="primary">
                    <UserPlus className="h-4 w-4" />
                    Add new user
                  </P2Button>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="grid gap-4 rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-surface)] p-3 md:grid-cols-[1fr_170px_52px]"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--p2-radius-card)] text-sm font-semibold text-[#251215]"
                          style={{ backgroundColor: user.accent }}
                        >
                          {user.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="text-base font-semibold text-[var(--p2-text-soft)]">
                              {user.name}
                            </div>
                            {user.rtrAccess ? <P2Pill tone="blue" outline>+RTR Access</P2Pill> : null}
                          </div>
                          <div className="truncate text-sm text-[var(--p2-text-muted)]">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      <P2Select
                        value={user.role}
                        onChange={(event) =>
                          setUserRole(user.id, event.target.value as typeof user.role)
                        }
                      >
                        <option>Administrator</option>
                        <option>Security analyst</option>
                        <option>Standard user</option>
                      </P2Select>

                      <P2Menu
                        items={[
                          { id: "view", label: "View profile" },
                          { id: "notify", label: "Send invite" },
                          { id: "disable", label: "Disable access" },
                        ]}
                        onSelect={() => undefined}
                      />
                    </div>
                  ))
                ) : (
                  <FinalEmptyState
                    icon={<UserPlus />}
                    title={
                      state.users.search.trim()
                        ? "No users match this search"
                        : "No invited admins yet"
                    }
                    copy={
                      state.users.search.trim()
                        ? "Try a broader search after teammates have been added."
                        : "Keep the final version empty by default and use this screen to tell the onboarding story for first-time user invites."
                    }
                  />
                )}
              </div>
            </div>
          </div>
      </P2Surface>
    </div>
  );
}
