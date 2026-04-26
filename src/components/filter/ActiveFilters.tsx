"use client";

import { X } from "lucide-react";
import type { CoffeeBean, ProcessingMethod, RoastLevel } from "@/types";
import { useBrewMap, type FlavorRanges } from "@/store";
import { cn, countryFlagEmoji } from "@/lib/utils";

const PROCESSING_LABELS: Record<ProcessingMethod, string> = {
  washed: "Washed",
  natural: "Natural",
  honey: "Honey",
  anaerobic: "Anaerobic",
  "wet-hulled": "Wet-Hulled",
};

const ROAST_LABELS: Record<RoastLevel, string> = {
  light: "Light",
  "medium-light": "Medium-Light",
  medium: "Medium",
  "medium-dark": "Medium-Dark",
  dark: "Dark",
};

const FLAVOR_LABELS: Record<keyof FlavorRanges, string> = {
  acidity: "Acidity",
  body: "Body",
  sweetness: "Sweetness",
  bitterness: "Bitterness",
};

interface Props {
  beans: CoffeeBean[];
  className?: string;
}

export function ActiveFilters({ beans, className }: Props) {
  const {
    filters,
    setRegions,
    toggleProcessing,
    toggleRoast,
    setAltitudeRange,
    setFlavorRange,
    resetFilters,
  } = useBrewMap();

  const countryNames = new Map<string, string>();
  beans.forEach((b) => {
    if (!countryNames.has(b.countryCode)) {
      countryNames.set(b.countryCode, b.country);
    }
  });

  const removeRegion = (cc: string) =>
    setRegions(filters.regions.filter((x) => x !== cc));

  const altitudeChanged =
    filters.altitudeRange[0] !== 0 || filters.altitudeRange[1] !== 2500;
  const changedFlavorAxes = (
    Object.keys(filters.flavorRanges) as Array<keyof FlavorRanges>
  ).filter((axis) => {
    const [a, b] = filters.flavorRanges[axis];
    return a !== 1 || b !== 10;
  });

  const totalChips =
    filters.regions.length +
    filters.processingMethods.length +
    filters.roastLevels.length +
    (altitudeChanged ? 1 : 0) +
    changedFlavorAxes.length;

  if (totalChips === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Filters:
      </span>

      {filters.regions.map((cc) => (
        <Chip key={`region-${cc}`} onRemove={() => removeRegion(cc)}>
          <span aria-hidden>{countryFlagEmoji(cc)}</span>
          {countryNames.get(cc) ?? cc}
        </Chip>
      ))}

      {filters.processingMethods.map((p) => (
        <Chip key={`proc-${p}`} onRemove={() => toggleProcessing(p)}>
          {PROCESSING_LABELS[p]}
        </Chip>
      ))}

      {filters.roastLevels.map((r) => (
        <Chip key={`roast-${r}`} onRemove={() => toggleRoast(r)}>
          {ROAST_LABELS[r]} roast
        </Chip>
      ))}

      {altitudeChanged && (
        <Chip onRemove={() => setAltitudeRange([0, 2500])}>
          {filters.altitudeRange[0]}–{filters.altitudeRange[1]} masl
        </Chip>
      )}

      {changedFlavorAxes.map((axis) => {
        const [a, b] = filters.flavorRanges[axis];
        return (
          <Chip
            key={`flavor-${axis}`}
            onRemove={() => setFlavorRange(axis, [1, 10])}
          >
            {FLAVOR_LABELS[axis]} {a}–{b}
          </Chip>
        );
      })}

      {totalChips > 1 && (
        <button
          type="button"
          onClick={resetFilters}
          className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function Chip({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-parchment px-2 py-0.5 text-xs text-roast-dark dark:bg-roast-dark dark:text-parchment">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove filter"
        className="rounded-full p-0.5 text-muted-foreground hover:bg-roast-medium/20 hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
