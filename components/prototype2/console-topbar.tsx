"use client";

import { P2Pill, P2Tabs, p2ButtonClasses } from "@/components/prototype2/ui";
import { cn } from "@/lib/utils";
import {
  Bell,
  Check,
  Clock3,
  Crosshair,
  Moon,
  Sun,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { Prototype2Version, TodoTaskId } from "@/lib/prototype2/types";
import { buildPrototype2WindowsDesktopHref } from "@/lib/windows-desktop";

export const prototype2UserName = "Christie Burke";
const TODO_DATE_LABEL = "05/31/2023";
const usernameBackgrounds = Array.from(
  { length: 7 },
  (_, index) => `/prototype-2/username-backgrounds/user-initial-shape-${index + 1}.svg`,
);

type ToDoPanelAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant: "primary" | "secondary";
};

type ToDoPanelState = {
  count: 0 | 1;
  title: string;
  copy: string;
  taskId?: TodoTaskId;
  dateLabel?: string;
  badgeLabel?: string;
  dismissLabel?: string;
  actions?: ToDoPanelAction[];
  success?: boolean;
};

export function pickUsernameBackground(seed: string) {
  const hash = Array.from(seed).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    0,
  );

  return usernameBackgrounds[hash % usernameBackgrounds.length];
}

