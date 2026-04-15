"use client";

import { create } from "zustand";
import type {
  CoffeeBean,
  ProcessingMethod,
  RoastLevel,
} from "@/types";

export interface ViewportState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface FlavorRanges {
  acidity: [number, number];
  body: [number, number];
  sweetness: [number, number];
  bitterness: [number, number];
}

export interface FilterState {
  regions: string[]; // country codes or continent keys
  processingMethods: ProcessingMethod[];
  altitudeRange: [number, number];
  roastLevels: RoastLevel[];
  flavorRanges: FlavorRanges;
}

export interface BrewMapState {
  // map
  viewport: ViewportState;
  setViewport: (v: Partial<ViewportState>) => void;

  // selection
  selectedBeanId: string | null;
  selectBean: (id: string | null) => void;
  clearSelection: () => void;

  // filters
  filters: FilterState;
  setRegions: (r: string[]) => void;
  toggleProcessing: (p: ProcessingMethod) => void;
  toggleRoast: (r: RoastLevel) => void;
  setAltitudeRange: (range: [number, number]) => void;
  setFlavorRange: (axis: keyof FlavorRanges, range: [number, number]) => void;
  resetFilters: () => void;

  // comparison
  comparisonBeanIds: string[];
  addToComparison: (id: string) => void;
  removeFromComparison: (id: string) => void;
  isComparisonOpen: boolean;
  setComparisonOpen: (open: boolean) => void;

  // ui
  isBeanPanelOpen: boolean;
  setBeanPanelOpen: (open: boolean) => void;
  isFilterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
}

const DEFAULT_FILTERS: FilterState = {
  regions: [],
  processingMethods: [],
  altitudeRange: [0, 2500],
  roastLevels: [],
  flavorRanges: {
    acidity: [1, 10],
    body: [1, 10],
    sweetness: [1, 10],
    bitterness: [1, 10],
  },
};

export const useBrewMap = create<BrewMapState>((set) => ({
  viewport: {
    longitude: 15,
    latitude: 5,
    zoom: 1.6,
    bearing: 0,
    pitch: 0,
  },
  setViewport: (v) =>
    set((s) => ({ viewport: { ...s.viewport, ...v } })),

  selectedBeanId: null,
  selectBean: (id) =>
    set({ selectedBeanId: id, isBeanPanelOpen: id !== null }),
  clearSelection: () =>
    set({ selectedBeanId: null, isBeanPanelOpen: false }),

  filters: DEFAULT_FILTERS,
  setRegions: (regions) =>
    set((s) => ({ filters: { ...s.filters, regions } })),
  toggleProcessing: (p) =>
    set((s) => {
      const has = s.filters.processingMethods.includes(p);
      return {
        filters: {
          ...s.filters,
          processingMethods: has
            ? s.filters.processingMethods.filter((x) => x !== p)
            : [...s.filters.processingMethods, p],
        },
      };
    }),
  toggleRoast: (r) =>
    set((s) => {
      const has = s.filters.roastLevels.includes(r);
      return {
        filters: {
          ...s.filters,
          roastLevels: has
            ? s.filters.roastLevels.filter((x) => x !== r)
            : [...s.filters.roastLevels, r],
        },
      };
    }),
  setAltitudeRange: (range) =>
    set((s) => ({ filters: { ...s.filters, altitudeRange: range } })),
  setFlavorRange: (axis, range) =>
    set((s) => ({
      filters: {
        ...s.filters,
        flavorRanges: { ...s.filters.flavorRanges, [axis]: range },
      },
    })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  comparisonBeanIds: [],
  addToComparison: (id) =>
    set((s) =>
      s.comparisonBeanIds.includes(id) || s.comparisonBeanIds.length >= 3
        ? s
        : { comparisonBeanIds: [...s.comparisonBeanIds, id] },
    ),
  removeFromComparison: (id) =>
    set((s) => ({
      comparisonBeanIds: s.comparisonBeanIds.filter((x) => x !== id),
    })),
  isComparisonOpen: false,
  setComparisonOpen: (open) => set({ isComparisonOpen: open }),

  isBeanPanelOpen: false,
  setBeanPanelOpen: (open) => set({ isBeanPanelOpen: open }),
  isFilterPanelOpen: false,
  setFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),
}));

export function filterBeans(
  beans: CoffeeBean[],
  filters: FilterState,
): CoffeeBean[] {
  const {
    regions,
    processingMethods,
    altitudeRange,
    roastLevels,
    flavorRanges,
  } = filters;

  return beans.filter((b) => {
    if (regions.length && !regions.includes(b.countryCode)) return false;
    if (processingMethods.length && !processingMethods.includes(b.processing))
      return false;
    if (roastLevels.length && !roastLevels.includes(b.roastRecommendation))
      return false;

    const [minAlt, maxAlt] = altitudeRange;
    if (b.altitudeMasl[1] < minAlt || b.altitudeMasl[0] > maxAlt) return false;

    const fp = b.flavorProfile;
    if (fp.acidity < flavorRanges.acidity[0] || fp.acidity > flavorRanges.acidity[1])
      return false;
    if (fp.body < flavorRanges.body[0] || fp.body > flavorRanges.body[1])
      return false;
    if (
      fp.sweetness < flavorRanges.sweetness[0] ||
      fp.sweetness > flavorRanges.sweetness[1]
    )
      return false;
    if (
      fp.bitterness < flavorRanges.bitterness[0] ||
      fp.bitterness > flavorRanges.bitterness[1]
    )
      return false;

    return true;
  });
}
