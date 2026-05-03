import type { Metadata } from "next";
import { getBeans } from "@/lib/data";
import { InsightsClient } from "./InsightsClient";

export const metadata: Metadata = {
  title: "Insights · BeanMap",
  description:
    "Explore coffee origins by altitude, harvest season, and other dimensions.",
};

export default function InsightsPage() {
  const beans = getBeans();
  return (
    <div className="mx-auto w-full max-w-(--breakpoint-xl) px-4 py-8 pb-24">
      <header className="mb-6">
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
