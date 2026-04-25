import Fuse from "fuse.js";
import type { CoffeeBean } from "@/types";

export function createBeanSearch(beans: CoffeeBean[]): Fuse<CoffeeBean> {
  return new Fuse(beans, {
    keys: [
      { name: "name", weight: 0.45 },
      { name: "country", weight: 0.2 },
      { name: "region", weight: 0.2 },
      { name: "flavorNotes", weight: 0.15 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
  });
}

export const RECENT_SEARCH_KEY = "brewmap.recent-bean-searches";

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string").slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(beanId: string) {
  if (typeof window === "undefined") return;
  const current = getRecentSearches().filter((id) => id !== beanId);
  current.unshift(beanId);
  localStorage.setItem(
    RECENT_SEARCH_KEY,
    JSON.stringify(current.slice(0, 5)),
  );
}
