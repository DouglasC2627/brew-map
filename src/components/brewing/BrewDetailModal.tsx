"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type {
  BrewRecommendation,
  BrewingMethod,
  CoffeeBean,
} from "@/types";
import {
  GRIND_SCALE,
  celsiusToFahrenheit,
  cn,
  formatBrewTime,
} from "@/lib/utils";
import { BrewCalculator } from "./BrewCalculator";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bean: CoffeeBean;
  recommendation: BrewRecommendation;
  method: BrewingMethod | undefined;
}

export function BrewDetailModal({
  open,
  onOpenChange,
  bean,
  recommendation: rec,
  method,
}: Props) {
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");

  const grindIndex = GRIND_SCALE.findIndex((g) => g.id === rec.grindSize);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {method?.name ?? rec.methodId} · {bean.name}
          </DialogTitle>
          <DialogDescription>
            {method?.description ?? "Brewing recipe tuned for this bean."}
          </DialogDescription>
        </DialogHeader>

        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Grind
          </h4>
          <div className="flex items-end gap-1">
            {GRIND_SCALE.map((g, i) => (
              <div
                key={g.id}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "w-full rounded-sm transition",
                    i === grindIndex
                      ? "bg-roast-medium"
                      : "bg-parchment dark:bg-roast-dark",
                  )}
                  style={{ height: `${(7 - i) * 4 + 8}px` }}
                />
                <div
                  className={cn(
                    "text-[9px] leading-tight text-center",
                    i === grindIndex
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {g.label.split("-").join(" ")}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 font-mono text-xs text-muted-foreground">
            ~{rec.grindMicrons}μm
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Temperature">
            <button
              type="button"
              onClick={() => setTempUnit(tempUnit === "C" ? "F" : "C")}
              className="font-mono text-base hover:text-roast-medium"
              aria-label="Toggle temperature unit"
            >
              {tempUnit === "C"
                ? `${rec.waterTempC}°C`
                : `${celsiusToFahrenheit(rec.waterTempC)}°F`}
            </button>
          </Stat>
          <Stat label="Ratio">
            <span className="font-mono text-base">{rec.ratio}</span>
          </Stat>
          <Stat label="Brew time">
            <span className="font-mono text-base">
              {formatBrewTime(rec.brewSeconds)}
            </span>
          </Stat>
          <Stat label="Difficulty">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < rec.difficulty
                      ? "fill-roast-medium text-roast-medium"
                      : "text-muted-foreground/40",
                  )}
                />
              ))}
            </div>
          </Stat>
        </section>

        {rec.bloomSeconds && (
          <p className="text-xs text-muted-foreground">
            Bloom for{" "}
            <span className="font-mono">{rec.bloomSeconds}s</span> before the
            first pour.
          </p>
        )}

        {rec.pourStages && rec.pourStages.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pour schedule
            </h4>
            <ol className="space-y-1.5">
              {rec.pourStages.map((stage, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-3 rounded-md border border-border bg-surface/60 p-2 text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatBrewTime(stage.atSeconds)}
                  </span>
                  <span className="font-medium">{stage.label}</span>
                  <span className="ml-auto font-mono text-xs">
                    +{stage.waterMl}ml
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {method?.equipment && method.equipment.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Equipment
            </h4>
            <ul className="flex flex-wrap gap-1.5 text-xs">
              {method.equipment.map((e) => (
                <li
                  key={e}
                  className="rounded-full bg-parchment px-2 py-0.5 text-roast-dark dark:bg-roast-dark dark:text-parchment"
                >
                  {e}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Why this works
          </h4>
          <p className="text-sm">{rec.tastingNotes}</p>
        </section>

        <BrewCalculator recommendation={rec} />
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
