"use client";

import { P2Pill, P2Tabs, p2ButtonClasses } from "@/components/prototype2/ui";
import { cn } from "@/lib/utils";
import { Bell, Moon, Sun, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { Prototype2Version } from "@/lib/prototype2/types";

export const prototype2UserName = "Christie Burke";
const usernameBackgrounds = Array.from(
  { length: 7 },
  (_, index) => `/prototype-2/username-backgrounds/user-initial-shape-${index + 1}.svg`,
);

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
  const { state, setTheme } = usePrototype2Demo();
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
  const onboardingTasks = useMemo(() => {
    if (version === "ideal") {
      return [
        {
          id: "sensor",
          title: "Install your first sensor",
          copy:
            "Download the sensor package and connect the first device so the dashboard starts filling in with live inventory.",
          status: "Completed",
          tone: "green" as const,
          meta: "Done",
        },
        {
          id: "protection",
          title: "Review prevention level",
          copy:
            "Confirm the current protection level and decide whether you want to keep maximum prevention enabled for the team.",
          status: "In progress",
          tone: "blue" as const,
          meta: "1 task left",
        },
        {
          id: "usb",
          title: "Create your USB allow list",
          copy:
            "Add trusted USB devices to the allow list so the team can use approved media without extra friction.",
          status: "Suggested",
          tone: "teal" as const,
          meta: "Recommended",
        },
        {
          id: "users",
          title: "Invite another administrator",
          copy:
            "Add one more admin account to make handoff and day-to-day monitoring easier as the workspace grows.",
          status: "Suggested",
          tone: "neutral" as const,
          meta: "Optional",
        },
      ];
    }

    const sensorInstalled = state.finalOnboarding.devices.length > 0;
    const userInvited = state.finalOnboarding.users.length > 0;

    return [
      {
        id: "sensor",
        title: "Install your first sensor",
        copy:
          "Download the sensor package and connect the first device so the onboarding dashboard can start filling in with live inventory.",
        status: sensorInstalled ? "Completed" : "Start here",
        tone: sensorInstalled ? ("green" as const) : ("blue" as const),
        meta: sensorInstalled ? "Done" : "Required",
      },
      {
        id: "protection",
        title: "Review prevention level",
        copy:
          "Choose the level you want to launch with before the first machine checks in.",
        status: "In progress",
        tone: "teal" as const,
        meta: "Recommended",
      },
      {
        id: "usb",
        title: "Create your USB allow list",
        copy:
          "Set the starting USB rules now so the first device inherits the policy on day one.",
        status: "Suggested",
        tone: "teal" as const,
        meta: "Optional",
      },
      {
        id: "users",
        title: "Invite another administrator",
        copy:
          "Add one more admin account to make handoff and day-to-day monitoring easier as the workspace grows.",
        status: userInvited ? "Completed" : "Suggested",
        tone: userInvited ? ("green" as const) : ("neutral" as const),
        meta: userInvited ? "Done" : "Optional",
      },
    ];
  }, [state.finalOnboarding.devices.length, state.finalOnboarding.users.length, version]);
  const completedOnboardingTasks = onboardingTasks.filter(
    (task) => task.status === "Completed",
  ).length;
  const notificationsVisible = notificationsPhase !== "closed";
  const notificationsActive =
    notificationsPhase === "opening" || notificationsPhase === "open";

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
            <div className="flex items-center gap-1 rounded-full border border-[var(--p2-border)] p-1">
              <button
                type="button"
                onClick={() => setTheme(version, "light")}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
                  state.theme[version] === "light"
                    ? "bg-[var(--p2-elevated)]"
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
                    ? "bg-[var(--p2-elevated)]"
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
              "fixed right-0 top-0 z-40 h-screen w-full max-w-[396px] border-l border-[var(--p2-border)] bg-[var(--p2-popover-bg)] p-5 shadow-[var(--p2-shadow-popover)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
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
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[var(--p2-text-muted)]">
                    Onboarding tasks
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-[var(--p2-text-soft)]">
                    Finish setup
                  </div>
                  <div className="mt-2 text-sm text-[var(--p2-text-muted)]">
                    {completedOnboardingTasks} of {onboardingTasks.length} tasks help this workspace feel ready for day one.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsPhase("closing")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--p2-radius-button)] transition hover:bg-[var(--p2-elevated)]"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {onboardingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[var(--p2-radius-card)] border border-[var(--p2-border)] bg-[var(--p2-surface)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <P2Pill tone={task.tone}>{task.status}</P2Pill>
                      <span className="text-xs font-medium text-[var(--p2-text-muted)]">
                        {task.meta}
                      </span>
                    </div>
                    <div className="mt-3 text-base font-semibold text-[var(--p2-text-soft)]">
                      {task.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--p2-text-muted)]">
                      {task.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
