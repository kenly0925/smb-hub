"use client";

import { Prototype2ConsoleTopbar } from "@/components/prototype2/console-topbar";
import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { Prototype2ThemeRoot } from "@/components/prototype2/ui";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const finalTabs = [
  { id: "summary", label: "Summary" },
  { id: "next-gen-av", label: "Next-gen AV" },
  { id: "usb-control", label: "USB Control" },
  { id: "devices", label: "Devices", badge: "dot" },
];

const utilityItems = [
  {
    label: "Quick View",
    iconSrc: "/prototype-2/icon-quick-view.svg",
    href: "/prototype-2/final/summary",
  },
  {
    label: "Bookmarks",
    iconSrc: "/prototype-1/nav-icon-bookmarks.svg",
    href: "/prototype-1/dashboard",
  },
  {
    label: "Recently visited",
    iconSrc: "/prototype-1/nav-icon-recently-visited.svg",
    href: "/prototype-1/dashboard",
  },
];

const navItems = [
  {
    label: "Endpoint security",
    iconSrc: "/prototype-1/nav-icon-endpoint-security.svg",
    href: "/prototype-1/dashboard",
    submenu: [
      { label: "Activity dashboard", href: "/prototype-1/dashboard" },
      { label: "Policies", href: "/prototype-1/policies" },
      { label: "Rule groups", href: "/prototype-1/dashboard" },
      { label: "Network", href: "/prototype-1/dashboard" },
    ],
  },
  {
    label: "OverWatch",
    iconSrc: "/prototype-1/nav-icon-overwatch.svg",
    href: "/prototype-1/dashboard",
  },
  {
    label: "Investigate",
    iconSrc: "/prototype-1/nav-icon-investigate.svg",
    href: "/prototype-1/dashboard",
  },
  {
    label: "Dashboards and reports",
    iconSrc: "/prototype-1/nav-icon-dashboards-and-reports.svg",
    href: "/prototype-1/dashboard",
  },
  {
    label: "Hosts setup and management",
    iconSrc: "/prototype-1/nav-icon-hosts-setup-and-management.svg",
    href: "/prototype-1/hosts",
  },
  {
    label: "Sensors",
    iconSrc: "/prototype-1/nav-icon-sensors.svg",
    href: "/prototype-1/sensors",
  },
  {
    label: "CrowdStrike Store",
    iconSrc: "/prototype-1/nav-icon-crowdstrike-store.svg",
    href: "/prototype-1/dashboard",
  },
  {
    label: "Audit logs",
    iconSrc: "/prototype-1/nav-icon-audit-logs.svg",
    href: "/prototype-1/dashboard",
  },
  {
    label: "Support and resources",
    iconSrc: "/prototype-1/nav-icon-support-and-resources.svg",
    href: "/prototype-1/dashboard",
  },
];

function getActiveTab(pathname: string) {
  if (pathname.includes("/next-gen-av")) {
    return "next-gen-av";
  }

  if (pathname.includes("/usb-control")) {
    return "usb-control";
  }

  if (pathname.includes("/devices")) {
    return "devices";
  }

  return "summary";
}

function getActiveNavLabel(pathname: string) {
  if (pathname.startsWith("/prototype-1/sensors")) {
    return "Sensors";
  }

  if (pathname.startsWith("/prototype-1/hosts")) {
    return "Hosts setup and management";
  }

  if (
    pathname.startsWith("/prototype-1/dashboard") ||
    pathname.startsWith("/prototype-1/policies")
  ) {
    return "Endpoint security";
  }

  return null;
}

