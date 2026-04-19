#!/usr/bin/env node
// Thin shim — delegates to the TS validator via tsx.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tsScript = resolve(here, "validate-data.ts");
const result = spawnSync("npx", ["tsx", tsScript], { stdio: "inherit" });
process.exit(result.status ?? 1);
