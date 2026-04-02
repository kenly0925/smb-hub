"use client";

import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { P2Button, P2Input, P2Menu, P2Select } from "@/components/prototype2/ui";
import { DeviceGroup, DeviceRecord } from "@/lib/prototype2/types";
import { cn } from "@/lib/utils";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { DM_Mono } from "next/font/google";
import {
  AlertTriangle,
  Check,
  Clock3,
  Folder,
  Minus,
  Move,
  Monitor,
  PencilRuler,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";

type ToolMode = "pan" | "draw";
type ResizeEdge = "left" | "right" | "top" | "bottom";
type EndpointKind =
  | "computer"
  | "desktop"
  | "laptop"
  | "mobile"
  | "server"
  | "vm";
type DetectionTone = "warning" | "danger" | null;
type SystemFilter = "all-systems" | "windows" | "apple" | "linux" | "others";
type SeverityFilter = "all-severities" | "danger" | "warning" | "no-detections";

type DraftGroup = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ResizeState = {
  groupId: string;
  edge: ResizeEdge;
  pointerX: number;
  pointerY: number;
  group: DeviceGroup;
};

type GroupDragState = {
  groupId: string;
  pointerX: number;
  pointerY: number;
  group: DeviceGroup;
};

type PendingGroupDragState = {
  groupId: string;
  pointerX: number;
  pointerY: number;
  group: DeviceGroup;
};

type DeviceDragState = {
  deviceId: string;
  pointerX: number;
  pointerY: number;
  group: DeviceGroup;
  item: PositionedDevice;
};

type PanState = {
  pointerX: number;
  pointerY: number;
  viewportX: number;
  viewportY: number;
};

type PositionedDevice = {
  device: DeviceRecord;
  x: number;
  y: number;
  endpointLabel: string;
  endpointKind: EndpointKind;
  detectionTone: DetectionTone;
};

const deviceCanvasMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const DEFAULT_ALL_DEVICES_GROUP = {
  x: 64,
  y: 60,
  width: 980,
  height: 500,
};

const ALL_DEVICES_CENTERED_SIZE = {
  width: 980,
  height: 540,
};
const ALL_DEVICES_CENTERED_CANVAS_MARGIN_X = 120;
const ALL_DEVICES_CENTERED_CANVAS_MARGIN_Y = 128;

const GROUP_MIN_WIDTH = 320;
const GROUP_MIN_HEIGHT = 240;
const ALL_DEVICES_MIN_WIDTH = 720;
const ALL_DEVICES_MIN_HEIGHT = 360;
const GROUP_CONTENT_TOP = 116;
const GROUP_CONTENT_BOTTOM = 42;
const DEVICE_HORIZONTAL_GAP = 164;
const DEVICE_VERTICAL_GAP = 146;
const DEVICE_SHELL_SIZE = 48;
const DEVICE_SHELL_RADIUS = 10;
const DEVICE_SHELL_HALF_SIZE = DEVICE_SHELL_SIZE / 2;
const DEVICE_BADGE_HEIGHT = 20;
const DEVICE_BADGE_OFFSET_Y = -48;
const DEVICE_LABEL_OFFSET_Y = 30;
const DEVICE_LABEL_WIDTH = 118;
const DEVICE_AUTO_LAYOUT_SIDE_PADDING = Math.ceil(DEVICE_LABEL_WIDTH / 2 + 10);
const DEVICE_AUTO_LAYOUT_BOTTOM_INSET = GROUP_CONTENT_BOTTOM + 14;
const DEVICE_STATUS_DOT_X = DEVICE_SHELL_HALF_SIZE - 1;
const DEVICE_STATUS_DOT_Y = -DEVICE_SHELL_HALF_SIZE + 1;
const DEVICE_TOOLTIP_WIDTH = 248;
const DEVICE_TOOLTIP_ESTIMATED_HEIGHT = 126;
const DEVICE_TOOLTIP_ARROW_DEPTH = 9;
const RESIZE_HIT_SIZE = 12;
const GROUP_DRAG_THRESHOLD = 6;
const MIN_SCALE = 0.72;
const MAX_SCALE = 2.2;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function truncateDeviceLabel(name: string) {
  if (name.length <= 20) {
    return name;
  }

  return `${name.slice(0, 17)}...`;
}

function getEndpointDescriptor(device: DeviceRecord) {
  const normalizedName = device.name.toUpperCase();

  if (normalizedName.includes("VM") || normalizedName.includes("VIRTUAL")) {
    return {
      endpointLabel: "Virtual machine",
      endpointKind: "vm" as EndpointKind,
    };
  }

  if (device.type === "Mobile") {
    return {
      endpointLabel: "Mobile",
      endpointKind: "mobile" as EndpointKind,
    };
  }

  if (device.type === "Server") {
    return {
      endpointLabel: "Server",
      endpointKind: "server" as EndpointKind,
    };
  }

  if (normalizedName.includes("LAPTOP")) {
    return {
      endpointLabel: "Laptop",
      endpointKind: "laptop" as EndpointKind,
    };
  }

  if (normalizedName.includes("DESKTOP")) {
    return {
      endpointLabel: "Desktop",
      endpointKind: "desktop" as EndpointKind,
    };
  }

  return {
    endpointLabel: "Computer",
    endpointKind: "computer" as EndpointKind,
  };
}

function getDeviceDetectionTone(device: DeviceRecord): DetectionTone {
  if (device.firstDetected) {
    return "danger";
  }

  if (device.status === "Connected recently") {
    return "warning";
  }

  return null;
}

function matchesSystemFilter(device: DeviceRecord, filter: SystemFilter) {
  if (filter === "all-systems") {
    return true;
  }

  if (filter === "windows") {
    return device.os === "Windows";
  }

  if (filter === "apple") {
    return device.os === "MacOS" || device.os === "iOS";
  }

  if (filter === "linux") {
    return device.os === "Linux";
  }

  return !["Windows", "MacOS", "iOS", "Linux"].includes(device.os);
}

function matchesSeverityFilter(device: DeviceRecord, filter: SeverityFilter) {
  const detectionTone = getDeviceDetectionTone(device);

  if (filter === "all-severities") {
    return true;
  }

  if (filter === "danger") {
    return detectionTone === "danger";
  }

  if (filter === "warning") {
    return detectionTone === "warning";
  }

  return detectionTone === null;
}

function isDefaultAllDevicesGroup(group: DeviceGroup) {
  return (
    group.id === "all-devices" &&
    group.x === DEFAULT_ALL_DEVICES_GROUP.x &&
    group.y === DEFAULT_ALL_DEVICES_GROUP.y &&
    group.width === DEFAULT_ALL_DEVICES_GROUP.width &&
    group.height === DEFAULT_ALL_DEVICES_GROUP.height
  );
}

function getCenteredDefaultGroup(
  group: DeviceGroup,
  canvasSize: { width: number; height: number },
) {
  if (!isDefaultAllDevicesGroup(group)) {
    return group;
  }

  const width = Math.min(
    ALL_DEVICES_CENTERED_SIZE.width,
    Math.max(
      ALL_DEVICES_MIN_WIDTH,
      canvasSize.width - ALL_DEVICES_CENTERED_CANVAS_MARGIN_X,
    ),
  );
  const height = Math.min(
    ALL_DEVICES_CENTERED_SIZE.height,
    Math.max(
      ALL_DEVICES_MIN_HEIGHT,
      canvasSize.height - ALL_DEVICES_CENTERED_CANVAS_MARGIN_Y,
    ),
  );

  return {
    ...group,
    width,
    height,
    x: Math.round((canvasSize.width - width) / 2),
    y: Math.max(64, Math.round((canvasSize.height - height) / 2)),
  };
}

function getGroupMinimums(groupId: string) {
  if (groupId === "all-devices") {
    return {
      minWidth: ALL_DEVICES_MIN_WIDTH,
      minHeight: ALL_DEVICES_MIN_HEIGHT,
    };
  }

  return {
    minWidth: GROUP_MIN_WIDTH,
    minHeight: GROUP_MIN_HEIGHT,
  };
}

function getResizedGroup(
  group: DeviceGroup,
  edge: ResizeEdge,
  deltaX: number,
  deltaY: number,
) {
  const { minWidth, minHeight } = getGroupMinimums(group.id);
  const nextGroup = { ...group };

  if (edge === "left") {
    const nextWidth = Math.max(minWidth, group.width - deltaX);
    nextGroup.x = group.x + (group.width - nextWidth);
    nextGroup.width = nextWidth;
  }

  if (edge === "right") {
    nextGroup.width = Math.max(minWidth, group.width + deltaX);
  }

  if (edge === "top") {
    const nextHeight = Math.max(minHeight, group.height - deltaY);
    nextGroup.y = group.y + (group.height - nextHeight);
    nextGroup.height = nextHeight;
  }

  if (edge === "bottom") {
    nextGroup.height = Math.max(minHeight, group.height + deltaY);
  }

  return nextGroup;
}

function getResizeCursor(edge: ResizeEdge) {
  if (edge === "left" || edge === "right") {
    return "ew-resize";
  }

  return "ns-resize";
}

function getZoomedViewport(
  viewport: { x: number; y: number; scale: number },
  nextScale: number,
  anchor: { x: number; y: number },
) {
  const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

  if (clampedScale === viewport.scale) {
    return viewport;
  }

  const worldPoint = {
    x: (anchor.x - viewport.x) / viewport.scale,
    y: (anchor.y - viewport.y) / viewport.scale,
  };

  return {
    scale: clampedScale,
    x: anchor.x - worldPoint.x * clampedScale,
    y: anchor.y - worldPoint.y * clampedScale,
  };
}

function clampDevicePosition(group: DeviceGroup, position: { x: number; y: number }) {
  return {
    x: clamp(
      position.x,
      DEVICE_SHELL_HALF_SIZE + 10,
      Math.max(DEVICE_SHELL_HALF_SIZE + 10, group.width - DEVICE_SHELL_HALF_SIZE - 10),
    ),
    y: clamp(
      position.y,
      GROUP_CONTENT_TOP + 8,
      Math.max(GROUP_CONTENT_TOP + 8, group.height - GROUP_CONTENT_BOTTOM - 14),
    ),
  };
}

function getPositionedDevices(group: DeviceGroup, devices: DeviceRecord[]) {
  const inGroup = devices.filter((device) => device.groupId === group.id);
  const maxColumns = group.id === "all-devices" ? 5 : 3;
  const maxFittableColumns =
    Math.floor(
      Math.max(0, group.width - DEVICE_AUTO_LAYOUT_SIDE_PADDING * 2) /
        DEVICE_HORIZONTAL_GAP,
    ) + 1;
  const columns = Math.max(
    1,
    Math.min(
      inGroup.length,
      maxColumns,
      maxFittableColumns,
    ),
  );
  const usedWidth = columns > 1 ? (columns - 1) * DEVICE_HORIZONTAL_GAP : 0;
  const startX = Math.round(group.width / 2 - usedWidth / 2);
  const rowCount = Math.max(1, Math.ceil(inGroup.length / columns));
  const availableHeight = Math.max(
    80,
    group.height - GROUP_CONTENT_TOP - DEVICE_AUTO_LAYOUT_BOTTOM_INSET,
  );
  const verticalGap =
    rowCount > 1
      ? Math.min(
          DEVICE_VERTICAL_GAP,
          Math.max(92, Math.floor(availableHeight / (rowCount - 1))),
        )
      : 0;

  return inGroup.map((device, index) => {
    const { endpointKind, endpointLabel } = getEndpointDescriptor(device);
    const column = index % columns;
    const row = Math.floor(index / columns);
    const autoPosition = clampDevicePosition(group, {
      x: startX + column * DEVICE_HORIZONTAL_GAP,
      y: GROUP_CONTENT_TOP + row * verticalGap,
    });
    const resolvedPosition = device.positionPinned
      ? clampDevicePosition(group, {
          x: device.x,
          y: device.y,
        })
      : autoPosition;

    return {
      device,
      x: resolvedPosition.x,
      y: resolvedPosition.y,
      endpointKind,
      endpointLabel,
      detectionTone: getDeviceDetectionTone(device),
    } satisfies PositionedDevice;
  });
}

function PrimaryToolButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[4px] text-sm transition",
          active
            ? "bg-[var(--p2-button-primary-bg)] text-[var(--p2-button-primary-text)]"
            : "bg-transparent text-[var(--p2-text-muted)] hover:bg-[var(--p2-surface)] hover:text-[var(--p2-text-soft)]",
        )}
        aria-label={label}
      >
        {children}
      </button>
      <div
        className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-[var(--p2-radius-popover)] px-3 py-2 text-[11px] font-medium text-[var(--p2-text-soft)] shadow-[var(--p2-shadow-popover)] group-hover:block"
        style={{ backgroundColor: "var(--p2-popover-bg)" }}
      >
        {label}
        <span
          className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45"
          style={{ backgroundColor: "var(--p2-popover-bg)" }}
        />
      </div>
    </div>
  );
}

