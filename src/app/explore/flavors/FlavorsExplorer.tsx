"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crosshair, X } from "lucide-react";
import type { CoffeeBean, FlavorNotesData } from "@/types";
import { useBeanMap, filterBeans } from "@/store";
import { FlavorWheelLazy } from "@/components/visualization/FlavorWheelLazy";
import { flavorNoteLabel, countryFlagEmoji } from "@/lib/utils";

interface Props {
  beans: CoffeeBean[];
  flavorNotes: FlavorNotesData;
}

function findLabel(data: FlavorNotesData, id: string): string {
  const note = data.notes.find((n) => n.id === id);
  if (note) return note.name;
  const sub = data.subcategories.find((s) => s.id === id);
  if (sub) return sub.name;
  const cat = data.categories.find((c) => c.id === id);
  if (cat) return cat.name;
  return id;
}

export function FlavorsExplorer({ beans, flavorNotes }: Props) {
  const router = useRouter();
  const {
    filters,
    toggleFlavorNote,
    clearFlavorNotes,
    requestFitBounds,
  } = useBeanMap();
  const selectedIds = useMemo(
    () => new Set(filters.flavorNoteIds),
    [filters.flavorNoteIds],
  );
  const matching = useMemo(
    () => filterBeans(beans, filters, flavorNotes),
    [beans, filters, flavorNotes],
  );

  const onShowOnMap = () => {
    requestFitBounds();
    router.push("/");
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex items-center justify-center">
          <FlavorWheelLazy
            beans={beans}
            flavorNotes={flavorNotes}
            size={560}
            selectedIds={selectedIds}
            onToggle={toggleFlavorNote}
          />
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-border bg-surface/60 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Beans matching
            </h2>
            <p className="mt-1 font-display text-2xl">
              <span className="font-mono">{matching.length}</span>{" "}
              <span className="text-muted-foreground">of {beans.length}</span>
            </p>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={clearFlavorNotes}
                className="mt-2 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Clear flavor selection
              </button>
            )}
          </section>

          {selectedIds.size > 0 && (
            <section className="rounded-lg border border-border bg-surface/60 p-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Selected
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(selectedIds).map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-parchment px-2 py-0.5 text-xs text-roast-dark dark:bg-roast-dark dark:text-parchment"
                  >
                    {findLabel(flavorNotes, id)}
                    <button
                      type="button"
                      onClick={() => toggleFlavorNote(id)}
                      aria-label={`Remove ${findLabel(flavorNotes, id)}`}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-roast-medium/20 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </section>
          )}

          <button
            type="button"
            onClick={onShowOnMap}
            disabled={matching.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-roast-medium px-3 py-2 text-sm text-cream hover:bg-roast-dark disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <Crosshair className="h-4 w-4" />
            Show on map
          </button>
        </aside>
      </div>

      <section className="rounded-lg border border-border bg-surface/60 p-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {selectedIds.size > 0
            ? `Matching beans (${matching.length})`
            : `All beans (${beans.length})`}
        </h2>
        {matching.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No beans match this combination. Try a different flavor or clear
            your selection.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {matching.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/?bean=${b.slug}`}
                  className="block rounded-md border border-border bg-background/60 p-2 transition hover:border-roast-medium"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      <span aria-hidden className="mr-1">
                        {countryFlagEmoji(b.countryCode)}
                      </span>
                      {b.name}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {b.flavorNotes
                      .slice(0, 3)
                      .map((id) => flavorNoteLabel(flavorNotes, id))
                      .join(" · ")}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-surface/60 p-5">
        <h2 className="font-display text-xl">About the Coffee Flavor Wheel</h2>
        <div className="mt-2 space-y-3 text-sm leading-relaxed">
          <p>
            The Coffee Flavor Wheel is a structured vocabulary that the
            specialty coffee community uses to talk about taste. It is read
            from the inside out: the inner ring shows broad{" "}
            <strong>categories</strong> (Fruity, Floral, Nutty/Cocoa, Sweet,
            and so on), the middle ring breaks each category into{" "}
            <strong>subcategories</strong> (Berry, Citrus, Brown Sugar…), and
            the outer ring lists specific <strong>notes</strong> a taster might
            actually call out — blackberry, bergamot, caramel.
          </p>
          <p>
            The original wheel was developed by the Specialty Coffee
            Association (SCA) and World Coffee Research as a research-backed
            consensus on how baristas, roasters, and Q-graders describe the
            sensory experience of brewed coffee. Coffees are tasted against
            this lexicon during cupping so that profiles can be compared
            consistently across origins and roasts.
          </p>
          <p>
            On this page, click anywhere on the wheel to filter the bean
            catalog. Tap an outer note to find a single flavor, tap a
            subcategory to broaden the search, or tap a category to see every
            bean whose profile touches that family.
          </p>
        </div>
      </section>
    </div>
  );
}
