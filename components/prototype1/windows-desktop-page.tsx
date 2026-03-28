"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePrototype1Demo } from "@/components/prototype1/demo-provider";
import { Button } from "@/components/prototype1/ui";
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
import Link from "next/link";
import { useRouter } from "next/navigation";

type InstallerStage = "closed" | "form" | "progress" | "complete";

const EICAR_TEST_STRING =
  "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";

const ACCEPTED_COMMAND = `powershell.exe -NoProfile -Command "$path = Join-Path $env:TEMP 'eicar.com'; Set-Content -Path $path -Value '${EICAR_TEST_STRING}' -NoNewline"`;

function InstallerInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white",
        props.className,
      )}
    />
  );
}

export function Prototype1WindowsDesktopPage() {
  const router = useRouter();
  const { state, completeInstallation, triggerFakeDetection } = usePrototype1Demo();
  const [selectedIcon, setSelectedIcon] = useState<"installer" | "cli" | null>(
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

  const desktopStatus = useMemo(() => {
    if (state.demoFlags.detectionTriggered && state.demoFlags.installerCompleted) {
      return "Installer complete and fake detection triggered";
    }

    if (state.demoFlags.installerCompleted) {
      return "Installer complete, console host record available";
    }

    return "Awaiting installation";
  }, [state.demoFlags.detectionTriggered, state.demoFlags.installerCompleted]);

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#9fd6ff] text-slate-950">
      <Image
        src="/windows-11-wallpaper.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-black/20 px-5 py-3 text-white backdrop-blur">
        <Link
          href="/prototype-1/sensors"
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm"
        >
          Back to sensors
        </Link>
        <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
          {desktopStatus}
        </div>
      </div>

      <div className="absolute inset-0 pt-20">
        <div className="flex h-full flex-col justify-between px-6 pb-0 pt-4">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setSelectedIcon("installer")}
              onDoubleClick={openInstaller}
              className={cn(
                "flex w-24 flex-col items-center rounded-sm px-3 py-4 text-sm text-white transition",
                selectedIcon === "installer" ? "bg-white/20" : "hover:bg-white/15",
              )}
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
              Falcon Sensor
            </button>

            <button
              type="button"
              onClick={() => setSelectedIcon("cli")}
              onDoubleClick={() => {
                setSelectedIcon("cli");
                setCommandPromptOpen(true);
              }}
              className={cn(
                "flex w-24 flex-col items-center rounded-2xl px-3 py-4 text-sm text-white transition",
                selectedIcon === "cli" ? "bg-white/20" : "hover:bg-white/15",
              )}
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                <TerminalSquare className="h-8 w-8" />
              </div>
              Command Prompt
            </button>
          </div>
        </div>
      </div>

      {installerStage !== "closed" ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/25">
          <div className="w-[780px] overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between bg-[#f3523c] px-4 py-3 text-white">
              <div className="flex items-center gap-2 font-semibold">
                <Image
                  src="/crowdstrike-logo.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px]"
                />
                Falcon Sensor Setup
              </div>
              <button
                type="button"
                onClick={() => setInstallerStage("closed")}
                className="rounded-md bg-white/10 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {installerStage === "form" ? (
              <div className="grid min-h-[360px] grid-cols-[220px_1fr]">
                <div className="flex items-center justify-center border-r border-black/5 bg-[radial-gradient(circle_at_40%_45%,rgba(243,82,60,0.15),transparent_38%),linear-gradient(180deg,#fafafa_0%,#f2f2f2_100%)]">
                  <Image
                    src="/crowdstrike-logo.svg"
                    alt="CrowdStrike"
                    width={120}
                    height={120}
                    className="h-auto w-[120px]"
                  />
                </div>
                <div className="flex flex-col justify-between p-8">
                  <div>
                    <div className="space-y-2">
                      <div className="h-3 w-4/5 rounded-full bg-slate-200" />
                      <div className="h-3 w-3/5 rounded-full bg-slate-200" />
                      <div className="h-3 w-2/3 rounded-full bg-slate-200" />
                    </div>
                    <label className="mt-6 flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={acceptedLicense}
                        onChange={(event) => setAcceptedLicense(event.target.checked)}
                      />
                      I accept the license agreement and privacy notice
                    </label>
                    <div className="mt-5">
                      <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        Customer ID
                      </div>
                      <InstallerInput
                        value={customerId}
                        onChange={(event) => setCustomerId(event.target.value)}
                      />
                    </div>
                    <div className="mt-4">
                      <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        Installation token
                      </div>
                      <InstallerInput
                        value={installationToken}
                        onChange={(event) => setInstallationToken(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-b-2xl rounded-t-xl">
                    <button
                      type="button"
                      onClick={() => setInstallerStage("closed")}
                      className="bg-[#5d5d5d] py-4 font-bold text-white"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={submitInstaller}
                      disabled={
                        !acceptedLicense ||
                        !customerId.trim() ||
                        !installationToken.trim()
                      }
                      className="bg-[#f3523c] py-4 font-bold text-white disabled:opacity-60"
                    >
                      Install
                    </button>
                  </div>
                </div>
              </div>
            ) : installerStage === "progress" ? (
              <div className="grid min-h-[360px] grid-cols-[220px_1fr]">
                <div className="flex items-center justify-center border-r border-black/5 bg-[radial-gradient(circle_at_40%_45%,rgba(243,82,60,0.15),transparent_38%),linear-gradient(180deg,#fafafa_0%,#f2f2f2_100%)]">
                  <Image
                    src="/crowdstrike-logo.svg"
                    alt="CrowdStrike"
                    width={120}
                    height={120}
                    className="h-auto w-[120px]"
                  />
                </div>
                <div className="flex flex-col items-center justify-center px-10 text-center">
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <Image
                      src="/circle-loader-bg.svg"
                      alt=""
                      width={88}
                      height={88}
                      className="h-[88px] w-[88px]"
                    />
                    <Image
                      src="/circle-loader.svg"
                      alt=""
                      width={88}
                      height={88}
                      className="absolute h-[88px] w-[88px] animate-[spin_1s_linear_infinite]"
                    />
                  </div>
                  <div className="mt-8 text-4xl font-light text-slate-900">
                    Installation
                  </div>
                  <div className="mt-3 text-sm text-slate-500">
                    Registering sensor, validating token, and reporting host metadata
                    to the demo console.
                  </div>
                  <div className="mt-4 text-sm font-medium text-slate-600">
                    {progress}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid min-h-[360px] grid-cols-[220px_1fr]">
                <div className="flex items-center justify-center border-r border-black/5 bg-[radial-gradient(circle_at_40%_45%,rgba(243,82,60,0.15),transparent_38%),linear-gradient(180deg,#fafafa_0%,#f2f2f2_100%)]">
                  <Image
                    src="/crowdstrike-logo.svg"
                    alt="CrowdStrike"
                    width={120}
                    height={120}
                    className="h-auto w-[120px]"
                  />
                </div>
                <div className="flex flex-col justify-between p-8">
                  <div>
                    <div className="text-3xl font-semibold text-slate-950">
                      Installation detected
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      The fake sensor install completed and the local web console
                      now shows the new host.
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Machine
                        </div>
                        <div className="mt-2 font-semibold text-slate-900">
                          WIN-FIN-001
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Username
                        </div>
                        <div className="mt-2 font-semibold text-slate-900">
                          kenly
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Status
                        </div>
                        <div className="mt-2 font-semibold text-emerald-600">
                          Connected
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      className="border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200"
                      onClick={() => setInstallerStage("closed")}
                    >
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => router.push("/prototype-1/sensors")}
                    >
                      Back to console
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
