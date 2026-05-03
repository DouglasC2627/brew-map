import type { Metadata } from "next";
import {
  getBeans,
  getBrewingMethods,
  getFlavorNotes,
} from "@/lib/data";
import { BeansBrowser } from "@/components/bean/BeansBrowser";
import { FilterPanel } from "@/components/filter/FilterPanel";
import { ComparisonTray } from "@/components/compare/ComparisonTray";

export const metadata: Metadata = {
  title: "All beans · BeanMap",
  description: "Browse every coffee bean profile in BeanMap.",
};

export default function BeansPage() {
  const beans = getBeans();
  const flavorNotes = getFlavorNotes();
  const methods = getBrewingMethods();
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 pb-24">
      <FilterPanel beans={beans} />
      <header className="mb-6 text-center">
        <h1 className="font-display text-3xl">All beans</h1>
        <p className="text-sm text-muted-foreground">
          Browse, sort, and filter every bean profile.
        </p>
      </header>
      <BeansBrowser beans={beans} flavorNotes={flavorNotes} />
      <ComparisonTray
        beans={beans}
        methods={methods}
        flavorNotes={flavorNotes}
      />
    </div>
  );
}
