import { createHash } from "node:crypto";

export type GateStatus =
  | "PASS"
  | "HOLD"
  | "BLOCK"
  | "UNVERIFIED"
  | "ROLLBACK_REQUIRED";

export type ProvenanceClass =
  | "SIMULATED"
  | "RECONSTRUCTED"
  | "MEASURED"
  | "DERIVED"
  | "REFERENCE"
  | "UNKNOWN";

export type GateStage =
  | "DEVELOPMENT"
  | "INTEGRATION"
  | "SECURITY"
  | "STAGING"
  | "H1"
  | "H2"
  | "H3"
  | "H4"
  | "H5"
  | "H6"
  | "LIVE"
  | "PARITY";

export interface Gate {
  id: string;
  stage: GateStage;
  status: GateStatus;
  owner: "RELEASE_GOVERNOR" | "VALIDATION_ENGINEER";
  timestamp: string;
  commitSha: string;
  buildId: string;
  environment: "development" | "integration" | "staging" | "hardware" | "live";
  provenance: ProvenanceClass;
  evidenceUri?: string;
  reviewer?: string;
  decision?: string;
}

export interface Evidence {
  id: string;
  release: string;
  gate: string;
  status: GateStatus;
  provenance: ProvenanceClass;
  deviceId?: string;
  testId?: string;
  measurementRef?: string;
  timestamp: string;
  signedBy: "VALIDATION_ENGINEER" | "RELEASE_GOVERNOR";
  evidenceHash: string;
}

export interface ReleaseManifest {
  version: string;
  software: Record<string, GateStatus>;
  hardware: Record<string, GateStatus>;
  live: Record<string, GateStatus>;
  controls: {
    hardware_control: "ENABLED" | "DISABLED";
    raw_media_persistence: "ENABLED" | "DISABLED";
  };
  overall: {
    status: GateStatus;
    provenance_required: true;
  };
}

export interface ReleaseDecision {
  status: GateStatus;
  reason: string;
  manifest: ReleaseManifest;
}

const HARDWARE_STAGES = new Set<GateStage>(["H1", "H2", "H3", "H4", "H5", "H6"]);
const LIVE_STAGES = new Set<GateStage>(["LIVE", "PARITY"]);

function canonicalEvidence(evidence: Evidence): string {
  return JSON.stringify({
    id: evidence.id,
    release: evidence.release,
    gate: evidence.gate,
    status: evidence.status,
    provenance: evidence.provenance,
    deviceId: evidence.deviceId ?? null,
    testId: evidence.testId ?? null,
    measurementRef: evidence.measurementRef ?? null,
    timestamp: evidence.timestamp,
    signedBy: evidence.signedBy,
  });
}

export function computeEvidenceHash(evidence: Evidence): string {
  return createHash("sha256").update(canonicalEvidence(evidence)).digest("hex");
}

export function isPhysicalProvenance(provenance: ProvenanceClass): boolean {
  return provenance === "MEASURED" || provenance === "DERIVED";
}

export class ReleaseGovernor {
  private readonly gates = new Map<string, Gate>();
  private readonly evidence = new Map<string, Evidence>();
  private readonly version: string;

  constructor(version = "3.0.0") {
    this.version = version;
  }

  registerGate(gate: Gate): void {
    if (this.gates.has(gate.id)) throw new Error(`Gate ${gate.id} already exists`);
    this.gates.set(gate.id, { ...gate });
  }

  getGate(id: string): Gate | undefined {
    const gate = this.gates.get(id);
    return gate ? { ...gate } : undefined;
  }

  listGates(): Gate[] {
    return Array.from(this.gates.values()).map((gate) => ({ ...gate }));
  }

  validateEvidence(candidate: Evidence): { accepted: boolean; reason: string } {
    const gate = this.gates.get(candidate.gate);
    if (!gate) return { accepted: false, reason: "Gate not found" };
    if (candidate.release !== this.version) return { accepted: false, reason: "Release version mismatch" };
    if (candidate.provenance === "UNKNOWN") return { accepted: false, reason: "UNKNOWN provenance is not evidence" };
    if (computeEvidenceHash(candidate) !== candidate.evidenceHash) {
      return { accepted: false, reason: "Evidence hash mismatch" };
    }
    if ((HARDWARE_STAGES.has(gate.stage) || LIVE_STAGES.has(gate.stage)) && !isPhysicalProvenance(candidate.provenance)) {
      return { accepted: false, reason: "Physical gate requires MEASURED or approved DERIVED provenance" };
    }
    this.evidence.set(candidate.id, { ...candidate });
    return { accepted: true, reason: "Evidence accepted" };
  }

  updateGate(id: string, status: GateStatus, evidenceId?: string): void {
    const gate = this.gates.get(id);
    if (!gate) throw new Error(`Gate ${id} not found`);
    if (evidenceId && !this.evidence.has(evidenceId)) throw new Error(`Evidence ${evidenceId} not found`);
    gate.status = status;
    gate.timestamp = new Date().toISOString();
    gate.evidenceUri = evidenceId;
  }

  softwareDecision(): ReleaseDecision {
    const gates = this.listGates();
    const software = gates.filter((gate) => !HARDWARE_STAGES.has(gate.stage) && !LIVE_STAGES.has(gate.stage));
    const failed = software.find((gate) => gate.status === "BLOCK" || gate.status === "ROLLBACK_REQUIRED");
    const pending = software.find((gate) => gate.status !== "PASS");
    const status: GateStatus = failed ? "BLOCK" : pending ? "HOLD" : "PASS";
    return { status, reason: failed ? `Software gate ${failed.id} blocks release` : pending ? "Software gates remain incomplete" : "All software gates passed", manifest: this.manifest(status) };
  }

  authorizeRelease(): ReleaseDecision {
    const gates = this.listGates();
    const failed = gates.find((gate) => gate.status === "BLOCK" || gate.status === "ROLLBACK_REQUIRED");
    const pending = gates.find((gate) => gate.status !== "PASS");
    const status: GateStatus = failed ? "BLOCK" : pending ? "HOLD" : "PASS";
    return { status, reason: failed ? `Gate ${failed.id} blocks release` : pending ? "Hardware/live or software evidence remains incomplete" : "All registered gates passed", manifest: this.manifest(status) };
  }

  private manifest(status: GateStatus): ReleaseManifest {
    const manifest: ReleaseManifest = {
      version: this.version,
      software: {},
      hardware: {},
      live: {},
      controls: { hardware_control: "DISABLED", raw_media_persistence: "DISABLED" },
      overall: { status, provenance_required: true },
    };
    for (const gate of Array.from(this.gates.values())) {
      const target = HARDWARE_STAGES.has(gate.stage) ? manifest.hardware : LIVE_STAGES.has(gate.stage) ? manifest.live : manifest.software;
      target[gate.id] = gate.status;
    }
    return manifest;
  }
}

export function makeEvidence(input: Omit<Evidence, "evidenceHash">): Evidence {
  const evidence = { ...input, evidenceHash: "" };
  return { ...evidence, evidenceHash: computeEvidenceHash(evidence) };
}
