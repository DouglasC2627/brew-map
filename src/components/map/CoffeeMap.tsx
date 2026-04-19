"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  Source,
  type MapRef,
  type MapMouseEvent,
} from "react-map-gl/mapbox";
import type {
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import type { CoffeeBean } from "@/types";
import { useBrewMap, filterBeans } from "@/store";
import { RegionHighlight } from "./RegionHighlight";

const LIGHT_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT ??
  "mapbox://styles/mapbox/light-v11";
const DARK_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK ??
  "mapbox://styles/mapbox/dark-v11";

const CLUSTER_LAYER: CircleLayerSpecification = {
  id: "bean-clusters",
  type: "circle",
  source: "beans",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#6f4e37",
    "circle-radius": [
      "step",
      ["get", "point_count"],
      18,
      5,
      24,
      15,
      30,
    ],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#faf6f1",
    "circle-opacity": 0.9,
  },
};

const CLUSTER_COUNT_LAYER: SymbolLayerSpecification = {
  id: "bean-cluster-count",
  type: "symbol",
  source: "beans",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 12,
    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
  },
  paint: { "text-color": "#faf6f1" },
};

const POINT_LAYER: CircleLayerSpecification = {
  id: "bean-points",
  type: "circle",
  source: "beans",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      "#c1440e",
      "#a67c52",
    ],
    "circle-radius": 7,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#faf6f1",
    "circle-opacity": [
      "case",
      ["boolean", ["get", "filtered"], true],
      1,
      0.15,
    ],
  },
};

interface Props {
  beans: CoffeeBean[];
}

export function CoffeeMap({ beans }: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const { resolvedTheme } = useTheme();
  const [cursor, setCursor] = useState<string>("grab");

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const { viewport, setViewport, selectBean, filters, setHoveredRegion } =
    useBrewMap();

  const matchingIds = useMemo(
    () => new Set(filterBeans(beans, filters).map((b) => b.id)),
    [beans, filters],
  );

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: beans.map((b) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: b.coordinates },
        properties: {
          id: b.id,
          slug: b.slug,
          name: b.name,
          country: b.country,
          filtered: matchingIds.has(b.id),
        },
      })),
    }),
    [beans, matchingIds],
  );

  const onClick = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const props = feature.properties as
        | { id?: string; cluster?: boolean; cluster_id?: number }
        | undefined;

      if (feature.geometry.type !== "Point") return;
      const coords = feature.geometry.coordinates as [number, number];

      if (props?.cluster) {
        const source = mapRef.current
          ?.getMap()
          .getSource("beans") as
          | {
              getClusterExpansionZoom: (id: number) => Promise<number>;
            }
          | undefined;
        if (!source || props.cluster_id == null) return;
        source
          .getClusterExpansionZoom(props.cluster_id)
          .then((zoom) => {
            mapRef.current?.easeTo({
              center: coords,
              zoom: zoom + 0.5,
              duration: 600,
            });
          })
          .catch(() => {});
        return;
      }

      if (props?.id) {
        mapRef.current?.flyTo({ center: coords, zoom: 5, duration: 900 });
        selectBean(props.id);
      }
    },
    [selectBean],
  );

  if (!token) {
    return (
      <div className="flex h-full min-h-[60vh] flex-1 items-center justify-center bg-parchment p-8 text-center dark:bg-roast-dark">
        <div className="max-w-md space-y-2">
          <h2 className="font-display text-2xl">Mapbox token missing</h2>
          <p className="text-sm text-muted-foreground">
            Add <code className="mono">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
            <code className="mono">.env.local</code> (see{" "}
            <code className="mono">.env.example</code>) and restart the dev
            server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[70vh] flex-1">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        mapStyle={resolvedTheme === "dark" ? DARK_STYLE : LIGHT_STYLE}
        projection={{ name: "globe" }}
        initialViewState={viewport}
        onMove={(e) => setViewport(e.viewState)}
        onClick={onClick}
        onMouseMove={(e) => {
          const feature = e.features?.[0];
          const props = feature?.properties as
            | { id?: string; cluster?: boolean }
            | undefined;
          if (props?.id && !props.cluster) {
            setCursor("pointer");
            setHoveredRegion(props.id);
          } else if (props?.cluster) {
            setCursor("pointer");
            setHoveredRegion(null);
          } else {
            setCursor("grab");
            setHoveredRegion(null);
          }
        }}
        onMouseLeave={() => {
          setCursor("grab");
          setHoveredRegion(null);
        }}
        cursor={cursor}
        interactiveLayerIds={["bean-clusters", "bean-points"]}
        fog={{
          color: "rgb(220, 210, 195)",
          "high-color": "rgb(180, 160, 140)",
          "horizon-blend": 0.1,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <RegionHighlight />
        <Source
          id="beans"
          type="geojson"
          data={geojson}
          cluster
          clusterMaxZoom={6}
          clusterRadius={45}
        >
          <Layer {...CLUSTER_LAYER} />
          <Layer {...CLUSTER_COUNT_LAYER} />
          <Layer {...POINT_LAYER} />
        </Source>
      </Map>
    </div>
  );
}
