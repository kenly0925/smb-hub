"use client";

import { useState } from "react";
import { usePrototype1Demo } from "@/components/prototype1/demo-provider";
import { Prototype1Shell } from "@/components/prototype1/shell";
import {
  Button,
  Checkbox,
  PageTabs,
  SectionHeading,
  SelectField,
  ShellCard,
  Toggle,
} from "@/components/prototype1/ui";
import { LEVEL_OPTIONS } from "@/lib/prototype1/data";
import { PolicyLevel, ToggleItem } from "@/lib/prototype1/types";
import { ArrowLeft, Info, Link2 } from "lucide-react";
import Link from "next/link";

function PolicyLevelRadioGroup({
  value,
  onChange,
}: {
  value: PolicyLevel;
  onChange: (value: PolicyLevel) => void;
}) {
  return (
    <div className="relative mt-4">
      <div className="pointer-events-none absolute left-[10%] right-[10%] top-3 h-px bg-white/10" />
      <div className="relative grid grid-cols-5 gap-3">
        {LEVEL_OPTIONS.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full border transition",
                  isActive
                    ? "border-[#c8dcfe] bg-[#c8dcfe]"
                    : "border-[#8e939c] bg-[var(--p1-surface)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full transition",
                    isActive ? "bg-[#20212a]" : "bg-transparent",
                  ].join(" ")}
                />
              </span>
              <span className="text-[11px] leading-4 text-[var(--p1-text-muted)]">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToggleCardsSection({
  title,
  description,
  items,
  onToggle,
  headerAction,
}: {
  title: string;
  description?: string;
  items: ToggleItem[];
  onToggle: (id: string, checked: boolean) => void;
  headerAction?: React.ReactNode;
}) {
  return (
    <ShellCard className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xl font-semibold text-white">{title}</div>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--p1-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {headerAction}
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-md border border-white/8 bg-[var(--p1-surface-2)] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm font-semibold text-white">{item.label}</div>
              <Toggle
                checked={item.enabled}
                onChange={(checked) => onToggle(item.id, checked)}
              />
            </div>
            {item.description ? (
              <p className="mt-4 text-sm leading-6 text-[var(--p1-text-muted)]">
                {item.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </ShellCard>
  );
}

function CheckboxSettingCard({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-md border border-white/8 bg-[var(--p1-surface-2)] p-4">
      <div className="flex items-start gap-3">
        <Checkbox checked={checked} onChange={onChange} />
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <p className="mt-2 text-sm leading-6 text-[var(--p1-text-muted)]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Prototype1PolicyDetailPage() {
  const {
    state: { policyConfigDraft },
    updatePolicyConfig,
    savePolicyConfig,
    resetPolicyConfig,
  } = usePrototype1Demo();
  const [tab, setTab] = useState("settings");

  return (
    <Prototype1Shell>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link
            href="/prototype-1/policies"
            className="inline-flex items-center gap-2 text-sm text-[var(--p1-text-muted)] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All policies
          </Link>
          <SectionHeading
            title="Phase 1 Prevention Policy"
            description="Configure machine learning levels, prevention responses, host-side controls, and analyst-facing settings for the Windows pilot policy."
          />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={resetPolicyConfig}>Cancel</Button>
          <Button variant="primary" onClick={savePolicyConfig}>
            Save
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <PageTabs
          tabs={[
            { label: "Settings", value: "settings" },
            { label: "Assigned host groups", value: "groups" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === "groups" ? (
        <ShellCard className="p-5">
          <div className="text-sm font-semibold text-[var(--p1-text-soft)]">
            Assigned host groups
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {policyConfigDraft.assignedHostGroups.map((group) => (
              <span
                key={group}
                className="rounded-sm border border-white/10 bg-[var(--p1-surface-2)] px-4 py-2 text-sm text-[var(--p1-text-soft)]"
              >
                {group}
              </span>
            ))}
          </div>
        </ShellCard>
      ) : (
        <div className="space-y-6">
          <ShellCard className="border-[#c8dcfe]/35 bg-[rgba(200,220,254,0.08)] p-5">
            <div className="flex gap-3">
              <div className="p-2 text-[var(--p1-link)]">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm text-[var(--p1-link)]">
                  Resource guardrail settings only apply to hosts with the latest
                  sensor version.
                </div>
                <div className="p1-link mt-2 inline-flex items-center gap-2 text-sm">
                  About sensor support
                  <Link2 className="h-4 w-4" />
                </div>
              </div>
            </div>
          </ShellCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <ShellCard className="p-6">
              <div className="border-b border-white/8 pb-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--p1-text-muted)]">
                  Type
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Next-Gen Antivirus
                </div>
                <div className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--p1-text-muted)]">
                  Category
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Sensor Machine Learning
                </div>
              </div>
              <div className="mt-6">
                <div className="text-xl font-semibold text-white">
                  Sensor Anti-malware
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--p1-text-muted)]">
                  Apply sensor-based machine learning to identify and analyze
                  unknown executables as they attempt to run.
                </p>
                <div className="mt-5 text-sm font-medium text-[var(--p1-text-muted)]">
                  Detection
                </div>
                <PolicyLevelRadioGroup
                  value={policyConfigDraft.sensorMachineLearning.sensorAntiMalware.detection}
                  onChange={(value) =>
                    updatePolicyConfig((draft) => {
                      draft.sensorMachineLearning.sensorAntiMalware.detection =
                        value;
                      return draft;
                    })
                  }
                />
                <div className="mt-6 text-sm font-medium text-[var(--p1-text-muted)]">
                  Prevention
                </div>
                <PolicyLevelRadioGroup
                  value={policyConfigDraft.sensorMachineLearning.sensorAntiMalware.prevention}
                  onChange={(value) =>
                    updatePolicyConfig((draft) => {
                      draft.sensorMachineLearning.sensorAntiMalware.prevention =
                        value;
                      return draft;
                    })
                  }
                />
              </div>
            </ShellCard>

            <ShellCard className="p-6">
              <div className="border-b border-white/8 pb-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--p1-text-muted)]">
                  Type
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Next-Gen Antivirus
                </div>
                <div className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--p1-text-muted)]">
                  Category
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Adware & PUP
                </div>
              </div>
              <div className="mt-6">
                <div className="text-xl font-semibold text-white">Adware & PUP</div>
                <p className="mt-2 text-sm leading-6 text-[var(--p1-text-muted)]">
                  Detect and prevent potentially unwanted software and adware with
                  the same graduated enforcement model.
                </p>
                <div className="mt-5 text-sm font-medium text-[var(--p1-text-muted)]">
                  Detection
                </div>
                <PolicyLevelRadioGroup
                  value={policyConfigDraft.sensorMachineLearning.adwareAndPup.detection}
                  onChange={(value) =>
                    updatePolicyConfig((draft) => {
                      draft.sensorMachineLearning.adwareAndPup.detection = value;
                      return draft;
                    })
                  }
                />
                <div className="mt-6 text-sm font-medium text-[var(--p1-text-muted)]">
                  Prevention
                </div>
                <PolicyLevelRadioGroup
                  value={policyConfigDraft.sensorMachineLearning.adwareAndPup.prevention}
                  onChange={(value) =>
                    updatePolicyConfig((draft) => {
                      draft.sensorMachineLearning.adwareAndPup.prevention = value;
                      return draft;
                    })
                  }
                />
              </div>
            </ShellCard>
          </div>

          <ToggleCardsSection
            title="Quarantine"
            description="Define what the policy should hold, isolate, or retain once prevention triggers on a host."
            items={policyConfigDraft.quarantine.items}
            onToggle={(id, checked) =>
              updatePolicyConfig((draft) => {
                draft.quarantine.items = draft.quarantine.items.map((item) =>
                  item.id === id ? { ...item, enabled: checked } : item,
                );
                draft.quarantine.enableAll = draft.quarantine.items.every((item) =>
                  item.id === id ? checked : item.enabled,
                );
                return draft;
              })
            }
            headerAction={
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--p1-text-soft)]">Enable all</span>
                <Toggle
                  checked={policyConfigDraft.quarantine.enableAll}
                  onChange={(checked) =>
                    updatePolicyConfig((draft) => {
                      draft.quarantine.enableAll = checked;
                      draft.quarantine.items = draft.quarantine.items.map((item) => ({
                        ...item,
                        enabled: checked,
                      }));
                      return draft;
                    })
                  }
                />
              </div>
            }
          />

          <ToggleCardsSection
            title="Execution Blocking"
            description="Turn on host-side prevention controls for suspicious processes, scripts, registry abuse, and driver-based attacks."
            items={policyConfigDraft.executionBlocking}
            onToggle={(id, checked) =>
              updatePolicyConfig((draft) => {
                draft.executionBlocking = draft.executionBlocking.map((item) =>
                  item.id === id ? { ...item, enabled: checked } : item,
                );
                return draft;
              })
            }
          />

          <ToggleCardsSection
            title="Script and Telemetry Visibility"
            description="Choose how much interpreter, script, and network telemetry should be collected for detection and analyst review."
            items={policyConfigDraft.visibilityAndScripts}
            onToggle={(id, checked) =>
              updatePolicyConfig((draft) => {
                draft.visibilityAndScripts = draft.visibilityAndScripts.map((item) =>
                  item.id === id ? { ...item, enabled: checked } : item,
                );
                return draft;
              })
            }
          />

          <ShellCard className="p-6">
            <div className="text-xl font-semibold text-white">
              Response and Exceptions
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--p1-text-muted)]">
              Configure default analyst response behavior and supplemental protection
              options for this policy.
            </p>

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--p1-text-muted)]">
                  Unknown binary response
                </div>
                <SelectField
                  value={policyConfigDraft.responseAndExceptions.unknownBinaryResponse}
                  onChange={(event) =>
                    updatePolicyConfig((draft) => {
                      draft.responseAndExceptions.unknownBinaryResponse = event.target
                        .value as "Prevent" | "Detect" | "Observe";
                      return draft;
                    })
                  }
                >
                  <option value="Prevent">Prevent</option>
                  <option value="Detect">Detect</option>
                  <option value="Observe">Observe</option>
                </SelectField>
              </div>
              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--p1-text-muted)]">
                  Script analysis depth
                </div>
                <SelectField
                  value={policyConfigDraft.responseAndExceptions.scriptAnalysisDepth}
                  onChange={(event) =>
                    updatePolicyConfig((draft) => {
                      draft.responseAndExceptions.scriptAnalysisDepth = event.target
                        .value as "Standard" | "Enhanced" | "Maximum";
                      return draft;
                    })
                  }
                >
                  <option value="Standard">Standard</option>
                  <option value="Enhanced">Enhanced</option>
                  <option value="Maximum">Maximum</option>
                </SelectField>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <CheckboxSettingCard
                label="Quarantine archive attachments"
                description="Retain archived copies of blocked artifacts for analyst retrieval and validation."
                checked={
                  policyConfigDraft.responseAndExceptions.quarantineArchiveAttachments
                }
                onChange={(checked) =>
                  updatePolicyConfig((draft) => {
                    draft.responseAndExceptions.quarantineArchiveAttachments =
                      checked;
                    return draft;
                  })
                }
              />
              <CheckboxSettingCard
                label="Block credential dumping"
                description="Apply additional host-side prevention against tools and behaviors associated with credential access."
                checked={
                  policyConfigDraft.responseAndExceptions.blockCredentialDumping
                }
                onChange={(checked) =>
                  updatePolicyConfig((draft) => {
                    draft.responseAndExceptions.blockCredentialDumping = checked;
                    return draft;
                  })
                }
              />
              <CheckboxSettingCard
                label="Notify on prevention"
                description="Create an analyst-visible notification when the policy blocks or quarantines a file."
                checked={policyConfigDraft.responseAndExceptions.notifyOnPrevention}
                onChange={(checked) =>
                  updatePolicyConfig((draft) => {
                    draft.responseAndExceptions.notifyOnPrevention = checked;
                    return draft;
                  })
                }
              />
              <CheckboxSettingCard
                label="Allow analyst override"
                description="Permit incident responders to temporarily relax blocking actions while investigating a host."
                checked={policyConfigDraft.responseAndExceptions.allowAnalystOverride}
                onChange={(checked) =>
                  updatePolicyConfig((draft) => {
                    draft.responseAndExceptions.allowAnalystOverride = checked;
                    return draft;
                  })
                }
              />
            </div>
          </ShellCard>
        </div>
      )}
    </Prototype1Shell>
  );
}
