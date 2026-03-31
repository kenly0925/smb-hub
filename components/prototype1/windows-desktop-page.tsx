"use client";

import { useEffect, useRef, useState } from "react";
import { usePrototype1Demo } from "@/components/prototype1/demo-provider";
import { WindowsInstallerDialog } from "@/components/shared/windows-installer-dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Folder,
  MonitorDown,
  Search,
  TerminalSquare,
  Wifi,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

type InstallerStage = "closed" | "form" | "progress" | "complete";

const EICAR_TEST_STRING =
  "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";

const ACCEPTED_COMMAND = `powershell.exe -NoProfile -Command "$path = Join-Path $env:TEMP 'eicar.com'; Set-Content -Path $path -Value '${EICAR_TEST_STRING}' -NoNewline"`;

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

export function Prototype1WindowsDesktopPage({
  returnPath,
}: {
  returnPath: string;
}) {
  const router = useRouter();
  const { state, completeInstallation, triggerFakeDetection } = usePrototype1Demo();
  const [selectedIcon, setSelectedIcon] = useState<
    "installer" | "cli" | "chrome" | null
  >(
    null,
  );
  const [installerStage, setInstallerStage] = useState<InstallerStage>("closed");
  const [acceptedLicense, setAcceptedLicense] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [installationToken, setInstallationToken] = useState("");
  const [progress, setProgress] = useState(8);
  const progressRef = useRef(progress);
  const [commandPromptOpen, setCommandPromptOpen] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([
    "Microsoft Windows [Version 10.0.26100.4946]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "C:\\Users\\kenly>",
  ]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (installerStage !== "progress") {
      return;
    }

    const timer = window.setInterval(() => {
      const next = Math.min(progressRef.current + 14, 100);
      progressRef.current = next;
      setProgress(next);

      if (next === 100) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          completeInstallation();
          setInstallerStage("complete");
        }, 0);
      }
    }, 280);

    return () => window.clearInterval(timer);
  }, [completeInstallation, installerStage]);

  function openInstaller() {
    setSelectedIcon("installer");
    setInstallerStage("form");
    setCustomerId(state.credentials.customerId);
    setInstallationToken("");
  }

  function submitInstaller() {
    if (!acceptedLicense || !customerId.trim() || !installationToken.trim()) {
      return;
    }

    setInstallerStage("progress");
    setProgress(14);
    progressRef.current = 14;
  }

  function runCommand() {
    const trimmed = commandInput.trim();

    if (!trimmed) {
      setCommandInput(ACCEPTED_COMMAND);
      return;
    }

    setCommandHistory((current) => [...current, trimmed]);
    setCommandInput("");

    window.setTimeout(() => {
      const normalized = trimmed.toLowerCase();

      if (
        trimmed === ACCEPTED_COMMAND ||
        (normalized.includes("powershell.exe") &&
          normalized.includes("eicar.com") &&
          normalized.includes("set-content"))
      ) {
        triggerFakeDetection();
        setCommandHistory((current) => [
          ...current,
          "[+] EICAR-style test artifact written to TEMP.",
          "[+] Dashboard state updated with one low-severity detection.",
          "",
          "C:\\Users\\kenly>",
        ]);
      } else {
        setCommandHistory((current) => [
          ...current,
          `'${trimmed}' is not recognized as an internal or external command.`,
          "",
          "C:\\Users\\kenly>",
        ]);
      }
    }, 650);
  }

  function finishInstaller() {
    setInstallerStage("closed");
  }

  function openChrome() {
    setSelectedIcon("chrome");
    router.push(returnPath);
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
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-sm bg-white/92 shadow-lg">
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

            <DesktopAppIcon
              label="Command Prompt"
              selected={selectedIcon === "cli"}
              onClick={() => setSelectedIcon("cli")}
              onDoubleClick={() => {
                setSelectedIcon("cli");
                setCommandPromptOpen(true);
              }}
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                <TerminalSquare className="h-8 w-8" />
              </div>
            </DesktopAppIcon>
          </div>
        </div>
      </div>

      {installerStage !== "closed" ? (
        <WindowsInstallerDialog
          stage={installerStage}
          acceptedLicense={acceptedLicense}
          customerId={customerId}
          installationToken={installationToken}
          progress={progress}
          onAcceptedLicenseChange={setAcceptedLicense}
          onCustomerIdChange={setCustomerId}
          onInstallationTokenChange={setInstallationToken}
          onClose={() => setInstallerStage("closed")}
          onInstall={submitInstaller}
          onFinish={finishInstaller}
          installDisabled={
            !acceptedLicense || !customerId.trim() || !installationToken.trim()
          }
        />
      ) : null}

      {commandPromptOpen ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/15">
          <div className="w-[680px] overflow-hidden rounded-[8px] border border-white/10 bg-[#090909] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between bg-[#11151d] px-3 py-2 text-sm text-white">
              <div>Command Prompt</div>
              <button
                type="button"
                onClick={() => setCommandPromptOpen(false)}
                className="rounded px-2 py-1 hover:bg-white/8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="font-mono text-[13px] text-white">
              <div className="h-[360px] overflow-y-auto px-4 py-4">
                {commandHistory.map((line, index) => (
                  <div key={`${line}-${index}`} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-2">
                  <span>C:\Users\kenly&gt;</span>
                  <input
                    value={commandInput}
                    onChange={(event) => setCommandInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        runCommand();
                      }
                    }}
                    className="w-full bg-transparent outline-none"
                    placeholder={ACCEPTED_COMMAND}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/20 bg-white/55 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">8°C Partly sunny</div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/70 px-3 py-2">
              <Search className="h-5 w-5 text-slate-800" />
            </div>
            <div className="rounded-2xl bg-white/70 px-3 py-2">
              <Folder className="h-5 w-5 text-amber-500" />
            </div>
            <div className="rounded-2xl bg-white/70 px-3 py-2">
              <MonitorDown className="h-5 w-5 text-slate-800" />
            </div>
            <div className="rounded-2xl bg-white/70 px-3 py-2">
              <TerminalSquare className="h-5 w-5 text-slate-800" />
            </div>
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