function EndpointIcon({
  kind,
  color,
}: {
  kind: EndpointKind;
  color: string;
}) {
  let content: React.ReactNode;

  if (kind === "mobile") {
    content = (
      <>
        <Rect
          x={-6.5}
          y={-12}
          width={13}
          height={24}
          cornerRadius={4}
          stroke={color}
          strokeWidth={1.6}
        />
        <Circle x={0} y={7.5} radius={1.5} fill={color} />
        <Line points={[-3.5, -8.5, 3.5, -8.5]} stroke={color} strokeWidth={1.4} />
      </>
    );
  }
  else if (kind === "server") {
    content = (
      <>
        {[-11, -2, 7].map((offset, index) => (
          <Rect
            key={offset}
            x={-13}
            y={offset}
            width={26}
            height={6.5}
            cornerRadius={3}
            stroke={color}
            strokeWidth={1.4}
            fill={index === 1 ? `${color}12` : undefined}
          />
        ))}
        <Circle x={8} y={-8} radius={1.3} fill={color} />
        <Circle x={8} y={1} radius={1.3} fill={color} />
        <Circle x={8} y={10} radius={1.3} fill={color} />
      </>
    );
  }
  else if (kind === "vm") {
    content = (
      <>
        <Rect
          x={-13}
          y={-10.5}
          width={26}
          height={17}
          cornerRadius={4}
          stroke={color}
          strokeWidth={1.6}
        />
        <Rect
          x={-6.5}
          y={-4.5}
          width={13}
          height={9}
          cornerRadius={2}
          stroke={color}
          strokeWidth={1.2}
        />
        <Line points={[-3.5, 9, 3.5, 9]} stroke={color} strokeWidth={1.4} />
        <Line points={[0, 6.5, 0, 10.5]} stroke={color} strokeWidth={1.4} />
      </>
    );
  }
  else if (kind === "laptop") {
    content = (
      <>
        <Rect
          x={-11}
          y={-10}
          width={22}
          height={13}
          cornerRadius={3}
          stroke={color}
          strokeWidth={1.6}
        />
        <Line
          points={[-13, 6.5, 13, 6.5, 10, 9.5, -10, 9.5, -13, 6.5]}
          closed
          stroke={color}
          strokeWidth={1.4}
        />
      </>
    );
  }
  else if (kind === "desktop") {
    content = (
      <>
        <Rect
          x={-12}
          y={-10}
          width={18}
          height={14}
          cornerRadius={3}
          stroke={color}
          strokeWidth={1.6}
        />
        <Rect
          x={8}
          y={-7}
          width={5.5}
          height={14}
          cornerRadius={2}
          stroke={color}
          strokeWidth={1.4}
        />
        <Line points={[-1, 6.5, -1, 10.5]} stroke={color} strokeWidth={1.4} />
        <Line points={[-6.5, 10.5, 4.5, 10.5]} stroke={color} strokeWidth={1.4} />
      </>
    );
  }
  else {
    content = (
      <>
      <Rect
        x={-13}
        y={-10.5}
        width={26}
        height={17}
        cornerRadius={3}
        stroke={color}
        strokeWidth={1.6}
      />
      <Line points={[-3.5, 9, 3.5, 9]} stroke={color} strokeWidth={1.4} />
      <Line points={[0, 6.5, 0, 10.5]} stroke={color} strokeWidth={1.4} />
      </>
    );
  }

  return (
    <Group x={kind === "desktop" ? -0.75 : 0} y={1}>
      {content}
    </Group>
  );
}

