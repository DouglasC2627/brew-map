#!/usr/bin/env node
// Generates a placeholder regions.geojson with a hexagon polygon around
// each bean's coordinate. Replace with real Natural Earth / GADM polygons
// (simplified via mapshaper) before shipping.
// Run: node scripts/generate-regions.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, "../src/data");
const publicDataDir = resolve(here, "../public/data");

import { mkdirSync } from "node:fs";
mkdirSync(publicDataDir, { recursive: true });

const beans = JSON.parse(readFileSync(`${dataDir}/beans.json`, "utf8"));

function hexagon(lng, lat, radiusDeg) {
  const coords = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const dx = radiusDeg * Math.cos(angle) / Math.cos((lat * Math.PI) / 180);
    const dy = radiusDeg * Math.sin(angle);
    coords.push([lng + dx, lat + dy]);
  }
  coords.push(coords[0]);
  return coords;
}

const features = beans.map((b) => ({
  type: "Feature",
  properties: {
    regionId: b.id,
    country: b.country,
    name: `${b.region} · ${b.country}`,
    altitudeRange: b.altitudeMasl,
  },
  geometry: {
    type: "Polygon",
    coordinates: [hexagon(b.coordinates[0], b.coordinates[1], 0.45)],
  },
}));

const geojson = {
  type: "FeatureCollection",
  note: "Placeholder hexagon buffers around each bean. Replace with real polygons from Natural Earth / GADM.",
  features,
};

const body = JSON.stringify(geojson, null, 2) + "\n";
writeFileSync(`${dataDir}/regions.geojson`, body);
writeFileSync(`${publicDataDir}/regions.geojson`, body);
console.log(
  `Wrote ${features.length} region features to src/data + public/data.`,
);
