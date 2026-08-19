import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { devices, InsertUser, predictionRuns, telemetryRecords, users, weatherObservationSeries } from "../drizzle/schema";
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
