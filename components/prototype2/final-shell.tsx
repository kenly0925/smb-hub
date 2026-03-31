"use client";

import { Prototype2ConsoleTopbar } from "@/components/prototype2/console-topbar";
import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { Prototype2FinalOnboardingModal } from "@/components/prototype2/final-onboarding-modal";
import { Prototype2ThemeRoot } from "@/components/prototype2/ui";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const utilityItems = [
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

function getHeaderCopy(pathname: string) {
  if (pathname.startsWith("/prototype-2/final/users")) {
    return { section: "Endpoint security", page: "Users" };
  }

  if (pathname.startsWith("/prototype-2/final/devices")) {
    return { section: "Endpoint security", page: "Devices" };
  }

  if (pathname.startsWith("/prototype-2/final/usb-control")) {
    return { section: "Endpoint security", page: "USB Control" };
  }

  if (pathname.startsWith("/prototype-2/final/next-gen-av")) {
    return { section: "Endpoint security", page: "Next-gen AV" };
  }

  return { section: "Endpoint security", page: "Summary" };
}

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

  return "Endpoint security";
}

export function Prototype2FinalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const shellIconClassName = "p2-final-shell-icon";
  const [submenuLabel, setSubmenuLabel] = useState<string | null>(null);
  const [submenuTop, setSubmenuTop] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { state, setTheme, toggleFinalNav, setFinalNavOpen } =
    usePrototype2Demo();
  const headerCopy = getHeaderCopy(pathname);
  const activeTab = getActiveTab(pathname);
  const activeNavLabel = getActiveNavLabel(pathname);
  const hoveredNavItem = navItems.find((item) => item.label === submenuLabel);
  const hasNewFinalDevice =
    state.installer.completed &&
    state.finalOnboarding.devices.some((device) => device.firstDetected);
  const finalTabs = [
    { id: "summary", label: "Summary" },
    { id: "next-gen-av", label: "Next-gen AV" },
    { id: "usb-control", label: "USB Control" },
    {
      id: "devices",
      label: "Devices",
      badge: hasNewFinalDevice ? "dot" : undefined,
    },
  ];

  return (
    <Prototype2ThemeRoot theme={state.theme.final} className="p2-final-shell">
      <div className="flex h-screen flex-col overflow-hidden bg-[var(--p1-bg)] text-[var(--p1-text-soft)]">
        <Prototype2FinalOnboardingModal />

        <div
          onMouseLeave={() => setSubmenuLabel(null)}
          className={cn(
            "fixed inset-y-0 left-0 top-16 z-20 flex items-start gap-0 transition duration-200",
            state.ui.finalNavOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-[120%] opacity-0",
          )}
        >
          <div className="relative h-[calc(100vh-64px)] w-[304px] border-r border-[var(--p2-final-shell-border)] bg-[var(--p1-surface)] shadow-[var(--p2-shadow-popover)]">
            <div className="space-y-0.5 px-0 pt-3">
              {utilityItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setFinalNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[15px] text-[var(--p1-text-soft)] transition hover:bg-[var(--p2-final-shell-hover)]"
                >
                  <Image
                    src={item.iconSrc}
                    alt=""
                    width={20}
                    height={20}
                    className={shellIconClassName}
                  />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mx-4 mt-3 border-t border-[var(--p2-final-shell-border)]" />
            <div className="space-y-0.5 px-0 py-3">
              {navItems.map((item, index) => {
                const isActive = item.label === activeNavLabel;
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
                        isActive
                          ? "bg-[var(--p1-surface-2)] text-[var(--p1-text-soft)]"
                          : "text-[var(--p1-text-soft)] hover:bg-[var(--p1-surface-2)]",
                      )}
                    >
                      {isActive ? (
                        <span className="absolute inset-y-2 left-0 w-1 bg-[var(--p2-final-shell-active-indicator)]" />
                      ) : null}
                      <Image
                        src={item.iconSrc}
                        alt=""
                        width={20}
                        height={20}
                        className={shellIconClassName}
                      />
                      <span className="leading-snug">{item.label}</span>
                    </Link>
                    {showDivider ? (
                      <div className="mx-4 my-2 border-t border-[var(--p2-final-shell-border)]" />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex h-9 items-center justify-end border-t border-[var(--p2-final-shell-border)] bg-[var(--p2-final-shell-bottom)] px-2">
              <button
                type="button"
                onClick={() => setFinalNavOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center border border-[var(--p2-final-shell-border)] bg-[var(--p1-surface-2)] text-[var(--p1-text-muted)]"
                aria-label="Close navigation"
              >
                &#8249;
              </button>
            </div>
          </div>

          {hoveredNavItem?.submenu ? (
            <div
              className="absolute w-[228px] border-r border-y border-[var(--p2-final-shell-border)] bg-[var(--p1-surface)] px-4 py-3 shadow-[var(--p2-shadow-popover)]"
              style={{ left: 304, top: submenuTop }}
            >
              <div className="text-[15px] font-semibold text-[var(--p1-text-soft)]">
                {hoveredNavItem.label}
              </div>
              <div className="mt-3 border-t border-[var(--p2-final-shell-border)]" />
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
                          ? "font-medium text-[var(--p1-text-soft)]"
                          : "text-[var(--p1-text-soft)] hover:text-[var(--p2-final-shell-submenu-hover)]",
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

        {state.ui.finalNavOpen ? (
          <button
            type="button"
            onClick={() => setFinalNavOpen(false)}
            className="fixed inset-0 z-10 bg-black/30"
            aria-label="Close navigation"
          />
        ) : null}
        <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--p2-final-shell-border)] bg-[var(--p1-panel)]">
          <div className="flex h-16 items-center justify-between gap-5 px-4 lg:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={toggleFinalNav}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-[var(--p1-text-soft)] transition hover:bg-[var(--p2-final-shell-hover)]"
                aria-label="Open navigation"
              >
                <Image
                  src="/prototype-1/icon-hamburger-menu.svg"
                  alt=""
                  width={24}
                  height={24}
                  className={shellIconClassName}
                />
              </button>
              <div className="inline-flex h-8 w-8 items-center justify-center">
                <Image
                  src="/prototype-1/icon-dashboard.svg"
                  alt=""
                  width={24}
                  height={24}
                  className={shellIconClassName}
                />
              </div>
              <div className="min-w-0 text-[17px] font-semibold tracking-[-0.01em] text-[var(--p1-text-soft)]">
                {headerCopy.section}
              </div>
              <div className="h-7 w-px bg-[var(--p2-final-shell-divider)]" />
              <div className="flex min-w-0 items-center gap-2 text-[15px] text-[var(--p1-text-muted)] lg:text-[16px]">
                <span className="truncate">{headerCopy.page}</span>
                <Image
                  src="/prototype-1/icon-bookmark.svg"
                  alt=""
                  width={16}
                  height={16}
                  className={shellIconClassName}
                />
              </div>
            </div>

            <div className="hidden flex-1 justify-center md:flex">
              <div className="flex h-11 w-full max-w-[360px] items-center rounded-sm border border-[var(--p2-final-shell-search-border)] px-4 text-[17px] text-[var(--p1-text-soft)]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-3 shrink-0 text-[var(--p1-text-soft)]"
                >
                  <path
                    d="M10.5 4C6.91015 4 4 6.91015 4 10.5C4 14.0899 6.91015 17 10.5 17C12.0523 17 13.4776 16.4557 14.5957 15.5473L19.0242 19.9758L20.4384 18.5616L16.0099 14.1331C16.9182 13.0151 17.4625 11.5897 17.4625 10.0375C17.4625 6.91015 14.0899 4 10.5 4ZM10.5 6C13.0147 6 15 7.98528 15 10.5C15 13.0147 13.0147 15 10.5 15C7.98528 15 6 13.0147 6 10.5C6 7.98528 7.98528 6 10.5 6Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="truncate">Search</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[var(--p1-text-soft)]">
              <div className="hidden items-center gap-2 text-[15px] text-[var(--p1-text-soft)] lg:flex">
                <span>@1b0e717a</span>
                <span className="text-[var(--p1-text-muted)]">&lt;CIDName&gt;</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[var(--p1-text-muted)]"
                >
                  <path
                    d="M7 10L12 15L17 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="hidden h-7 w-px bg-[var(--p2-final-shell-divider)] lg:block" />
              <div className="flex items-center gap-2 lg:gap-3">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-sm transition hover:bg-[var(--p2-final-shell-hover)]"
                  aria-label="Icon 1"
                >
                  <Image
                    src="/prototype-1/icon-right-1.svg"
                    alt=""
                    width={24}
                    height={24}
                    className={shellIconClassName}
                  />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-sm transition hover:bg-[var(--p2-final-shell-hover)]"
                  aria-label="Notifications"
                >
                  <Image
                    src="/prototype-1/icon-right-2.svg"
                    alt=""
                    width={24}
                    height={24}
                    className={shellIconClassName}
                  />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-sm transition hover:bg-[var(--p2-final-shell-hover)]"
                  aria-label="Icon 3"
                >
                  <Image
                    src="/prototype-1/icon-right-3.svg"
                    alt=""
                    width={24}
                    height={24}
                    className={shellIconClassName}
                  />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-sm transition hover:bg-[var(--p2-final-shell-hover)]"
                  aria-label="User"
                >
                  <Image
                    src="/prototype-1/icon-right-4.svg"
                    alt=""
                    width={24}
                    height={24}
                    className={shellIconClassName}
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTheme(
                      "final",
                      state.theme.final === "dark" ? "light" : "dark",
                    )
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-sm transition hover:bg-[var(--p2-final-shell-hover)]"
                  aria-label={
                    state.theme.final === "dark"
                      ? "Switch to light mode"
                      : "Switch to dark mode"
                  }
                >
                  <Image
                    src="/prototype-1/icon-right-5.svg"
                    alt=""
                    width={24}
                    height={24}
                    className={shellIconClassName}
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex min-h-0 flex-1 w-full max-w-[1920px] flex-col overflow-hidden px-5 py-6">
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
