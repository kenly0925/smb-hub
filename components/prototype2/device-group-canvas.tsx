"use client";

import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { P2Button } from "@/components/prototype2/ui";
import { DeviceRecord } from "@/lib/prototype2/types";
import { cn } from "@/lib/utils";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { Check, Move, PencilRuler, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, Group, Layer, Rect, Stage, Text } from "react-konva";

type ToolMode = "pan" | "draw";

type DraftGroup = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function layoutGroupDevices(groupId: string, devices: DeviceRecord[]) {
  const inGroup = devices.filter((device) => device.groupId === groupId);

  return inGroup.map((device) => ({
    ...device,
  }));
}

function IconToolButton({
  active,
  onClick,
  label,
  className,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center border transition",
        active
          ? "border-[var(--p2-button-primary-border)] bg-[var(--p2-button-primary-bg)] text-white"
          : "border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text-muted)] hover:bg-[var(--p2-elevated)]",
        className,
      )}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

export function DeviceGroupCanvas({
  theme,
}: {
  theme: "light" | "dark";
}) {
  const { state, createDeviceGroup, moveDeviceToGroup, renameDeviceGroup } =
    usePrototype2Demo();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<KonvaStage | null>(null);
  const [tool, setTool] = useState<ToolMode>("pan");
  const [selectedGroupId, setSelectedGroupId] = useState("all-devices");
  const [draftGroup, setDraftGroup] = useState<DraftGroup | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 560 });
  const [viewport, setViewport] = useState(state.deviceGroups.viewport);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [draftGroupName, setDraftGroupName] = useState("");
  const isDark = theme === "dark";
  const canvasBackground = isDark ? "#18181b" : "#ffffff";
  const dotColor = isDark ? "rgba(82, 82, 91, 0.72)" : "#e4e4e7";
  const canvasBorderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(24, 24, 27, 0.08)";
  const editInputClass = isDark
    ? "border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-500"
    : "border-zinc-200 bg-white text-zinc-900 focus:border-[var(--p2-button-primary-border)]";
  const groupStroke = isDark ? "#52525b" : "#e4e4e7";
  const groupFill = isDark ? "rgba(39, 39, 42, 0.92)" : "rgba(250, 250, 250, 0.98)";
  const selectedGroupFill = isDark ? "rgba(63, 63, 70, 0.94)" : "rgba(255, 255, 255, 1)";
  const groupNameColor = isDark ? "#f4f4f5" : "#18181b";
  const groupMetaColor = isDark ? "#a1a1aa" : "#71717a";
  const deviceIdColor = isDark ? "#e4e4e7" : "#3f3f46";
  const deviceCircleFill = isDark ? "#bfdbfe" : "#93c5fd";
  const deviceCircleStroke = isDark ? "#1f2937" : "#f4f4f5";
  const deviceInitialColor = "#111827";

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    function updateCanvasSize() {
      if (!container) {
        return;
      }

      setCanvasSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
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

  const groups = state.deviceGroups.groups;
  const devicesByGroup = useMemo(() => {
    const entries = new Map<string, DeviceRecord[]>();

    groups.forEach((group) => {
      if (group.id === "all-devices") {
        entries.set(group.id, layoutGroupDevices(group.id, state.devices.items));
        return;
      }

      const devices = state.devices.items
        .filter((item) => item.groupId === group.id)
        .map((device, index) => {
          const columns = Math.max(1, Math.floor((group.width - 92) / 120));
          const col = index % columns;
          const row = Math.floor(index / columns);

          return {
            ...device,
            x: group.x + 62 + col * 120,
            y: group.y + 92 + row * 92,
          };
        });

      entries.set(group.id, devices);
    });

    return entries;
  }, [groups, state.devices.items]);

  const editingGroup = useMemo(
    () => groups.find((group) => group.id === editingGroupId) ?? null,
    [editingGroupId, groups],
  );

  const editingOverlay = useMemo(() => {
    if (!editingGroup) {
      return null;
    }

    const left = editingGroup.x * viewport.scale + viewport.x + 16;
    const top = editingGroup.y * viewport.scale + viewport.y + 10;
    const width = Math.max(160, editingGroup.width * viewport.scale - 150);

    return {
      left: Math.min(Math.max(12, left), Math.max(12, canvasSize.width - 260)),
      top: Math.min(Math.max(12, top), Math.max(12, canvasSize.height - 44)),
      width: Math.min(width, Math.max(160, canvasSize.width - left - 108)),
    };
  }, [canvasSize.height, canvasSize.width, editingGroup, viewport]);

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

  function getPointerPosition() {
    const stage = stageRef.current;

    if (!stage) {
      return null;
    }

    return stage.getRelativePointerPosition();
  }

  function handleStageMouseDown(event: KonvaEventObject<MouseEvent>) {
    if (tool !== "draw" || event.target !== event.target.getStage()) {
      return;
    }

    const position = getPointerPosition();

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
    if (!draftGroup) {
      return;
    }

    const position = getPointerPosition();

    if (!position) {
      return;
    }

    setDraftGroup((current) =>
      current
        ? {
            x: Math.min(current.x, position.x),
            y: Math.min(current.y, position.y),
            width: Math.abs(position.x - current.x),
            height: Math.abs(position.y - current.y),
          }
        : null,
    );
  }

  function handleStageMouseUp() {
    if (!draftGroup) {
      return;
    }

    if (draftGroup.width > 120 && draftGroup.height > 100) {
      const id = `group-${Date.now()}`;
      createDeviceGroup({
        id,
        name: `New group ${groups.length}`,
        ...draftGroup,
      });
      setSelectedGroupId(id);
      setEditingGroupId(id);
      setDraftGroupName(`New group ${groups.length}`);
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
        cursor: tool === "draw" ? "crosshair" : "grab",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundColor: canvasBackground,
          backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
      />

      <div className="absolute left-4 top-4 z-20 flex flex-col">
        <IconToolButton
          active={tool === "pan"}
          onClick={() => setTool("pan")}
          label="Pan canvas"
          className="rounded-t-[var(--p2-radius-button)]"
        >
          <Move className="h-4 w-4" />
        </IconToolButton>
        <IconToolButton
          active={tool === "draw"}
          onClick={() => setTool("draw")}
          label="Draw group"
          className="rounded-b-[var(--p2-radius-button)] border-t-0"
        >
          <PencilRuler className="h-4 w-4" />
        </IconToolButton>
      </div>

      <button
        type="button"
        onClick={() =>
          setViewport({
            x: 0,
            y: 0,
            scale: 1,
          })
        }
        className={cn(
          "absolute bottom-4 left-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-[var(--p2-radius-button)] border transition",
          "border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text-muted)] hover:bg-[var(--p2-elevated)]",
        )}
        aria-label="Reset view"
        title="Reset view"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      {editingOverlay ? (
        <div
          className="absolute z-30 flex items-center gap-2"
          style={{
            left: editingOverlay.left,
            top: editingOverlay.top,
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
              "h-8 rounded-[var(--p2-radius-field)] border px-3 text-sm outline-none transition",
              editInputClass,
            )}
            style={{ width: editingOverlay.width }}
            aria-label="Rename group"
          />
          <P2Button type="button" size="sm" variant="primary" onClick={commitRename}>
            <Check className="h-4 w-4" />
            Save
          </P2Button>
        </div>
      ) : null}

      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        draggable={tool === "pan"}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        onDragEnd={(event) =>
          setViewport((current) => ({
            ...current,
            x: event.target.x(),
            y: event.target.y(),
          }))
        }
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onWheel={(event) => {
          event.evt.preventDefault();
          const stage = stageRef.current;
          const oldScale = viewport.scale;
          const pointer = stage?.getPointerPosition();

          if (!stage || !pointer) {
            return;
          }

          const pointTo = {
            x: (pointer.x - viewport.x) / oldScale,
            y: (pointer.y - viewport.y) / oldScale,
          };
          const direction = event.evt.deltaY > 0 ? -1 : 1;
          const nextScale = Math.min(1.8, Math.max(0.72, oldScale + direction * 0.06));

          setViewport({
            scale: nextScale,
            x: pointer.x - pointTo.x * nextScale,
            y: pointer.y - pointTo.y * nextScale,
          });
        }}
      >
        <Layer>
          {isDark ? (
            <Rect x={0} y={0} width={1600} height={980} fill="rgba(24, 24, 27, 0.94)" />
          ) : null}

          {groups.map((group) => {
            const count = devicesByGroup.get(group.id)?.length ?? 0;
            const isSelected = selectedGroupId === group.id;
            const isEditing = editingGroupId === group.id;

            return (
              <Group key={group.id} onClick={() => setSelectedGroupId(group.id)}>
                <Rect
                  x={group.x}
                  y={group.y}
                  width={group.width}
                  height={group.height}
                  cornerRadius={8}
                  stroke={isSelected ? "#60a5fa" : groupStroke}
                  strokeWidth={isSelected ? 2.2 : 1.4}
                  fill={isSelected ? selectedGroupFill : groupFill}
                />
                <Text
                  x={group.x + 18}
                  y={group.y + 16}
                  text={group.name}
                  fill={groupNameColor}
                  fontSize={18}
                  fontStyle="bold"
                  opacity={isEditing ? 0 : 1}
                  onDblClick={() => {
                    setEditingGroupId(group.id);
                    setDraftGroupName(group.name);
                    setSelectedGroupId(group.id);
                  }}
                />
                <Text
                  x={group.x + 18}
                  y={group.y + 44}
                  text={`${count} device${count === 1 ? "" : "s"}`}
                  fill={groupMetaColor}
                  fontSize={12}
                  opacity={0.9}
                />
              </Group>
            );
          })}

          {groups.flatMap((group) =>
            (devicesByGroup.get(group.id) ?? []).map((device) => (
              <Group
                key={device.id}
                x={device.x}
                y={device.y}
                draggable
                onDragEnd={(event) => {
                  const position = event.target.position();
                  const targetGroup =
                    groups.find(
                      (candidate) =>
                        position.x >= candidate.x &&
                        position.x <= candidate.x + candidate.width &&
                        position.y >= candidate.y &&
                        position.y <= candidate.y + candidate.height,
                    ) ?? groups[0];

                  moveDeviceToGroup(device.id, targetGroup.id);
                  setSelectedGroupId(targetGroup.id);
                }}
                >
                <Circle radius={22} fill={deviceCircleFill} stroke={deviceCircleStroke} strokeWidth={2} />
                <Text
                  x={-12}
                  y={-7}
                  text={device.name.slice(0, 2)}
                  fill={deviceInitialColor}
                  fontSize={12}
                  fontStyle="bold"
                />
                <Text
                  x={-56}
                  y={34}
                  width={112}
                  align="center"
                  text={device.id}
                  fill={deviceIdColor}
                  fontSize={11}
                />
              </Group>
            )),
          )}

          {draftGroup ? (
            <Rect
              x={draftGroup.x}
              y={draftGroup.y}
              width={draftGroup.width}
              height={draftGroup.height}
              cornerRadius={8}
              stroke="#60a5fa"
              strokeWidth={2}
              dash={[12, 8]}
            />
          ) : null}
        </Layer>
      </Stage>
    </div>
  );
}
