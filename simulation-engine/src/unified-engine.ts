import type {
  DigitalTwinRecord,
  PlatformEvent,
  Provenance,
  TelemetryReading,
} from "../../packages/contracts/src/unified";

export interface PressureModelInput {
  referencePressure: number;
  decayExponent: number;
  distance: number;
  quantumEnhancement: number;
}
export interface PressureModelOutput {
  pressure: number;
  forceVector: number;
  uncertainty: number;
  provenance: "SIMULATION";
  modelStatus: "HYPOTHESIS";
}

export function simulatePressureField(
  input: PressureModelInput
): PressureModelOutput {
  const distance = Math.max(0.001, input.distance);
  const pressure =
    input.referencePressure *
    Math.pow(distance, -Math.max(0.1, input.decayExponent)) *
    (1 + Math.max(0, input.quantumEnhancement));
  const finitePressure = Number.isFinite(pressure) ? pressure : 0;
  return {
    pressure: finitePressure,
    forceVector: finitePressure * 0.001,
    uncertainty: Math.min(1, 0.08 + Math.abs(input.decayExponent - 2) * 0.12),
    provenance: "SIMULATION",
    modelStatus: "HYPOTHESIS",
  };
}

export interface OrbitInput {
  radiusKm: number;
  centralMass: number;
  pressureAdjustment: number;
}
export interface OrbitOutput {
  velocityKmS: number;
  stabilityRatio: number;
  pressureAdjustment: number;
  provenance: "SIMULATION";
}

export function simulateOrbit(input: OrbitInput): OrbitOutput {
  const radius = Math.max(1, input.radiusKm);
  const velocityKmS =
    Math.sqrt(Math.max(0.01, input.centralMass / radius)) * 29.78;
  const stabilityRatio = Math.max(
    0,
    Math.min(1, 1 - Math.abs(input.pressureAdjustment) * 0.05)
  );
  return {
    velocityKmS: Number(velocityKmS.toFixed(4)),
    stabilityRatio: Number(stabilityRatio.toFixed(4)),
    pressureAdjustment: input.pressureAdjustment,
    provenance: "SIMULATION",
  };
}

export function compareTwinStates(
  twin: DigitalTwinRecord,
  simulatedState: Record<string, number>
) {
  const keys = Object.keys(simulatedState);
  const deltas = Object.fromEntries(
    keys.map(key => [key, simulatedState[key] - Number(twin.state[key] ?? 0)])
  );
  return {
    twinId: twin.id,
    physicalState: twin.state,
    simulationState: simulatedState,
    deltas,
    provenance: "SIMULATION" as const,
    physicalStatePreserved: true,
  };
}

export interface UnifiedPipelineInput {
  correlationId: string;
  source: string;
  telemetry: TelemetryReading[];
  twinId: string;
}
export interface UnifiedPipelineOutput {
  correlationId: string;
  stages: string[];
  event: PlatformEvent;
  provenance: Provenance;
  auditAction: string;
}

export function runUnifiedSimulationPipeline(
  input: UnifiedPipelineInput
): UnifiedPipelineOutput {
  const timestamp = new Date().toISOString();
  const stages = [
    "INGEST",
    "VALIDATE",
    "NORMALIZE",
    "ENRICH",
    "DIGITAL_TWIN_UPDATE",
    "MODEL_SOLVER",
    "RESULT",
    "VISUALISE",
    "AUDIT",
  ];
  return {
    correlationId: input.correlationId,
    stages,
    provenance: "SIMULATION",
    auditAction: "simulation.execute",
    event: {
      eventId: `evt_${input.correlationId}`,
      eventType: "simulation.completed",
      timestamp,
      source: { system: input.source, component: "simulation-engine" },
      destination: { system: "oneness-control-center" },
      provenance: "SIMULATION",
      payload: {
        twinId: input.twinId,
        telemetryCount: input.telemetry.length,
        stages,
      },
      schemaVersion: "1.0",
      correlationId: input.correlationId,
    },
  };
}
