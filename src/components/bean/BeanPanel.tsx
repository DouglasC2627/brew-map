"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import type { CoffeeBean, BrewingMethod } from "@/types";
import { useBrewMap } from "@/store";
import { countryFlagEmoji, formatAltitude, monthName } from "@/lib/utils";

const FLAVOR_AXES: Array<{ key: keyof CoffeeBean["flavorProfile"]; label: string }> = [
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
}

export function BeanPanel({ beans, methods }: Props) {
  const { selectedBeanId, clearSelection } = useBrewMap();
  const bean = beans.find((b) => b.id === selectedBeanId);
  const methodById = new Map(methods.map((m) => [m.id, m]));

  return (
    <AnimatePresence>
      {bean && (
        <motion.aside
          key={bean.id}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
          className="fixed right-0 top-14 bottom-0 z-30 w-full overflow-y-auto border-l border-border bg-background/95 shadow-xl backdrop-blur-sm sm:w-[50vw] lg:w-[420px]"
          aria-label={`Profile of ${bean.name}`}
        >
          <div className="flex items-start justify-between border-b border-border p-5">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-muted">
                <span aria-hidden className="text-lg leading-none">
                  {countryFlagEmoji(bean.countryCode)}
                </span>
                <span>{bean.country}</span>
              </div>
              <h2 className="font-display text-2xl leading-tight">
                {bean.name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {bean.region} · {formatAltitude(bean.altitudeMasl)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              aria-label="Close panel"
              className="rounded-md p-1 text-muted hover:bg-parchment hover:text-foreground dark:hover:bg-roast-dark"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <section className="space-y-2 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
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
                    <span className="w-6 text-right font-mono text-xs text-muted">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-2 border-t border-border p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Tasting Notes
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {bean.flavorNotes.map((note) => (
                <span
                  key={note}
                  className="rounded-full bg-parchment px-2.5 py-0.5 text-xs text-roast-dark dark:bg-roast-dark dark:text-parchment"
                >
                  {note}
                </span>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 border-t border-border p-5 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">
                Processing
              </div>
              <div className="capitalize">{bean.processing}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">
                Roast
              </div>
              <div className="capitalize">{bean.roastRecommendation}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs uppercase tracking-wider text-muted">
                Varieties
              </div>
              <div>{bean.varieties.join(", ")}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs uppercase tracking-wider text-muted">
                Harvest
              </div>
              <div>{bean.harvestMonths.map(monthName).join(", ")}</div>
            </div>
          </section>

          <section className="space-y-3 border-t border-border p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Top brewing methods
            </h3>
            <ul className="space-y-2">
              {[...bean.brewingRecommendations]
                .sort((a, b) => b.affinity - a.affinity)
                .slice(0, 3)
                .map((rec) => {
                  const method = methodById.get(rec.methodId);
                  return (
                    <li
                      key={rec.methodId}
                      className="rounded-md border border-border bg-surface/60 p-3"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-medium">
                          {method?.name ?? rec.methodId}
                        </span>
                        <span className="font-mono text-xs text-muted">
                          {rec.ratio} · {rec.waterTempC}°C
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        {rec.tastingNotes}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </section>

          <section className="border-t border-border p-5 text-sm">
            <p>{bean.description}</p>
            <Link
              href={`/bean/${bean.slug}`}
              className="mt-4 inline-block rounded-md bg-roast-medium px-3 py-1.5 text-sm text-cream hover:bg-roast-dark"
            >
              View full profile →
            </Link>
          </section>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
