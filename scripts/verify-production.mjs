import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const required = [
  "package.json",
  "client/index.html",
  "client/src/App.tsx",
  "sandbox/wealth-bridge/operations-engine.ts",
  "config/system-config.json",
  "config/operations-roadmap.json",
  "docs/operations",
  "integrations/universal-driver/adapter-contract.ts",
  "integrations/digital-twin/twin-runtime-contract.ts",
];
const missing = required.filter((entry) => !existsSync(resolve(root, entry)));
if (missing.length) throw new Error(`Missing required project entries: ${missing.join(", ")}`);

const config = JSON.parse(readFileSync(resolve(root, "config/system-config.json"), "utf8"));
if (config.externalWrites !== false) throw new Error("Production verification requires externalWrites=false");
if (!['hypothesis', 'simulation', 'contract', 'live'].includes(config.modelState)) throw new Error("Invalid model state");

const output = resolve(root, "simulation-engine/operations-simulation-output.json");
if (existsSync(output)) {
  const simulation = JSON.parse(readFileSync(output, "utf8"));
  if (simulation.financialExecution !== false) throw new Error("Simulation output must not execute financial actions");
}

const dist = resolve(root, "dist/public/index.html");
if (!existsSync(dist)) console.warn("Production frontend artifact not found; run pnpm build before deployment.");
console.log(JSON.stringify({ status: "verified", requiredEntries: required.length, externalWrites: config.externalWrites, modelState: config.modelState, frontendArtifact: existsSync(dist) }, null, 2));
