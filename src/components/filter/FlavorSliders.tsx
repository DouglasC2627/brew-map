"use client";

import { useBrewMap } from "@/store";
import type { FlavorRanges } from "@/store";
import { Slider } from "@/components/ui/slider";

const AXES: Array<{ key: keyof FlavorRanges; label: string }> = [
  { key: "acidity", label: "Acidity" },
  { key: "body", label: "Body" },
  { key: "sweetness", label: "Sweetness" },
  { key: "bitterness", label: "Bitterness" },
];

export function FlavorSliders() {
  const { filters, setFlavorRange } = useBrewMap();

  return (
    <div className="space-y-4">
      {AXES.map((axis) => {
        const range = filters.flavorRanges[axis.key];
        return (
          <div key={axis.key}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm">{axis.label}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {range[0]}–{range[1]}
              </span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={range}
              onValueChange={(v) => {
                if (Array.isArray(v) && v.length === 2) {
                  setFlavorRange(axis.key, [v[0], v[1]]);
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
