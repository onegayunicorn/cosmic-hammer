import { createHmac, timingSafeEqual } from "node:crypto";
import type { DeviceIdentityInput, SignedTelemetryInput } from "../shared/contracts";

const ranges: Record<string, { unit: string; min: number; max: number }> = {
  "pressure-bmp180": { unit: "Pa", min: 80_000, max: 110_000 },
  "temperature-dht22": { unit: "°C", min: -40, max: 80 },
  "humidity-dht22": { unit: "%", min: 0, max: 100 },
  "co2-mh-z19": { unit: "ppm", min: 0, max: 5_000 },
};

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };

export function canonicalTelemetry(input: SignedTelemetryInput): string {
  return JSON.stringify({ deviceId: input.deviceId, observedAt: input.observedAt, sequenceNumber: input.sequenceNumber, experimentId: input.experimentId, coordinateSystem: input.coordinateSystem, readings: input.readings });
}

export function signTelemetry(input: Omit<SignedTelemetryInput, "signature">, signingSecret: string): string {
  return createHmac("sha256", signingSecret).update(canonicalTelemetry({ ...input, signature: "" })).digest("hex");
}

export function verifyTelemetrySignature(input: SignedTelemetryInput, signingSecret: string): boolean {
  const expected = signTelemetry(input, signingSecret);
  const actual = Buffer.from(input.signature, "utf8");
  const target = Buffer.from(expected, "utf8");
  return actual.length === target.length && timingSafeEqual(actual, target);
}

export function validateDeviceIdentity(device: DeviceIdentityInput): ValidationResult {
  const errors: string[] = [];
  if (!device.deviceId) errors.push("Device ID required");
  if (!device.hardwareRevision) errors.push("Hardware revision required");
  if (!device.firmwareVersion) errors.push("Firmware version required");
  if (!device.calibrationVersion) errors.push("Calibration version required");
  if (!device.publicKey) errors.push("Public key or development signing secret required");
  if (!["WGS84", "ITRF2014", "ENU", "ECEF", "LOCAL_CHAMBER"].includes(device.coordinateSystem)) errors.push("Unsupported coordinate system");
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function validateTelemetry(input: SignedTelemetryInput, device: DeviceIdentityInput, previousSequence: number | undefined): ValidationResult {
  const errors: string[] = [];
  if (input.deviceId !== device.deviceId) errors.push("Device identity mismatch");
  if (Number.isNaN(Date.parse(input.observedAt))) errors.push("Invalid observation timestamp");
  if (!Number.isInteger(input.sequenceNumber) || input.sequenceNumber < 1) errors.push("Invalid sequence number");
  if (previousSequence !== undefined && input.sequenceNumber <= previousSequence) errors.push("Duplicate or stale sequence number");
  if (input.coordinateSystem !== device.coordinateSystem) errors.push("Coordinate-system mismatch");
  if (!input.experimentId) errors.push("Experiment ID required");
  if (!input.readings.length) errors.push("At least one reading required");
  for (const reading of input.readings) {
    const definition = ranges[reading.sensorId];
    if (!definition) { errors.push(`Unknown sensor: ${reading.sensorId}`); continue; }
    if (reading.unit !== definition.unit) errors.push(`Unit mismatch for ${reading.sensorId}`);
    if (!Number.isFinite(reading.value) || reading.value < definition.min || reading.value > definition.max) errors.push(`Value out of range for ${reading.sensorId}`);
    if (reading.uncertainty !== undefined && (!Number.isFinite(reading.uncertainty) || reading.uncertainty < 0)) errors.push(`Invalid uncertainty for ${reading.sensorId}`);
    if (!reading.calibrationId) errors.push(`Calibration metadata required for ${reading.sensorId}`);
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}
