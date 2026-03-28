"use client";

import dynamic from "next/dynamic";
import { Prototype1Shell } from "@/components/prototype1/shell";
import {
  Button,
  DataTable,
  ShellCard,
  StatTile,
} from "@/components/prototype1/ui";
import { usePrototype1Demo } from "@/components/prototype1/demo-provider";
import { MoreVertical, ShieldAlert } from "lucide-react";
import Image from "next/image";

const CrowdScoreChart = dynamic(
  () =>
    import("@/components/prototype1/crowdscore-chart").then(
      (module) => module.CrowdScoreChart,
    ),
  { ssr: false },
);

function EmptyCardState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <Image
        src="/prototype-1/icon-dashboard.svg"
        alt=""
        width={22}
        height={22}
        className="opacity-35"
      />
      <div className="text-base text-[var(--p1-text-muted)]">No data found</div>
    </div>
  );
}

export function Prototype1DashboardPage() {
  const {
    state: { detections },
  } = usePrototype1Demo();

  return (
    <Prototype1Shell>
      <div className="grid h-[calc(100vh-112px)] grid-rows-3 gap-4 overflow-hidden">
        <div className="grid min-h-0 gap-4 xl:grid-cols-4">
          <StatTile label="Current CrowdScore" value="0/100" className="min-h-0 h-full" />
          <StatTile
            label="New detections"
            value={detections.length}
            className="min-h-0 h-full"
          />
          <ShellCard className="flex min-h-0 h-full flex-col p-5">
            <div className="text-sm font-medium text-[var(--p1-text-muted)]">
              SHA-based detections
            </div>
            <EmptyCardState />
          </ShellCard>
          <ShellCard className="flex min-h-0 h-full flex-col p-5">
            <div className="text-sm font-medium text-[var(--p1-text-muted)]">
              Prevented malware by host
            </div>
            <EmptyCardState />
          </ShellCard>
        </div>

        <div className="grid min-h-0 gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <ShellCard className="flex min-h-0 h-full flex-col p-5">
            <div className="text-sm font-medium text-[var(--p1-text-muted)]">
              OverWatch detections by day
            </div>
            <EmptyCardState />
          </ShellCard>
          <StatTile
            label="Total hunting leads generated"
            value="0"
            className="min-h-0 h-full"
          />
          <StatTile
            label="Total hunting leads investigated"
            value="0"
            className="min-h-0 h-full"
          />
        </div>

        <div className="grid min-h-0 gap-4 xl:grid-cols-[0.9fr_1.6fr]">
          <ShellCard className="flex min-h-0 h-full flex-col p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-[var(--p1-text-muted)]">
                CrowdScore overtime
              </div>
            <Button
              variant="secondary"
              className="h-10 min-h-0 w-10 min-w-0 px-0 py-0"
              aria-label="CrowdScore overtime actions"
            >
              <MoreVertical className="h-5 w-5 text-[var(--p1-text-soft)]" />
            </Button>
            </div>
            <div className="mt-5 min-h-0 flex-1 rounded-md border border-white/8 bg-[var(--p1-bg)]/30 px-2 py-3">
              <CrowdScoreChart />
            </div>
          </ShellCard>

          <ShellCard className="flex min-h-0 h-full flex-col p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-sm font-medium text-[var(--p1-text-muted)]">
                Most recent detections
              </div>
              <Button
                variant="secondary"
                className="h-10 min-h-0 w-10 min-w-0 px-0 py-0"
                aria-label="Most recent detections actions"
              >
                <MoreVertical className="h-5 w-5 text-[var(--p1-text-soft)]" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <DataTable
                headers={["Severity", "Tactic & Technique", "Time", "Host ID", "Link"]}
              >
                {detections.length ? (
                  detections.map((detection) => (
                    <tr key={detection.id} className="border-t border-white/8">
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center gap-2 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          {detection.severity}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[var(--p1-text-soft)]">
                        {detection.tactic}
                      </td>
                      <td className="px-4 py-4 text-[var(--p1-text-soft)]">
                        {detection.time}
                      </td>
                      <td className="px-4 py-4 text-[var(--p1-text-soft)]">
                        {detection.hostId}
                      </td>
                      <td className="px-4 py-4">
                        <button type="button" className="p1-link text-sm">
                          {detection.linkLabel}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-white/8">
                    <td
                      colSpan={5}
                      className="px-4 py-16 text-center text-sm text-[var(--p1-text-muted)]"
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </DataTable>
            </div>
          </ShellCard>
        </div>
      </div>
    </Prototype1Shell>
  );
}
