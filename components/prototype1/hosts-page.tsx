"use client";

import { usePrototype1Demo } from "@/components/prototype1/demo-provider";
import { Prototype1Shell } from "@/components/prototype1/shell";
import { Button, DataTable, SectionHeading, ShellCard } from "@/components/prototype1/ui";
import { MoreVertical } from "lucide-react";

export function Prototype1HostsPage() {
  const {
    state: { hosts },
  } = usePrototype1Demo();

  return (
    <Prototype1Shell>
      <SectionHeading
        title="Hosts"
        description="Review enrolled endpoints, recent sensor check-in details, and the host records created by the installation workflow."
      />

      <ShellCard className="mt-6 p-5">
        <div className="mb-4 text-sm font-semibold text-[var(--p1-text-soft)]">
          All hosts
        </div>
        <DataTable
          headers={[
            "Hostname",
            "Device ID",
            "Platform",
            "Sensor version",
            "Last seen",
            "IP address",
            "Host group(s)",
            "Action",
          ]}
        >
          {hosts.length ? (
            hosts.map((item) => (
              <tr key={item.id} className="border-t border-white/8">
                <td className="px-4 py-4 text-[var(--p1-text-soft)]">{item.hostname}</td>
                <td className="px-4 py-4 text-[var(--p1-text-soft)]">{item.deviceId}</td>
                <td className="px-4 py-4 text-[var(--p1-text-soft)]">{item.platform}</td>
                <td className="px-4 py-4 text-[var(--p1-text-soft)]">
                  {item.sensorVersion}
                </td>
                <td className="px-4 py-4 text-[var(--p1-text-soft)]">{item.lastSeen}</td>
                <td className="px-4 py-4 text-[var(--p1-text-soft)]">{item.ipAddress}</td>
                <td className="px-4 py-4 text-[var(--p1-text-soft)]">{item.hostGroups}</td>
                <td className="px-4 py-4 text-[var(--p1-text-soft)]">
                  <div className="inline-flex items-center gap-3">
                    <button
                      type="button"
                      className="p1-link text-sm font-medium"
                    >
                      View
                    </button>
                    <Button
                      variant="secondary"
                      className="h-10 min-h-0 w-10 min-w-0 px-0 py-0"
                      aria-label={`Host actions for ${item.hostname}`}
                    >
                      <MoreVertical className="h-5 w-5 text-[var(--p1-text-soft)]" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="border-t border-white/8">
              <td
                colSpan={8}
                className="px-4 py-16 text-center text-sm text-[var(--p1-text-muted)]"
              >
                No hosts found. Run the fake installer from the Sensors page.
              </td>
            </tr>
          )}
        </DataTable>
      </ShellCard>
    </Prototype1Shell>
  );
}
