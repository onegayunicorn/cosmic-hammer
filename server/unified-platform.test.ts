import { describe, expect, it } from "vitest";
import { createControlPlaneSnapshot } from "./control-plane/snapshot";
import {
  compareTwinStates,
  runUnifiedSimulationPipeline,
  simulatePressureField,
} from "../simulation-engine/src/unified-engine";

describe("unified platform contracts and engines", () => {
  it("labels pressure output as a hypothesis simulation", () => {
    const result = simulatePressureField({
      referencePressure: 1e-11,
      decayExponent: 2,
      distance: 1.2,
      quantumEnhancement: 0.08,
    });
    expect(result.provenance).toBe("SIMULATION");
    expect(result.modelStatus).toBe("HYPOTHESIS");
    expect(result.uncertainty).toBeGreaterThan(0);
  });

  it("preserves physical twin state while comparing simulation state", () => {
    const snapshot = createControlPlaneSnapshot();
    const twin = snapshot.digitalTwins[0];
    const result = compareTwinStates(twin, { temperature: 27.2 });
    expect(result.physicalStatePreserved).toBe(true);
    expect(result.physicalState).toEqual(twin.state);
    expect(result.provenance).toBe("SIMULATION");
  });

  it("emits one correlation id across the unified pipeline trace", () => {
    const result = runUnifiedSimulationPipeline({
      correlationId: "corr-test",
      source: "test",
      twinId: "twin-terra-01",
      telemetry: [],
    });
    expect(result.correlationId).toBe("corr-test");
    expect(result.event.correlationId).toBe("corr-test");
    expect(result.stages).toEqual([
      "INGEST",
      "VALIDATE",
      "NORMALIZE",
      "ENRICH",
      "DIGITAL_TWIN_UPDATE",
      "MODEL_SOLVER",
      "RESULT",
      "VISUALISE",
      "AUDIT",
    ]);
  });

  it("keeps default snapshot external writes disabled", () => {
    const snapshot = createControlPlaneSnapshot();
    expect(snapshot.system.externalWrites).toBe(false);
    expect(snapshot.governance.externalWrites).toBe(false);
    expect(snapshot.environment).toBe("development");
    expect(snapshot.provenance).toBe("DEMO");
  });
});
