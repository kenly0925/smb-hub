"use client";

import {
  getUserInitials,
  pickUsernameBackground,
  Prototype2ConsoleTopbar,
  prototype2UserName,
} from "@/components/prototype2/console-topbar";
import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import {
  FinalCountBadge,
  DownloadAgentCardSummary,
  DownloadAgentPlatformNote,
  DownloadSensorButton,
  FinalPreventionLevelSelector,
  finalPreventionLevelTabs,
} from "@/components/prototype2/final-pages";
import {
  AdversaryUniverseSummaryCard,
  DetectionStatusSummaryCard,
  HighSeverityEndpointsSummaryCard,
} from "@/components/prototype2/ideal-summary-widgets";
import { Prototype2UsbControlContent } from "@/components/prototype2/usb-control-content";
import {
  P2Button,
  P2Input,
  P2Menu,
  P2Pill,
  P2Select,
  P2Surface,
  Prototype2ThemeRoot,
} from "@/components/prototype2/ui";
import { Prototype2UsbSummaryCard } from "@/components/prototype2/usb-summary-card";
import { getProtectionShieldSrc } from "@/lib/prototype2/presentation";
import dynamic from "next/dynamic";
import { DM_Mono } from "next/font/google";
import {
  Check,
  Database,
  Download,
  File,
  FileArchive,
  FileCode2,
  FileTerminal,
  FileText,
  Info,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const QuarantineArena = dynamic(
  () =>
    import("@/components/prototype2/quarantine-arena").then(
      (module) => module.QuarantineArena,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full rounded-[var(--p2-radius-canvas)] border border-[var(--p2-border)] bg-[var(--p2-canvas)]" />
    ),
  },
);

const DeviceGroupCanvas = dynamic(
  () =>
    import("@/components/prototype2/device-group-canvas").then(
      (module) => module.DeviceGroupCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full rounded-[var(--p2-radius-canvas)] border border-[var(--p2-border)] bg-[var(--p2-canvas)]" />
    ),
  },
);

const IDEAL_VIEWPORT_HEIGHT = "calc(100dvh - 156px)";
const idealSummaryMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

function getQuarantineCardPresentation(fileName: string) {
  const lower = fileName.toLowerCase();
  const extension = lower.includes(".") ? lower.split(".").pop() ?? "" : "";

  if (extension === "reg" || lower.includes("registry") || lower.includes("regedit")) {
    return {
      badge: "REG",
      Icon: Database,
    };
  }

  if (["bat", "cmd", "ps1", "sh", "zsh"].includes(extension) || lower.includes("cli")) {
    return {
      badge: "CLI",
      Icon: FileTerminal,
    };
  }

  if (["pkg", "msi", "exe", "dmg"].includes(extension) || lower.includes("installer")) {
    return {
      badge: "PKG",
      Icon: Package,
    };
  }

  if (["html", "js", "ts", "jsx", "tsx", "json", "xml"].includes(extension)) {
    return {
      badge: extension.toUpperCase().slice(0, 4),
      Icon: FileCode2,
    };
  }

  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return {
      badge: extension.toUpperCase().slice(0, 4),
      Icon: FileArchive,
    };
  }

  if (["pdf", "doc", "docx", "txt", "rtf", "csv"].includes(extension)) {
    return {
      badge: extension.toUpperCase().slice(0, 4),
      Icon: FileText,
    };
  }

  return {
    badge: extension ? extension.toUpperCase().slice(0, 4) : "FILE",
    Icon: File,
  };
}