export function getUserInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Prototype2ConsoleTopbar({
  version,
  tabs,
  activeTab,
  onTabChange,
  showThemeToggle = true,
  className,
}: {
  version: Prototype2Version;
  tabs: Array<{ id: string; label: string; badge?: string }>;
  activeTab: string;
  onTabChange: (id: string) => void;
  showThemeToggle?: boolean;
  className?: string;
}) {
  const { state, setTheme, dismissTodo } = usePrototype2Demo();
  const pathname = usePathname();
  const [notificationsPhase, setNotificationsPhase] = useState<
    "closed" | "opening" | "open" | "closing"
  >("closed");
  const avatarBackgroundSrc = useMemo(
    () => pickUsernameBackground(`${prototype2UserName}-${version}`),
    [version],
  );
  const userInitials = useMemo(() => getUserInitials(prototype2UserName), []);
  const manageUsersHref =
    version === "ideal" ? "/prototype-2/ideal/users" : "/prototype-2/final/users";
  const manageUsersCount =
    version === "ideal"
      ? state.users.items.length
      : state.finalOnboarding.users.length;
  const notificationsVisible = notificationsPhase !== "closed";
  const notificationsActive =
    notificationsPhase === "opening" || notificationsPhase === "open";
  const isDarkTheme = state.theme[version] === "dark";
  const closeNotifications = () => setNotificationsPhase("closing");
  const tutorialsHref = buildPrototype2WindowsDesktopHref(version, pathname);
  const dismissedTodos = state.ui.dismissedTodos[version];
  const openPreventionPolicy = () => {
    onTabChange("next-gen-av");
    closeNotifications();
  };
  const activeToDoPanel: ToDoPanelState =
    version === "final" && state.finalOnboarding.devices.length === 0
      ? {
          taskId: "sensor",
          count: 1,
          title: "Install your first sensor",
          copy:
            "In order to have your devices protected, you need to first install the Falcon sensor on your first device.",
          dateLabel: TODO_DATE_LABEL,
          badgeLabel: "Required",
          actions: [
            {
              label: "Download sensor",
              href: tutorialsHref,
              variant: "primary",
            },
            {
              label: "Watch installation tutorials",
              href: tutorialsHref,
              variant: "secondary",
            },
          ],
        }
      : state.prevention.level !== "maximum" &&
          !dismissedTodos.includes("prevention")
        ? {
            taskId: "prevention",
            count: 1,
            title: "Turn up your prevention policy",
            copy:
              "It appears you are currently using a less aggressive policy. As long as everything in your network continues to function, we recommend increasing to the next level of prevention policy.",
            dateLabel: TODO_DATE_LABEL,
            dismissLabel: "Dismiss",
            actions: [
              {
                label: "Change prevention policy",
                onClick: openPreventionPolicy,
                variant: "primary",
              },
              {
                label: "Learn about prevention levels",
                onClick: openPreventionPolicy,
                variant: "secondary",
              },
            ],
          }
        : {
            count: 0,
            title: "You're all good!",
            copy:
              "We don't need anything from you at the moment. We'll let you know if that changes.",
            success: true,
          };

  useEffect(() => {
    if (notificationsPhase === "opening") {
      const frameId = window.requestAnimationFrame(() => {
        setNotificationsPhase("open");
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    if (notificationsPhase === "closing") {
      const timeoutId = window.setTimeout(() => {
        setNotificationsPhase("closed");
      }, 280);

      return () => window.clearTimeout(timeoutId);
    }
  }, [notificationsPhase]);

  return (
    <>
      <div
        className={cn(
          "relative flex min-w-0 items-center justify-between gap-5",
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--p2-radius-card)]">
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
          <div className="min-w-0">
            <div className="text-[20px] font-semibold leading-none text-[var(--p2-text-soft)]">
              {prototype2UserName}
            </div>
            <div className="mt-2">
              <P2Pill tone="neutral">Administrator</P2Pill>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 flex w-full max-w-[48rem] -translate-x-1/2 -translate-y-1/2 justify-center">
          <P2Tabs
            tabs={tabs}
            activeId={activeTab}
            onChange={onTabChange}
            className="min-w-0"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={manageUsersHref}
            className={p2ButtonClasses()}
          >
            <Users className="h-4 w-4" />
            Manage users ({manageUsersCount})
          </Link>
          <button
            type="button"
            onClick={() =>
              setNotificationsPhase((current) =>
                current === "closed" ? "opening" : current,
              )
            }
            className={p2ButtonClasses({ className: "w-10 px-0" })}
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          {showThemeToggle ? (
            <div className="flex items-center gap-1 rounded-full border border-[var(--p2-border)] bg-[var(--p2-surface)] p-1">
              <button
                type="button"
                onClick={() => setTheme(version, "light")}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
                  state.theme[version] === "light"
                    ? "border border-[var(--p2-border)] bg-[var(--p2-elevated)] shadow-[var(--p2-shadow)]"
                    : "text-[var(--p2-text-muted)]",
                )}
                aria-label="Use light theme"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setTheme(version, "dark")}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
                  state.theme[version] === "dark"
                    ? "border border-[var(--p2-border)] bg-[var(--p2-elevated)] shadow-[var(--p2-shadow)]"
                    : "text-[var(--p2-text-muted)]",
                )}
                aria-label="Use dark theme"
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {notificationsVisible ? (
        <>
          <button
            type="button"
            onClick={() => setNotificationsPhase("closing")}
            className={cn(
              "fixed inset-0 z-30 bg-black/30 transition-opacity duration-350 ease-out",
              notificationsActive ? "opacity-100" : "opacity-0",
            )}
            aria-label="Close notifications"
          />
          <aside
            className={cn(
              "fixed right-4 top-[88px] z-40 h-[min(650px,calc(100vh-7rem))] w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-[8px] border border-[var(--p2-border)] p-4 shadow-[var(--p2-shadow-popover)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform md:right-8 md:top-[92px] md:w-[294px]",
              isDarkTheme ? "bg-[var(--p2-elevated)]" : "bg-[var(--p2-popover-bg)]",
              notificationsActive
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0",
            )}
          >
            <div
              className={cn(
                "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                notificationsActive
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-[var(--p2-text-muted)]" />
                    <div className="text-[15px] font-semibold text-[var(--p2-text-soft)]">
                      To-do list
                    </div>
                    <span
                      className={cn(
                        "inline-flex min-w-4 items-center justify-center rounded-[4px] px-1.5 py-[1px] text-[10px] font-semibold leading-none",
                        activeToDoPanel.count > 0
                          ? "bg-[#ff4d57] text-white"
                          : "bg-black/55 text-[var(--p2-text-soft)]",
                      )}
                    >
                      {activeToDoPanel.count}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={closeNotifications}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] text-[var(--p2-text-muted)] transition hover:bg-[var(--p2-elevated)] hover:text-[var(--p2-text-soft)]"
                    aria-label="Close notifications"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 flex-1">
                  {activeToDoPanel.success ? (
                    <div className="max-w-[232px]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#19ddc4] text-[#2b3038]">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
                      <div className="mt-4 text-[28px] font-semibold leading-none text-[var(--p2-text-soft)]">
                        {activeToDoPanel.title}
                      </div>
                      <p className="mt-4 text-[12px] leading-6 text-[var(--p2-text-muted)]">
                        {activeToDoPanel.copy}
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-[260px]">
                      <div className="flex items-center justify-between gap-3 text-[10px] font-medium text-[var(--p2-text-muted)]">
                        <div className="flex items-center gap-1.5">
                          <Clock3 className="h-3 w-3" />
                          <span>{activeToDoPanel.dateLabel}</span>
                        </div>
                        {activeToDoPanel.dismissLabel ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (activeToDoPanel.taskId) {
                                dismissTodo(version, activeToDoPanel.taskId);
                              }
                            }}
                            className="transition hover:text-[var(--p2-text-soft)]"
                          >
                            {activeToDoPanel.dismissLabel}
                          </button>
                        ) : activeToDoPanel.badgeLabel ? (
                          <span className="inline-flex items-center rounded-[4px] border border-[#7a2a33] bg-[#4b1b22] px-1.5 py-[2px] text-[10px] font-semibold text-[#ff6a73]">
                            {activeToDoPanel.badgeLabel}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-5 text-[22px] font-semibold leading-tight text-[var(--p2-text-soft)]">
                        {activeToDoPanel.title}
                      </div>
                      <p className="mt-3 text-[12px] leading-6 text-[var(--p2-text-muted)]">
                        {activeToDoPanel.copy}
                      </p>

                      {activeToDoPanel.actions?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {activeToDoPanel.actions.map((action) =>
                            action.href ? (
                              <Link
                                key={action.label}
                                href={action.href}
                                onClick={closeNotifications}
                                className={p2ButtonClasses({
                                  variant: action.variant,
                                  size: "sm",
                                  className:
                                    "h-7 rounded-[3px] px-2.5 text-[10px] font-semibold shadow-none",
                                })}
                              >
                                {action.label}
                              </Link>
                            ) : (
                              <button
                                key={action.label}
                                type="button"
                                onClick={action.onClick}
                                className={p2ButtonClasses({
                                  variant: action.variant,
                                  size: "sm",
                                  className:
                                    "h-7 rounded-[3px] px-2.5 text-[10px] font-semibold shadow-none",
                                })}
                              >
                                {action.label}
                              </button>
                            ),
                          )}
                        </div>
                      ) : null}

                      <div className="mt-4 ml-auto h-px w-14 bg-[var(--p2-border-strong)]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
