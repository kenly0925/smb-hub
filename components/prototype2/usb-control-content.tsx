"use client";

import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import {
  P2Menu,
  P2Pill,
  P2Select,
  P2Surface,
  P2Switch,
  P2Table,
} from "@/components/prototype2/ui";
import { getUsbControlIconSrc } from "@/lib/prototype2/presentation";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Prototype2UsbControlContent({
  height,
  className,
}: {
  height?: string;
  className?: string;
}) {
  const { state, toggleUsbCategory, allowListUsbDevice, setUsbTableView } =
    usePrototype2Demo();
  const showingFiles = state.usbControl.tableView === "files-written";

  return (
    <div
      className={cn(
        "grid min-h-0 grid-rows-[minmax(0,0.86fr)_minmax(0,1.14fr)] gap-2 overflow-hidden",
        className,
      )}
      style={height ? { height } : undefined}
    >
      <P2Surface className="flex min-h-0 flex-col p-5">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="text-[30px] font-semibold text-[var(--p2-text-soft)]">
            Device types
          </div>
          <P2Pill tone="teal" outline>
            {state.usbControl.monitoringLabel}
          </P2Pill>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden rounded-[var(--p2-radius-card)] xl:grid-cols-6">
          {state.usbControl.categories.map((category) => {
            return (
              <div
                key={category.id}
                className="flex min-h-0 flex-col justify-center bg-[var(--p2-panel)] p-5"
              >
                <div className="mb-5 flex justify-center">
                  <Image
                    src={getUsbControlIconSrc(category.id, category.allow)}
                    alt={`${category.label} ${category.allow ? "allowed" : "disallowed"}`}
                    width={36}
                    height={36}
                    className="h-9 w-9"
                  />
                </div>
                <div className="text-center text-base font-medium text-[var(--p2-text-soft)]">
                  {category.label}
                </div>
                <div className="mt-5 flex items-center justify-center gap-3 text-sm text-[var(--p2-text-muted)]">
                  <span className={category.allow ? "text-[var(--p2-text-soft)]" : ""}>
                    Allow
                  </span>
                  <P2Switch
                    checked={category.allow}
                    onChange={() => toggleUsbCategory(category.id)}
                  />
                  <span className={!category.allow ? "text-[var(--p2-text-soft)]" : ""}>
                    Block
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </P2Surface>

      <P2Surface className="min-h-0 overflow-hidden p-5">
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-[var(--p2-radius-button)] bg-[var(--p2-tab-strip)] p-1">
              <button
                type="button"
                onClick={() => setUsbTableView("files-written")}
                className={`rounded-[4px] px-4 py-2 text-sm font-semibold transition ${
                  showingFiles
                    ? "bg-[var(--p2-tab-active)] text-[var(--p2-tab-active-text)]"
                    : "text-[var(--p2-text)]"
                }`}
              >
                Files written to USB
              </button>
              <button
                type="button"
                onClick={() => setUsbTableView("recent-devices")}
                className={`rounded-[4px] px-4 py-2 text-sm font-semibold transition ${
                  !showingFiles
                    ? "bg-[var(--p2-tab-active)] text-[var(--p2-tab-active-text)]"
                    : "text-[var(--p2-text)]"
                }`}
              >
                Recently seen USB devices
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="w-[140px]">
                <P2Select defaultValue="all-file-types">
                  <option value="all-file-types">File type</option>
                </P2Select>
              </div>
              <div className="w-[140px]">
                <P2Select defaultValue="all-devices">
                  <option value="all-devices">Device</option>
                </P2Select>
              </div>
              <div className="w-[150px]">
                <P2Select defaultValue="last-week">
                  <option value="last-week">Last week</option>
                </P2Select>
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-auto">
            {showingFiles ? (
              <P2Table
                headers={[
                  "Date written",
                  "File name",
                  "File type detected",
                  "USB device name",
                  "Device ID",
                ]}
              >
                {state.usbControl.filesWritten.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[var(--p2-border)] text-[var(--p2-text)]"
                  >
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.writtenAt}</td>
                    <td className="px-4 py-3">{row.fileName}</td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.detectedType}</td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.usbDeviceName}</td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.deviceId}</td>
                  </tr>
                ))}
              </P2Table>
            ) : (
              <P2Table
                headers={[
                  "USB device",
                  "Vendor",
                  "Connected at",
                  "Last user",
                  "Device ID",
                  "Actions",
                ]}
              >
                {state.usbControl.recentDevices.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[var(--p2-border)] text-[var(--p2-text)]"
                  >
                    <td className="px-4 py-3">{row.deviceName}</td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.vendor}</td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.connectedAt}</td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.lastUser}</td>
                    <td className="px-4 py-3 text-[var(--p2-text-muted)]">{row.deviceId}</td>
                    <td className="px-4 py-3">
                      <P2Menu
                        align="right"
                        items={[
                          {
                            id: "allow-list",
                            label: row.allowListed
                              ? "Added to allow list"
                              : "Add to allow list",
                            checked: row.allowListed,
                          },
                        ]}
                        onSelect={() => {
                          if (!row.allowListed) {
                            allowListUsbDevice(row.id);
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </P2Table>
            )}
          </div>
        </div>
      </P2Surface>
    </div>
  );
}
