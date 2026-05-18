import type { Metadata } from "next";
import { getBeans, getFlavorNotes } from "@/lib/data";
import { FlavorsExplorer } from "./FlavorsExplorer";

export const metadata: Metadata = {
  title: "Flavor Wheel · BeanMap",
  description:
    "Explore coffee flavor categories, subcategories, and notes. Filter beans on the map by tapping any segment of the wheel.",
};

export default function FlavorsPage() {
  const beans = getBeans();
  const flavorNotes = getFlavorNotes();
  return (
    <div className="mx-auto w-full max-w-(--breakpoint-xl) px-4 py-8 pb-24">
      <header className="mb-6 text-center">
        <h1 className="font-display text-3xl">Flavor Wheel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hover for counts, click any segment to filter the map. Selecting a
          category includes every note inside it.
        </p>
      </header>
      <FlavorsExplorer beans={beans} flavorNotes={flavorNotes} />
    </div>
  );
}
