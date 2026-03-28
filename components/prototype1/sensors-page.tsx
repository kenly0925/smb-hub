"use client";

import { usePrototype1Demo } from "@/components/prototype1/demo-provider";
import { Prototype1Shell } from "@/components/prototype1/shell";
import {
  Button,
  DataTable,
  SectionHeading,
  ShellCard,
  TextInput,
} from "@/components/prototype1/ui";
import { maskValue } from "@/lib/utils";
import { Eye, EyeOff, MonitorDown } from "lucide-react";
import Link from "next/link";

const windowsRows = [
  ["v7.13.1502", "Windows 10/11"],
  ["v7.12.1430", "Windows 10/11"],
  ["v7.11.1355", "Windows 8.1, 10, 11"],
  ["v7.10.1280", "Windows 7 SP1, 8.1, 10"],
];

const macRows = [
  ["v7.13.1401", "macOS 12-14"],
  ["v7.12.1320", "macOS 11-13"],
  ["v7.11.1255", "macOS 10.15-12"],
  ["v7.10.1190", "macOS 10.14-11"],
];

const linuxRows = [
  ["v7.13.1350", "RHEL 7-9, Amazon Linux 2/2023, SUSE 12-15"],
  ["v7.12.1280", "RHEL 7-8, Amazon Linux 2, SUSE 12"],
  ["v7.11.1205", "RHEL 6-7 (legacy)"],
];

export function Prototype1SensorsPage() {
  const { state, toggleCredentialVisibility } = usePrototype1Demo();

  return (
    <Prototype1Shell>
      <SectionHeading
        title="Download sensors"
        description="Review supported sensor packages, reveal the customer ID and installation token, and launch the Windows installer flow used in the demo."
      />

      <ShellCard className="mt-6 p-5">
        <div className="mb-5 text-sm font-semibold text-[var(--p1-text-soft)]">
          Credentials
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--p1-text-muted)]">
              Customer ID
            </div>
            <div className="flex gap-3">
              <TextInput
                value={maskValue(
                  state.credentials.customerId,
                  state.credentials.customerIdVisible,
                )}
                readOnly
              />
              <Button
                onClick={() => toggleCredentialVisibility("customerId")}
                className="px-3"
              >
                {state.credentials.customerIdVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--p1-text-muted)]">
              Installation token
            </div>
            <div className="flex gap-3">
              <TextInput
                value={maskValue(
                  state.credentials.installationToken,
                  state.credentials.installationTokenVisible,
                )}
                readOnly
                onClick={(event) => event.currentTarget.select()}
                onCopy={(event) => {
                  event.preventDefault();
                  event.clipboardData.setData(
                    "text/plain",
                    state.credentials.installationToken,
                  );
                }}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
                    event.preventDefault();
                    void navigator.clipboard.writeText(
                      state.credentials.installationToken,
                    );
                  }
                }}
              />
              <Button
                onClick={() => toggleCredentialVisibility("installationToken")}
                className="px-3"
              >
                {state.credentials.installationTokenVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </ShellCard>

      <div className="mt-6 space-y-4">
        <ShellCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-white">Windows</div>
            <Link href="/prototype-1/windows-desktop">
              <Button variant="primary">
                <MonitorDown className="h-4 w-4" />
                Open installer desktop
              </Button>
            </Link>
          </div>
          <DataTable
            headers={["Version", "System", "Action"]}
            tableClassName="table-fixed"
          >
            {windowsRows.map((row) => (
              <tr key={row.join("-")} className="border-t border-white/8">
                <td className="w-1/3 px-4 py-3 text-[var(--p1-text-soft)]">{row[0]}</td>
                <td className="w-1/3 px-4 py-3 text-[var(--p1-text-soft)]">{row[1]}</td>
                <td className="w-1/3 px-4 py-3">
                  <Link href="/prototype-1/windows-desktop" className="p1-link text-sm">
                    Download
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>
        </ShellCard>

        <ShellCard className="p-5">
          <div className="mb-4 text-lg font-semibold text-white">MacOS</div>
          <DataTable
            headers={["Version", "System", "Action"]}
            tableClassName="table-fixed"
          >
            {macRows.map((row) => (
              <tr key={row.join("-")} className="border-t border-white/8">
                <td className="w-1/3 px-4 py-3 text-[var(--p1-text-soft)]">{row[0]}</td>
                <td className="w-1/3 px-4 py-3 text-[var(--p1-text-soft)]">{row[1]}</td>
                <td className="w-1/3 px-4 py-3">
                  <span className="p1-link text-sm">Download</span>
                </td>
              </tr>
            ))}
          </DataTable>
        </ShellCard>

        <ShellCard className="p-5">
          <div className="mb-4 text-lg font-semibold text-white">Linux</div>
          <DataTable
            headers={["Version", "System", "Action"]}
            tableClassName="table-fixed"
          >
            {linuxRows.map((row) => (
              <tr key={row.join("-")} className="border-t border-white/8">
                <td className="w-1/3 px-4 py-3 text-[var(--p1-text-soft)]">{row[0]}</td>
                <td className="w-1/3 px-4 py-3 text-[var(--p1-text-soft)]">{row[1]}</td>
                <td className="w-1/3 px-4 py-3">
                  <span className="p1-link text-sm">Download</span>
                </td>
              </tr>
            ))}
          </DataTable>
        </ShellCard>
      </div>
    </Prototype1Shell>
  );
}
