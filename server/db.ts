import { and, desc, eq, lt, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { calibrationRecords, devices, forensicTraces, InsertUser, predictionRuns, providerSnapshots, scheduledAlerts, sensors, stations, telemetryRecords, users, weatherObservationSeries } from "../drizzle/schema";
import { ENV } from "./_core/env";
import type { DeviceIdentityInput, SignedTelemetryInput } from "../shared/contracts";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createStation(input: { stationId: string; name: string; latitude: number; longitude: number; elevationMeters: number; hardwareModel: string; firmwareVersion: string; owner: string; coordinateSystem: string; status?: "online" | "offline" | "maintenance" | "error" }, createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(stations).values({ ...input, status: input.status ?? "offline", createdBy }); return (await db.select().from(stations).where(eq(stations.stationId, input.stationId)).limit(1))[0]; }
export async function listStations(createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.select().from(stations).where(eq(stations.createdBy, createdBy)).orderBy(desc(stations.updatedAt)); }
export async function getStationByTaskUid(taskUid: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return (await db.select().from(stations).where(or(eq(stations.scheduleCronTaskUid, taskUid), eq(stations.providerSnapshotTaskUid, taskUid), eq(stations.calibrationExpiryTaskUid, taskUid), eq(stations.driftCheckTaskUid, taskUid), eq(stations.operatorAlertTaskUid, taskUid))).limit(1))[0]; }
export async function setStationTaskUid(stationId: string, createdBy: number, taskUid: string, kind: "providerSnapshot" | "calibrationExpiry" | "driftCheck" | "operatorAlert") { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const field = kind === "providerSnapshot" ? "providerSnapshotTaskUid" : kind === "calibrationExpiry" ? "calibrationExpiryTaskUid" : kind === "driftCheck" ? "driftCheckTaskUid" : "operatorAlertTaskUid"; await db.update(stations).set({ [field]: taskUid }).where(and(eq(stations.stationId, stationId), eq(stations.createdBy, createdBy))); return { stationId, taskUid, kind }; }
export async function updateStation(stationId: string, createdBy: number, input: Partial<{ name: string; latitude: number; longitude: number; elevationMeters: number; hardwareModel: string; firmwareVersion: string; owner: string; coordinateSystem: string; status: "online" | "offline" | "maintenance" | "error" }>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(stations).set(input).where(and(eq(stations.stationId, stationId), eq(stations.createdBy, createdBy))); return (await db.select().from(stations).where(eq(stations.stationId, stationId)).limit(1))[0]; }
export async function deleteStation(stationId: string, createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(sensors).where(and(eq(sensors.stationId, stationId), eq(sensors.createdBy, createdBy))); await db.delete(stations).where(and(eq(stations.stationId, stationId), eq(stations.createdBy, createdBy))); return { stationId, deleted: true }; }
export async function createSensor(input: { sensorId: string; stationId: string; sensorType: string; unit: string; status?: "active" | "maintenance" | "retired"; calibrationVersion?: string }, createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(sensors).values({ ...input, status: input.status ?? "active", calibrationVersion: input.calibrationVersion ?? null, createdBy }); return (await db.select().from(sensors).where(eq(sensors.sensorId, input.sensorId)).limit(1))[0]; }
export async function listSensors(stationId: string, createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.select().from(sensors).where(and(eq(sensors.stationId, stationId), eq(sensors.createdBy, createdBy))).orderBy(desc(sensors.createdAt)); }
export async function updateSensor(sensorId: string, createdBy: number, input: Partial<{ sensorType: string; unit: string; status: "active" | "maintenance" | "retired"; calibrationVersion: string | null }>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(sensors).set(input).where(and(eq(sensors.sensorId, sensorId), eq(sensors.createdBy, createdBy))); return (await db.select().from(sensors).where(eq(sensors.sensorId, sensorId)).limit(1))[0]; }
export async function createCalibration(input: { stationId: string; sensorId: string; version: string; certificate: string; calibratedAt: Date; expiresAt: Date; offset: number; scale: number }, createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(calibrationRecords).values({ ...input, createdBy }); return input; }
export async function listCalibrations(stationId: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.select().from(calibrationRecords).where(eq(calibrationRecords.stationId, stationId)).orderBy(desc(calibrationRecords.expiresAt)); }
export async function listExpiringCalibrations(stationId: string, before: Date) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.select().from(calibrationRecords).where(and(eq(calibrationRecords.stationId, stationId), lt(calibrationRecords.expiresAt, before))); }
export async function saveForensicTrace(input: { traceId: string; observationId: string; stationId: string; deviceId: string; seriesId?: string; terminalStatus: "open" | "verified" | "rejected" | "sealed"; events: unknown; completedAt?: Date }, createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(forensicTraces).values({ ...input, events: input.events as Record<string, unknown>, seriesId: input.seriesId ?? null, completedAt: input.completedAt ?? null, createdBy }); return { traceId: input.traceId }; }
export async function listForensicTraces(stationId: string, createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.select().from(forensicTraces).where(and(eq(forensicTraces.stationId, stationId), eq(forensicTraces.createdBy, createdBy))).orderBy(desc(forensicTraces.createdAt)); }
export async function saveScheduledAlert(input: { alertId: string; stationId?: string; kind: string; severity: "info" | "warning" | "critical"; message: string; payload: unknown }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(scheduledAlerts).values({ ...input, stationId: input.stationId ?? null, payload: input.payload as Record<string, unknown> }); return { alertId: input.alertId }; }
export async function saveProviderSnapshot(input: { snapshotId: string; stationId: string; provider: string; fetchedAt: Date; payload: unknown }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(providerSnapshots).values({ ...input, payload: input.payload as Record<string, unknown> }); return { snapshotId: input.snapshotId }; }

