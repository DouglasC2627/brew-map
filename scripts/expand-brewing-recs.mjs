#!/usr/bin/env node
// Expands beans.json so every bean has a BrewRecommendation for every method.
// Preserves any hand-authored recs; fills gaps with traits-derived defaults.
// Run: node scripts/expand-brewing-recs.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, "../src/data");

const beans = JSON.parse(readFileSync(`${dataDir}/beans.json`, "utf8"));
const methods = JSON.parse(
  readFileSync(`${dataDir}/brewing-methods.json`, "utf8"),
);

const GRIND_MICRONS = {
  "extra-fine": 200,
  fine: 260,
  "medium-fine": 600,
  medium: 800,
  "medium-coarse": 950,
  coarse: 1050,
  "extra-coarse": 1200,
};

// Affinity weights per method — how strongly each bean axis influences fit.
// Positive = favors high value, negative = favors low value.
const AFFINITY_WEIGHTS = {
  v60: { acidity: 0.9, complexity: 0.8, fruitiness: 0.6, body: -0.3 },
  chemex: { acidity: 0.7, complexity: 0.8, sweetness: 0.4, body: -0.5 },
  kalita: { sweetness: 0.6, complexity: 0.4, acidity: 0.3 },
  espresso: { body: 0.8, sweetness: 0.6, bitterness: 0.3, acidity: -0.3 },
  "french-press": { body: 0.9, sweetness: 0.4, acidity: -0.4, complexity: -0.2 },
  aeropress: { sweetness: 0.5, complexity: 0.3, acidity: 0.2 },
  "cold-brew": { sweetness: 0.7, body: 0.4, bitterness: -0.6, acidity: -0.3 },
  moka: { body: 0.8, bitterness: 0.3, acidity: -0.4 },
};

function computeAffinity(methodId, fp) {
  const w = AFFINITY_WEIGHTS[methodId] ?? {};
  let score = 5; // baseline
  for (const [axis, weight] of Object.entries(w)) {
    const v = fp[axis] ?? 5;
    score += ((v - 5.5) / 4.5) * weight * 3;
  }
  return Math.max(1, Math.min(10, Math.round(score)));
}

function adjustTemp(baseC, bean) {
  let t = baseC;
  if (bean.roastRecommendation === "dark" || bean.roastRecommendation === "medium-dark")
    t -= 2;
  if (bean.roastRecommendation === "light") t += 1;
  if (bean.processing === "natural" || bean.processing === "wet-hulled") t -= 1;
  return Math.max(80, Math.min(96, t));
}

function tastingTemplate(bean, methodId) {
  const topNotes = bean.flavorNotes.slice(0, 2).join(" and ");
  const character = bean.flavorProfile.body >= 7 ? "full-bodied" : "clean";
  const templates = {
    v60: `Highlights ${topNotes}; ${character} and articulate.`,
    chemex: `Tea-like clarity; ${topNotes} shine through.`,
    kalita: `Balanced extraction; ${topNotes} with rounded sweetness.`,
    espresso: `Concentrated ${topNotes}; syrupy shot.`,
    "french-press": `Heavy body; ${topNotes} with textured mouthfeel.`,
    aeropress: `Versatile cup; ${topNotes} with soft acidity.`,
    "cold-brew": `Smooth and sweet; ${topNotes} without the bite.`,
    moka: `Bold and rich; ${topNotes} in a concentrated cup.`,
  };
  return templates[methodId] ?? `Notes of ${topNotes}.`;
}

function difficultyFor(methodId) {
  const map = {
    v60: 3,
    chemex: 3,
    kalita: 2,
    espresso: 4,
    "french-press": 1,
    aeropress: 2,
    "cold-brew": 1,
    moka: 2,
  };
  return map[methodId] ?? 3;
}

function buildDefaultRec(bean, method) {
  const defaults = method.defaultParameters;
  const grindSize = defaults.grindSize;
  const rec = {
    methodId: method.id,
    grindSize,
    grindMicrons: GRIND_MICRONS[grindSize] ?? 700,
    waterTempC: adjustTemp(defaults.waterTempC, bean),
    ratio: defaults.ratio,
    brewSeconds: defaults.brewSeconds,
    difficulty: difficultyFor(method.id),
    affinity: computeAffinity(method.id, bean.flavorProfile),
    tastingNotes: tastingTemplate(bean, method.id),
  };
  if (method.category === "pour-over") rec.bloomSeconds = 40;
  return rec;
}

let added = 0;
for (const bean of beans) {
  const existing = new Map(
    (bean.brewingRecommendations ?? []).map((r) => [r.methodId, r]),
  );
  const merged = methods.map((m) => {
    if (existing.has(m.id)) return existing.get(m.id);
    added += 1;
    return buildDefaultRec(bean, m);
  });
  bean.brewingRecommendations = merged;
}

writeFileSync(`${dataDir}/beans.json`, JSON.stringify(beans, null, 2) + "\n");
console.log(
  `Expanded ${beans.length} beans × ${methods.length} methods; added ${added} defaults.`,
);
