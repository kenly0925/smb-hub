"use client";

import { prototype2UserName } from "@/components/prototype2/console-topbar";
import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import {
  DownloadSensorButton,
  FinalPreventionLevelSelector,
  finalPreventionLevelTabs,
} from "@/components/prototype2/final-pages";
import { P2Button } from "@/components/prototype2/ui";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

const configurationPhases = [
  {
    threshold: 30,
    increment: 4,
    label: "Applying prevention settings across backend services",
  },
  {
    threshold: 58,
    increment: 4,
    label: "Registering your first sensor with the cloud platform",
  },
  {
    threshold: 84,
    increment: 3,
    label: "Syncing device inventory into the management backend",
  },
  {
    threshold: 100,
    increment: 2,
    label: "Finalizing portal configuration and homepage data",
  },
] as const;

function getConfigurationPhase(progress: number) {
  return (
    configurationPhases.find((phase) => progress < phase.threshold) ??
    configurationPhases[configurationPhases.length - 1]
  );
}

function getConfigurationStatus(progress: number) {
  return getConfigurationPhase(progress).label;
}

function getNextConfigurationProgress(progress: number) {
  const currentPhase = getConfigurationPhase(progress);

  return Math.min(progress + currentPhase.increment, currentPhase.threshold);
}

export function Prototype2FinalOnboardingModal() {
  const {
    state,
    setProtectionLevel,
    setFinalOnboardingProgress,
    setFinalOnboardingStage,
    completeFinalOnboarding,
  } = usePrototype2Demo();
  const progressRef = useRef(state.finalOnboarding.configurationProgress);
  const firstName = prototype2UserName.split(" ")[0] || prototype2UserName;
  const configurationProgress = state.finalOnboarding.configurationProgress;
  const configurationStatus = getConfigurationStatus(configurationProgress);

  useEffect(() => {
    progressRef.current = configurationProgress;
  }, [configurationProgress]);

  useEffect(() => {
    if (state.finalOnboarding.stage !== "configuring") {
      return;
    }

    if (progressRef.current >= 100) {
      completeFinalOnboarding();
      return;
    }

    const timer = window.setInterval(() => {
      const nextProgress = getNextConfigurationProgress(progressRef.current);
      progressRef.current = nextProgress;
      setFinalOnboardingProgress(nextProgress);

      if (nextProgress === 100) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          completeFinalOnboarding();
        }, 260);
      }
    }, 320);

    return () => window.clearInterval(timer);
  }, [
    completeFinalOnboarding,
    setFinalOnboardingProgress,
    state.finalOnboarding.stage,
  ]);

  if (state.finalOnboarding.stage === "complete") {
    return null;
  }

  if (state.finalOnboarding.stage === "configuring") {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--p2-bg)]">
        <div className="flex min-h-screen items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-[760px] text-center">
            <div className="text-[clamp(24px,3.2vw,32px)] font-semibold leading-[1.08] text-[var(--p2-text-soft)]">
              Configuring your security environment
            </div>
            <div className="mx-auto mt-10 h-1 w-full max-w-[560px] overflow-hidden rounded-[3px] bg-[var(--p2-surface)]">
              <div
                className="h-full rounded-[3px] bg-[#06e5b7] transition-[width] duration-300 ease-out"
                style={{ width: `${configurationProgress}%` }}
              />
            </div>
            <div className="mt-5 text-[26px] font-medium leading-none text-[var(--p2-text-muted)]">
              {configurationProgress}%
            </div>
            <div className="mt-3 text-[15px] leading-6 text-[var(--p2-text-muted)]">
              {configurationStatus}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--p2-bg)]">
      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[920px]">
            <div className="mx-auto flex w-full flex-col items-center text-center">
              <div className="text-[clamp(24px,3vw,34px)] font-semibold leading-tight text-[var(--p2-text-soft)]">
                Hi, {firstName},
              </div>
              <div className="mt-3 text-[clamp(18px,2.2vw,24px)] font-semibold leading-tight text-[var(--p2-text-soft)]">
                {state.finalOnboarding.stage === "confirm-user"
                  ? "Confirm the prevention strength"
                  : "Download your first sensor"}
              </div>

              {state.finalOnboarding.stage === "confirm-user" ? (
                <div className="mt-10 w-full">
                  <FinalPreventionLevelSelector
                    className="mt-5"
                    levels={finalPreventionLevelTabs}
                    activeId={state.prevention.level}
                    onChange={setProtectionLevel}
                  />
                </div>
              ) : (
                <div className="mt-6 flex w-full flex-col items-center">
                  <div className="max-w-[560px] text-center text-sm leading-7 text-[var(--p2-text-muted)]">
                    Download and install the first sensor, then come back here.
                    We&apos;ll refresh automatically and finish the remaining
                    setup in the background.
                  </div>
                  <div className="mt-7 h-px w-24 bg-[var(--p2-border)]" />
                  <div className="mt-7">
                    <DownloadSensorButton returnTo="final" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <div>
            {state.finalOnboarding.stage === "download-agent" ? (
              <P2Button
                variant="secondary"
                size="lg"
                onClick={() => setFinalOnboardingStage("confirm-user")}
              >
                Back
              </P2Button>
            ) : null}
          </div>

          <div>
            {state.finalOnboarding.stage === "confirm-user" ? (
              <P2Button
                variant="primary"
                size="lg"
                onClick={() => setFinalOnboardingStage("download-agent")}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </P2Button>
            ) : null}

            {state.finalOnboarding.stage === "download-agent" ? (
              <P2Button variant="primary" size="lg" disabled>
                Next
                <ArrowRight className="h-4 w-4" />
              </P2Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