export function DeviceGroupCanvas({
  theme,
}: {
  theme: "light" | "dark";
}) {
  const {
    state,
    createDeviceGroup,
    deleteDeviceGroup,
    renameDeviceGroup,
    setDeviceGroupRestricted,
    updateDevicePlacements,
    updateDeviceGroupLayout,
  } = usePrototype2Demo();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<KonvaStage | null>(null);
  const hoveredTooltipRef = useRef<HTMLDivElement | null>(null);
  const createdGroupSequenceRef = useRef(0);
  const [tool, setTool] = useState<ToolMode>("pan");
  const [selectedGroupId, setSelectedGroupId] = useState("all-devices");
  const [draftGroup, setDraftGroup] = useState<DraftGroup | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 560 });
  const [viewport, setViewport] = useState(state.deviceGroups.viewport);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const [hoveredDeviceId, setHoveredDeviceId] = useState<string | null>(null);
  const [hoveredResizeEdge, setHoveredResizeEdge] = useState<{
    groupId: string;
    edge: ResizeEdge;
  } | null>(null);
  const [draggingGroupId, setDraggingGroupId] = useState<string | null>(null);
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [pendingGroupDrag, setPendingGroupDrag] = useState<PendingGroupDragState | null>(null);
  const [deviceDragState, setDeviceDragState] = useState<DeviceDragState | null>(null);
  const [deviceDragPreview, setDeviceDragPreview] = useState<{
    deviceId: string;
    x: number;
    y: number;
  } | null>(null);
  const [stageDragging, setStageDragging] = useState(false);
  const [groupDragState, setGroupDragState] = useState<GroupDragState | null>(null);
  const [groupDragPreview, setGroupDragPreview] = useState<DeviceGroup | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [resizePreview, setResizePreview] = useState<DeviceGroup | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [draftGroupName, setDraftGroupName] = useState("");
  const [systemFilter, setSystemFilter] = useState<SystemFilter>("all-systems");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all-severities");
  const [deleteTargetGroupId, setDeleteTargetGroupId] = useState<string | null>(null);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const [hoveredTooltipHeight, setHoveredTooltipHeight] = useState(
    DEVICE_TOOLTIP_ESTIMATED_HEIGHT,
  );
  const panStateRef = useRef<PanState | null>(null);
  const isDark = theme === "dark";
  const canvasBackground = isDark ? "#101012" : "#ffffff";
  const dotColor = isDark ? "rgba(82, 82, 91, 0.34)" : "rgba(161, 161, 170, 0.28)";
  const canvasBorderColor = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(24, 24, 27, 0.08)";
  const editInputClass = isDark
    ? "border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-500"
    : "border-zinc-200 bg-white text-zinc-900 focus:border-[var(--p2-button-primary-border)]";
  const primaryStroke = "#60a5fa";
  const destructiveStroke = "#ff4d57";
  const groupStroke = isDark ? "rgba(212, 212, 216, 0.26)" : "rgba(161, 161, 170, 0.86)";
  const groupFill = isDark ? "rgba(39, 39, 42, 0.76)" : "rgba(244, 244, 245, 0.84)";
  const groupSelectedFill = isDark
    ? "rgba(39, 39, 42, 0.82)"
    : "rgba(244, 244, 245, 0.9)";
  const restrictedGroupFill = "rgba(255, 77, 87, 0.2)";
  const restrictedGroupSelectedFill = "rgba(255, 77, 87, 0.24)";
  const groupNameColor = isDark ? "#f4f4f5" : "#18181b";
  const groupMetaColor = isDark ? "#a1a1aa" : "#71717a";
  const deviceNameColor = isDark ? "#e4e4e7" : "#27272a";
  const deviceIconColor = isDark ? "#d4d4d8" : "#52525b";
  const deviceBadgeFill = isDark
    ? "rgba(24, 24, 27, 0.9)"
    : "rgba(255, 255, 255, 0.94)";
  const deviceBadgeStroke = isDark
    ? "rgba(255, 255, 255, 0.09)"
    : "rgba(24, 24, 27, 0.08)";
  const deviceBadgeText = isDark ? "#d4d4d8" : "#52525b";
  const deviceShellFill = isDark
    ? "rgba(24, 24, 27, 0.94)"
    : "rgba(255, 255, 255, 0.96)";
  const deviceShellStroke = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(24, 24, 27, 0.08)";
  const warningDot = "#fbbf24";
  const dangerDot = "#fb7185";
  const tooltipBackground = isDark ? "var(--p2-popover-bg)" : "var(--p2-panel)";
  const toolbarDivider = "bg-[var(--p2-border)]";
  const isInteracting =
    draggingGroupId !== null ||
    draggingDeviceId !== null ||
    pendingGroupDrag !== null ||
    deviceDragState !== null ||
    groupDragState !== null ||
    resizeState !== null;
  const filterShellClass = isDark
    ? "border-[var(--p2-border)] bg-[var(--p2-panel)]/95"
    : "border-[var(--p2-border)] bg-[var(--p2-panel)]/96";
  const modalPanelClass = isDark
    ? "border-[var(--p2-border)] bg-[var(--p2-panel)]"
    : "border-[var(--p2-border)] bg-white";

  useEffect(() => {
    function updateCanvasSize() {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      setCanvasSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    updateCanvasSize();

    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        setTool("pan");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const displayGroups = useMemo(() => {
    return state.deviceGroups.groups
      .map((group) => {
        const centered = getCenteredDefaultGroup(group, canvasSize);

        if (groupDragPreview?.id === group.id) {
          return groupDragPreview;
        }

        if (resizePreview?.id === group.id) {
          return resizePreview;
        }

        return centered;
      });
  }, [canvasSize, groupDragPreview, resizePreview, state.deviceGroups.groups]);

  const filteredDevices = useMemo(
    () =>
      state.devices.items.filter(
        (device) =>
          matchesSystemFilter(device, systemFilter) &&
          matchesSeverityFilter(device, severityFilter),
      ),
    [severityFilter, state.devices.items, systemFilter],
  );

  const devicesByGroup = useMemo(() => {
    const entries = new Map<string, PositionedDevice[]>();

    for (const group of displayGroups) {
      entries.set(group.id, getPositionedDevices(group, filteredDevices));
    }

    return entries;
  }, [displayGroups, filteredDevices]);

  const editingGroup = useMemo(
    () => displayGroups.find((group) => group.id === editingGroupId) ?? null,
    [displayGroups, editingGroupId],
  );
  const deleteTargetGroup = useMemo(
    () => displayGroups.find((group) => group.id === deleteTargetGroupId) ?? null,
    [deleteTargetGroupId, displayGroups],
  );
  const hoveredDeviceOverlay = (() => {
    if (!hoveredDeviceId || draggingDeviceId || groupDragState || resizeState || stageDragging) {
      return null;
    }

    for (const group of displayGroups) {
      const item = (devicesByGroup.get(group.id) ?? []).find(
        (candidate) => candidate.device.id === hoveredDeviceId,
      );

      if (!item) {
        continue;
      }

      const screenX = viewport.x + (group.x + item.x) * viewport.scale;
      const screenY = viewport.y + (group.y + item.y) * viewport.scale;
      const badgeTop = screenY + DEVICE_BADGE_OFFSET_Y * viewport.scale;
      const left = clamp(
        screenX - DEVICE_TOOLTIP_WIDTH / 2,
        12,
        Math.max(12, canvasSize.width - DEVICE_TOOLTIP_WIDTH - 12),
      );
      const top = clamp(
        badgeTop - hoveredTooltipHeight - DEVICE_TOOLTIP_ARROW_DEPTH,
        12,
        Math.max(12, canvasSize.height - hoveredTooltipHeight - 24),
      );

      return {
        item,
        group,
        left,
        top,
        arrowLeft: clamp(screenX - left, 18, DEVICE_TOOLTIP_WIDTH - 18),
      };
    }

    return null;
  })();

  useLayoutEffect(() => {
    if (!hoveredDeviceOverlay) {
      return;
    }

    const nextHeight = hoveredTooltipRef.current?.getBoundingClientRect().height;

    if (!nextHeight) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setHoveredTooltipHeight((current) =>
        Math.abs(current - nextHeight) < 1 ? current : nextHeight,
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hoveredDeviceOverlay]);

  const editingOverlay = useMemo(() => {
    if (!editingGroup) {
      return null;
    }

    const rawLeft = editingGroup.x * viewport.scale + viewport.x + 16;
    const top = editingGroup.y * viewport.scale + viewport.y + 10;
    const left = Math.min(Math.max(12, rawLeft), Math.max(12, canvasSize.width - 220));
    const groupWidth = Math.max(140, editingGroup.width * viewport.scale - 24);
    const maxAllowedWidth = Math.max(140, canvasSize.width - left - 16);
    const width = Math.min(groupWidth, maxAllowedWidth);
    const compact = width < 245;

    return {
      left,
      top: Math.min(Math.max(12, top), Math.max(12, canvasSize.height - 44)),
      width,
      compact,
    };
  }, [canvasSize.height, canvasSize.width, editingGroup, viewport]);

  const cursor = useMemo(() => {
    if (resizeState) {
      return getResizeCursor(resizeState.edge);
    }

    if (hoveredResizeEdge) {
      return getResizeCursor(hoveredResizeEdge.edge);
    }

    if (draggingGroupId || draggingDeviceId || stageDragging) {
      return "grabbing";
    }

    if (tool === "draw") {
      return "crosshair";
    }

    if (hoveredDeviceId || hoveredGroupId) {
      return "grab";
    }

    return "default";
  }, [
    draggingDeviceId,
    draggingGroupId,
    hoveredDeviceId,
    hoveredGroupId,
    hoveredResizeEdge,
    resizeState,
    stageDragging,
    tool,
  ]);
  const canConfirmDelete = deleteConfirmValue.trim() === "DELETE";

  useEffect(() => {
    const stageContainer = stageRef.current?.container();

    if (!stageContainer) {
      return;
    }

    stageContainer.style.cursor = cursor;

    return () => {
      stageContainer.style.cursor = "";
    };
  }, [cursor]);

  function commitRename() {
    if (!editingGroupId) {
      return;
    }

    const trimmedName = draftGroupName.trim();

    if (trimmedName) {
      renameDeviceGroup(editingGroupId, trimmedName);
    }

    setEditingGroupId(null);
    setDraftGroupName("");
  }

  function beginEditingGroup(group: DeviceGroup) {
    setEditingGroupId(group.id);
    setDraftGroupName(group.name);
    setSelectedGroupId(group.id);
    setDraggingGroupId(null);
    setDraggingDeviceId(null);
    setPendingGroupDrag(null);
    setDeviceDragState(null);
    setDeviceDragPreview(null);
    setGroupDragState(null);
    setGroupDragPreview(null);
  }

  function setStageDragEnabled(enabled: boolean) {
    const stage = stageRef.current;

    if (!enabled) {
      panStateRef.current = null;
      setStageDragging(false);
    }

    if (!stage) {
      return;
    }

    if (!enabled) {
      stage.stopDrag();
    }
  }

  function getPointerPosition() {
    const stage = stageRef.current;

    if (!stage) {
      return null;
    }

    return stage.getRelativePointerPosition();
  }

  function beginPendingGroupDrag(
    event: KonvaEventObject<MouseEvent>,
    group: DeviceGroup,
  ) {
    if (tool !== "pan" || resizeState || deviceDragState || groupDragState) {
      return;
    }

    event.cancelBubble = true;
    setStageDragEnabled(false);
    const pointer = getPointerPosition();

    if (!pointer) {
      return;
    }

    setSelectedGroupId(group.id);
    setPendingGroupDrag({
      groupId: group.id,
      pointerX: pointer.x,
      pointerY: pointer.y,
      group,
    });
  }

  function zoomCanvas(delta: number) {
    setViewport((current) =>
      getZoomedViewport(current, current.scale + delta, {
        x: canvasSize.width / 2,
        y: canvasSize.height / 2,
      }),
    );
  }

  function openDeleteDialog(groupId: string) {
    setDeleteTargetGroupId(groupId);
    setDeleteConfirmValue("");
  }

  function handleGroupMenuAction(group: DeviceGroup, actionId: string) {
    if (actionId === "rename") {
      beginEditingGroup(group);
      return;
    }

    if (actionId === "center") {
      updateDeviceGroupLayout(group.id, {
        x: Math.round((canvasSize.width / 2 - viewport.x) / viewport.scale - group.width / 2),
        y: Math.round((canvasSize.height / 2 - viewport.y) / viewport.scale - group.height / 2),
      });
      setSelectedGroupId(group.id);
      return;
    }

    if (actionId === "toggle-restricted") {
      setDeviceGroupRestricted(group.id, !group.restricted);
      setSelectedGroupId(group.id);
      return;
    }

    if (actionId === "delete") {
      openDeleteDialog(group.id);
    }
  }

  function closeDeleteDialog() {
    setDeleteTargetGroupId(null);
    setDeleteConfirmValue("");
  }

  function confirmDeleteGroup() {
    if (!deleteTargetGroupId || !canConfirmDelete) {
      return;
    }

    deleteDeviceGroup(deleteTargetGroupId);
    setSelectedGroupId("all-devices");
    setEditingGroupId((current) => (current === deleteTargetGroupId ? null : current));
    setHoveredGroupId((current) => (current === deleteTargetGroupId ? null : current));
    setHoveredResizeEdge((current) =>
      current?.groupId === deleteTargetGroupId ? null : current,
    );
    setDraggingGroupId((current) => (current === deleteTargetGroupId ? null : current));
    setPendingGroupDrag((current) =>
      current?.groupId === deleteTargetGroupId ? null : current,
    );
    setGroupDragState((current) =>
      current?.groupId === deleteTargetGroupId ? null : current,
    );
    setGroupDragPreview((current) =>
      current?.id === deleteTargetGroupId ? null : current,
    );
    closeDeleteDialog();
  }

  function handleStageMouseDown(event: KonvaEventObject<MouseEvent>) {
    const stage = event.target.getStage();

    if (!stage || event.target !== stage) {
      return;
    }

    if (tool === "pan" && !isInteracting) {
      const pointer = stage.getPointerPosition();

      if (!pointer) {
        return;
      }

      panStateRef.current = {
        pointerX: pointer.x,
        pointerY: pointer.y,
        viewportX: viewport.x,
        viewportY: viewport.y,
      };
      setStageDragging(true);
      return;
    }

    if (tool !== "draw") {
      return;
    }

    const position = stage.getRelativePointerPosition();

    if (!position) {
      return;
    }

    setDraftGroup({
      x: position.x,
      y: position.y,
      width: 0,
      height: 0,
    });
  }

  function handleStageMouseMove() {
    if (pendingGroupDrag) {
      const pointer = getPointerPosition();

      if (!pointer) {
        return;
      }

      const deltaX = pointer.x - pendingGroupDrag.pointerX;
      const deltaY = pointer.y - pendingGroupDrag.pointerY;

      if (Math.hypot(deltaX, deltaY) < GROUP_DRAG_THRESHOLD) {
        return;
      }

      setDraggingGroupId(pendingGroupDrag.groupId);
      setGroupDragState(pendingGroupDrag);
      setGroupDragPreview({
        ...pendingGroupDrag.group,
        x: pendingGroupDrag.group.x + deltaX,
        y: pendingGroupDrag.group.y + deltaY,
      });
      setPendingGroupDrag(null);
      return;
    }

    if (groupDragState) {
      const pointer = getPointerPosition();

      if (!pointer) {
        return;
      }

      setGroupDragPreview({
        ...groupDragState.group,
        x: groupDragState.group.x + (pointer.x - groupDragState.pointerX),
        y: groupDragState.group.y + (pointer.y - groupDragState.pointerY),
      });
      return;
    }

    if (deviceDragState) {
      const pointer = getPointerPosition();

      if (!pointer) {
        return;
      }

      setDeviceDragPreview({
        deviceId: deviceDragState.deviceId,
        x: deviceDragState.item.x + (pointer.x - deviceDragState.pointerX),
        y: deviceDragState.item.y + (pointer.y - deviceDragState.pointerY),
      });
      return;
    }

    if (resizeState) {
      const pointer = getPointerPosition();

      if (!pointer) {
        return;
      }

      setResizePreview(
        getResizedGroup(
          resizeState.group,
          resizeState.edge,
          pointer.x - resizeState.pointerX,
          pointer.y - resizeState.pointerY,
        ),
      );
      return;
    }

    const panState = panStateRef.current;

    if (panState) {
      const pointer = stageRef.current?.getPointerPosition();

      if (!pointer) {
        return;
      }

      setViewport((current) => ({
        ...current,
        x: panState.viewportX + (pointer.x - panState.pointerX),
        y: panState.viewportY + (pointer.y - panState.pointerY),
      }));
      return;
    }

    if (!draftGroup) {
      return;
    }

    const pointer = getPointerPosition();

    if (!pointer) {
      return;
    }

    setDraftGroup((current) =>
      current
        ? {
            x: Math.min(current.x, pointer.x),
            y: Math.min(current.y, pointer.y),
            width: Math.abs(pointer.x - current.x),
            height: Math.abs(pointer.y - current.y),
          }
        : null,
    );
  }

  function handleStageMouseUp() {
    if (panStateRef.current) {
      panStateRef.current = null;
      setStageDragging(false);
      return;
    }

    if (pendingGroupDrag) {
      setPendingGroupDrag(null);
      return;
    }

    if (deviceDragState) {
      const preview = deviceDragPreview ?? {
        deviceId: deviceDragState.deviceId,
        x: deviceDragState.item.x,
        y: deviceDragState.item.y,
      };
      const absolutePosition = {
        x: deviceDragState.group.x + preview.x,
        y: deviceDragState.group.y + preview.y,
      };
      const targetGroup =
        displayGroups.find(
          (candidate) =>
            absolutePosition.x >= candidate.x &&
            absolutePosition.x <= candidate.x + candidate.width &&
            absolutePosition.y >= candidate.y &&
            absolutePosition.y <= candidate.y + candidate.height,
        ) ?? deviceDragState.group;
      const targetPosition = clampDevicePosition(targetGroup, {
        x: absolutePosition.x - targetGroup.x,
        y: absolutePosition.y - targetGroup.y,
      });

      updateDevicePlacements([{
        id: deviceDragState.deviceId,
        groupId: targetGroup.id,
        x: targetPosition.x,
        y: targetPosition.y,
        positionPinned: true,
      }]);
      setSelectedGroupId(targetGroup.id);
      setDraggingDeviceId(null);
      setDeviceDragState(null);
      setDeviceDragPreview(null);
      return;
    }

    if (groupDragState) {
      if (groupDragPreview) {
        updateDeviceGroupLayout(groupDragState.groupId, {
          x: groupDragPreview.x,
          y: groupDragPreview.y,
        });
      }

      setDraggingGroupId(null);
      setGroupDragState(null);
      setGroupDragPreview(null);
      return;
    }

    if (resizeState) {
      if (resizePreview) {
        updateDeviceGroupLayout(resizeState.groupId, {
          x: resizePreview.x,
          y: resizePreview.y,
          width: resizePreview.width,
          height: resizePreview.height,
        });
      }

      setResizeState(null);
      setResizePreview(null);
      return;
    }

    if (!draftGroup) {
      return;
    }

    if (draftGroup.width > 120 && draftGroup.height > 100) {
      const id = `group-${state.deviceGroups.groups.length + createdGroupSequenceRef.current}`;
      createdGroupSequenceRef.current += 1;
      createDeviceGroup({
        id,
        name: `New group ${state.deviceGroups.groups.length}`,
        ...draftGroup,
        restricted: false,
      });
      setSelectedGroupId(id);
      setEditingGroupId(id);
      setDraftGroupName(`New group ${state.deviceGroups.groups.length}`);
      setTool("pan");
    }

    setDraftGroup(null);
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-hidden rounded-[var(--p2-radius-card)] border"
      style={{
        backgroundColor: canvasBackground,
        borderColor: canvasBorderColor,
        cursor,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-55"
        style={{
          backgroundColor: canvasBackground,
          backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
      />

      <div className="absolute left-6 top-6 z-20 font-sans text-[15px] font-semibold leading-none text-[var(--p2-text)]">
        Devices
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        {displayGroups.map((group) => {
          const left = viewport.x + (group.x + group.width) * viewport.scale - 52;
          const top = viewport.y + group.y * viewport.scale + 10;
          const menuItems =
            group.id === "all-devices"
              ? [
                  { id: "rename", label: "Rename group" },
                  { id: "center", label: "Center group" },
                ]
              : [
                  { id: "rename", label: "Rename group" },
                  { id: "center", label: "Center group" },
                  {
                    id: "toggle-restricted",
                    label: group.restricted
                      ? "Disable restricted zone"
                      : "Enable restricted zone",
                    checked: group.restricted,
                    tone: "danger" as const,
                  },
                  { id: "delete", label: "Delete group", tone: "danger" as const },
                ];

          return (
            <div
              key={`menu-${group.id}`}
              className="pointer-events-auto absolute"
              style={{ left, top }}
            >
              <P2Menu
                align="right"
                items={menuItems}
                onSelect={(actionId) => handleGroupMenuAction(group, actionId)}
              />
            </div>
          );
        })}
      </div>

      {hoveredDeviceOverlay ? (
        <div
          ref={hoveredTooltipRef}
          className={cn(
            deviceCanvasMono.className,
            "pointer-events-none absolute z-50 w-[248px] rounded-[var(--p2-radius-popover)] px-4 py-3 text-left shadow-[var(--p2-shadow-popover)] backdrop-blur-sm",
          )}
          style={{
            left: hoveredDeviceOverlay.left,
            top: hoveredDeviceOverlay.top,
            backgroundColor: tooltipBackground,
          }}
        >
          <div className="text-sm font-semibold leading-5 text-[var(--p2-text-soft)]">
            {hoveredDeviceOverlay.item.device.name}
          </div>
          <div
            className="mt-3 flex items-center gap-2 text-xs font-medium"
            style={{
              color:
                hoveredDeviceOverlay.item.detectionTone === "danger"
                  ? dangerDot
                  : hoveredDeviceOverlay.item.detectionTone === "warning"
                    ? warningDot
                    : "var(--p2-text)",
            }}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {hoveredDeviceOverlay.item.detectionTone === "danger"
              ? "Danger severity signal"
              : hoveredDeviceOverlay.item.detectionTone === "warning"
                ? "Warning severity signal"
                : "No associated detections"}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-[var(--p2-text-muted)]">
            <Monitor className="h-3.5 w-3.5" />
            {hoveredDeviceOverlay.item.endpointLabel} endpoint on{" "}
            {hoveredDeviceOverlay.item.device.os}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--p2-text-muted)]">
            <Folder className="h-3.5 w-3.5" />
            Group {hoveredDeviceOverlay.group.name}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--p2-text-muted)]">
            <Clock3 className="h-3.5 w-3.5" />
            {hoveredDeviceOverlay.item.device.status} - Last seen{" "}
            {hoveredDeviceOverlay.item.device.lastSeen}
          </div>
          <span
            className="absolute top-full h-3 w-3 -translate-y-1/2 rotate-45"
            style={{
              left: hoveredDeviceOverlay.arrowLeft,
              backgroundColor: tooltipBackground,
            }}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "absolute left-1/2 top-5 z-20 flex w-[420px] max-w-[calc(100%-220px)] -translate-x-1/2 items-center gap-3 rounded-[6px] border px-3 py-2 shadow-[var(--p2-shadow-popover)] backdrop-blur-sm",
          filterShellClass,
        )}
      >
        <div className="min-w-0 flex-1">
          <P2Select
            value={systemFilter}
            onChange={(event) => setSystemFilter(event.target.value as SystemFilter)}
          >
            <option value="all-systems">All systems</option>
            <option value="windows">Windows</option>
            <option value="apple">Apple</option>
            <option value="linux">Linux</option>
            <option value="others">Others</option>
          </P2Select>
        </div>
        <div className="min-w-0 flex-1">
          <P2Select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value as SeverityFilter)
            }
          >
            <option value="all-severities">All severities</option>
            <option value="danger">Danger</option>
            <option value="warning">Warning</option>
            <option value="no-detections">No detections</option>
          </P2Select>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-[6px] border border-[var(--p2-border)] bg-[var(--p2-panel)]/95 px-2 py-1.5 shadow-[var(--p2-shadow-popover)] backdrop-blur-sm">
        <PrimaryToolButton
          active={tool === "pan"}
          onClick={() => setTool("pan")}
          label="Pan canvas"
        >
          <Move className="h-4 w-4" />
        </PrimaryToolButton>
        <PrimaryToolButton
          active={tool === "draw"}
          onClick={() => setTool("draw")}
          label="Draw group"
        >
          <PencilRuler className="h-4 w-4" />
        </PrimaryToolButton>
        <div className={cn("mx-1 h-6 w-px", toolbarDivider)} />
        <PrimaryToolButton onClick={() => zoomCanvas(-0.12)} label="Zoom out">
          <Minus className="h-4 w-4" />
        </PrimaryToolButton>
        <PrimaryToolButton onClick={() => zoomCanvas(0.12)} label="Zoom in">
          <Plus className="h-4 w-4" />
        </PrimaryToolButton>
        <div className={cn("mx-1 h-6 w-px", toolbarDivider)} />
        <PrimaryToolButton
          onClick={() =>
            setViewport({
              x: 0,
              y: 0,
              scale: 1,
            })
          }
          label="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </PrimaryToolButton>
      </div>

      {editingOverlay ? (
        <div
          className="absolute z-30 flex items-center gap-2"
          style={{
            left: editingOverlay.left,
            top: editingOverlay.top,
            width: editingOverlay.width,
          }}
        >
          <input
            autoFocus
            value={draftGroupName}
            onChange={(event) => setDraftGroupName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitRename();
              }

              if (event.key === "Escape") {
                setEditingGroupId(null);
                setDraftGroupName("");
              }
            }}
            className={cn(
              "min-w-0 flex-1 h-8 rounded-[var(--p2-radius-field)] border px-3 text-sm outline-none transition",
              editInputClass,
            )}
            aria-label="Rename group"
          />
          <P2Button
            type="button"
            size="sm"
            variant="primary"
            onClick={commitRename}
            className={cn("shrink-0", editingOverlay.compact ? "w-9 px-0" : "")}
            aria-label="Save group name"
          >
            <Check className="h-4 w-4" />
            {editingOverlay.compact ? null : "Save"}
          </P2Button>
        </div>
      ) : null}

      {deleteTargetGroup ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-5 backdrop-blur-[2px]">
          <div
            className={cn(
              "w-full max-w-[460px] rounded-[var(--p2-radius-card)] border p-5 shadow-[var(--p2-shadow-popover)]",
              modalPanelClass,
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff4d57]/12 text-[#ff6b74]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[17px] font-semibold text-[var(--p2-text-soft)]">
                  Delete device group
                </div>
                <div className="mt-2 text-sm leading-6 text-[var(--p2-text-muted)]">
                  This will delete{" "}
                  <span className="font-semibold text-[var(--p2-text-soft)]">
                    {deleteTargetGroup.name}
                  </span>
                  . Endpoints assigned to this group will be moved back to{" "}
                  <span className="font-semibold text-[var(--p2-text-soft)]">
                    All devices
                  </span>
                  .
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--p2-text-muted)]">
                Type DELETE to confirm
              </div>
              <P2Input
                value={deleteConfirmValue}
                onChange={(event) => setDeleteConfirmValue(event.target.value)}
                placeholder="DELETE"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <P2Button type="button" variant="secondary" onClick={closeDeleteDialog}>
                Cancel
              </P2Button>
              <P2Button
                type="button"
                variant="danger"
                disabled={!canConfirmDelete}
                onClick={confirmDeleteGroup}
              >
                <Trash2 className="h-4 w-4" />
                Delete group
              </P2Button>
            </div>
          </div>
        </div>
      ) : null}

      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        draggable={false}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onWheel={(event) => {
          if (!event.evt.ctrlKey) {
            return;
          }

          event.evt.preventDefault();

          const stage = stageRef.current;
          const pointer = stage?.getPointerPosition();

          if (!pointer) {
            return;
          }

          setViewport((current) =>
            getZoomedViewport(
              current,
              current.scale + (event.evt.deltaY > 0 ? -0.08 : 0.08),
              pointer,
            ),
          );
        }}
      >
        <Layer>
          {displayGroups.map((group) => {
            const devices = devicesByGroup.get(group.id) ?? [];
            const count = devices.length;
            const isHovered = hoveredGroupId === group.id;
            const isDragging = draggingGroupId === group.id;
            const isResizing = resizeState?.groupId === group.id;
            const isEditing = editingGroupId === group.id;
            const isSelected = selectedGroupId === group.id;
            const isRestricted = Boolean(group.restricted);
            const resolvedGroupStroke = isRestricted
              ? destructiveStroke
              : isHovered || isDragging || isResizing
                ? primaryStroke
                : groupStroke;
            const resolvedGroupFill = isRestricted
              ? isSelected
                ? restrictedGroupSelectedFill
                : restrictedGroupFill
              : isSelected
                ? groupSelectedFill
                : groupFill;

            return (
              <Group
                key={group.id}
                x={group.x}
                y={group.y}
                onClick={(event) => {
                  event.cancelBubble = true;
                  setSelectedGroupId(group.id);
                }}
              >
                <Rect
                  width={group.width}
                  height={group.height}
                  cornerRadius={6}
                  stroke={resolvedGroupStroke}
                  strokeWidth={1}
                  fill={resolvedGroupFill}
                  onMouseDown={(event) => beginPendingGroupDrag(event, group)}
                  onMouseEnter={() => setHoveredGroupId(group.id)}
                  onMouseLeave={() =>
                    setHoveredGroupId((current) => (current === group.id ? null : current))
                  }
                />
                <Text
                  x={18}
                  y={16}
                  text={group.name}
                  fill={groupNameColor}
                  fontSize={16}
                  fontStyle="bold"
                  opacity={isEditing ? 0 : 1}
                  onMouseDown={(event) => beginPendingGroupDrag(event, group)}
                  onDblClick={() => beginEditingGroup(group)}
                />
                <Text
                  x={18}
                  y={40}
                  text={`${count} endpoint${count === 1 ? "" : "s"}`}
                  fill={groupMetaColor}
                  fontSize={12}
                  opacity={0.92}
                  onMouseDown={(event) => beginPendingGroupDrag(event, group)}
                />

                {devices.map((item) => {
                  const badgeWidth = Math.max(
                    52,
                    Math.ceil(item.endpointLabel.length * 5.9 + 24),
                  );
                  const deviceHovered = hoveredDeviceId === item.device.id;
                  const deviceBorder = deviceHovered ? primaryStroke : deviceShellStroke;
                  const devicePosition =
                    deviceDragPreview?.deviceId === item.device.id
                      ? deviceDragPreview
                      : item;

                  return (
                    <Group
                      key={item.device.id}
                      x={devicePosition.x}
                      y={devicePosition.y}
                      onMouseDown={(event) => {
                        if (tool !== "pan" || resizeState || groupDragState) {
                          return;
                        }

                        event.cancelBubble = true;
                        setStageDragEnabled(false);
                        const pointer = getPointerPosition();

                        if (!pointer) {
                          return;
                        }

                        setSelectedGroupId(group.id);
                        setHoveredDeviceId(item.device.id);
                        setDraggingDeviceId(item.device.id);
                        setDeviceDragState({
                          deviceId: item.device.id,
                          pointerX: pointer.x,
                          pointerY: pointer.y,
                          group,
                          item,
                        });
                        setDeviceDragPreview({
                          deviceId: item.device.id,
                          x: item.x,
                          y: item.y,
                        });
                      }}
                      onMouseOver={() => setHoveredDeviceId(item.device.id)}
                      onMouseMove={() => setHoveredDeviceId(item.device.id)}
                      onMouseOut={() =>
                        setHoveredDeviceId((current) =>
                          current === item.device.id ? null : current,
                        )
                      }
                    >
                      <Rect
                        x={-badgeWidth / 2}
                        y={DEVICE_BADGE_OFFSET_Y}
                        width={badgeWidth}
                        height={DEVICE_BADGE_HEIGHT}
                        cornerRadius={10}
                        fill={deviceBadgeFill}
                        stroke={deviceBadgeStroke}
                        strokeWidth={1}
                      />
                      <Text
                        x={-badgeWidth / 2}
                        y={DEVICE_BADGE_OFFSET_Y + 5}
                        width={badgeWidth}
                        align="center"
                        text={item.endpointLabel}
                        fill={deviceBadgeText}
                        fontSize={10}
                        fontStyle="bold"
                        fontFamily={deviceCanvasMono.style.fontFamily}
                      />
                      <Rect
                        x={-DEVICE_SHELL_HALF_SIZE}
                        y={-DEVICE_SHELL_HALF_SIZE}
                        width={DEVICE_SHELL_SIZE}
                        height={DEVICE_SHELL_SIZE}
                        cornerRadius={DEVICE_SHELL_RADIUS}
                        fill={deviceShellFill}
                        stroke={deviceBorder}
                        strokeWidth={deviceHovered ? 1.6 : 1}
                      />
                      <EndpointIcon kind={item.endpointKind} color={deviceIconColor} />
                      {item.detectionTone ? (
                        <Circle
                          x={DEVICE_STATUS_DOT_X}
                          y={DEVICE_STATUS_DOT_Y}
                          radius={4.5}
                          fill={item.detectionTone === "danger" ? dangerDot : warningDot}
                          stroke={deviceShellFill}
                          strokeWidth={1.4}
                        />
                      ) : null}
                      <Text
                        x={-DEVICE_LABEL_WIDTH / 2}
                        y={DEVICE_LABEL_OFFSET_Y}
                        width={DEVICE_LABEL_WIDTH}
                        align="center"
                        text={truncateDeviceLabel(item.device.name)}
                        fill={deviceNameColor}
                        fontSize={11}
                        fontFamily={deviceCanvasMono.style.fontFamily}
                      />
                    </Group>
                  );
                })}

                {tool === "pan" && isSelected
                  ? ([
                      {
                        edge: "left",
                        x: -RESIZE_HIT_SIZE / 2,
                        y: 26,
                        width: RESIZE_HIT_SIZE,
                        height: group.height - 52,
                      },
                      {
                        edge: "right",
                        x: group.width - RESIZE_HIT_SIZE / 2,
                        y: 26,
                        width: RESIZE_HIT_SIZE,
                        height: group.height - 52,
                      },
                      {
                        edge: "top",
                        x: 26,
                        y: -RESIZE_HIT_SIZE / 2,
                        width: group.width - 52,
                        height: RESIZE_HIT_SIZE,
                      },
                      {
                        edge: "bottom",
                        x: 26,
                        y: group.height - RESIZE_HIT_SIZE / 2,
                        width: group.width - 52,
                        height: RESIZE_HIT_SIZE,
                      },
                    ] as const).map((handle) => (
                      <Rect
                        key={handle.edge}
                        x={handle.x}
                        y={handle.y}
                        width={handle.width}
                        height={handle.height}
                        fill="rgba(0,0,0,0.001)"
                        onMouseEnter={() =>
                          setHoveredResizeEdge({
                            groupId: group.id,
                            edge: handle.edge,
                          })
                        }
                        onMouseLeave={() =>
                          setHoveredResizeEdge((current) =>
                            current?.groupId === group.id && current.edge === handle.edge
                              ? null
                              : current,
                          )
                        }
                        onMouseDown={(event) => {
                          event.cancelBubble = true;
                          setStageDragEnabled(false);

                          const pointer = getPointerPosition();

                          if (!pointer) {
                            return;
                          }

                          setSelectedGroupId(group.id);
                          setResizeState({
                            groupId: group.id,
                            edge: handle.edge,
                            pointerX: pointer.x,
                            pointerY: pointer.y,
                            group,
                          });
                          setResizePreview(group);
                        }}
                      />
                    ))
                  : null}
              </Group>
            );
          })}

          {draftGroup ? (
            <Rect
              x={draftGroup.x}
              y={draftGroup.y}
              width={draftGroup.width}
              height={draftGroup.height}
              cornerRadius={6}
              stroke={primaryStroke}
              strokeWidth={2}
              dash={[12, 8]}
            />
          ) : null}
        </Layer>
      </Stage>
    </div>
  );
}
