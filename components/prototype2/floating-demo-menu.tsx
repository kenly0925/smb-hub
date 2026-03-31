"use client";

import { usePrototype1Demo } from "@/components/prototype1/demo-provider";
import { usePrototype2Demo } from "@/components/prototype2/demo-provider";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function FloatingDemoMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [edgeActive, setEdgeActive] = useState(false);
  const [hideUntilEdgeHover, setHideUntilEdgeHover] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const { resetDemo: resetPrototype1 } = usePrototype1Demo();
  const { resetDemo: resetPrototype2 } = usePrototype2Demo();

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    function syncDockMode() {
      setHideUntilEdgeHover(mediaQuery.matches);
    }

    syncDockMode();
    mediaQuery.addEventListener("change", syncDockMode);

    return () => mediaQuery.removeEventListener("change", syncDockMode);
  }, []);

  const shouldRevealControl = open || edgeActive || !hideUntilEdgeHover;

  function handleReset() {
    if (pathname.startsWith("/prototype-1")) {
      resetPrototype1();
      return;
    }

    if (pathname.startsWith("/prototype-2")) {
      resetPrototype2();
      return;
    }

    resetPrototype1();
    resetPrototype2();
  }

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setEdgeActive(true)}
      onMouseLeave={() => setEdgeActive(false)}
      onFocusCapture={() => setEdgeActive(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setEdgeActive(false);
        }
      }}
      className={cn(
        "fixed right-0 top-1/2 z-[70] h-28 w-24 -translate-y-1/2",
        className,
      )}
    >
      <div
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ease-out",
          shouldRevealControl
            ? "translate-x-0 opacity-100"
            : "translate-x-10 opacity-0",
        )}
      >
        {open ? (
          <div
            role="menu"
            className="absolute right-[calc(100%+10px)] top-1/2 min-w-[182px] -translate-y-1/2 rounded-[10px] border border-white/12 bg-[#171a20]/96 p-2 text-white shadow-[0_20px_50px_rgba(0,0,0,0.34)] backdrop-blur"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                handleReset();
                setOpen(false);
              }}
              className="flex w-full items-center rounded-[8px] px-3 py-2 text-left text-sm text-white/92 transition hover:bg-white/8"
            >
              Reset demo
            </button>
            <Link
            href="/"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center rounded-[8px] px-3 py-2 text-sm text-white/92 transition hover:bg-white/8"
          >
            Go to launcher
          </Link>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={open}
        aria-label="Open demo menu"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[#16171b] shadow-[0_14px_30px_rgba(0,0,0,0.24)] transition hover:bg-[#1e2026] focus:outline-none focus:ring-2 focus:ring-[#8ab7ff]/35",
          open && "bg-[#1e2026]",
        )}
        >
          <Image
            src="/prototype-1/nav-icon-sensors.svg"
            alt=""
            width={17}
            height={17}
            className="h-[17px] w-[17px]"
          />
        </button>
      </div>
    </div>
  );
}