export function Prototype2IdealPage() {
  const {
    state,
    setProtectionLevel,
    releaseQuarantineItem,
    deleteQuarantineItem,
    setAllUsbCategories,
  } = usePrototype2Demo();
  const [activeTab, setActiveTab] = useState("summary");
  const activeQuarantineItems = useMemo(
    () =>
      state.quarantine.items.filter((item) => item.status === "quarantined"),
    [state.quarantine.items],
  );
  const topQuarantineItems = useMemo(
    () =>
      [...activeQuarantineItems]
        .sort(
          (left, right) =>
            new Date(right.quarantinedAt).getTime() -
            new Date(left.quarantinedAt).getTime(),
        )
        .slice(0, 4),
    [activeQuarantineItems],
  );
  const usbAccessAllowed = state.usbControl.categories.every((category) => category.allow);
  const remainingLicenses = Math.max(
    0,
    state.summary.licenseTotal - state.summary.licenseUsed,
  );
  const isIdealDark = state.theme.ideal === "dark";
  const quarantineBadgeBorder = isIdealDark ? "#3f3f46" : "#d4d4d8";
  const quarantineBadgeText = isIdealDark ? "#a1a1aa" : "#71717a";
  const quarantineBadgeBackground = isIdealDark
    ? "rgba(24,24,27,0.78)"
    : "rgba(255,255,255,0.92)";
  const quarantineFileIconClassName = isIdealDark
    ? "border-white/8 bg-[#2b2c31] text-[#cfd2d8]"
    : "border-[#d4d4d8] bg-white text-[#3f3f46]";
  const quarantineCardReleaseActionClassName = isIdealDark
    ? "pointer-events-auto h-auto gap-0 rounded-[4px] border px-2 py-1 text-[10px] font-normal leading-none !border-[#4ade80] !bg-[#14532d] !text-[#4ade80] hover:!bg-[#166534] hover:!text-[#4ade80]"
    : "pointer-events-auto h-auto gap-0 rounded-[4px] border px-2 py-1 text-[10px] font-normal leading-none !border-[#16a34a] !bg-[#dcfce7] !text-[#16a34a] hover:!bg-[#bbf7d0] hover:!text-[#15803d]";
  const quarantineCardDeleteActionClassName = isIdealDark
    ? "pointer-events-auto h-auto gap-0 rounded-[4px] border px-2 py-1 text-[10px] font-normal leading-none border-[#f87171] bg-[#7f1d1d] text-[#f87171] hover:bg-[#991b1b] hover:text-[#f87171]"
    : "pointer-events-auto h-auto gap-0 rounded-[4px] border px-2 py-1 text-[10px] font-normal leading-none border-[#dc2626] bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca] hover:text-[#b91c1c]";
  const protectionShieldSrc = getProtectionShieldSrc(
    state.prevention.level,
    state.summary.statusLabel,
    { animated: false },
  );
  const idealSummaryProtectionPanelClass =
    state.theme.ideal === "dark"
      ? "border-[#2b3934] bg-[#1a1b1f]"
      : "border-[#d6e5de] bg-[#f8fbf9]";
  const idealSummaryProtectionBackdropClass =
    state.theme.ideal === "dark"
      ? "bg-[radial-gradient(circle_at_84%_58%,rgba(6,229,183,0.34),transparent_20%),radial-gradient(circle_at_74%_18%,rgba(194,255,231,0.14),transparent_26%),linear-gradient(118deg,rgba(255,255,255,0.02)_0%,rgba(6,229,183,0.08)_56%,rgba(6,229,183,0.18)_100%)]"
      : "bg-[radial-gradient(circle_at_84%_58%,rgba(6,229,183,0.2),transparent_22%),radial-gradient(circle_at_72%_18%,rgba(6,229,183,0.08),transparent_28%),linear-gradient(118deg,rgba(255,255,255,0.98)_0%,rgba(241,255,251,0.98)_58%,rgba(224,251,243,0.98)_100%)]";
  const idealSummaryHeaderClass =
    "flex items-center gap-2.5 text-[15px] font-semibold text-[var(--p2-text)]";
  const idealSummaryHeaderIconClass = "h-4 w-4";

  return (
    <Prototype2ThemeRoot theme={state.theme.ideal}>
      <main className="min-h-screen bg-[var(--p2-bg)] px-5 py-6 text-[var(--p2-text)] md:px-8">
        <div className="mx-auto max-w-[1920px]">
          <Prototype2ConsoleTopbar
            version="ideal"
            tabs={[
              { id: "summary", label: "Summary" },
              { id: "next-gen-av", label: "Next-gen AV" },
              { id: "usb-control", label: "USB Control" },
              { id: "devices", label: "Devices" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="mb-6"
          />

          {activeTab === "summary" ? (
            <div
              className="grid min-h-0 grid-cols-12 grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.74fr)] gap-2 overflow-hidden"
              style={{ height: IDEAL_VIEWPORT_HEIGHT }}
            >
              <P2Surface
                className={`relative col-span-4 min-h-0 overflow-hidden p-0 ${idealSummaryProtectionPanelClass}`}
              >
                <div
                  aria-hidden
                  className={`absolute inset-0 ${idealSummaryProtectionBackdropClass}`}
                />
                <div
                  aria-hidden
                  className="absolute right-[22px] top-1/2 h-[172px] w-[172px] -translate-y-1/2 rounded-full bg-[#06e5b7]/22 blur-[42px]"
                />
                <div className="relative flex h-full min-h-[220px] flex-col justify-between p-5 pr-[184px]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#06e5b7] text-[#06140f]">
                      <Check className="h-[18px] w-[18px] stroke-[2.6]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium leading-none text-[var(--p2-text-muted)]">
                        Status
                      </div>
                      <div className="mt-2 text-[clamp(18px,1.25vw,21px)] font-semibold leading-none text-[var(--p2-text-soft)]">
                        {state.summary.statusLabel}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--p2-text-soft)]">
                      <span>{state.summary.deviceCount} devices protected</span>
                      <Info className="h-3.5 w-3.5 text-[var(--p2-text-muted)]" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("devices")}
                      className="inline-flex w-fit border-b border-current pb-px text-sm font-medium text-[var(--p2-text-soft)] opacity-80 transition hover:opacity-100"
                    >
                      Manage devices
                    </button>
                  </div>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[226px] items-center justify-end">
                    <Image
                      src={protectionShieldSrc}
                      alt={`${state.summary.statusLabel} shield`}
                      width={320}
                      height={320}
                      className="relative right-[-40px] h-auto w-[244px] max-w-none object-contain drop-shadow-[0_20px_42px_rgba(6,229,183,0.15)]"
                      priority
                    />
                  </div>
                </div>
              </P2Surface>

              <P2Surface className="col-span-4 min-h-0 p-4">
                <div className="flex h-full flex-col">
                  <div className={idealSummaryHeaderClass}>
                    <ShieldCheck className={idealSummaryHeaderIconClass} />
                    Next-gen AV
                  </div>
                  <div className="mt-4 flex justify-center">
                    <FinalCountBadge
                      icon={<ShieldCheck className="h-7 w-7" />}
                      value={state.summary.threatsPrevented.toLocaleString()}
                      label="threats prevented"
                      themeMode={state.theme.ideal}
                      badgeBackdropClassName="bg-[var(--p2-panel)]"
                    />
                  </div>
                  <div className="mt-auto pt-4">
                    <FinalPreventionLevelSelector
                      levels={finalPreventionLevelTabs}
                      activeId={state.prevention.level}
                      onChange={setProtectionLevel}
                      descriptionMode="tooltip"
                    />
                  </div>
                </div>
              </P2Surface>

              <div style={{ gridColumn: "span 4 / span 4", minHeight: 0 }}>
                <Prototype2UsbSummaryCard
                  checked={usbAccessAllowed}
                  onChange={setAllUsbCategories}
                />
              </div>

              <P2Surface className="col-span-4 min-h-0 p-4">
                <div className="flex h-full flex-col">
                  <div className={idealSummaryHeaderClass}>
                    <Download className={idealSummaryHeaderIconClass} />
                    Download agents
                  </div>
                  <div className="mt-4 flex flex-1 flex-col items-center justify-center text-center">
                    <DownloadAgentCardSummary
                      licenseRemaining={remainingLicenses}
                      activeDeviceCount={state.summary.deviceCount}
                    />
                    <div className="mt-6 flex flex-col items-center gap-3">
                      <DownloadSensorButton
                        returnTo="ideal"
                        showTutorialLink={false}
                        showPlatformIcons
                      />
                      <DownloadAgentPlatformNote />
                    </div>
                  </div>
                </div>
              </P2Surface>

              <P2Surface className="col-span-4 min-h-0 p-4">
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2.5 text-[15px] font-semibold text-[var(--p2-text)]">
                    <Package className={idealSummaryHeaderIconClass} />
                    Quarantine files
                  </div>
                  <div className={idealSummaryMono.className}>
                    <div className="mt-4 space-y-2">
                      {topQuarantineItems.length > 0 ? (
                        topQuarantineItems.map((item) => {
                          const { badge, Icon } =
                            getQuarantineCardPresentation(item.fileName);

                          return (
                            <div
                              key={item.id}
                              className="group relative overflow-hidden rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-surface)] px-3 py-2.5 transition hover:border-white/12 hover:bg-[var(--p2-elevated)]"
                            >
                              <div className="flex min-w-0 items-center gap-3 pr-[106px]">
                                <span className="flex w-12 shrink-0">
                                  <span
                                    className="inline-flex shrink-0 items-center rounded-[4px] border px-2 py-1 text-[10px] font-semibold leading-none"
                                    style={{
                                      borderColor: quarantineBadgeBorder,
                                      color: quarantineBadgeText,
                                      backgroundColor: quarantineBadgeBackground,
                                    }}
                                  >
                                    {badge}
                                  </span>
                                </span>
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border ${quarantineFileIconClassName}`}
                                >
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span className="truncate text-[13px] font-medium text-[var(--p2-text-soft)]">
                                  {item.fileName}
                                </span>
                              </div>
                              <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                                <P2Button
                                  size="sm"
                                  variant="secondary"
                                  className={quarantineCardReleaseActionClassName}
                                  onClick={() => releaseQuarantineItem(item.id)}
                                >
                                  Release
                                </P2Button>
                                <P2Button
                                  size="sm"
                                  variant="danger"
                                  className={quarantineCardDeleteActionClassName}
                                  onClick={() => deleteQuarantineItem(item.id)}
                                >
                                  Delete
                                </P2Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-surface)] px-3 py-3 text-[13px] text-[var(--p2-text-muted)]">
                          No quarantined files right now.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </P2Surface>

              <P2Surface className="col-span-4 min-h-0 p-4">
                <AdversaryUniverseSummaryCard theme={state.theme.ideal} />
              </P2Surface>

              <P2Surface className="col-span-6 min-h-0 p-4">
                <DetectionStatusSummaryCard
                  theme={state.theme.ideal}
                  devices={state.devices.items}
                />
              </P2Surface>

              <P2Surface className="col-span-6 min-h-0 p-4">
                <HighSeverityEndpointsSummaryCard
                  theme={state.theme.ideal}
                  devices={state.devices.items}
                  onOpenDevices={() => setActiveTab("devices")}
                />
              </P2Surface>
            </div>
          ) : null}

          {activeTab === "next-gen-av" ? (
            <div
              className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden"
              style={{ height: IDEAL_VIEWPORT_HEIGHT }}
            >
              <div className="grid gap-3 xl:grid-cols-[0.88fr_1.12fr]">
                <P2Surface className="p-6">
                  <div className="text-[15px] font-semibold text-[var(--p2-text)]">
                    Prevention status
                  </div>
                  <div className="flex min-h-[220px] items-center justify-center pt-3">
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
                      <FinalCountBadge
                        icon={<ShieldCheck className="h-7 w-7" />}
                        value={state.summary.threatsPrevented.toLocaleString()}
                        label="threats prevented"
                        themeMode={state.theme.ideal}
                        badgeBackdropClassName="bg-[var(--p2-panel)]"
                      />
                      <FinalCountBadge
                        icon={<Package className="h-7 w-7" />}
                        value={state.quarantine.totalFiles.toLocaleString()}
                        label="files quarantined"
                        themeMode={state.theme.ideal}
                        badgeBackdropClassName="bg-[var(--p2-panel)]"
                      />
                    </div>
                  </div>
                </P2Surface>

                <P2Surface className="p-6">
                  <div className="text-[15px] font-semibold text-[var(--p2-text)]">
                    Prevention level
                  </div>
                  <FinalPreventionLevelSelector
                    className="mt-5"
                    levels={finalPreventionLevelTabs}
                    activeId={state.prevention.level}
                    onChange={setProtectionLevel}
                  />
                </P2Surface>
              </div>
              <div className="min-h-0 overflow-hidden rounded-[var(--p2-radius-card)]">
                <QuarantineArena theme={state.theme.ideal} />
              </div>
            </div>
          ) : null}

          {activeTab === "usb-control" ? (
            <Prototype2UsbControlContent height={IDEAL_VIEWPORT_HEIGHT} />
          ) : null}

          {activeTab === "devices" ? (
            <div
              className="min-h-0 overflow-hidden rounded-[var(--p2-radius-card)]"
              style={{ height: IDEAL_VIEWPORT_HEIGHT }}
            >
              <DeviceGroupCanvas theme={state.theme.ideal} />
            </div>
          ) : null}
        </div>
      </main>
    </Prototype2ThemeRoot>
  );
}

export function Prototype2IdealUsersPage() {
  const router = useRouter();
  const { state, setUserSearch, setUserRole } = usePrototype2Demo();
  const avatarBackgroundSrc = useMemo(
    () => pickUsernameBackground(`${prototype2UserName}-ideal-users`),
    [],
  );
  const userInitials = useMemo(() => getUserInitials(prototype2UserName), []);
  const filteredUsers = useMemo(() => {
    const search = state.users.search.trim().toLowerCase();

    if (!search) {
      return state.users.items;
    }

    return state.users.items.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search),
    );
  }, [state.users.items, state.users.search]);

  return (
    <Prototype2ThemeRoot theme={state.theme.ideal}>
      <main className="min-h-screen bg-[var(--p2-bg)] px-5 py-6 text-[var(--p2-text)] md:px-8">
        <div className="mx-auto max-w-[1920px]">
          <Prototype2ConsoleTopbar
            version="ideal"
            tabs={[
              { id: "summary", label: "Summary" },
              { id: "next-gen-av", label: "Next-gen AV" },
              { id: "usb-control", label: "USB Control" },
              { id: "devices", label: "Devices" },
            ]}
            activeTab="summary"
            onTabChange={() => router.push("/prototype-2/ideal")}
            className="mb-6"
          />

          <div style={{ height: IDEAL_VIEWPORT_HEIGHT }}>
            <P2Surface className="h-full min-h-0 p-5">
              <div className="grid h-full min-h-0 gap-8 xl:grid-cols-[280px_1fr]">
                <aside className="space-y-5">
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
                        <Users className="h-4 w-4" />
                        Add new user
                      </P2Button>
                    </div>
                  </div>

                  <div className="min-h-0 space-y-3 overflow-auto pr-1">
                    {filteredUsers.map((user) => (
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
                              {user.rtrAccess ? (
                                <P2Pill tone="blue" outline>
                                  +RTR Access
                                </P2Pill>
                              ) : null}
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
                    ))}
                  </div>
                </div>
              </div>
            </P2Surface>
          </div>
        </div>
      </main>
    </Prototype2ThemeRoot>
  );
}
