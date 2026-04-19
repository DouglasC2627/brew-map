"use client";

import { useEffect, useState } from "react";
import { Layer, Source } from "react-map-gl/mapbox";
import { useBrewMap } from "@/store";

const EMPTY: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export function RegionHighlight() {
  const hoveredRegionId = useBrewMap((s) => s.hoveredRegionId);
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

  const filtered: GeoJSON.FeatureCollection = hoveredRegionId
    ? {
        type: "FeatureCollection",
        features: regions.features.filter(
          (f) => f.properties?.regionId === hoveredRegionId,
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