export function Prototype2FinalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [submenuLabel, setSubmenuLabel] = useState<string | null>(null);
  const [submenuTop, setSubmenuTop] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { state, setTheme, toggleFinalNav, setFinalNavOpen, resetDemo } =
    usePrototype2Demo();
  const activeTab = getActiveTab(pathname);
  const activeNavLabel = getActiveNavLabel(pathname);
  const hoveredNavItem = navItems.find((item) => item.label === submenuLabel);

  return (
    <Prototype2ThemeRoot theme={state.theme.final} className="p2-final-shell">
      <div className="flex h-screen flex-col overflow-hidden bg-[var(--p2-bg)] text-[var(--p2-text)]">
        <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--p2-border)] bg-[var(--p2-header)]/95 backdrop-blur">
          <div className="relative flex h-14 items-center justify-between gap-4 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={toggleFinalNav}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--p2-radius-button)] text-[var(--p2-text)] transition hover:bg-[var(--p2-elevated)]"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Sparkles className="h-4 w-4 text-[var(--p2-text-soft)]" />
              <div className="text-sm font-semibold text-[var(--p2-text-soft)]">
                Quick view
              </div>
              <div className="hidden h-6 w-px bg-[var(--p2-border)] sm:block" />
              <div className="hidden text-sm text-[var(--p2-text-muted)] sm:block">
                Dashboard
              </div>
            </div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 hidden w-full max-w-[320px] -translate-x-1/2 -translate-y-1/2 md:flex">
              <div className="flex h-9 w-full items-center gap-3 rounded-[var(--p2-radius-field)] border border-[var(--p2-border-strong)] bg-[var(--p2-surface)] px-3 text-sm text-[var(--p2-text-muted)]">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 text-[var(--p2-text-soft)]">
              <div className="hidden text-sm text-[var(--p2-text-muted)] lg:block">
                @1b0e717a &lt;CIDName&gt;
              </div>
              <Bell className="h-4 w-4" />
              <Users className="h-4 w-4" />
              <UserRound className="h-4 w-4" />
              <div className="flex items-center gap-1 rounded-full border border-[var(--p2-border)] p-1">
                <button
                  type="button"
                  onClick={() => setTheme("final", "dark")}
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full transition",
                    state.theme.final === "dark"
                      ? "bg-[var(--p2-elevated)]"
                      : "text-[var(--p2-text-muted)]",
                  )}
                  aria-label="Use dark theme"
                >
                  <Moon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("final", "light")}
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full transition",
                    state.theme.final === "light"
                      ? "bg-[var(--p2-elevated)]"
                      : "text-[var(--p2-text-muted)]",
                  )}
                  aria-label="Use light theme"
                >
                  <Sun className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {state.ui.finalNavOpen ? (
          <>
            <button
              type="button"
              onClick={() => setFinalNavOpen(false)}
              className="fixed inset-0 z-20 bg-black/35"
              aria-label="Close navigation"
            />
            <div
              onMouseLeave={() => setSubmenuLabel(null)}
              className="fixed inset-y-0 left-0 top-14 z-30 flex items-start gap-0"
            >
              <div className="relative h-[calc(100vh-56px)] w-[304px] border-r border-[var(--p2-border)] bg-[var(--p2-popover-bg)] shadow-[var(--p2-shadow-popover)]">
                <div className="space-y-0.5 px-0 pt-3">
                  {utilityItems.map((item) => {
                    const active =
                      item.label === "Quick View"
                        ? pathname.startsWith("/prototype-2/final")
                        : pathname === item.href;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setFinalNavOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 px-4 py-3 text-[15px] transition",
                          active
                            ? "bg-[var(--p2-elevated)] text-[var(--p2-text-soft)]"
                            : "text-[var(--p2-text-soft)] hover:bg-[var(--p2-elevated)]",
                        )}
                      >
                        {active ? (
                          <span className="absolute inset-y-2 left-0 w-1 bg-[#c8dcfe]" />
                        ) : null}
                        <Image src={item.iconSrc} alt="" width={20} height={20} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mx-4 mt-3 border-t border-[var(--p2-border)]" />

                <div className="space-y-0.5 px-0 py-3">
                  {navItems.map((item, index) => {
                    const active = item.label === activeNavLabel;
                    const showDivider = index === 1 || index === 2;

                    return (
                      <div key={item.label}>
                        <Link
                          href={item.href}
                          onMouseEnter={(event) => {
                            if (item.submenu) {
                              setSubmenuLabel(item.label);
                              setSubmenuTop(event.currentTarget.offsetTop);
                            } else {
                              setSubmenuLabel(null);
                            }
                          }}
                          onClick={() => {
                            if (!item.submenu) {
                              setFinalNavOpen(false);
                            }
                          }}
                          className={cn(
                            "relative flex items-center gap-3 px-4 py-3 text-[15px] transition",
                            active
                              ? "bg-[var(--p2-elevated)] text-[var(--p2-text-soft)]"
                              : "text-[var(--p2-text-soft)] hover:bg-[var(--p2-elevated)]",
                          )}
                        >
                          {active ? (
                            <span className="absolute inset-y-2 left-0 w-1 bg-[#c8dcfe]" />
                          ) : null}
                          <Image src={item.iconSrc} alt="" width={20} height={20} />
                          <span className="leading-snug">{item.label}</span>
                        </Link>
                        {showDivider ? (
                          <div className="mx-4 my-2 border-t border-[var(--p2-border)]" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="absolute inset-x-0 bottom-0 flex h-9 items-center justify-between border-t border-[var(--p2-border)] bg-[var(--p2-surface)] px-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={resetDemo}
                      className="text-[11px] font-medium text-[var(--p2-link)] underline underline-offset-2"
                    >
                      Reset
                    </button>
                    <Link
                      href="/prototype-2/ideal"
                      onClick={() => setFinalNavOpen(false)}
                      className="text-[11px] font-medium text-[var(--p2-link)] underline underline-offset-2 transition"
                    >
                      Open Ideal
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFinalNavOpen(false)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--p2-radius-button)] border border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text-muted)]"
                    aria-label="Close navigation"
                  >
                    &#8249;
                  </button>
                </div>
              </div>

              {hoveredNavItem?.submenu ? (
                <div
                  className="absolute w-[228px] border-r border-y border-[var(--p2-border)] bg-[var(--p2-popover-bg)] px-4 py-3 shadow-[var(--p2-shadow-popover)]"
                  style={{ left: 304, top: submenuTop }}
                >
                  <div className="text-[15px] font-semibold text-[var(--p2-text-soft)]">
                    {hoveredNavItem.label}
                  </div>
                  <div className="mt-3 border-t border-[var(--p2-border)]" />
                  <div className="mt-3 space-y-1">
                    {hoveredNavItem.submenu.map((subItem) => {
                      const subActive = pathname === subItem.href;

                      return (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          onClick={() => setFinalNavOpen(false)}
                          className={cn(
                            "block px-0 py-2 text-[15px] transition",
                            subActive
                              ? "font-medium text-[var(--p2-text-soft)]"
                              : "text-[var(--p2-text-soft)] hover:text-[var(--p2-text)]",
                          )}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <main className="flex min-h-0 flex-1 min-w-0 flex-col overflow-hidden p-4 md:p-5">
          <Prototype2ConsoleTopbar
            version="final"
            tabs={finalTabs}
            activeTab={activeTab}
            onTabChange={(next) => router.push(`/prototype-2/final/${next}`)}
            showThemeToggle={false}
            className="mb-6"
          />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </main>
      </div>
    </Prototype2ThemeRoot>
  );
}
