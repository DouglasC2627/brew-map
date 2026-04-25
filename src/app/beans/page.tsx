import type { Metadata } from "next";
import { getBeans, getFlavorNotes } from "@/lib/data";
import { BeansBrowser } from "@/components/bean/BeansBrowser";

export const metadata: Metadata = {
  title: "All beans · BrewMap",
  description: "Browse every coffee bean profile in BrewMap.",
};

export default function BeansPage() {
  const beans = getBeans();
  const flavorNotes = getFlavorNotes();
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-6">
      <header className="mb-6">
        <h1 className="font-display text-3xl">All beans</h1>
        <p className="text-sm text-muted-foreground">
          Browse, sort, and filter every bean profile.
        </p>
      </header>
      <BeansBrowser beans={beans} flavorNotes={flavorNotes} />
    </div>
  );
}
