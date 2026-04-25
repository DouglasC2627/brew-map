"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { CoffeeBean, BrewingMethod, FlavorNotesData } from "@/types";
import { BeanPanel } from "@/components/bean/BeanPanel";
import { FilterPanel } from "@/components/filter/FilterPanel";
import { SearchCommand } from "@/components/shared/SearchCommand";
import { UrlStateSync } from "@/components/shared/UrlStateSync";

const CoffeeMap = dynamic(
  () => import("./CoffeeMap").then((m) => m.CoffeeMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[70vh] flex-1 animate-pulse items-center justify-center bg-parchment text-muted-foreground dark:bg-roast-dark">
        Loading map…
      </div>
    ),
  },
);

interface Props {
  beans: CoffeeBean[];
  methods: BrewingMethod[];
  flavorNotes: FlavorNotesData;
}

export function MapView({ beans, methods, flavorNotes }: Props) {
  return (
    <div className="relative flex flex-1 flex-col">
      <Suspense fallback={null}>
        <UrlStateSync beans={beans} />
      </Suspense>
      <CoffeeMap beans={beans} />
      <FilterPanel beans={beans} />
      <BeanPanel beans={beans} methods={methods} flavorNotes={flavorNotes} />
      <SearchCommand beans={beans} flavorNotes={flavorNotes} />
    </div>
  );
}
