"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";

export type WindowsInstallerDialogStage = "form" | "progress" | "complete";

type WindowsInstallerDialogProps = {
  stage: WindowsInstallerDialogStage;
  acceptedLicense: boolean;
  customerId: string;
  installationToken: string;
  progress: number;
  onAcceptedLicenseChange: (checked: boolean) => void;
  onCustomerIdChange: (value: string) => void;
  onInstallationTokenChange: (value: string) => void;
  onClose: () => void;
  onInstall: () => void;
  onFinish: () => void;
  installDisabled: boolean;
};

export function WindowsInstallerInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-[6px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400",
        props.className,
      )}
    />
  );
}

function InstallerBrandPanel() {
  return (
    <div className="flex items-center justify-center border-r border-black/5 bg-[radial-gradient(circle_at_40%_45%,rgba(243,82,60,0.15),transparent_38%),linear-gradient(180deg,#fafafa_0%,#f2f2f2_100%)]">
      <Image
        src="/crowdstrike-logo.svg"
        alt="CrowdStrike"
        width={120}
        height={120}
        className="h-auto w-[120px]"
      />
    </div>
  );
}

function InstallerActionButton({
  tone,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone: "neutral" | "primary";
}) {
  return (
    <button
      {...props}
      className={cn(
        "py-4 text-sm font-semibold transition",
        tone === "primary"
          ? "rounded-[6px] bg-[#f3523c] text-white hover:bg-[#e34a35] disabled:opacity-60"
          : "rounded-[6px] bg-[#5d5d5d] text-white hover:bg-[#4f4f4f]",
        className,
      )}
    />
  );
}

function InstallerProgressRing() {
  return (
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
  );
}

export function WindowsInstallerDialog({
  stage,
  acceptedLicense,
  customerId,
  installationToken,
  progress,
  onAcceptedLicenseChange,
  onCustomerIdChange,
  onInstallationTokenChange,
  onClose,
  onInstall,
  onFinish,
  installDisabled,
}: WindowsInstallerDialogProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/25">
      <div className="w-[780px] overflow-hidden rounded-[6px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
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
            onClick={onClose}
            className="rounded-[6px] bg-white/10 p-1"
            aria-label="Close installer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {stage === "form" ? (
          <div className="grid min-h-[360px] grid-cols-[220px_1fr]">
            <InstallerBrandPanel />
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
                    onChange={(event) =>
                      onAcceptedLicenseChange(event.target.checked)
                    }
                  />
                  I accept the license agreement and privacy notice
                </label>
                <div className="mt-5">
                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Customer ID
                  </div>
                  <WindowsInstallerInput
                    value={customerId}
                    onChange={(event) => onCustomerIdChange(event.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Installation token
                  </div>
                  <WindowsInstallerInput
                    value={installationToken}
                    onChange={(event) =>
                      onInstallationTokenChange(event.target.value)
                    }
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <InstallerActionButton
                  type="button"
                  tone="neutral"
                  className="flex-1"
                  onClick={onClose}
                >
                  Close
                </InstallerActionButton>
                <InstallerActionButton
                  type="button"
                  tone="primary"
                  className="flex-1"
                  onClick={onInstall}
                  disabled={installDisabled}
                >
                  Install
                </InstallerActionButton>
              </div>
            </div>
          </div>
        ) : null}

        {stage === "progress" ? (
          <div className="grid min-h-[360px] grid-cols-[220px_1fr]">
            <InstallerBrandPanel />
            <div className="flex flex-col items-center justify-center px-10 text-center">
              <InstallerProgressRing />
              <div className="mt-8 text-4xl font-light text-slate-900">
                Installing
              </div>
              <div className="mt-3 text-sm leading-5 text-slate-500">
                Registering the sensor and syncing it with the web portal.
              </div>
              <div className="mt-4 text-sm font-medium text-slate-600">
                {progress}%
              </div>
            </div>
          </div>
        ) : null}

        {stage === "complete" ? (
          <div className="grid min-h-[360px] grid-cols-[220px_1fr]">
            <InstallerBrandPanel />
            <div className="flex flex-col justify-between p-8">
              <div>
                <div className="text-3xl font-semibold text-slate-950">
                  Installation successful
                </div>
                <p className="mt-3 max-w-[420px] text-sm leading-5 text-slate-600">
                  Go back to the web portal to confirm the new device is connected
                  and continue from there.
                </p>
              </div>
              <div className="flex justify-end">
                <InstallerActionButton
                  type="button"
                  tone="primary"
                  className="min-w-[150px] px-6"
                  onClick={onFinish}
                >
                  Finish
                </InstallerActionButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
