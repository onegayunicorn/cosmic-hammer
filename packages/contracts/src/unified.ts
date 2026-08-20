export type PlatformEnvironment = "development" | "integration" | "production";
export type Provenance =
  | "LIVE"
  | "SIMULATION"
  | "DEMO"
  | "TEST"
  | "HYPOTHESIS"
  | "EXPERIMENTAL"
  | "UNVERIFIED";
export type ComponentStatus = "offline" | "healthy" | "degraded" | "failed";
export type LifecycleStatus =
  | "DISCOVERED"
  | "REGISTERED"
  | "VALIDATED"
  | "SANDBOXED"
  | "INTEGRATION_READY"
  | "APPROVED"
  | "LIVE"
  | "DEGRADED"
  | "QUARANTINED";
export type Capability =
  | "telemetry.read"
  | "twin.read"
  | "twin.write"
  | "simulation.execute"
  | "agent.execute"
  | "pipeline.execute"
  | "device.read"
  | "device.control"
  | "deployment.read"
  | "deployment.write";

export interface ProvenanceState {
  provenance: Provenance;
  source: string;
  timestamp: string;
  confidence?: number;
  validationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  assumptions?: string[];
  evidence?: string[];
}

export interface SystemRecord {
  id: string;
  name: string;
  version: string;
  environment: PlatformEnvironment;
  status: ComponentStatus;
  provenance: Provenance;
  capabilities: Capability[];
  lastHeartbeat: string;
}

export interface TelemetryReading {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  provenance: Provenance;
}

export interface DigitalTwinRecord {
  id: string;
  name: string;
  type: "device" | "character" | "system" | "environment";
  status: LifecycleStatus;
  provenance: ProvenanceState;
  capabilities: Capability[];
  state: Record<string, unknown>;
  simulationState?: Record<string, unknown>;
  telemetry: TelemetryReading[];
  health: {
    status: "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "OFFLINE";
    lastCheck: string;
    details: Record<string, unknown>;
  };
  relationships: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlatformEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  source: { system: string; component?: string; device?: string };
  destination?: { system: string; component?: string };
  provenance: Provenance;
  payload: Record<string, unknown>;
  schemaVersion: string;
  correlationId: string;
  causationId?: string;
  signature?: string;
}

export interface GovernanceState {
  systemId: string;
  status: LifecycleStatus;
  permissions: Array<{
    capability: Capability;
    allowed: boolean;
    scope: string;
    expires?: string;
  }>;
  approvedBy?: string;
  approvedAt?: string;
  lastAudit: string;
  rollbackAvailable: boolean;
  externalWrites: boolean;
}

export interface AuditRecord {
  eventId: string;
  actor: string;
  action: string;
  resource: string;
  environment: PlatformEnvironment;
  result: "success" | "failure" | "denied";
  timestamp: string;
  correlationId: string;
  provenance: Provenance;
}

export interface ControlPlaneSnapshot {
  schemaVersion: "1.0.0";
  snapshotId: string;
  observedAt: string;
  environment: PlatformEnvironment;
  provenance: Provenance;
  system: {
    id: string;
    status: ComponentStatus;
    version: string;
    externalWrites: false;
  };
  systems: SystemRecord[];
  devices: Array<{
    id: string;
    name: string;
    status: "ONLINE" | "OFFLINE" | "ERROR";
    lastHeartbeat: string;
    provenance: Provenance;
  }>;
  digitalTwins: DigitalTwinRecord[];
  simulations: Array<{
    id: string;
    status: "idle" | "running" | "completed" | "failed";
    provenance: Provenance;
    startedAt?: string;
    completedAt?: string;
  }>;
  agents: Array<{
    id: string;
    name: string;
    status: "available" | "busy" | "offline";
    capabilities: Capability[];
  }>;
  pipelines: Array<{
    id: string;
    name: string;
    status: "idle" | "running" | "failed" | "completed";
    stage: string;
  }>;
  events: PlatformEvent[];
  telemetry: TelemetryReading[];
  governance: GovernanceState;
  audit: AuditRecord[];
}

export function isLive(state: ProvenanceState | Provenance): boolean {
  return (typeof state === "string" ? state : state.provenance) === "LIVE";
}

export function isSimulated(state: ProvenanceState | Provenance): boolean {
  const provenance = typeof state === "string" ? state : state.provenance;
  return provenance === "SIMULATION" || provenance === "DEMO";
}
