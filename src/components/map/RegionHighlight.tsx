"use client";

import { useEffect, useMemo, useState } from "react";
import { Layer, Source } from "react-map-gl/mapbox";
import { useBrewMap } from "@/store";

const EMPTY: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export function RegionHighlight() {
  const hoveredRegionId = useBrewMap((s) => s.hoveredRegionId);
  const selectedBeanId = useBrewMap((s) => s.selectedBeanId);
  const [regions, setRegions] = useState<GeoJSON.FeatureCollection>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/regions.geojson")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setRegions(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Highlight the selected bean's region persistently and any hovered region.
  const activeIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedBeanId) ids.add(selectedBeanId);
    if (hoveredRegionId) ids.add(hoveredRegionId);
    return ids;
  }, [selectedBeanId, hoveredRegionId]);

  const filtered: GeoJSON.FeatureCollection = activeIds.size
    ? {
        type: "FeatureCollection",
        features: regions.features.filter((f) =>
          activeIds.has(f.properties?.regionId as string),
        ),
      }
    : EMPTY;

  return (
    <Source id="regions" type="geojson" data={filtered}>
      <Layer
        id="region-fill"
        type="fill"
        paint={{ "fill-color": "#c1440e", "fill-opacity": 0.2 }}
      />
      <Layer
        id="region-outline"
        type="line"
        paint={{
          "line-color": "#c1440e",
          "line-width": 1.5,
          "line-opacity": 0.7,
        }}
      />
    </Source>
  );
}
