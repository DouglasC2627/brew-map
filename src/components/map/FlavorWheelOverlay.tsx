"use client";

import { useMemo } from "react";
import { Flower2, X } from "lucide-react";
import type { CoffeeBean, FlavorNotesData } from "@/types";
import { useBeanMap } from "@/store";
import { cn } from "@/lib/utils";
import { FlavorWheelLazy } from "@/components/visualization/FlavorWheelLazy";

interface Props {
  beans: CoffeeBean[];
  flavorNotes: FlavorNotesData;
}

export function FlavorWheelOverlay({ beans, flavorNotes }: Props) {
  const {
    isFlavorWheelOpen,
    setFlavorWheelOpen,
    filters,
    toggleFlavorNote,
    clearFlavorNotes,
  } = useBeanMap();

  const selectedIds = useMemo(
    () => new Set(filters.flavorNoteIds),
    [filters.flavorNoteIds],
  );
  const selectionCount = filters.flavorNoteIds.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setFlavorWheelOpen(!isFlavorWheelOpen)}
        aria-label="Toggle flavor wheel"
        aria-pressed={isFlavorWheelOpen}
        className={cn(
          "fixed right-3 top-32 z-30 flex items-center gap-2 rounded-md border border-border bg-background/90 px-3 py-2 text-sm shadow-md backdrop-blur transition hover:border-roast-medium",
          isFlavorWheelOpen && "border-roast-medium bg-roast-medium text-cream hover:bg-roast-dark",
        )}
      >
        <Flower2 className="h-4 w-4" />
        <span>Flavors</span>
        {selectionCount > 0 && (
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px]",
            isFlavorWheelOpen
              ? "bg-cream text-roast-dark"
              : "bg-roast-medium text-cream",
          )}>
            {selectionCount}
          </span>
        )}
      </button>

      {isFlavorWheelOpen && (
        <div className="fixed right-3 top-44 z-30 w-[min(360px,calc(100vw-1.5rem))] rounded-lg border border-border bg-background/95 p-3 shadow-xl backdrop-blur">
          <div className="mb-1 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Flavor wheel
            </div>
            <div className="flex items-center gap-1">
              {selectionCount > 0 && (
                <button
                  type="button"
                  onClick={clearFlavorNotes}
                  className="text-[10px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setFlavorWheelOpen(false)}
                aria-label="Close flavor wheel"
                className="rounded-md p-1 text-muted-foreground hover:bg-parchment hover:text-foreground dark:hover:bg-roast-dark"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <FlavorWheelLazy
              beans={beans}
              flavorNotes={flavorNotes}
              size={300}
              selectedIds={selectedIds}
              onToggle={toggleFlavorNote}
              showLabels={false}
            />
          </div>
          <p className="mt-1 text-center text-[10px] text-muted-foreground">
            Click any segment to filter the map.
          </p>
        </div>
      )}
    </>
  );
}
