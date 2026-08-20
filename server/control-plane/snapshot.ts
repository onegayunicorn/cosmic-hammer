import type {
  ControlPlaneSnapshot,
  DigitalTwinRecord,
  TelemetryReading,
} from "../../packages/contracts/src/unified";

const observedAt = "2026-08-21T00:00:00.000Z";

const twin: DigitalTwinRecord = {
  id: "twin-terra-01",
  name: "Terra Anchor",
  type: "environment",
  status: "SANDBOXED",
  provenance: {
    provenance: "SIMULATION",
    source: "cosmic-hammer-demo",
    timestamp: observedAt,
    validationStatus: "PENDING",
    assumptions: ["synthetic telemetry"],
  },
  capabilities: ["twin.read", "simulation.execute"],
  state: { temperature: 24.7, pressure: 1012.4 },
  simulationState: { temperature: 27.2, pressure: 1009.8 },
  telemetry: [],
  health: {
    status: "HEALTHY",
    lastCheck: observedAt,
    details: { externalWrites: false },
  },
  relationships: ["simulation-engine"],
  createdAt: observedAt,
  updatedAt: observedAt,
};

const telemetry: TelemetryReading[] = [
  {
    name: "temperature",
    value: 24.7,
    unit: "°C",
    timestamp: observedAt,
    provenance: "SIMULATION",
  },
  {
    name: "pressure",
    value: 1012.4,
    unit: "hPa",
    timestamp: observedAt,
    provenance: "SIMULATION",
  },
];

export function createControlPlaneSnapshot(): ControlPlaneSnapshot {
  return {
    schemaVersion: "1.0.0",
    snapshotId: "cosmic-hammer-development-snapshot",
    observedAt,
    environment: "development",
    provenance: "DEMO",
    system: {
      id: "cosmic-hammer-unified",
      status: "healthy",
      version: "3.0.0",
      externalWrites: false,
    },
    systems: [
      {
        id: "cosmic-hammer",
        name: "Cosmic Hammer",
        version: "3.0.0",
        environment: "development",
        status: "healthy",
        provenance: "DEMO",
        capabilities: ["telemetry.read", "twin.read", "simulation.execute"],
        lastHeartbeat: observedAt,
      },
      {
        id: "architect-orchestrator",
        name: "Architect Orchestrator",
        version: "0.1.0",
        environment: "development",
        status: "healthy",
        provenance: "TEST",
        capabilities: [
          "simulation.execute",
          "agent.execute",
          "pipeline.execute",
        ],
        lastHeartbeat: observedAt,
      },
      {
        id: "oneness-control-center",
        name: "ONENESS Control Center",
        version: "0.1.0",
        environment: "development",
        status: "healthy",
        provenance: "DEMO",
        capabilities: ["deployment.read", "telemetry.read"],
        lastHeartbeat: observedAt,
      },
      {
        id: "universal-driver",
        name: "Universal Driver",
        version: "0.1.0",
        environment: "development",
        status: "offline",
        provenance: "TEST",
        capabilities: ["device.read"],
        lastHeartbeat: observedAt,
      },
    ],
    devices: [
      {
        id: "device-synthetic-01",
        name: "Synthetic Sensor",
        status: "ONLINE",
        lastHeartbeat: observedAt,
        provenance: "SIMULATION",
      },
    ],
    digitalTwins: [{ ...twin, telemetry }],
    simulations: [
      {
        id: "sim-pressure-001",
        status: "completed",
        provenance: "SIMULATION",
        completedAt: observedAt,
      },
    ],
    agents: [
      {
        id: "solver",
        name: "Solver Agent",
        status: "available",
        capabilities: ["simulation.execute"],
      },
      {
        id: "telemetry",
        name: "Telemetry Agent",
        status: "available",
        capabilities: ["telemetry.read"],
      },
      {
        id: "audit",
        name: "Audit Agent",
        status: "available",
        capabilities: ["deployment.read"],
      },
    ],
    pipelines: [
      {
        id: "pipeline-unified-001",
        name: "Unified telemetry pipeline",
        status: "completed",
        stage: "AUDIT",
      },
    ],
    events: [],
    telemetry,
    governance: {
      systemId: "cosmic-hammer-unified",
      status: "SANDBOXED",
      permissions: [
        { capability: "telemetry.read", allowed: true, scope: "development" },
        { capability: "device.control", allowed: false, scope: "*" },
      ],
      lastAudit: observedAt,
      rollbackAvailable: false,
      externalWrites: false,
    },
    audit: [],
  };
}
