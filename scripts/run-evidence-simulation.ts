import { buildDataRoomPayload } from "../shared/evidence";

const overview = {
  stations: 3,
  onlineStations: 2,
  sensors: 8,
  verifiedObservations: 480,
  telemetryRecords: 512,
  providerCoverage: 2,
  providers: ["Open-Meteo", "NOAA"],
  forecastRuns: 6,
  activeAlerts: 1,
  calibrationRecords: 8,
  forecastAccuracy: { mae: 0.82, rmse: 1.14, bias: -0.07 },
  driftScore: 0.18,
  evidenceClass: "observed_and_derived_only",
};

const claims = [
  { claimId: "actual-stations", label: "Authenticated stations", value: "3", category: "actual", status: "approved" },
  { claimId: "target-stations", label: "Phase 1 station target", value: "1,000", category: "target", status: "submitted" },
  { claimId: "source-roi", label: "Projected ROI", value: "1000x", category: "unverified", status: "draft" },
  { claimId: "sim-bridge", label: "Bridge integrity", value: "valid", category: "simulation", status: "approved" },
];

const result = buildDataRoomPayload(overview, [{ citationId: "open-meteo-docs", title: "Open-Meteo API documentation" }], claims, "2026-08-20T00:00:00.000Z");
console.log(JSON.stringify({ classification: "VALIDATED_EVIDENCE_SIMULATION", actualClaimCount: result.actuals.claims.length, targetCount: result.targets.length, assumptionCount: result.assumptions.length, simulationCount: result.simulations.length, metricSnapshot: overview }, null, 2));
