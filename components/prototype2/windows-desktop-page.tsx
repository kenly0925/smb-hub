"use client";

import { WindowsInstallerDialog } from "@/components/shared/windows-installer-dialog";
import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { cn } from "@/lib/utils";
import { Search, Wifi } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function DesktopAppIcon({
  label,
  selected,
  onClick,
  onDoubleClick,
  children,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "flex w-24 flex-col items-center rounded-[6px] px-3 py-4 text-sm text-white transition",
        selected ? "bg-white/20" : "hover:bg-white/15",
      )}
    >
      {children}
      {label}
    </button>
  );
}

export function Prototype2WindowsDesktopPage({
  returnTo,
  returnPath,
}: {
  returnTo: "ideal" | "final";
  returnPath: string;
}) {
  const router = useRouter();
  const {
    state,
    setInstallerAcceptedLicense,
    setInstallerField,
    setInstallerProgress,
    setInstallerStage,
    completeInstallation,
  } = usePrototype2Demo();
  const progressRef = useRef(state.installer.progress);
  const [selectedIcon, setSelectedIcon] = useState<"installer" | "chrome" | null>(
    null,
  );

  useEffect(() => {
    progressRef.current = state.installer.progress;
  }, [state.installer.progress]);

  useEffect(() => {
    if (state.installer.stage !== "progress") {
      return;
    }

    const timer = window.setInterval(() => {
      const next = Math.min(progressRef.current + 14, 100);
      progressRef.current = next;
      setInstallerProgress(next);

      if (next === 100) {
        window.clearInterval(timer);
        completeInstallation(returnTo);
      }
    }, 280);

    return () => window.clearInterval(timer);
  }, [completeInstallation, returnTo, setInstallerProgress, state.installer.stage]);

  function openInstaller() {
    setSelectedIcon("installer");
    setInstallerStage("form");
  }

  function closeInstallerWindow() {
    setInstallerStage("idle");
  }

  function openChrome() {
    setSelectedIcon("chrome");
    router.push(returnPath);
  }

  function submitInstaller() {
    if (
      !state.installer.acceptedLicense ||
      !state.installer.customerId.trim() ||
      !state.installer.installationToken.trim()
    ) {
      return;
    }

    setInstallerProgress(18);
    setInstallerStage("progress");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#9fd6ff] text-slate-950">
      <Image
        src="/windows-11-wallpaper.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 pt-8">
        <div className="flex h-full flex-col justify-between px-6 pb-0 pt-4">
          <div className="flex gap-6">
            <DesktopAppIcon
              label="Falcon Sensor"
              selected={selectedIcon === "installer"}
              onClick={() => setSelectedIcon("installer")}
              onDoubleClick={openInstaller}
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-[6px] bg-white/92 shadow-lg">
                <Image
                  src="/crowdstrike-logo.svg"
                  alt="CrowdStrike"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
              </div>
            </DesktopAppIcon>

            <DesktopAppIcon
              label="Google Chrome"
              selected={selectedIcon === "chrome"}
              onClick={openChrome}
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-[6px] bg-white/92 shadow-lg">
                <Image
                  src="/google-chrome-logo.svg"
                  alt="Google Chrome"
                  width={38}
                  height={38}
                  className="h-10 w-10"
                />
              </div>
            </DesktopAppIcon>
          </div>
        </div>
      </div>

      {state.installer.stage !== "idle" ? (
        <WindowsInstallerDialog
          stage={state.installer.stage}
          acceptedLicense={state.installer.acceptedLicense}
          customerId={state.installer.customerId}
          installationToken={state.installer.installationToken}
          progress={state.installer.progress}
          onAcceptedLicenseChange={setInstallerAcceptedLicense}
          onCustomerIdChange={(value) => setInstallerField("customerId", value)}
          onInstallationTokenChange={(value) =>
            setInstallerField("installationToken", value)
          }
          onClose={closeInstallerWindow}
          onInstall={submitInstaller}
          onFinish={closeInstallerWindow}
          installDisabled={
            !state.installer.acceptedLicense ||
            !state.installer.customerId.trim() ||
            !state.installer.installationToken.trim()
          }
        />
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/20 bg-white/55 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">8°C Partly sunny</div>
          <div className="rounded-2xl bg-white/70 px-3 py-2">
            <Search className="h-5 w-5 text-slate-800" />
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Wifi className="h-4 w-4" />
            11:00 AM
          </div>
        </div>
      </div>
    </main>
  );
}
