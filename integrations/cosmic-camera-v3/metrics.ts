import type { DeviceTelemetry } from "./device-contracts";

export interface MetricSummary {
  sampleCount: number;
  meanTemperatureC: number;
  maxDroppedFrames: number;
  meanAcquisitionHz: number;
  thermalEnvelope: "WITHIN_ENVELOPE" | "OUTSIDE_ENVELOPE";
  frameIntegrity: "PASS" | "DEGRADED";
}

export function summarizeTelemetry(
  samples: DeviceTelemetry[],
  minTemperatureC = -20,
  maxTemperatureC = 60,
): MetricSummary {
  if (samples.length === 0) {
    throw new Error("at least one telemetry sample is required");
  }
  const meanTemperatureC =
    samples.reduce((sum, sample) => sum + sample.temperatureC, 0) /
    samples.length;
  const maxDroppedFrames = Math.max(
    ...samples.map((sample) => sample.droppedFrames),
  );
  const meanAcquisitionHz =
    samples.reduce((sum, sample) => sum + sample.acquisitionHz, 0) /
    samples.length;
  const thermalEnvelope =
    samples.every(
      (sample) =>
        sample.temperatureC >= minTemperatureC &&
        sample.temperatureC <= maxTemperatureC,
    )
      ? "WITHIN_ENVELOPE"
      : "OUTSIDE_ENVELOPE";
  return {
    sampleCount: samples.length,
    meanTemperatureC,
    maxDroppedFrames,
    meanAcquisitionHz,
    thermalEnvelope,
    frameIntegrity: maxDroppedFrames === 0 ? "PASS" : "DEGRADED",
  };
}

export function userObservationMetric(input: {
  label: string;
  source: "camera" | "simulation" | "lux-codex";
  durationMs: number;
}) {
  if (!input.label.trim()) throw new Error("observation label is required");
  if (input.durationMs < 100 || input.durationMs > 3_600_000) {
    throw new Error("duration must be between 100ms and one hour");
  }
  return {
    event: "observation.created",
    label: input.label.trim(),
    source: input.source,
    provenance: input.source === "camera" ? "LIVE" : "SIMULATION",
    durationMs: input.durationMs,
    rawMediaPersisted: false,
    externalWrite: false,
  } as const;
}
