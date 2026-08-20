import { existsSync } from "node:fs";
import {
  simulatePressureField,
  runUnifiedSimulationPipeline,
} from "../simulation-engine/src/unified-engine";

const required = [
  "packages/contracts/src/unified.ts",
  "simulation-engine/src/unified-engine.ts",
  "server/control-plane/snapshot.ts",
  "client/src/pages/UnifiedPlatform.tsx",
  "Dockerfile",
  "docker-compose.yml",
  "vercel.json",
];
const missing = required.filter(entry => !existsSync(entry));
const pressure = simulatePressureField({
  referencePressure: 1e-11,
  decayExponent: 2,
  distance: 1.2,
  quantumEnhancement: 0.08,
});
const pipeline = runUnifiedSimulationPipeline({
  correlationId: "verify-platform",
  source: "verify-platform",
  twinId: "twin-terra-01",
  telemetry: [],
});
const report = {
  status:
    missing.length === 0 &&
    pressure.provenance === "SIMULATION" &&
    pipeline.provenance === "SIMULATION"
      ? "verified"
      : "failed",
  requiredEntries: required.length,
  missing,
  externalWrites: false,
  simulationProvenance: pressure.provenance,
  pipelineStages: pipeline.stages.length,
};
console.log(JSON.stringify(report, null, 2));
if (report.status !== "verified") process.exit(1);
