#!/usr/bin/env node
// Interactive scaffolder for adding a coffee bean to src/data/beans.json.
// Run via: npm run new:bean

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, "../src/data");
const beansPath = `${dataDir}/beans.json`;
const methodsPath = `${dataDir}/brewing-methods.json`;
const notesPath = `${dataDir}/flavor-notes.json`;

const beans = JSON.parse(readFileSync(beansPath, "utf8"));
const methods = JSON.parse(readFileSync(methodsPath, "utf8"));
const flavor = JSON.parse(readFileSync(notesPath, "utf8"));

const rl = readline.createInterface({ input, output });

const PROCESSINGS = ["washed", "natural", "honey", "anaerobic", "wet-hulled"];
const ROASTS = ["light", "medium-light", "medium", "medium-dark", "dark"];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ask(prompt, { required = true, defaultValue } = {}) {
  const hint = defaultValue !== undefined ? ` [${defaultValue}]` : "";
  while (true) {
    const raw = (await rl.question(`${prompt}${hint}: `)).trim();
    if (!raw && defaultValue !== undefined) return defaultValue;
    if (!raw && !required) return "";
    if (raw) return raw;
    console.log("  (required)");
  }
}

async function askEnum(prompt, options) {
  while (true) {
    console.log(`  Options: ${options.join(", ")}`);
    const raw = (await ask(prompt)).toLowerCase();
    if (options.includes(raw)) return raw;
    console.log(`  ✖ "${raw}" is not in the list`);
  }
}

async function askNumber(prompt, { min, max, defaultValue } = {}) {
  while (true) {
    const raw = await ask(prompt, { defaultValue });
    const n = Number(raw);
    if (Number.isFinite(n)) {
      if (min != null && n < min) {
        console.log(`  ✖ must be ≥ ${min}`);
        continue;
      }
      if (max != null && n > max) {
        console.log(`  ✖ must be ≤ ${max}`);
        continue;
      }
      return n;
    }
    console.log("  ✖ not a number");
  }
}

async function askList(prompt) {
  const raw = await ask(`${prompt} (comma-separated)`);
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

async function askFlavorNotes() {
  const noteIds = new Set(flavor.notes.map((n) => n.id));
  const raw = await askList(
    "Flavor note IDs (e.g. blueberry, jasmine, dark-chocolate)",
  );
  const valid = [];
  for (const id of raw) {
    if (noteIds.has(id)) {
      valid.push(id);
    } else {
      // try to map from a free-text label
      const slug = slugify(id);
      if (noteIds.has(slug)) {
        valid.push(slug);
        console.log(`  → "${id}" mapped to "${slug}"`);
      } else {
        console.log(
          `  ✖ "${id}" is not a known flavor note ID — skipping. ` +
            `See src/data/flavor-notes.json.`,
        );
      }
    }
  }
  return valid;
}

async function main() {
  console.log("\nNew bean — fill out fields. Empty input = use default.\n");

  const name = await ask("Name (e.g. Ethiopian Yirgacheffe)");
  const slug = await ask("Slug", { defaultValue: slugify(name) });

  if (beans.some((b) => b.slug === slug)) {
    console.log(`  ✖ slug "${slug}" already exists. Aborting.`);
    rl.close();
    process.exit(1);
  }
  const id = slug;

  const country = await ask("Country");
  const countryCode = (
    await ask("ISO-2 country code", { defaultValue: "" })
  ).toUpperCase();
  const region = await ask("Region (e.g. Yirgacheffe, Sidamo)");
  const lng = await askNumber("Longitude (-180..180)", {
    min: -180,
    max: 180,
  });
  const lat = await askNumber("Latitude (-90..90)", { min: -90, max: 90 });
  const altMin = await askNumber("Altitude min (masl)", { min: 0, max: 5000 });
  const altMax = await askNumber("Altitude max (masl)", {
    min: altMin,
    max: 5000,
  });
  const varieties = await askList("Varieties");
  const processing = await askEnum("Processing", PROCESSINGS);
  const roast = await askEnum("Roast recommendation", ROASTS);

  console.log("\nFlavor profile (1–10):");
  const acidity = await askNumber("  Acidity", { min: 1, max: 10 });
  const body = await askNumber("  Body", { min: 1, max: 10 });
  const sweetness = await askNumber("  Sweetness", { min: 1, max: 10 });
  const bitterness = await askNumber("  Bitterness", { min: 1, max: 10 });
  const complexity = await askNumber("  Complexity", { min: 1, max: 10 });
  const fruitiness = await askNumber("  Fruitiness", { min: 1, max: 10 });

  const flavorNotes = await askFlavorNotes();
  const harvestRaw = await askList("Harvest months (1–12)");
  const harvestMonths = harvestRaw
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12);

  const description = await ask("One-paragraph description");

  const bean = {
    id,
    slug,
    name,
    country,
    countryCode,
    region,
    coordinates: [lng, lat],
    altitudeMasl: [altMin, altMax],
    varieties,
    processing,
    roastRecommendation: roast,
    flavorProfile: {
      acidity,
      body,
      sweetness,
      bitterness,
      complexity,
      fruitiness,
    },
    flavorNotes,
    harvestMonths,
    description,
    relatedBeanIds: [],
    brewingRecommendations: [],
  };

  console.log("\n→ Preview:");
  console.log(JSON.stringify(bean, null, 2));
  const confirm = (
    await ask("\nWrite to beans.json? (y/N)", { defaultValue: "n" })
  )
    .trim()
    .toLowerCase();
  if (confirm !== "y" && confirm !== "yes") {
    console.log("Aborted.");
    rl.close();
    return;
  }

  beans.push(bean);
  writeFileSync(beansPath, JSON.stringify(beans, null, 2) + "\n");
  console.log(`\n✓ Added "${name}" to beans.json (${beans.length} total).`);
  console.log(
    "Next: add brewing recommendations. The map needs at least one " +
      "method; the panel sorts by affinity.",
  );
  console.log(`Available methods: ${methods.map((m) => m.id).join(", ")}`);
  console.log(
    "  Either edit beans.json by hand, or run scripts/expand-brewing-recs.mjs.",
  );
  console.log("Then run: npm run validate:data");
  rl.close();
}

main().catch((e) => {
  console.error(e);
  rl.close();
  process.exit(1);
});
