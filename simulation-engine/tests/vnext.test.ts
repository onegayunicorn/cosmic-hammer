import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { DeviceIdentityManager, generateDeviceKeyPair, signPayload, type DeviceIdentity } from "../../packages/provenance/src/DeviceIdentity";
import { composeSceneGraph } from "../../packages/4d-engine/src/index";
import { sealManifest, verifyManifest } from "../../packages/platform-seal/src/index";
import { runVerificationPipeline } from "../../services/verification/src/pipeline";
import { appendForensicEvent, createForensicTrace } from "../../packages/contracts/src/ForensicTrace";
import { validateObservationSeries } from "../../packages/contracts/src/ObservationValidation";
import { BellChain, Bridge, SandboxLedger } from "../../sandbox/wealth-bridge/index";

describe("Cosmic Hammer vNext simulation", () => {
  it("verifies Ed25519 telemetry and rejects replay", () => {
    const keys = generateDeviceKeyPair();
    const device: DeviceIdentity = { deviceId: "d1", stationId: "s1", hardwareModel: "demo", firmwareVersion: "1", sensorInventory: [{ sensorId: "temp", type: "temperature", model: "demo", unit: "C", samplingFrequency: 1, calibrationCertificate: "cert", calibrationDate: "2026-01-01", calibrationExpiry: "2027-01-01", lastCalibrated: "2026-01-01", offset: 0, scale: 1 }], calibrationVersion: "c1", operationalStatus: "active", registeredAt: new Date().toISOString(), publicKey: keys.publicKey, keyId: "k1", keyVersion: 1 };
    const manager = new DeviceIdentityManager(); manager.registerDevice(device);
    const unsigned = { deviceId: "d1", stationId: "s1", timestamp: new Date().toISOString(), nonce: randomUUID(), sequenceNumber: 1, payload: { value: 1 }, keyId: "k1", keyVersion: 1 };
    const signed = { ...unsigned, signature: signPayload(unsigned, keys.privateKey) };
    expect(manager.verifySignedPayload(signed)).toBe(true);
    expect(() => manager.verifySignedPayload(signed)).toThrow("Replay detected");
  });
  it("computes reproducible verification metrics and alerts", () => {
    const result = runVerificationPipeline({ forecast: [{ timestamp: "a", value: 10 }, { timestamp: "b", value: 14 }], observations: [{ timestamp: "a", value: 8, quality: "excellent" }, { timestamp: "b", value: 10, quality: "good" }], forecastAgeMinutes: 300, observationLatencyMinutes: 90, calibrationAgeDays: 200, provider: "demo" });
    expect(result.mae).toBe(3); expect(result.rmse).toBeCloseTo(Math.sqrt(10)); expect(result.meanBiasError).toBe(3); expect(result.alerts).toEqual(expect.arrayContaining(["STALE_FORECAST", "OBSERVATION_LATENCY", "CALIBRATION_EXPIRING"]));
  });
  it("validates station observations and completes a forensic trace", () => {
    const validation = validateObservationSeries([{ id: "a", timestamp: "2026-08-20T00:00:00Z", latitude: 10, longitude: 20, value: 1, unit: "C" }, { id: "b", timestamp: "2026-08-20T00:00:00Z", latitude: 10, longitude: 20, value: null, unit: "C" }, { id: "c", timestamp: "bad", latitude: 100, longitude: 20, value: 2, unit: "C" }]);
    expect(validation.duplicateCount).toBe(1); expect(validation.missingCount).toBe(1); expect(validation.invalidCoordinateCount).toBe(1); expect(validation.quality).toBe("poor");
    let trace = createForensicTrace({ traceId: "t", observationId: "o", stationId: "s", deviceId: "d" });
    trace = appendForensicEvent(trace, { stage: "observation", timestamp: new Date().toISOString(), status: "passed", referenceId: "o", evidenceClass: "observed", details: {} });
    trace = appendForensicEvent(trace, { stage: "forecast-comparison", timestamp: new Date().toISOString(), status: "passed", referenceId: "v", evidenceClass: "derived", details: { mae: 0.4 } });
    trace = appendForensicEvent(trace, { stage: "dashboard-rendering", timestamp: new Date().toISOString(), status: "passed", referenceId: "dashboard", evidenceClass: "derived", details: {} });
    expect(trace.terminalStatus).toBe("verified"); expect(trace.events).toHaveLength(3);
  });
  it("composes layers, seals manifests, and simulates bridge/ledger operations", () => {
    const scene = composeSceneGraph({ timestamp: "2026-08-20T00:00:00Z", layers: [{ id: "x", kind: "station", visible: true, opacity: 2, coordinateReferenceSystem: "WGS84", provenance: "demo", data: {} }] });
    expect(scene.layers[0]?.opacity).toBe(1);
    const manifest = sealManifest({ application: "test", version: "1", commit: "x", buildId: "b", schemaVersion: "s", physicalTwinStateVersion: "p", providerVersions: {}, stationRegistryVersion: "s", calibrationRegistryVersion: "c", rendererVersion: "r", configurationHash: "h", databaseMigration: "m", artifactHashes: {}, testResults: { passed: 1, failed: 0 }, securityVerification: "ok", timestamp: "t" });
    expect(verifyManifest(manifest)).toBe(true);
    const bridge = new Bridge("a", "b", 1); expect(bridge.addConnection("one")).toBe(true); expect(bridge.addConnection("two")).toBe(false);
    const chain = new BellChain(2); expect(chain.ringBell(0)).toBe(true); const ledger = new SandboxLedger(); ledger.addBlock({ operation: "demo" }); expect(ledger.verify()).toBe(true); expect(chain.getChainState()[0]?.rung).toBe(true);
  });
});
