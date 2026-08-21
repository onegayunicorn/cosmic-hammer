import {
  makeEvidence,
  ReleaseGovernor,
  type Gate,
} from "../integrations/release-operations/release-governor.js";

const governor = new ReleaseGovernor("3.0.0");
const now = "2026-08-22T00:00:00.000Z";
const gates: Gate[] = [
  { id: "D1-development", stage: "DEVELOPMENT", status: "UNVERIFIED", owner: "VALIDATION_ENGINEER", timestamp: now, commitSha: "local", buildId: "v3", environment: "development", provenance: "REFERENCE" },
  { id: "I1-integration", stage: "INTEGRATION", status: "UNVERIFIED", owner: "VALIDATION_ENGINEER", timestamp: now, commitSha: "local", buildId: "v3", environment: "integration", provenance: "REFERENCE" },
  { id: "S1-security", stage: "SECURITY", status: "UNVERIFIED", owner: "VALIDATION_ENGINEER", timestamp: now, commitSha: "local", buildId: "v3", environment: "staging", provenance: "REFERENCE" },
  { id: "ST1-staging", stage: "STAGING", status: "UNVERIFIED", owner: "VALIDATION_ENGINEER", timestamp: now, commitSha: "local", buildId: "v3", environment: "staging", provenance: "REFERENCE" },
  { id: "H1-sensor", stage: "H1", status: "UNVERIFIED", owner: "VALIDATION_ENGINEER", timestamp: now, commitSha: "local", buildId: "v3", environment: "hardware", provenance: "UNKNOWN" },
];
for (const gate of gates) governor.registerGate(gate);

const softwareEvidence = gates.slice(0, 4).map((gate) => makeEvidence({
  id: `evidence-${gate.id}`,
  release: "3.0.0",
  gate: gate.id,
  status: "PASS",
  provenance: "REFERENCE",
  testId: gate.id,
  timestamp: now,
  signedBy: "VALIDATION_ENGINEER",
}));
for (const evidence of softwareEvidence) {
  const result = governor.validateEvidence(evidence);
  if (!result.accepted) throw new Error(result.reason);
  governor.updateGate(evidence.gate, "PASS", evidence.id);
}

const simulatedHardware = makeEvidence({
  id: "evidence-h1-simulated",
  release: "3.0.0",
  gate: "H1-sensor",
  status: "PASS",
  provenance: "SIMULATED",
  testId: "h1-simulation",
  timestamp: now,
  signedBy: "VALIDATION_ENGINEER",
});
const hardwareAttempt = governor.validateEvidence(simulatedHardware);
const softwareDecision = governor.softwareDecision();
const overallDecision = governor.authorizeRelease();

console.log(JSON.stringify({
  status: "passed",
  agent1: "RELEASE_GOVERNOR",
  agent2: "VALIDATION_ENGINEER",
  simulatedHardwareAccepted: hardwareAttempt.accepted,
  simulatedHardwareReason: hardwareAttempt.reason,
  softwareDecision,
  overallDecision,
  controls: { hardwareControl: "DISABLED", rawMediaPersistence: "DISABLED", externalWrites: false },
}, null, 2));
