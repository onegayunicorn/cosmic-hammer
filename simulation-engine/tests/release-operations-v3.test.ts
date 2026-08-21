import { describe, expect, it } from "vitest";
import {
  computeEvidenceHash,
  makeEvidence,
  ReleaseGovernor,
  type Gate,
} from "../../integrations/release-operations/release-governor";

const baseGate = (id: string, stage: Gate["stage"]): Gate => ({
  id,
  stage,
  status: "UNVERIFIED",
  owner: "VALIDATION_ENGINEER",
  timestamp: "2026-08-22T00:00:00.000Z",
  commitSha: "test-sha",
  buildId: "test-build",
  environment: stage.startsWith("H") ? "hardware" : "staging",
  provenance: "REFERENCE",
});

describe("dual-agent release operations", () => {
  it("accepts valid software evidence and produces a software PASS", () => {
    const governor = new ReleaseGovernor();
    const gate = baseGate("D1", "DEVELOPMENT");
    governor.registerGate(gate);
    const evidence = makeEvidence({
      id: "ev-d1",
      release: "3.0.0",
      gate: "D1",
      status: "PASS",
      provenance: "REFERENCE",
      testId: "unit-d1",
      timestamp: "2026-08-22T00:00:00.000Z",
      signedBy: "VALIDATION_ENGINEER",
    });
    expect(governor.validateEvidence(evidence)).toEqual({ accepted: true, reason: "Evidence accepted" });
    governor.updateGate("D1", "PASS", "ev-d1");
    expect(governor.softwareDecision().status).toBe("PASS");
  });

  it("rejects tampered evidence", () => {
    const governor = new ReleaseGovernor();
    governor.registerGate(baseGate("D1", "DEVELOPMENT"));
    const evidence = makeEvidence({
      id: "ev-d1",
      release: "3.0.0",
      gate: "D1",
      status: "PASS",
      provenance: "REFERENCE",
      timestamp: "2026-08-22T00:00:00.000Z",
      signedBy: "VALIDATION_ENGINEER",
    });
    const tampered = { ...evidence, status: "BLOCK" as const };
    expect(computeEvidenceHash(tampered)).not.toBe(evidence.evidenceHash);
    expect(governor.validateEvidence(tampered).reason).toBe("Evidence hash mismatch");
  });

  it("rejects simulated evidence for hardware gates", () => {
    const governor = new ReleaseGovernor();
    governor.registerGate(baseGate("H1", "H1"));
    const evidence = makeEvidence({
      id: "ev-h1",
      release: "3.0.0",
      gate: "H1",
      status: "PASS",
      provenance: "SIMULATED",
      timestamp: "2026-08-22T00:00:00.000Z",
      signedBy: "VALIDATION_ENGINEER",
    });
    expect(governor.validateEvidence(evidence)).toEqual({
      accepted: false,
      reason: "Physical gate requires MEASURED or approved DERIVED provenance",
    });
  });

  it("keeps the overall release on HOLD while hardware is incomplete", () => {
    const governor = new ReleaseGovernor();
    governor.registerGate(baseGate("D1", "DEVELOPMENT"));
    governor.registerGate(baseGate("H1", "H1"));
    const evidence = makeEvidence({
      id: "ev-d1",
      release: "3.0.0",
      gate: "D1",
      status: "PASS",
      provenance: "REFERENCE",
      timestamp: "2026-08-22T00:00:00.000Z",
      signedBy: "VALIDATION_ENGINEER",
    });
    expect(governor.validateEvidence(evidence).accepted).toBe(true);
    governor.updateGate("D1", "PASS", "ev-d1");
    expect(governor.softwareDecision().status).toBe("PASS");
    expect(governor.authorizeRelease().status).toBe("HOLD");
  });
});
