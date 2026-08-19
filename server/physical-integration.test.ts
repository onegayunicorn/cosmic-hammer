import { describe, expect, it } from "vitest";
import { predictTwinPosition, predictWeather, runPredictionSimulation } from "../client/src/lib/prediction-engine";
import { compareForecastToObservations } from "./weather";
import { signTelemetry, validateTelemetry, verifyTelemetrySignature } from "./telemetry";

describe("prediction regression suite", () => {
  it("keeps weather uncertainty bounded and deterministic", () => {
    const result = predictWeather({ location: "Brisbane", baselineTemperatureC: 22.4, baselineHumidity: 63, baselinePressureHpa: 1012.6, horizonHours: 12, pressureSignal: 0.42 });
    expect(result.modelState).toBe("simulation");
    expect(result.uncertainty).toBeGreaterThanOrEqual(4);
    expect(result.uncertainty).toBeLessThanOrEqual(45);
    expect(result.confidence + result.uncertainty).toBeCloseTo(100, 4);
  });

  it("keeps twin position outputs reproducible with finite uncertainty", () => {
    const result = predictTwinPosition({ twinId: "AST-0042", anchorX: 12, anchorY: -4, anchorZ: 7, velocityX: 0.84, velocityY: 0.12, velocityZ: -0.22, horizonSeconds: 30, pressureSignal: 0.42 });
    expect(result.position.x).toBeCloseTo(37.351, 3);
    expect(result.displacement).toBeGreaterThan(0);
    expect(result.uncertaintyMeters).toBeGreaterThan(0);
    expect(result.modelState).toBe("simulation");
  });

  it("exports a complete prediction trace", () => {
    const run = runPredictionSimulation();
    expect(run.runId).toBe("pred-0042");
    expect(run.weather.location).toBe("Brisbane, AU");
    expect(run.digitalTwin.twinId).toBe("AST-0042");
  });
});

describe("telemetry security and evidence boundaries", () => {
  const device = { deviceId: "edge-01", hardwareRevision: "r1", firmwareVersion: "1.0.0", calibrationVersion: "cal-1", publicKey: "dev-secret", coordinateSystem: "WGS84" as const };
  const unsigned = { deviceId: "edge-01", observedAt: "2026-08-20T00:00:00.000Z", sequenceNumber: 1, experimentId: "weather-baseline", coordinateSystem: "WGS84" as const, readings: [{ sensorId: "temperature-dht22", value: 22.1, unit: "°C", calibrationId: "cal-1", uncertainty: 0.2 }] };

  it("accepts a valid signed observation and rejects stale sequences", () => {
    const signed = { ...unsigned, signature: signTelemetry(unsigned, device.publicKey) };
    expect(verifyTelemetrySignature(signed, device.publicKey)).toBe(true);
    expect(validateTelemetry(signed, device, undefined)).toEqual({ ok: true });
    expect(validateTelemetry(signed, device, 1)).toMatchObject({ ok: false });
  });

  it("rejects coordinate mismatch and impossible sensor values", () => {
    const invalid = { ...unsigned, coordinateSystem: "ECEF" as const, readings: [{ sensorId: "temperature-dht22", value: 999, unit: "°C", calibrationId: "cal-1" }], signature: "bad" };
    const result = validateTelemetry(invalid, device, undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toContain("Coordinate-system mismatch");
  });
});

describe("forecast verification metrics", () => {
  it("calculates MAE, RMSE, and bias against paired observations", () => {
    const forecast = [{ time: "00:00", temperatureC: 10, humidityPercent: 50, pressureHpa: 1000, windKmh: 10, precipitationProbability: 20 }];
    const observations = [{ time: "00:00", temperatureC: 8, humidityPercent: 55, pressureHpa: 1004, windKmh: 12, precipitationProbability: 10 }];
    const metrics = compareForecastToObservations(forecast, observations, "station:demo");
    expect(metrics.find(metric => metric.metric === "temperatureC")).toMatchObject({ count: 1, mae: 2, bias: 2 });
    expect(metrics.find(metric => metric.metric === "pressureHpa")?.rmse).toBe(4);
  });
});
