"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import { animated, config, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

type MobileBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Fractions of viewport height occupied by the sheet at each snap point. */
  snapPoints?: number[];
  /** Index into snapPoints to use when the sheet opens. Default: 1 (middle). */
  initialSnap?: number;
  label?: string;
  className?: string;
  children: ReactNode;
};

const DEFAULT_SNAPS = [0.25, 0.5, 0.9];

function getViewportHeight() {
  if (typeof window === "undefined") return 800;
  return window.innerHeight;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function MobileBottomSheet({
  open,
  onClose,
  snapPoints = DEFAULT_SNAPS,
  initialSnap = 1,
  label = "Bottom sheet",
  className,
  children,
}: MobileBottomSheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  // `y` represents the visible portion of the sheet measured from the bottom of the
  // viewport, in pixels. When closed, y = 0 (entirely off-screen). When fully open
  // y = vh * topSnap.
  const [{ y }, api] = useSpring(() => ({ y: 0 }));

  // Snap positions in pixels (visible height at each snap point).
  const snapPositions = useMemo(() => {
    const vh = getViewportHeight();
    return snapPoints.map((s) => Math.round(vh * s));
  }, [snapPoints]);

  const openAt = useCallback(
    (snapIdx: number) => {
      const target = snapPositions[clamp(snapIdx, 0, snapPositions.length - 1)];
      api.start({
        y: target,
        immediate: reduceMotion,
        config: reduceMotion ? config.stiff : { tension: 320, friction: 32 },
      });
    },
    [api, snapPositions, reduceMotion],
  );

  const close = useCallback(() => {
    api.start({
      y: 0,
      immediate: reduceMotion,
      config: reduceMotion ? config.stiff : config.stiff,
      onRest: () => onClose(),
    });
  }, [api, onClose, reduceMotion]);

  // Drive open/close from the `open` prop.
  useEffect(() => {
    if (open) {
      openAt(initialSnap);
    } else {
      api.start({
        y: 0,
        immediate: reduceMotion,
        config: config.stiff,
      });
    }
  }, [open, initialSnap, openAt, api, reduceMotion]);

  // Recompute snap positions on resize.
  useEffect(() => {
    if (!open) return;
    const handle = () => openAt(initialSnap);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [open, initialSnap, openAt]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Drag binding on the handle (and anywhere outside scrollable content).
  const bind = useDrag(
    ({ last, velocity: [, vy], direction: [, dy], movement: [, my], cancel }) => {
      const current = y.get();
      // Convert "movement" (positive = downward in screen space) into a delta on
      // our `y` axis (visible height — bigger when up).
      const next = clamp(
        current - my,
        0,
        snapPositions[snapPositions.length - 1],
      );

      if (!last) {
        api.start({ y: next, immediate: true });
        return;
      }

      // Drag ended — pick a snap target.
      const flickDown = vy > 0.5 && dy > 0;
      const flickUp = vy > 0.5 && dy < 0;
      const lowest = snapPositions[0];
      const highest = snapPositions[snapPositions.length - 1];

      if (flickDown && next <= lowest * 1.05) {
        cancel();
        close();
        return;
      }

      let target = snapPositions[0];
      let bestDist = Infinity;
      for (const s of snapPositions) {
        const d = Math.abs(s - next);
        if (d < bestDist) {
          bestDist = d;
          target = s;
        }
      }
      if (flickUp) target = highest;
      if (flickDown && target === snapPositions[0]) {
        cancel();
        close();
        return;
      }
      api.start({
        y: target,
        immediate: reduceMotion,
        config: reduceMotion ? config.stiff : { tension: 320, friction: 32 },
      });
    },
    {
      axis: "y",
      from: () => [0, -y.get()],
      pointer: { touch: true },
      filterTaps: true,
    },
  );

  if (!open && y.get() === 0) {
    return null;
  }

  const topSnap = snapPositions[snapPositions.length - 1] || 1;

  return (
    <>
      {/* Backdrop */}
      <animated.div
        aria-hidden
        onClick={close}
        className="fixed inset-0 z-20 bg-espresso/40"
        style={{
          opacity: y.to((v) => clamp(v / topSnap, 0, 1) * 0.6),
          pointerEvents: y.to((v) => (v > 4 ? "auto" : "none")),
        }}
      />
      <animated.div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 flex flex-col rounded-t-2xl border-t border-border bg-background/95 shadow-2xl backdrop-blur-sm",
          className,
        )}
        style={{
          height: y.to((v) => `${Math.max(0, v)}px`),
          touchAction: "none",
        }}
      >
        <div
          {...bind()}
          className="flex shrink-0 cursor-grab touch-none items-center justify-center pt-2 pb-1 active:cursor-grabbing"
          aria-label="Drag to resize"
          role="separator"
        >
          <div className="h-1 w-10 rounded-full bg-tan/80" />
        </div>
        <span id={titleId} className="sr-only">
          {label}
        </span>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </animated.div>
    </>
  );
}
