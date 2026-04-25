import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  beansDataSchema,
  brewingMethodsDataSchema,
  flavorNotesDataSchema,
} from "../src/lib/schemas";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, "../src/data");

const beans = JSON.parse(readFileSync(`${dataDir}/beans.json`, "utf8"));
const methods = JSON.parse(
  readFileSync(`${dataDir}/brewing-methods.json`, "utf8"),
);
const flavorNotes = JSON.parse(
  readFileSync(`${dataDir}/flavor-notes.json`, "utf8"),
);

const beansResult = beansDataSchema.safeParse(beans);
if (!beansResult.success) {
  console.error("beans.json failed validation:");
  console.error(JSON.stringify(beansResult.error.issues, null, 2));
  process.exit(1);
}

const methodsResult = brewingMethodsDataSchema.safeParse(methods);
if (!methodsResult.success) {
  console.error("brewing-methods.json failed validation:");
  console.error(JSON.stringify(methodsResult.error.issues, null, 2));
  process.exit(1);
}

const flavorResult = flavorNotesDataSchema.safeParse(flavorNotes);
if (!flavorResult.success) {
  console.error("flavor-notes.json failed validation:");
  console.error(JSON.stringify(flavorResult.error.issues, null, 2));
  process.exit(1);
}

// Cross-checks
const noteIds = new Set(flavorResult.data.notes.map((n) => n.id));
const subIds = new Set(flavorResult.data.subcategories.map((s) => s.id));
const catIds = new Set(flavorResult.data.categories.map((c) => c.id));

for (const sub of flavorResult.data.subcategories) {
  if (!catIds.has(sub.categoryId)) {
    console.error(
      `subcategory "${sub.id}" references missing category "${sub.categoryId}"`,
    );
    process.exit(1);
  }
}
for (const note of flavorResult.data.notes) {
  if (!subIds.has(note.subcategoryId)) {
    console.error(
      `note "${note.id}" references missing subcategory "${note.subcategoryId}"`,
    );
    process.exit(1);
  }
}

const beanIds = new Set(beansResult.data.map((b) => b.id));
const methodIds = new Set(methodsResult.data.map((m) => m.id));
let beanIssues = 0;
for (const bean of beansResult.data) {
  for (const noteId of bean.flavorNotes) {
    if (!noteIds.has(noteId)) {
      console.error(
        `bean "${bean.id}" has unknown flavor note "${noteId}"`,
      );
      beanIssues++;
    }
  }
  for (const rec of bean.brewingRecommendations) {
    if (!methodIds.has(rec.methodId)) {
      console.error(
        `bean "${bean.id}" has recommendation for unknown method "${rec.methodId}"`,
      );
      beanIssues++;
    }
  }
  for (const relatedId of bean.relatedBeanIds) {
    if (!beanIds.has(relatedId)) {
      console.error(
        `bean "${bean.id}" references unknown related bean "${relatedId}"`,
      );
      beanIssues++;
    }
  }
}
if (beanIssues > 0) process.exit(1);

console.log(
  `OK: ${beans.length} beans, ${methods.length} methods, ` +
    `${flavorResult.data.notes.length} flavor notes (` +
    `${flavorResult.data.categories.length} categories, ` +
    `${flavorResult.data.subcategories.length} subcategories) validated.`,
);
