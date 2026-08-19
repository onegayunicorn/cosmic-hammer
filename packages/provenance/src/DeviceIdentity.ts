import { createPublicKey, createVerify, generateKeyPairSync, sign as cryptoSign, verify as cryptoVerify } from "node:crypto";

export type ProvenanceState = "SIMULATED" | "PROVIDER_OBSERVED" | "DEVICE_OBSERVED" | "VERIFIED" | "SEALED";
export type OperationalStatus = "active" | "maintenance" | "decommissioned";

export interface SensorInventory { sensorId: string; type: string; model: string; unit: string; samplingFrequency: number; calibrationCertificate: string; calibrationDate: string; calibrationExpiry: string; offset: number; scale: number; }
export interface DeviceIdentity { deviceId: string; stationId: string; hardwareModel: string; firmwareVersion: string; sensorInventory: SensorInventory[]; calibrationVersion: string; operationalStatus: OperationalStatus; registeredAt: string; lastSeen?: string; publicKey: string; keyId: string; keyVersion: number; }
export interface SignedPayload { deviceId: string; stationId: string; timestamp: string; nonce: string; sequenceNumber: number; payload: unknown; signature: string; keyId: string; keyVersion: number; }
export interface ProvenanceRecord { id: string; timestamp: string; state: ProvenanceState; source: string; deviceId?: string; stationId?: string; calibrationVersion?: string; signature?: string; keyId?: string; previousState?: ProvenanceState; transitionReason?: string; metadata: Record<string, unknown>; }

export function canonicalPayload(payload: Omit<SignedPayload, "signature">): string { return JSON.stringify({ deviceId: payload.deviceId, stationId: payload.stationId, timestamp: payload.timestamp, nonce: payload.nonce, sequenceNumber: payload.sequenceNumber, payload: payload.payload }); }
export function generateDeviceKeyPair() { const pair = generateKeyPairSync("ed25519"); return { publicKey: pair.publicKey.export({ type: "spki", format: "pem" }).toString(), privateKey: pair.privateKey.export({ type: "pkcs8", format: "pem" }).toString() }; }
export function signPayload(payload: Omit<SignedPayload, "signature">, privateKey: string): string { return cryptoSign(null, Buffer.from(canonicalPayload(payload)), privateKey).toString("hex"); }

export class DeviceIdentityManager {
  private devices = new Map<string, DeviceIdentity>();
  private provenance = new Map<string, ProvenanceRecord[]>();
  private usedNonces = new Set<string>();
  private revokedKeys = new Set<string>();

  registerDevice(identity: DeviceIdentity): void { if (!identity.deviceId || !identity.stationId || !identity.publicKey || !identity.keyId || !identity.sensorInventory.length) throw new Error("Incomplete device identity"); if (this.devices.has(identity.deviceId)) throw new Error(`Device ${identity.deviceId} already registered`); createPublicKey(identity.publicKey); this.devices.set(identity.deviceId, identity); this.provenance.set(identity.deviceId, []); this.addProvenance(identity.deviceId, "DEVICE_OBSERVED", "Device registered"); }
  addProvenance(deviceId: string, state: ProvenanceState, reason: string, metadata: Record<string, unknown> = {}): ProvenanceRecord { const records = this.provenance.get(deviceId) ?? []; const record: ProvenanceRecord = { id: `prov-${records.length + 1}`, timestamp: new Date().toISOString(), state, source: "system", deviceId, metadata, previousState: records.at(-1)?.state, transitionReason: reason }; records.push(record); this.provenance.set(deviceId, records); return record; }
  verifySignedPayload(payload: SignedPayload): boolean { const device = this.devices.get(payload.deviceId); if (!device) throw new Error("Unknown device"); if (payload.stationId !== device.stationId) throw new Error("Station mismatch"); if (payload.keyId !== device.keyId || payload.keyVersion !== device.keyVersion) throw new Error("Key version mismatch"); if (this.revokedKeys.has(payload.keyId)) throw new Error("Key revoked"); if (this.usedNonces.has(payload.nonce)) throw new Error("Replay detected"); if (Math.abs(Date.now() - Date.parse(payload.timestamp)) > 5 * 60_000) throw new Error("Timestamp outside acceptance window"); const valid = cryptoVerify(null, Buffer.from(canonicalPayload(payload)), device.publicKey, Buffer.from(payload.signature, "hex")); if (!valid) throw new Error("Invalid signature"); this.usedNonces.add(payload.nonce); this.addProvenance(payload.deviceId, "VERIFIED", "Ed25519 signature verified", { sequenceNumber: payload.sequenceNumber }); return true; }
  rotateKey(deviceId: string, publicKey: string, keyId: string): void { const device = this.devices.get(deviceId); if (!device) throw new Error("Unknown device"); createPublicKey(publicKey); device.publicKey = publicKey; device.keyId = keyId; device.keyVersion += 1; this.addProvenance(deviceId, "DEVICE_OBSERVED", "Device key rotated", { keyId, keyVersion: device.keyVersion }); }
  revokeKey(deviceId: string, keyId: string): void { this.revokedKeys.add(keyId); this.addProvenance(deviceId, "VERIFIED", "Device key revoked", { keyId }); }
  getDevice(deviceId: string) { return this.devices.get(deviceId); }
  getProvenance(deviceId: string) { return this.provenance.get(deviceId) ?? []; }
}
