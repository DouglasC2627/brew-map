"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitCompareArrows,
  X,
} from "lucide-react";
import type { BrewingMethod, CoffeeBean, FlavorNotesData } from "@/types";
import { useBeanMap } from "@/store";
import { cn, countryFlagEmoji } from "@/lib/utils";
import { ComparisonView } from "./ComparisonView";

interface Props {
  beans: CoffeeBean[];
  methods?: BrewingMethod[];
  flavorNotes?: FlavorNotesData;
}

export function ComparisonTray({ beans, methods, flavorNotes }: Props) {
  const ids = useBeanMap((s) => s.comparisonBeanIds);
  const removeFromComparison = useBeanMap((s) => s.removeFromComparison);
  const isOpen = useBeanMap((s) => s.isComparisonOpen);
  const setOpen = useBeanMap((s) => s.setComparisonOpen);

  const [showFull, setShowFull] = useState(false);

  const selected = useMemo(
    () =>
      ids
        .map((id) => beans.find((b) => b.id === id))
        .filter((b): b is CoffeeBean => Boolean(b)),
    [ids, beans],
  );

  if (selected.length === 0) return null;

  return (
    <>
      <div
        aria-label="Comparison tray"
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-[calc(100%-2.25rem)]",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          aria-label={isOpen ? "Collapse comparison tray" : "Expand comparison tray"}
          className="flex w-full items-center justify-between border-b border-border bg-parchment/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-roast-dark dark:bg-roast-dark/40 dark:text-parchment"
        >
          <span className="inline-flex items-center gap-2">
            <GitCompareArrows className="h-3.5 w-3.5" />
            Comparison ({selected.length}/3)
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </button>

        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
          <ul className="flex min-w-0 gap-2 overflow-x-auto sm:flex-1">
            {selected.map((bean) => (
              <li
                key={bean.id}
                className="flex shrink-0 items-center gap-2 rounded-md border border-border bg-surface/60 px-3 py-1.5"
              >
                <span aria-hidden>{countryFlagEmoji(bean.countryCode)}</span>
                <div className="text-xs leading-tight">
                  <div className="font-medium">{bean.name}</div>
                  <div className="text-muted-foreground">{bean.country}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromComparison(bean.id)}
                  aria-label={`Remove ${bean.name} from comparison`}
                  className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-parchment hover:text-foreground dark:hover:bg-roast-dark"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <Link
              href={`/compare?beans=${selected.map((b) => b.slug).join(",")}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-roast-medium hover:text-foreground"
              title="Open as a shareable page"
            >
              <ExternalLink className="h-3 w-3" />
              Share link
            </Link>

            <button
              type="button"
              onClick={() => setShowFull(true)}
              className="shrink-0 rounded-md bg-roast-medium px-3 py-1.5 text-xs font-medium text-cream hover:bg-roast-dark"
            >
              Compare →
            </button>
          </div>
        </div>
      </div>

      {showFull && (
        <ComparisonView
          beans={selected}
          methods={methods}
          flavorNotes={flavorNotes}
          onClose={() => setShowFull(false)}
        />
      )}
    </>
  );
}
