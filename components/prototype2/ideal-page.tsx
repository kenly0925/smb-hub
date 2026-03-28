"use client";

import {
  getUserInitials,
  pickUsernameBackground,
  Prototype2ConsoleTopbar,
  prototype2UserName,
} from "@/components/prototype2/console-topbar";
import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { Prototype2UsbControlContent } from "@/components/prototype2/usb-control-content";
import {
  P2Button,
  P2Input,
  P2Menu,
  P2Pill,
  P2Select,
  P2Surface,
  P2Switch,
  Prototype2ThemeRoot,
  p2ButtonClasses,
} from "@/components/prototype2/ui";
import {
  formatProtectionLevel,
  getProtectionShieldSrc,
  getUsbControlIconSrc,
} from "@/lib/prototype2/presentation";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  Monitor,
  Package,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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

const IDEAL_VIEWPORT_HEIGHT = "min(calc(100dvh - 156px), 920px)";

function LevelButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[var(--p2-radius-card)] border px-4 py-4 text-left transition ${
        active
          ? "border-[var(--p2-accent)] bg-[var(--p2-accent-soft)] text-[var(--p2-text-soft)]"
          : "border-[var(--p2-border)] bg-[var(--p2-panel)] text-[var(--p2-text)] hover:bg-[var(--p2-elevated)]"
      }`}
    >
      <div className="text-sm font-semibold">{label}</div>
    </button>
  );
}

function IdealVersionMenu({ onReset }: { onReset: () => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-30">
      {open ? (
        <div className="absolute bottom-[calc(100%+8px)] right-0 w-[190px] rounded-[var(--p2-radius-popover)] border border-[var(--p2-border)] bg-[var(--p2-popover-bg)] p-2 shadow-[var(--p2-shadow-popover)]">
          <Link
            href="/prototype-2/final/summary"
            onClick={() => setOpen(false)}
            className="flex w-full items-center rounded-[var(--p2-radius-button)] px-3 py-2 text-sm text-[var(--p2-text)] transition hover:bg-[var(--p2-elevated)]"
          >
            Open final version
          </Link>
          <button
            type="button"
            onClick={() => {
              onReset();
              setOpen(false);
            }}
            className="flex w-full items-center rounded-[var(--p2-radius-button)] px-3 py-2 text-left text-sm text-[var(--p2-text)] transition hover:bg-[var(--p2-elevated)]"
          >
            Reset demo
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--p2-radius-button)] border border-[var(--p2-border)] bg-[var(--p2-panel)] px-3 text-xs font-semibold text-[var(--p2-text-soft)] shadow-[var(--p2-shadow)] transition hover:bg-[var(--p2-elevated)]"
        aria-label="Open version switcher"
      >
        Version
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function Prototype2IdealPage() {
  const {
    state,
    setProtectionLevel,
    setQuarantineAction,
    toggleUsbCategory,
    resetDemo,
  } = usePrototype2Demo();
  const [activeTab, setActiveTab] = useState("summary");
  const usbCore =
    state.usbControl.categories.find((category) => category.id === "mass-storage") ??
    state.usbControl.categories[0];
  const activeQuarantineItems = state.quarantine.items.filter(
    (item) => item.status === "quarantined",
  );
  const allowedUsbCount = state.usbControl.categories.filter(
    (category) => category.allow,
  ).length;
  const blockedUsbCount =
    state.usbControl.categories.length - allowedUsbCount;
  const protectionShieldSrc = getProtectionShieldSrc(
    state.prevention.level,
    state.summary.statusLabel,
    { animated: false },
  );

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
              <P2Surface className="col-span-4 min-h-0 overflow-hidden p-4">
                <div className="flex h-full gap-4">
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-[var(--p2-text-muted)]">
                        Protection status
                      </div>
                      <div className="mt-2 text-[clamp(28px,2.6vw,44px)] font-semibold leading-none text-[var(--p2-text-soft)]">
                        {state.summary.statusLabel}
                      </div>
                      <div className="mt-3 max-w-sm text-sm leading-6 text-[var(--p2-text-muted)]">
                        {state.summary.deviceCount} devices are already sharing the same backend.
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-surface)] p-3">
                        <div className="text-xs uppercase tracking-[0.12em] text-[var(--p2-text-muted)]">
                          Licenses
                        </div>
                        <div className="mt-1 text-lg font-semibold text-[var(--p2-text-soft)]">
                          {state.summary.licenseUsed}/{state.summary.licenseTotal}
                        </div>
                      </div>
                      <div className="rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-surface)] p-3">
                        <div className="text-xs uppercase tracking-[0.12em] text-[var(--p2-text-muted)]">
                          Threats blocked
                        </div>
                        <div className="mt-1 text-lg font-semibold text-[var(--p2-text-soft)]">
                          {state.summary.threatsPrevented.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-[124px] shrink-0 items-center justify-center">
                    <Image
                      src={protectionShieldSrc}
                      alt={`${state.summary.statusLabel} shield`}
                      width={240}
                      height={240}
                      className="h-auto max-h-[170px] w-full object-contain"
                      priority
                    />
                  </div>
                </div>
              </P2Surface>

              <P2Surface className="col-span-4 min-h-0 p-4">
                <div className="flex h-full flex-col">
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--p2-text-muted)]">
                    Prevention level
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-[var(--p2-text-soft)]">
                    {formatProtectionLevel(state.prevention.level)}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--p2-text-muted)]">
                    Tune the guard rails directly from the summary.
                  </div>
                  <div className="mt-auto grid grid-cols-3 gap-2">
                    {(["basic", "enhanced", "maximum"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setProtectionLevel(level)}
                        className={`rounded-[var(--p2-radius-card)] border px-3 py-3 text-sm font-semibold transition ${
                          state.prevention.level === level
                            ? "border-[var(--p2-accent)] bg-[var(--p2-accent-soft)] text-[var(--p2-text-soft)]"
                            : "border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text)] hover:bg-[var(--p2-elevated)]"
                        }`}
                      >
                        {formatProtectionLevel(level)}
                      </button>
                    ))}
                  </div>
                </div>
              </P2Surface>

              <P2Surface className="col-span-4 min-h-0 p-4">
                <div className="flex h-full flex-col">
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--p2-text-muted)]">
                    USB control status
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-[var(--p2-radius-card)] p-2 ${
                        usbCore.allow
                          ? "bg-[#22e0ba]/12"
                          : "bg-[#ff6671]/12"
                      }`}
                    >
                      <Image
                        src={getUsbControlIconSrc(usbCore.id, usbCore.allow)}
                        alt={`${usbCore.label} ${usbCore.allow ? "allowed" : "disallowed"}`}
                        width={32}
                        height={32}
                        className="h-8 w-8"
                      />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-[var(--p2-text-soft)]">
                        {usbCore.allow ? "USB connected" : "USB blocked"}
                      </div>
                      <div className="mt-1 text-sm text-[var(--p2-text-muted)]">
                        {usbCore.label} is {usbCore.allow ? "allowed" : "blocked"} right now.
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <P2Pill tone={usbCore.allow ? "green" : "red"}>
                        {usbCore.allow ? "Allowed" : "Blocked"}
                      </P2Pill>
                      <P2Pill tone="neutral" outline>
                        {allowedUsbCount} on / {blockedUsbCount} off
                      </P2Pill>
                    </div>
                    <P2Switch
                      checked={usbCore.allow}
                      onChange={() => toggleUsbCategory(usbCore.id)}
                    />
                  </div>
                </div>
              </P2Surface>

              <P2Surface className="col-span-4 min-h-0 p-4">
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--p2-text-muted)]">
                    <Download className="h-3.5 w-3.5" />
                    Download agents
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-[var(--p2-text-soft)]">
                    Add another device
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--p2-text-muted)]">
                    Start the Windows installer and return here with the new agent already synced.
                  </div>
                  <div className="mt-auto space-y-3">
                    <Link
                      href="/prototype-2/windows-desktop?returnTo=ideal"
                      className={p2ButtonClasses({ variant: "primary" })}
                    >
                      Download sensor
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[var(--p2-text-muted)]">
                      <Monitor className="h-3.5 w-3.5" />
                      Installer progress stays mirrored with the final console.
                    </div>
                  </div>
                </div>
              </P2Surface>

              <P2Surface className="col-span-4 min-h-0 p-4">
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--p2-text-muted)]">
                    <Package className="h-3.5 w-3.5" />
                    Quarantine files
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-[var(--p2-text-soft)]">
                    {activeQuarantineItems.length} waiting
                  </div>
                  <div className="mt-2 space-y-2 text-sm text-[var(--p2-text-muted)]">
                    {activeQuarantineItems.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="truncate rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-surface)] px-3 py-2"
                      >
                        {item.fileName}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex gap-2">
                    <P2Button
                      variant={
                        state.quarantine.action === "release" ? "primary" : "secondary"
                      }
                      onClick={() => setQuarantineAction("release")}
                    >
                      Release
                    </P2Button>
                    <P2Button
                      variant={
                        state.quarantine.action === "delete" ? "primary" : "secondary"
                      }
                      onClick={() => setQuarantineAction("delete")}
                    >
                      Delete
                    </P2Button>
                  </div>
                </div>
              </P2Surface>

              <P2Surface className="col-span-4 min-h-0 p-4">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--p2-text-muted)]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Adversary universe intro
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[var(--p2-text-soft)]">
                      Story layer placeholder
                    </div>
                    <div className="mt-2 max-w-sm text-sm leading-6 text-[var(--p2-text-muted)]">
                      This slot will become the lighter-shell introduction to the adversary universe.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {["SK", "RG", "AV"].map((code, index) => (
                      <span
                        key={code}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: ["#f2f2f2", "#f5d8d8", "#f0cdcd"][index],
                          color: ["#2d2d2d", "#632929", "#943737"][index],
                        }}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </P2Surface>

              <P2Surface className="col-span-6 min-h-0 p-4">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.14em] text-[var(--p2-text-muted)]">
                      Filler slot
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[var(--p2-text-soft)]">
                      Device grouping overview
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[var(--p2-text-muted)]">
                      Reserved for a condensed version of the canvas board.
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-[var(--p2-text-muted)]">
                      {state.devices.items.length} connected devices available
                    </div>
                    <P2Button variant="secondary" onClick={() => setActiveTab("devices")}>
                      Open devices
                      <ArrowRight className="h-4 w-4" />
                    </P2Button>
                  </div>
                </div>
              </P2Surface>

              <P2Surface className="col-span-6 min-h-0 p-4">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--p2-text-muted)]">
                      <Users className="h-3.5 w-3.5" />
                      Filler slot
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[var(--p2-text-soft)]">
                      Team operations summary
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[var(--p2-text-muted)]">
                      Reserved for a compact view of user roles, alerts, and assignment handoff.
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-[var(--p2-text-muted)]">
                      {state.users.items.length} people covered in the shared demo
                    </div>
                    <Link
                      href="/prototype-2/ideal/users"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[var(--p2-link)] transition hover:underline"
                    >
                      Open users
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </P2Surface>
            </div>
          ) : null}

          {activeTab === "next-gen-av" ? (
            <div
              className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden"
              style={{ height: IDEAL_VIEWPORT_HEIGHT }}
            >
              <div className="grid gap-2 md:grid-cols-3">
                <LevelButton
                  label="Basic"
                  active={state.prevention.level === "basic"}
                  onClick={() => setProtectionLevel("basic")}
                />
                <LevelButton
                  label="Enhanced"
                  active={state.prevention.level === "enhanced"}
                  onClick={() => setProtectionLevel("enhanced")}
                />
                <LevelButton
                  label="Maximum"
                  active={state.prevention.level === "maximum"}
                  onClick={() => setProtectionLevel("maximum")}
                />
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
        <IdealVersionMenu onReset={resetDemo} />
      </main>
    </Prototype2ThemeRoot>
  );
}

export function Prototype2IdealUsersPage() {
  const router = useRouter();
  const { state, setUserSearch, setUserRole, resetDemo } = usePrototype2Demo();
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
        <IdealVersionMenu onReset={resetDemo} />
      </main>
    </Prototype2ThemeRoot>
  );
}
