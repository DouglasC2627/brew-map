"use client";

import { useEffect, useRef } from "react";
import { useQueryStates, type inferParserType } from "nuqs";
import { urlParsers } from "@/lib/url-state";
import { useBrewMap } from "@/store";
import type { CoffeeBean } from "@/types";

type UrlState = inferParserType<typeof urlParsers>;

interface Props {
  beans: CoffeeBean[];
}

export function UrlStateSync({ beans }: Props) {
  const [params, setParams] = useQueryStates(urlParsers, {
    history: "replace",
    shallow: true,
  });

  const hydrated = useRef(false);

  // One-shot hydration: URL → store
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const store = useBrewMap.getState();

    if (params.bean) {
      const bean = beans.find((b) => b.slug === params.bean);
      if (bean) store.selectBean(bean.id);
    }
    if (params.lng != null && params.lat != null && params.zoom != null) {
      store.setViewport({
        longitude: params.lng,
        latitude: params.lat,
        zoom: params.zoom,
      });
    }
    if (params.region.length) store.setRegions(params.region);
    if (params.processing.length) {
      params.processing.forEach((p) => store.toggleProcessing(p));
    }
    if (params.roast.length) {
      params.roast.forEach((r) => store.toggleRoast(r));
    }
    if (params.altMin != null && params.altMax != null) {
      store.setAltitudeRange([params.altMin, params.altMax]);
    }
  }, [params, beans]);

  // Store → URL: subscribe to selection + filters and reflect them
  useEffect(() => {
    if (!hydrated.current) return;
    const unsub = useBrewMap.subscribe((state, prev) => {
      const updates: Partial<UrlState> = {};

      if (state.selectedBeanId !== prev.selectedBeanId) {
        const bean = state.selectedBeanId
          ? beans.find((b) => b.id === state.selectedBeanId)
          : null;
        updates.bean = bean?.slug ?? null;
      }

      if (state.filters.regions !== prev.filters.regions) {
        updates.region = state.filters.regions;
      }
      if (state.filters.processingMethods !== prev.filters.processingMethods) {
        updates.processing = state.filters.processingMethods;
      }
      if (state.filters.roastLevels !== prev.filters.roastLevels) {
        updates.roast = state.filters.roastLevels;
      }
      if (state.filters.altitudeRange !== prev.filters.altitudeRange) {
        const [min, max] = state.filters.altitudeRange;
        const isDefault = min === 0 && max === 2500;
        updates.altMin = isDefault ? null : min;
        updates.altMax = isDefault ? null : max;
      }

      if (Object.keys(updates).length > 0) {
        setParams(updates);
      }
    });
    return unsub;
  }, [beans, setParams]);

  // Viewport debounced sync (300ms)
  useEffect(() => {
    if (!hydrated.current) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsub = useBrewMap.subscribe((state, prev) => {
      if (state.viewport === prev.viewport) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setParams({
          lng: Number(state.viewport.longitude.toFixed(2)),
          lat: Number(state.viewport.latitude.toFixed(2)),
          zoom: Number(state.viewport.zoom.toFixed(2)),
        });
      }, 300);
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, [setParams]);

  return null;
}
