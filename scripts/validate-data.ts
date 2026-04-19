import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  beansDataSchema,
  brewingMethodsDataSchema,
} from "../src/lib/schemas";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, "../src/data");

const beans = JSON.parse(readFileSync(`${dataDir}/beans.json`, "utf8"));
const methods = JSON.parse(
  readFileSync(`${dataDir}/brewing-methods.json`, "utf8"),
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

console.log(
  `OK: ${beans.length} beans, ${methods.length} methods validated.`,
);
