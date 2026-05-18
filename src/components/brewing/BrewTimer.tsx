"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { PourStage } from "@/types";
import { cn, formatBrewTime } from "@/lib/utils";

type BrewTimerProps = {
  totalSeconds: number;
  bloomSeconds?: number;
  stages?: PourStage[];
  methodName?: string;
  className?: string;
};

const SOUND_PREF_KEY = "bm.timer.sound";

function getAudioContextCtor(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return w.AudioContext ?? w.webkitAudioContext;
}

export function BrewTimer({
  totalSeconds,
  bloomSeconds,
  stages,
  methodName,
  className,
}: BrewTimerProps) {
  const titleId = useId();
  const sortedStages = useMemo(
    () =>
      stages && stages.length > 0
        ? [...stages].sort((a, b) => a.atSeconds - b.atSeconds)
        : [],
    [stages],
  );

  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [stageIndex, setStageIndex] = useState(-1);
  const [stageAnnouncement, setStageAnnouncement] = useState("");

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseMsRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastStageRef = useRef(-1);

  // Restore preference
  useEffect(() => {
    try {
      const v = localStorage.getItem(SOUND_PREF_KEY);
      if (v === "1") setSoundOn(true);
    } catch {
      // ignore
    }
  }, []);

  const persistSound = useCallback((on: boolean) => {
    try {
      localStorage.setItem(SOUND_PREF_KEY, on ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  const playBeep = useCallback(() => {
    const Ctor = getAudioContextCtor();
    if (!Ctor) return;
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new Ctor();
      } catch {
        return;
      }
    }
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    // iOS may suspend the context until a user gesture.
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => undefined);
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }, []);

  const tick = useCallback(() => {
    if (startRef.current == null) return;
    const now = performance.now();
    const next = baseMsRef.current + (now - startRef.current);
    const capped = Math.min(next, totalSeconds * 1000);
    setElapsedMs(capped);
    if (capped >= totalSeconds * 1000) {
      setRunning(false);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [totalSeconds]);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (startRef.current != null) {
        baseMsRef.current += performance.now() - startRef.current;
      }
      startRef.current = null;
    };
  }, [running, tick]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close().catch(() => undefined);
    },
    [],
  );

  // Track which stage we're in and play beeps when it changes.
  useEffect(() => {
    if (sortedStages.length === 0) {
      setStageIndex(-1);
      return;
    }
    const elapsedSec = elapsedMs / 1000;
    let idx = -1;
    for (let i = 0; i < sortedStages.length; i++) {
      if (elapsedSec >= sortedStages[i].atSeconds) idx = i;
      else break;
    }
    if (idx !== lastStageRef.current) {
      const prev = lastStageRef.current;
      lastStageRef.current = idx;
      setStageIndex(idx);
      if (idx > prev && idx >= 0) {
        const stage = sortedStages[idx];
        setStageAnnouncement(`${stage.label} — pour ${stage.waterMl}ml`);
        if (soundOn && running) playBeep();
      }
    }
  }, [elapsedMs, sortedStages, soundOn, running, playBeep]);

  const start = useCallback(() => {
    // Resume / create context within the user gesture so iOS allows audio later.
    if (soundOn) {
      const Ctor = getAudioContextCtor();
      if (Ctor && !audioCtxRef.current) {
        try {
          audioCtxRef.current = new Ctor();
        } catch {
          // ignore
        }
      }
      audioCtxRef.current?.resume().catch(() => undefined);
    }
    setRunning(true);
  }, [soundOn]);

  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    baseMsRef.current = 0;
    startRef.current = null;
    lastStageRef.current = -1;
    setElapsedMs(0);
    setStageIndex(-1);
    setStageAnnouncement("");
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      persistSound(next);
      return next;
    });
  }, [persistSound]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.target instanceof HTMLButtonElement) return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (running) pause();
        else start();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      }
    },
    [running, pause, start, reset],
  );

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const remainingSec = Math.max(0, totalSeconds - elapsedSec);
  const progress = totalSeconds > 0 ? Math.min(1, elapsedMs / (totalSeconds * 1000)) : 0;

  const currentStage = stageIndex >= 0 ? sortedStages[stageIndex] : null;
  const nextStage =
    stageIndex + 1 < sortedStages.length ? sortedStages[stageIndex + 1] : null;
  const inBloom =
    bloomSeconds != null && bloomSeconds > 0 && elapsedSec < bloomSeconds;

  // Geometry for the progress ring
  const SIZE = 132;
  const STROKE = 8;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * RADIUS;

  return (
    <div
      role="timer"
      aria-labelledby={titleId}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "rounded-lg border border-border bg-surface/50 p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h4
          id={titleId}
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {methodName ? `${methodName} timer` : "Brew timer"}
        </h4>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? "Mute stage alerts" : "Enable stage alert sound"}
          aria-pressed={soundOn}
          className="rounded-md p-1 text-muted-foreground hover:bg-parchment hover:text-foreground dark:hover:bg-roast-dark"
        >
          {soundOn ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            aria-hidden
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeWidth={STROKE}
              fill="none"
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="var(--color-roast-medium, #6F4E37)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-150 motion-safe:ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl tabular-nums">
              {formatClock(remainingSec)}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              of {formatClock(totalSeconds)}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 text-sm">
          {inBloom ? (
            <div className="text-xs">
              <span className="font-semibold text-roast-medium">Bloom</span>{" "}
              <span className="text-muted-foreground">
                until {formatBrewTime(bloomSeconds!)}
              </span>
            </div>
          ) : currentStage ? (
            <div className="text-xs">
              <span className="font-semibold">{currentStage.label}</span>{" "}
              <span className="text-muted-foreground">
                ({formatBrewTime(currentStage.atSeconds)} · +
                {currentStage.waterMl}ml)
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Ready</div>
          )}

          {nextStage ? (
            <div className="text-[11px] text-muted-foreground">
              Next:{" "}
              <span className="font-medium text-foreground">
                {nextStage.label}
              </span>{" "}
              at {formatBrewTime(nextStage.atSeconds)}
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground">
              {sortedStages.length > 0 ? "Last pour" : "No pour stages"}
            </div>
          )}

          <div className="mt-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={running ? pause : start}
              className="inline-flex items-center gap-1.5 rounded-md bg-roast-medium px-3 py-1.5 text-xs text-cream hover:bg-roast-dark"
              aria-label={running ? "Pause timer" : "Start timer"}
            >
              {running ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Start
                </>
              )}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={elapsedMs === 0 && !running}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground hover:border-roast-medium hover:text-foreground disabled:opacity-50"
              aria-label="Reset timer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Press <kbd className="font-mono">Space</kbd> to start/pause.
          </p>
        </div>
      </div>

      {sortedStages.length > 0 && (
        <ol className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {sortedStages.map((stage, i) => {
            const reached = elapsedSec >= stage.atSeconds;
            const active = i === stageIndex;
            return (
              <li
                key={`${stage.label}-${stage.atSeconds}`}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-xs",
                  active
                    ? "border-roast-medium bg-parchment text-roast-dark dark:bg-roast-dark dark:text-parchment"
                    : reached
                      ? "border-border bg-surface/40 text-muted-foreground line-through"
                      : "border-border bg-surface/40",
                )}
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {formatBrewTime(stage.atSeconds)}
                </span>
                <span className="flex-1 truncate font-medium">
                  {stage.label}
                </span>
                <span className="font-mono text-[10px]">
                  +{stage.waterMl}ml
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="sr-only" aria-live="polite" role="status">
        {stageAnnouncement}
      </div>
    </div>
  );
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default BrewTimer;
