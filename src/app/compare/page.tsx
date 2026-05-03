import type { Metadata } from "next";
import Link from "next/link";
import {
  getBeans,
  getBrewingMethods,
  getFlavorNotes,
} from "@/lib/data";
import { ComparisonView } from "@/components/compare/ComparisonView";

interface SearchParams {
  searchParams: Promise<{ beans?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchParams): Promise<Metadata> {
  const { beans: param } = await searchParams;
  const slugs = (param ?? "").split(",").filter(Boolean);
  const all = getBeans();
  const matched = slugs
    .map((s) => all.find((b) => b.slug === s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  if (matched.length === 0) {
    return {
      title: "Compare beans · BeanMap",
      description: "Side-by-side comparison of coffee bean profiles.",
    };
  }
  const names = matched.map((b) => b.name).join(" vs ");
  return {
    title: `${names} · Compare on BeanMap`,
    description: `Compare flavor profiles, origin, and brewing affinity for ${names}.`,
  };
}

export default async function ComparePage({ searchParams }: SearchParams) {
  const { beans: param } = await searchParams;
  const slugs = (param ?? "").split(",").filter(Boolean).slice(0, 3);

  const all = getBeans();
  const matched = slugs
    .map((s) => all.find((b) => b.slug === s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const methods = getBrewingMethods();
  const flavorNotes = getFlavorNotes();

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-xl) px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl">Compare beans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick up to 3 beans from the map or list and compare them side by
          side.
        </p>
      </header>

      {matched.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No beans selected. Open a bean and tap{" "}
            <span className="font-medium text-foreground">Compare</span> to add
            it.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded-md bg-roast-medium px-3 py-1.5 text-sm text-cream hover:bg-roast-dark"
            >
              Open the map
            </Link>
            <Link
              href="/beans"
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-roast-medium"
            >
              Browse beans
            </Link>
          </div>
        </div>
      ) : (
        <ComparisonView
          beans={matched}
          methods={methods}
          flavorNotes={flavorNotes}
        />
      )}
    </div>
  );
}
