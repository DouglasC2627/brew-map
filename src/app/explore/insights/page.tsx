import type { Metadata } from "next";
import { getBeans } from "@/lib/data";
import { InsightsClient } from "./InsightsClient";
import { FilterPanel } from "@/components/filter/FilterPanel";

export const metadata: Metadata = {
  title: "Insights · BeanMap",
  description:
    "Explore coffee origins by altitude, harvest season, and other dimensions.",
};

export default function InsightsPage() {
  const beans = getBeans();
  return (
    <div className="mx-auto w-full max-w-(--breakpoint-xl) overflow-x-hidden px-4 py-8 pb-24">
      <FilterPanel beans={beans} />
      <header className="mb-6 text-center">
        <h1 className="font-display text-3xl">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregate views across the bean catalog. Filters from the explore
          view apply here too.
        </p>
      </header>
      <InsightsClient beans={beans} />
    </div>
  );
}
