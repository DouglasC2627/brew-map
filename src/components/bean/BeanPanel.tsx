"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type {
  CoffeeBean,
  BrewingMethod,
  BrewRecommendation,
  FlavorNotesData,
} from "@/types";
import { useBrewMap } from "@/store";
import {
  cn,
  countryFlagEmoji,
  formatAltitude,
  monthName,
  flavorNoteLabel,
} from "@/lib/utils";
import { findSimilarBeans } from "@/lib/similar";
import { BrewCard } from "@/components/brewing/BrewCard";
import { BrewDetailModal } from "@/components/brewing/BrewDetailModal";

const FLAVOR_AXES: Array<{
  key: keyof CoffeeBean["flavorProfile"];
  label: string;
}> = [
  { key: "acidity", label: "Acidity" },
  { key: "body", label: "Body" },
  { key: "sweetness", label: "Sweetness" },
  { key: "bitterness", label: "Bitterness" },
  { key: "complexity", label: "Complexity" },
  { key: "fruitiness", label: "Fruitiness" },
];

interface Props {
  beans: CoffeeBean[];
  methods: BrewingMethod[];
  flavorNotes: FlavorNotesData;
}

export function BeanPanel({ beans, methods, flavorNotes }: Props) {
  const { selectedBeanId, clearSelection, selectBean } = useBrewMap();
  const bean = beans.find((b) => b.id === selectedBeanId);
  const methodById = useMemo(
    () => new Map(methods.map((m) => [m.id, m])),
    [methods],
  );
  const isOpen = Boolean(bean);

  const [openRec, setOpenRec] = useState<BrewRecommendation | null>(null);

  const sortedRecs = useMemo(
    () =>
      bean
        ? [...bean.brewingRecommendations].sort(
            (a, b) => b.affinity - a.affinity,
          )
        : [],
    [bean],
  );

  const similar = useMemo(
    () => (bean ? findSimilarBeans(bean, beans, 3) : []),
    [bean, beans],
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close panel"
        onClick={clearSelection}
        className={cn(
          "fixed inset-0 z-20 bg-espresso/40 transition-opacity sm:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-label={bean ? `Profile of ${bean.name}` : "Bean profile"}
        aria-hidden={!isOpen}
        className={cn(
          "fixed z-30 overflow-y-auto bg-background/95 shadow-xl backdrop-blur-sm transition-transform duration-300 ease-out",
          "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl border-t border-border",
          "sm:top-14 sm:right-0 sm:bottom-0 sm:left-auto sm:w-[50vw] sm:max-w-none sm:max-h-none sm:rounded-none sm:border-t-0 sm:border-l lg:w-105",
          isOpen
            ? "translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-y-0 sm:translate-x-full",
        )}
      >
        {bean && (
          <>
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <span aria-hidden className="text-lg leading-none">
                    {countryFlagEmoji(bean.countryCode)}
                  </span>
                  <span>{bean.country}</span>
                </div>
                <h2 className="font-display text-2xl leading-tight">
                  {bean.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {bean.region} · {formatAltitude(bean.altitudeMasl)}
                </p>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                aria-label="Close panel"
                className="rounded-md p-1 text-muted-foreground hover:bg-parchment hover:text-foreground dark:hover:bg-roast-dark"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <section className="space-y-2 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Flavor Profile
              </h3>
              <div className="space-y-1.5">
                {FLAVOR_AXES.map((axis) => {
                  const value = bean.flavorProfile[axis.key];
                  return (
                    <div key={axis.key} className="flex items-center gap-3">
                      <span className="w-24 text-sm">{axis.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-parchment dark:bg-roast-dark">
                        <div
                          className="h-full rounded-full bg-roast-medium"
                          style={{ width: `${(value / 10) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right font-mono text-xs text-muted-foreground">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2 border-t border-border p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tasting Notes
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {bean.flavorNotes.map((id) => (
                  <span
                    key={id}
                    className="rounded-full bg-parchment px-2.5 py-0.5 text-xs text-roast-dark dark:bg-roast-dark dark:text-parchment"
                  >
                    {flavorNoteLabel(flavorNotes, id)}
                  </span>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4 border-t border-border p-5 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Processing
                </div>
                <div className="capitalize">{bean.processing}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Roast
                </div>
                <div className="capitalize">{bean.roastRecommendation}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Varieties
                </div>
                <div>{bean.varieties.join(", ")}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Harvest
                </div>
                <div>{bean.harvestMonths.map(monthName).join(", ")}</div>
              </div>
            </section>

            <section className="border-t border-border p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended brewing
              </h3>
              <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
                {sortedRecs.map((rec, i) => (
                  <BrewCard
                    key={rec.methodId}
                    recommendation={rec}
                    method={methodById.get(rec.methodId)}
                    isBest={i === 0}
                    onClick={() => setOpenRec(rec)}
                  />
                ))}
              </div>
            </section>

            {similar.length > 0 && (
              <section className="border-t border-border p-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Similar beans
                </h3>
                <ul className="grid grid-cols-1 gap-2">
                  {similar.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => selectBean(r.id)}
                        className="w-full rounded-md border border-border bg-surface/60 p-2 text-left hover:border-roast-medium"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-medium">{r.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {r.country}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.flavorNotes
                            .slice(0, 2)
                            .map((id) => flavorNoteLabel(flavorNotes, id))
                            .join(" · ")}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="border-t border-border p-5 text-sm">
              <p>{bean.description}</p>
              <Link
                href={`/bean/${bean.slug}`}
                className="mt-4 inline-block rounded-md bg-roast-medium px-3 py-1.5 text-sm text-cream hover:bg-roast-dark"
              >
                View full profile →
              </Link>
            </section>
          </>
        )}
      </aside>

      {bean && openRec && (
        <BrewDetailModal
          open={Boolean(openRec)}
          onOpenChange={(o) => !o && setOpenRec(null)}
          bean={bean}
          recommendation={openRec}
          method={methodById.get(openRec.methodId)}
        />
      )}
    </>
  );
}
