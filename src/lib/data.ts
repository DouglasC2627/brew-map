import beansJson from "@/data/beans.json";
import methodsJson from "@/data/brewing-methods.json";
import flavorNotesJson from "@/data/flavor-notes.json";
import {
  beansDataSchema,
  brewingMethodsDataSchema,
  flavorNotesDataSchema,
} from "@/lib/schemas";
import type {
  BrewingMethod,
  CoffeeBean,
  FlavorNotesData,
} from "@/types";

let cachedBeans: CoffeeBean[] | null = null;
let cachedMethods: BrewingMethod[] | null = null;
let cachedFlavorNotes: FlavorNotesData | null = null;

export function getBeans(): CoffeeBean[] {
  if (!cachedBeans) {
    cachedBeans = beansDataSchema.parse(beansJson) as CoffeeBean[];
  }
  return cachedBeans;
}

export function getBeanBySlug(slug: string): CoffeeBean | undefined {
  return getBeans().find((b) => b.slug === slug);
}

export function getBeanById(id: string): CoffeeBean | undefined {
  return getBeans().find((b) => b.id === id);
}

export function getBrewingMethods(): BrewingMethod[] {
  if (!cachedMethods) {
    cachedMethods = brewingMethodsDataSchema.parse(methodsJson) as BrewingMethod[];
  }
  return cachedMethods;
}

export function getBrewingMethod(id: string): BrewingMethod | undefined {
  return getBrewingMethods().find((m) => m.id === id);
}

export function getFlavorNotes(): FlavorNotesData {
  if (!cachedFlavorNotes) {
    cachedFlavorNotes = flavorNotesDataSchema.parse(
      flavorNotesJson,
    ) as FlavorNotesData;
  }
  return cachedFlavorNotes;
}

export function getFlavorNoteName(id: string): string {
  const note = getFlavorNotes().notes.find((n) => n.id === id);
  return note?.name ?? id;
}
