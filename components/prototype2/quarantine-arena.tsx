"use client";

import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { cn } from "@/lib/utils";
import { Canvas } from "@react-three/fiber";
import { Float, OrthographicCamera, Text } from "@react-three/drei";
import { ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

function ArenaTargets({ theme }: { theme: "light" | "dark" }) {
  const { state, releaseQuarantineItem, deleteQuarantineItem } = usePrototype2Demo();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeItems = useMemo(
    () => state.quarantine.items.filter((item) => item.status === "quarantined"),
    [state.quarantine.items],
  );
  const planeColor = theme === "dark" ? "#18181b" : "#ffffff";
  const ringColor = theme === "dark" ? "#3f3f46" : "#e4e4e7";
  const labelColor = theme === "dark" ? "#f4f4f5" : "#27272a";

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 4, 8]} intensity={1.1} />
      <pointLight position={[-4, -2, 8]} intensity={0.8} color="#4ac9ff" />
      {theme === "dark" ? (
        <>
          <mesh position={[0, 0, -1]}>
            <planeGeometry args={[13, 8]} />
            <meshBasicMaterial color={planeColor} opacity={0.88} transparent />
          </mesh>
          <mesh position={[0, 0, -0.8]}>
            <ringGeometry args={[2.8, 3.2, 64]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0.26} />
          </mesh>
        </>
      ) : null}
      {activeItems.map((item) => {
        const hovered = hoveredId === item.id;
        const color =
          state.quarantine.action === "release"
            ? hovered
              ? "#8ffae2"
              : "#31d8ba"
            : hovered
              ? "#ff8b8f"
              : "#ff5b66";

        return (
          <group key={item.id}>
            <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.55}>
              <mesh
                position={[item.x, item.y, 0]}
                onPointerEnter={(event) => {
                  event.stopPropagation();
                  setHoveredId(item.id);
                }}
                onPointerLeave={() => setHoveredId((current) => (current === item.id ? null : current))}
                onClick={(event) => {
                  event.stopPropagation();
                  if (state.quarantine.action === "release") {
                    releaseQuarantineItem(item.id);
                  } else {
                    deleteQuarantineItem(item.id);
                  }
                }}
              >
                <icosahedronGeometry args={[item.radius, 0]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.35}
                />
              </mesh>
            </Float>
            {hovered ? (
              <Text
                position={[item.x, item.y - item.radius - 0.7, 0]}
                fontSize={0.18}
                color={labelColor}
                maxWidth={2.8}
                textAlign="center"
              >
                {item.fileName}
              </Text>
            ) : null}
          </group>
        );
      })}
    </>
  );
}

export function QuarantineArena({
  theme,
}: {
  theme: "light" | "dark";
}) {
  const { state, setQuarantineAction } = usePrototype2Demo();
  const activeItems = state.quarantine.items.filter((item) => item.status === "quarantined");
  const [cursor, setCursor] = useState({
    x: 0,
    y: 0,
    active: false,
  });
  const isDark = theme === "dark";
  const canvasBackground = isDark ? "#18181b" : "#ffffff";
  const dotColor = isDark ? "rgba(82, 82, 91, 0.72)" : "#e4e4e7";
  const canvasBorderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(24, 24, 27, 0.08)";
  const toolbarClass =
    "border-[var(--p2-border)] bg-[var(--p2-surface)] text-[var(--p2-text-muted)] hover:bg-[var(--p2-elevated)]";
  const counterClass = isDark
    ? "border border-[var(--p2-border)] bg-[var(--p2-surface)]/88 text-[var(--p2-text-muted)]"
    : "border border-[var(--p2-border)] bg-[var(--p2-panel)]/92 text-[var(--p2-text)] shadow-[var(--p2-shadow)]";

  return (
    <div
      className="relative h-full overflow-hidden rounded-[var(--p2-radius-canvas)] border"
      style={{
        backgroundColor: canvasBackground,
        borderColor: canvasBorderColor,
        cursor: "none",
      }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();

        setCursor({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          active: true,
        });
      }}
      onMouseLeave={() =>
        setCursor((current) => ({
          ...current,
          active: false,
        }))
      }
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundColor: canvasBackground,
          backgroundImage:
            `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
      />

      <div className="absolute left-4 top-4 z-20 flex flex-col">
        <button
          type="button"
          onClick={() => setQuarantineAction("release")}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center border transition first:rounded-t-[var(--p2-radius-button)] last:rounded-b-[var(--p2-radius-button)]",
            state.quarantine.action === "release"
              ? "border-[var(--p2-button-primary-border)] bg-[var(--p2-button-primary-bg)] text-white"
              : toolbarClass,
          )}
          aria-label="Use release tool"
        >
          <ShieldCheck className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setQuarantineAction("delete")}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center border border-t-0 transition first:rounded-t-[var(--p2-radius-button)] last:rounded-b-[var(--p2-radius-button)]",
            state.quarantine.action === "delete"
              ? "border-[var(--p2-button-primary-border)] bg-[var(--p2-button-primary-bg)] text-white"
              : toolbarClass,
          )}
          aria-label="Use delete tool"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div
        className={cn(
          "absolute inset-0 z-10 pointer-events-none transition-opacity duration-100",
          cursor.active ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className={`absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
            state.quarantine.action === "release"
              ? "border-[#3ef0ca]"
              : "border-[#ff6671]"
          }`}
          style={{ left: cursor.x, top: cursor.y }}
        />
        <div
          className={`absolute h-px w-24 -translate-x-1/2 -translate-y-1/2 ${
            state.quarantine.action === "release" ? "bg-[#3ef0ca]" : "bg-[#ff6671]"
          }`}
          style={{ left: cursor.x, top: cursor.y }}
        />
        <div
          className={`absolute h-24 w-px -translate-x-1/2 -translate-y-1/2 ${
            state.quarantine.action === "release" ? "bg-[#3ef0ca]" : "bg-[#ff6671]"
          }`}
          style={{ left: cursor.x, top: cursor.y }}
        />
        <div
          className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
            state.quarantine.action === "release" ? "bg-[#3ef0ca]" : "bg-[#ff6671]"
          }`}
          style={{ left: cursor.x, top: cursor.y }}
        />
      </div>

      <div className="h-full">
        <Canvas gl={{ alpha: true }} style={{ background: "transparent" }} onPointerMissed={() => undefined}>
          <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={85} />
          <ArenaTargets theme={theme} />
        </Canvas>
      </div>

      <div className={cn("absolute bottom-4 right-4 rounded-full px-3 py-1.5 text-xs backdrop-blur", counterClass)}>
        {activeItems.length} item(s) remaining
      </div>
    </div>
  );
}
