"use client";

import dynamic from "next/dynamic";
import type { CoffeeBean, BrewingMethod } from "@/types";
import { BeanPanel } from "@/components/bean/BeanPanel";

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
}

export function MapView({ beans, methods }: Props) {
  return (
    <div className="relative flex flex-1 flex-col">
      <CoffeeMap beans={beans} />
      <BeanPanel beans={beans} methods={methods} />
    </div>
  );
}
