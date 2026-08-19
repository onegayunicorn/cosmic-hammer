import { describe, expect, it } from "vitest";
import { runOperationsSimulation } from "./operations-engine";

describe("operations PDF sandbox", () => {
  it("runs every conceptual operation without financial execution", () => {
    const result = runOperationsSimulation();
    expect(result.classification).toBe("VALIDATED_SANDBOX_SIMULATION");
    expect(result.financialExecution).toBe(false);
    expect(result.fusion.status).toBe("STABLE_SIMULATION");
    expect(result.bridge.active).toBe(2);
    expect(result.bellChain.filter((bell) => bell.rung)).toHaveLength(2);
    expect(result.ledger.valid).toBe(true);
    expect(result.governance.approved).toBe(true);
    expect(result.network.vendors).toBe(1);
    expect(result.asset.financialExecution).toBe(false);
  });

  it("preserves a null value score instead of fabricating monetary value", () => {
    const result = runOperationsSimulation();
    expect(result.asset.valueScore).toBeNull();
    expect(result.doorway).toBe("SIMULATION_OPTIMAL");
  });
});