export async function registerDevice(input: DeviceIdentityInput, registeredBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(devices).values({ ...input, registeredBy }).onDuplicateKeyUpdate({ set: { hardwareRevision: input.hardwareRevision, firmwareVersion: input.firmwareVersion, calibrationVersion: input.calibrationVersion, publicKey: input.publicKey, coordinateSystem: input.coordinateSystem } });
  const rows = await db.select().from(devices).where(eq(devices.deviceId, input.deviceId)).limit(1);
  return rows[0];
}

export async function getDevice(deviceId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(devices).where(eq(devices.deviceId, deviceId)).limit(1);
  return rows[0];
}

export async function getLatestDeviceSequence(deviceId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select({ sequenceNumber: telemetryRecords.sequenceNumber }).from(telemetryRecords).where(eq(telemetryRecords.deviceId, deviceId)).orderBy(desc(telemetryRecords.sequenceNumber)).limit(1);
  return rows[0]?.sequenceNumber;
}

export async function saveTelemetry(input: SignedTelemetryInput, softwareVersion: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const provenance = { device: input.deviceId, softwareVersion, coordinateSystem: input.coordinateSystem };
  for (const reading of input.readings) {
    await db.insert(telemetryRecords).values({ deviceId: input.deviceId, sensorId: reading.sensorId, experimentId: input.experimentId, observedAt: new Date(input.observedAt), sequenceNumber: input.sequenceNumber, value: reading.value, unit: reading.unit, evidenceClass: "observed", uncertainty: reading.uncertainty ?? null, calibrationId: reading.calibrationId ?? null, coordinateSystem: input.coordinateSystem, provenance, signature: input.signature });
  }
  return { accepted: input.readings.length };
}

export async function saveObservationSeries(input: { seriesId: string; source: string; coordinateSystem: string; latitude: number; longitude: number; payload: unknown; createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(weatherObservationSeries).values({ ...input, payload: input.payload as Record<string, unknown> });
  return { seriesId: input.seriesId };
}

export async function getObservationSeries(seriesId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.select().from(weatherObservationSeries).where(eq(weatherObservationSeries.seriesId, seriesId)).limit(1);
  return rows[0];
}

export async function savePredictionRun(input: { runId: string; modelVersion: string; coordinateSystem: string; payload: unknown; uncertainty?: number; createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(predictionRuns).values({ ...input, payload: input.payload as Record<string, unknown>, uncertainty: input.uncertainty ?? null, evidenceClass: "simulated" });
  return { runId: input.runId };
}
