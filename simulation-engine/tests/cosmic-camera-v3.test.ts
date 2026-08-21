import { describe, expect, it } from "vitest";
import {
  photonToLux,
  pnpAdmm,
  wavelengthToFrequency,
} from "../../integrations/cosmic-camera-v3/photonic-core";
import {
  summarizeTelemetry,
  userObservationMetric,
} from "../../integrations/cosmic-camera-v3/metrics";

describe("Cosmic Camera v3 photonic core", () => {
  it("converts a positive wavelength to frequency", () => {
    expect(wavelengthToFrequency(550)).toBeCloseTo(545077196363636.3, 0);
  });

  it("rejects invalid wavelengths", () => {
    expect(() => wavelengthToFrequency(0)).toThrow("wavelength must be positive");
  });

  it("keeps photon-derived lux bounded", () => {
    const value = photonToLux({
      id: "p1",
      wavelengthNm: 550,
      frequencyHz: wavelengthToFrequency(550),
      amplitude: 0.5,
      phaseRad: 0,
      polarization: "linear",
      x: 0,
      y: 0,
      z: 0,
      timestamp: "2026-08-22T00:00:00.000Z",
      provenance: "SIMULATED",
    });
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });

  it("produces a bounded reconstruction result", () => {
    const result = pnpAdmm([0, 1, 0, 2], 10, 1e-6);
    expect(result.image).toHaveLength(4);
    expect(result.provenance).toBe("REFERENCE");
    expect(result.iterations).toBeGreaterThan(0);
  });
});

describe("Cosmic Camera v3 user and telemetry metrics", () => {
  it("creates a simulation event without persistence or external writes", () => {
    expect(
      userObservationMetric({
        label: "  baseline  ",
        source: "simulation",
        durationMs: 1000,
      }),
    ).toMatchObject({
      label: "baseline",
      provenance: "SIMULATION",
      rawMediaPersisted: false,
      externalWrite: false,
    });
  });

  it("rejects unsafe observation input bounds", () => {
    expect(() =>
      userObservationMetric({ label: "", source: "camera", durationMs: 1000 }),
    ).toThrow("observation label is required");
    expect(() =>
      userObservationMetric({ label: "x", source: "camera", durationMs: 50 }),
    ).toThrow("duration must be between 100ms and one hour");
  });

  it("summarizes thermal and frame integrity metrics", () => {
    const summary = summarizeTelemetry([
      {
        timestamp: "2026-08-22T00:00:00.000Z",
        temperatureC: 18,
        supplyV: 12,
        tecDuty: 0.2,
        droppedFrames: 0,
        acquisitionHz: 10,
      },
      {
        timestamp: "2026-08-22T00:00:01.000Z",
        temperatureC: 19,
        supplyV: 12,
        tecDuty: 0.2,
        droppedFrames: 1,
        acquisitionHz: 9,
      },
    ]);
    expect(summary).toMatchObject({
      sampleCount: 2,
      maxDroppedFrames: 1,
      thermalEnvelope: "WITHIN_ENVELOPE",
      frameIntegrity: "DEGRADED",
    });
  });
});
