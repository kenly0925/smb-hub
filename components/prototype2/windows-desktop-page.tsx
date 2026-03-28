"use client";

import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { P2Button } from "@/components/prototype2/ui";
import { cn } from "@/lib/utils";
import { Search, Wifi, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function InstallerInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-[8px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400",
        props.className,
      )}
    />
  );
}

export function Prototype2WindowsDesktopPage({
  returnTo,
}: {
  returnTo: "ideal" | "final";
}) {
  const router = useRouter();
  const returnHref =
    returnTo === "ideal" ? "/prototype-2/ideal" : "/prototype-2/final/summary";
  const {
    state,
    setInstallerAcceptedLicense,
    setInstallerField,
    setInstallerProgress,
    setInstallerStage,
    completeInstallation,
  } = usePrototype2Demo();
  const progressRef = useRef(state.installer.progress);
  const [selectedIcon, setSelectedIcon] = useState(false);

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
    setSelectedIcon(true);
    setInstallerStage("form");
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

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-black/20 px-5 py-3 text-white backdrop-blur">
        <Link
          href={returnHref}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm"
        >
          Back to {returnTo === "ideal" ? "ideal version" : "final console"}
        </Link>
        <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
          {state.installer.completed
            ? "Installer complete and synced to Prototype 2"
            : "Waiting for installer launch"}
        </div>
      </div>

      <div className="absolute inset-0 pt-20">
        <div className="flex h-full flex-col justify-between px-6 pb-0 pt-4">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setSelectedIcon(true)}
              onDoubleClick={openInstaller}
              className={cn(
                "flex w-24 flex-col items-center rounded-[12px] px-3 py-4 text-sm text-white transition",
                selectedIcon ? "bg-white/20" : "hover:bg-white/15",
              )}
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-[12px] bg-white/92 shadow-lg">
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
          </div>
        </div>
      </div>

      {state.installer.stage !== "idle" ? (
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
                onClick={() => setInstallerStage("idle")}
                className="rounded-md bg-white/10 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {state.installer.stage === "form" ? (
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
                        checked={state.installer.acceptedLicense}
                        onChange={(event) =>
                          setInstallerAcceptedLicense(event.target.checked)
                        }
                      />
                      I accept the license agreement and privacy notice
                    </label>
                    <div className="mt-5">
                      <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        Customer ID
                      </div>
                      <InstallerInput
                        value={state.installer.customerId}
                        onChange={(event) =>
                          setInstallerField("customerId", event.target.value)
                        }
                      />
                    </div>
                    <div className="mt-4">
                      <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        Installation token
                      </div>
                      <InstallerInput
                        value={state.installer.installationToken}
                        onChange={(event) =>
                          setInstallerField("installationToken", event.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-b-2xl rounded-t-xl">
                    <button
                      type="button"
                      onClick={() => setInstallerStage("idle")}
                      className="bg-[#5d5d5d] py-4 font-bold text-white"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={submitInstaller}
                      disabled={
                        !state.installer.acceptedLicense ||
                        !state.installer.customerId.trim() ||
                        !state.installer.installationToken.trim()
                      }
                      className="bg-[#f3523c] py-4 font-bold text-white disabled:opacity-60"
                    >
                      Install
                    </button>
                  </div>
                </div>
              </div>
            ) : state.installer.stage === "progress" ? (
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
                    Installing
                  </div>
                  <div className="mt-3 text-sm text-slate-500">
                    Registering the sensor and syncing the new workstation to both Prototype 2 shells.
                  </div>
                  <div className="mt-4 text-sm font-medium text-slate-600">
                    {state.installer.progress}%
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
                      The new workstation is now visible in the final console and available inside the ideal version’s device grouping canvas.
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
                          Status
                        </div>
                        <div className="mt-2 font-semibold text-emerald-600">
                          Connected
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Scope
                        </div>
                        <div className="mt-2 font-semibold text-slate-900">
                          Prototype 2
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <P2Button
                      className="border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200"
                      onClick={() => setInstallerStage("idle")}
                    >
                      Close
                    </P2Button>
                    <P2Button variant="primary" onClick={() => router.push(returnHref)}>
                      Back to {returnTo === "ideal" ? "ideal version" : "final console"}
                    </P2Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
