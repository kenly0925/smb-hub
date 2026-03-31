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
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const USB_TABLE_HEADER_HEIGHT = 64;
const USB_TABLE_MIN_ROW_HEIGHT = 52;
const USB_TABLE_HEIGHT_ALLOWANCE = 2;

function getPageCount(itemCount: number, pageSize: number) {
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

function paginateRows<T>(rows: T[], page: number, pageSize: number) {
  const start = page * pageSize;

  return rows.slice(start, start + pageSize);
}

function UsbTablePagination({
  page,
  pageCount,
  itemCount,
  pageSize,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  itemCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const start = itemCount === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(itemCount, (page + 1) * pageSize);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--p2-border)] pt-4">
      <div className="text-xs text-[var(--p2-text-muted)]">
        Showing {start}-{end} of {itemCount}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="inline-flex h-8 items-center justify-center rounded-[4px] border border-[var(--p2-border)] bg-[var(--p2-surface)] px-3 text-xs font-semibold text-[var(--p2-text)] transition hover:bg-[var(--p2-elevated)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        {Array.from({ length: pageCount }, (_, index) => {
          const active = index === page;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onPageChange(index)}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-[4px] border px-2 text-xs font-semibold transition",
                active
                  ? "border-[var(--p2-button-primary-border)] bg-[var(--p2-button-primary-bg)] text-[var(--p2-button-primary-text)]"
                  : "border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text)] hover:bg-[var(--p2-elevated)]",
              )}
            >
              {index + 1}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount - 1}
          className="inline-flex h-8 items-center justify-center rounded-[4px] border border-[var(--p2-border)] bg-[var(--p2-surface)] px-3 text-xs font-semibold text-[var(--p2-text)] transition hover:bg-[var(--p2-elevated)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

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
  const [filesPage, setFilesPage] = useState(0);
  const [recentDevicesPage, setRecentDevicesPage] = useState(0);
  const tableViewportRef = useRef<HTMLDivElement | null>(null);
  const [tablePageSize, setTablePageSize] = useState(5);
  const [tableBodyHeight, setTableBodyHeight] = useState(USB_TABLE_MIN_ROW_HEIGHT * 5);
  const filesPageCount = getPageCount(
    state.usbControl.filesWritten.length,
    tablePageSize,
  );
  const recentDevicesPageCount = getPageCount(
    state.usbControl.recentDevices.length,
    tablePageSize,
  );
  const clampedFilesPage = Math.min(filesPage, filesPageCount - 1);
  const clampedRecentDevicesPage = Math.min(
    recentDevicesPage,
    recentDevicesPageCount - 1,
  );
  const paginatedFiles = useMemo(
    () => paginateRows(state.usbControl.filesWritten, clampedFilesPage, tablePageSize),
    [clampedFilesPage, state.usbControl.filesWritten, tablePageSize],
  );
  const paginatedRecentDevices = useMemo(
    () =>
      paginateRows(
        state.usbControl.recentDevices,
        clampedRecentDevicesPage,
        tablePageSize,
      ),
    [clampedRecentDevicesPage, state.usbControl.recentDevices, tablePageSize],
  );
  const tableRowHeight = Math.max(
    USB_TABLE_MIN_ROW_HEIGHT,
    Math.floor(tableBodyHeight / Math.max(1, tablePageSize)),
  );
  const emptyFileRows = Math.max(0, tablePageSize - paginatedFiles.length);
  const emptyRecentDeviceRows = Math.max(
    0,
    tablePageSize - paginatedRecentDevices.length,
  );

  useEffect(() => {
    const container = tableViewportRef.current;

    if (!container) {
      return;
    }

    function updatePageSize() {
      const element = tableViewportRef.current;

      if (!element) {
        return;
      }

      const nextBodyHeight = Math.max(
        USB_TABLE_MIN_ROW_HEIGHT,
        element.clientHeight - USB_TABLE_HEADER_HEIGHT - USB_TABLE_HEIGHT_ALLOWANCE,
      );
      const nextPageSize = Math.max(
        1,
        Math.floor(nextBodyHeight / USB_TABLE_MIN_ROW_HEIGHT),
      );

      setTableBodyHeight((current) =>
        current === nextBodyHeight ? current : nextBodyHeight,
      );
      setTablePageSize((current) => (current === nextPageSize ? current : nextPageSize));
    }

    updatePageSize();

    const observer = new ResizeObserver(updatePageSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 overflow-hidden",
        className,
      )}
      style={height ? { height } : undefined}
    >
      <P2Surface className="shrink-0 overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 px-6 py-5">
          <div className="text-[15px] font-semibold text-[var(--p2-text)]">
            USB Access
          </div>
          <P2Pill tone="teal" outline className="gap-1.5">
            <LoaderCircle className="h-3 w-3 animate-spin" />
            {state.usbControl.monitoringLabel}
          </P2Pill>
        </div>

        <div className="grid gap-px border-t border-[var(--p2-border)] bg-[var(--p2-border)] sm:grid-cols-2 xl:grid-cols-6">
          {state.usbControl.categories.map((category) => {
            return (
              <div
                key={category.id}
                className="flex min-h-[160px] flex-col justify-center bg-[var(--p2-panel)] px-5 py-5"
              >
                <div className="mb-4 flex justify-center">
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
                <div className="mt-4 flex items-center justify-center gap-3 text-sm text-[var(--p2-text-muted)]">
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
                onClick={() => {
                  setUsbTableView("files-written");
                  setFilesPage(0);
                }}
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
                onClick={() => {
                  setUsbTableView("recent-devices");
                  setRecentDevicesPage(0);
                }}
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
                  <option value="executables">Executables</option>
                  <option value="archives">Archives</option>
                  <option value="documents">Documents</option>
                </P2Select>
              </div>
              <div className="w-[140px]">
                <P2Select defaultValue="all-devices">
                  <option value="all-devices">Device</option>
                  <option value="managed-endpoints">Managed endpoints</option>
                  <option value="recent-usb">Recent USB devices</option>
                </P2Select>
              </div>
              <div className="w-[150px]">
                <P2Select defaultValue="last-week">
                  <option value="last-week">Last week</option>
                  <option value="today">Today</option>
                  <option value="last-30-days">Last 30 days</option>
                </P2Select>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex flex-1 flex-col">
            <div
              ref={tableViewportRef}
              className="min-h-0 flex-1 overflow-hidden"
            >
              {showingFiles ? (
                <P2Table
                  className="h-full"
                  tableClassName="table-fixed"
                  headers={[
                    "Date written",
                    "File name",
                    "File type detected",
                    "USB device name",
                    "Device ID",
                  ]}
                  colGroup={
                    <colgroup>
                      <col style={{ width: "220px" }} />
                      <col style={{ width: "300px" }} />
                      <col style={{ width: "190px" }} />
                      <col style={{ width: "280px" }} />
                      <col style={{ width: "260px" }} />
                    </colgroup>
                  }
                >
                  {paginatedFiles.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-[var(--p2-border)] text-[var(--p2-text)]"
                      style={{ height: tableRowHeight }}
                    >
                      <td className="px-4 align-middle text-[var(--p2-text-muted)]">
                        <div className="truncate">{row.writtenAt}</div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="truncate">{row.fileName}</div>
                      </td>
                      <td className="px-4 align-middle text-[var(--p2-text-muted)]">
                        <div className="truncate">{row.detectedType}</div>
                      </td>
                      <td className="px-4 align-middle text-[var(--p2-text-muted)]">
                        <div className="truncate">{row.usbDeviceName}</div>
                      </td>
                      <td className="px-4 align-middle text-[var(--p2-text-muted)]">
                        <div className="truncate">{row.deviceId}</div>
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: emptyFileRows }, (_, index) => (
                    <tr
                      key={`files-empty-${index}`}
                      aria-hidden="true"
                      className="border-t border-[var(--p2-border)] text-transparent"
                      style={{ height: tableRowHeight }}
                    >
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                    </tr>
                  ))}
                </P2Table>
              ) : (
                <P2Table
                  className="h-full"
                  tableClassName="table-fixed"
                  headers={[
                    "USB device",
                    "Vendor",
                    "Connected at",
                    "Last user",
                    "Device ID",
                    "Actions",
                  ]}
                  colGroup={
                    <colgroup>
                      <col style={{ width: "280px" }} />
                      <col style={{ width: "170px" }} />
                      <col style={{ width: "230px" }} />
                      <col style={{ width: "190px" }} />
                      <col style={{ width: "280px" }} />
                      <col style={{ width: "88px" }} />
                    </colgroup>
                  }
                >
                  {paginatedRecentDevices.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-[var(--p2-border)] text-[var(--p2-text)]"
                      style={{ height: tableRowHeight }}
                    >
                      <td className="px-4 align-middle">
                        <div className="truncate">{row.deviceName}</div>
                      </td>
                      <td className="px-4 align-middle text-[var(--p2-text-muted)]">
                        <div className="truncate">{row.vendor}</div>
                      </td>
                      <td className="px-4 align-middle text-[var(--p2-text-muted)]">
                        <div className="truncate">{row.connectedAt}</div>
                      </td>
                      <td className="px-4 align-middle text-[var(--p2-text-muted)]">
                        <div className="truncate">{row.lastUser}</div>
                      </td>
                      <td className="px-4 align-middle text-[var(--p2-text-muted)]">
                        <div className="truncate">{row.deviceId}</div>
                      </td>
                      <td className="px-4 align-middle">
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
                            { id: "copy-device-id", label: "Copy device ID" },
                            { id: "view-activity", label: "View recent activity" },
                            { id: "block-device", label: "Block device" },
                          ]}
                          onSelect={(actionId) => {
                            if (actionId === "allow-list" && !row.allowListed) {
                              allowListUsbDevice(row.id);
                              return;
                            }

                            if (
                              actionId === "copy-device-id" &&
                              typeof navigator !== "undefined" &&
                              navigator.clipboard
                            ) {
                              void navigator.clipboard.writeText(row.deviceId);
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: emptyRecentDeviceRows }, (_, index) => (
                    <tr
                      key={`recent-empty-${index}`}
                      aria-hidden="true"
                      className="border-t border-[var(--p2-border)] text-transparent"
                      style={{ height: tableRowHeight }}
                    >
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="truncate">.</div>
                      </td>
                    </tr>
                  ))}
                </P2Table>
              )}
            </div>
            {showingFiles ? (
              <UsbTablePagination
                page={clampedFilesPage}
                pageCount={filesPageCount}
                itemCount={state.usbControl.filesWritten.length}
                pageSize={tablePageSize}
                onPageChange={(page) =>
                  setFilesPage(Math.max(0, Math.min(page, filesPageCount - 1)))
                }
              />
            ) : (
              <UsbTablePagination
                page={clampedRecentDevicesPage}
                pageCount={recentDevicesPageCount}
                itemCount={state.usbControl.recentDevices.length}
                pageSize={tablePageSize}
                onPageChange={(page) =>
                  setRecentDevicesPage(
                    Math.max(0, Math.min(page, recentDevicesPageCount - 1)),
                  )
                }
              />
            )}
          </div>
        </div>
      </P2Surface>
    </div>
  );
}
