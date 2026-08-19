import { and, desc, eq, lt, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { calibrationRecords, claimReviews, devices, evidenceExports, forensicTraces, InsertUser, predictionRuns, providerSnapshots, roadmapClaims, scheduledAlerts, sensors, sourceCitations, stations, telemetryRecords, users, weatherObservationSeries } from "../drizzle/schema";
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

export async function listEvidenceAggregates(createdBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const ownedStations = await db.select().from(stations).where(eq(stations.createdBy, createdBy));
  const ownedDevices = await db.select().from(devices).where(eq(devices.registeredBy, createdBy));
  const stationIds = new Set(ownedStations.map((station) => station.stationId));
  const deviceIds = new Set(ownedDevices.map((device) => device.deviceId));
  const allTelemetry = await db.select().from(telemetryRecords);
  const allSnapshots = await db.select().from(providerSnapshots);
  const ownedSnapshots = allSnapshots.filter((snapshot) => stationIds.has(snapshot.stationId));
  const ownedTelemetry = allTelemetry.filter((reading) => deviceIds.has(reading.deviceId));
  const ownedPredictions = await db.select().from(predictionRuns).where(eq(predictionRuns.createdBy, createdBy));
  const forecastMetrics = ownedPredictions.reduce((summary, run) => {
    const payload = run.payload as { metrics?: { mae?: number; rmse?: number; bias?: number; driftScore?: number } };
    const metrics = payload?.metrics;
    if (!metrics) return summary;
    if (typeof metrics.mae === "number") summary.mae.push(metrics.mae);
    if (typeof metrics.rmse === "number") summary.rmse.push(metrics.rmse);
    if (typeof metrics.bias === "number") summary.bias.push(metrics.bias);
    if (typeof metrics.driftScore === "number") summary.drift.push(metrics.driftScore);
    return summary;
  }, { mae: [] as number[], rmse: [] as number[], bias: [] as number[], drift: [] as number[] });
  const average = (values: number[]) => values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
  const ownedAlerts = await db.select().from(scheduledAlerts);
  const metrics = ownedTelemetry.reduce((summary, reading) => {
    summary.verifiedObservations += reading.evidenceClass === "observed" ? 1 : 0;
    summary.telemetryRecords += 1;
    return summary;
  }, { verifiedObservations: 0, telemetryRecords: 0 });
  const providers = new Set(ownedSnapshots.map((snapshot) => snapshot.provider));
  const warnings = ownedAlerts.filter((alert) => alert.severity !== "info" && !alert.acknowledgedAt).length;
  return { stations: ownedStations.length, onlineStations: ownedStations.filter((station) => station.status === "online").length, sensors: (await db.select().from(sensors).where(eq(sensors.createdBy, createdBy))).length, verifiedObservations: metrics.verifiedObservations, telemetryRecords: metrics.telemetryRecords, providerCoverage: providers.size, providers: Array.from(providers), forecastRuns: ownedPredictions.length, activeAlerts: warnings, calibrationRecords: (await db.select().from(calibrationRecords).where(eq(calibrationRecords.createdBy, createdBy))).length, forecastAccuracy: { mae: average(forecastMetrics.mae), rmse: average(forecastMetrics.rmse), bias: average(forecastMetrics.bias) }, driftScore: average(forecastMetrics.drift), evidenceClass: "observed_and_derived_only" as const };
}

export async function listSourceCitations(createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.select().from(sourceCitations).where(eq(sourceCitations.createdBy, createdBy)).orderBy(desc(sourceCitations.createdAt)); }
export async function createSourceCitation(input: { citationId: string; title: string; publisher?: string; url: string; accessedAt: Date; sourceType: "primary" | "secondary" | "authored" | "internal"; notes?: string }, createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(sourceCitations).values({ ...input, publisher: input.publisher ?? null, notes: input.notes ?? null, createdBy }); return { citationId: input.citationId }; }
export async function listClaimReviews(claimId: string, reviewerId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const claims = await db.select().from(roadmapClaims).where(and(eq(roadmapClaims.claimId, claimId), eq(roadmapClaims.submittedBy, reviewerId))); if (!claims[0]) throw new Error("Claim not found"); return db.select().from(claimReviews).where(eq(claimReviews.claimId, claimId)).orderBy(desc(claimReviews.createdAt)); }
export async function listRoadmapClaims(createdBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.select().from(roadmapClaims).where(eq(roadmapClaims.submittedBy, createdBy)).orderBy(desc(roadmapClaims.updatedAt)); }
export async function createRoadmapClaim(input: { claimId: string; label: string; value: string; category: "actual" | "target" | "assumption" | "simulation" | "hypothesis" | "unverified"; citationId?: string; evidenceNote: string }, submittedBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(roadmapClaims).values({ ...input, citationId: input.citationId ?? null, status: "draft", submittedBy }); return { claimId: input.claimId, status: "draft" as const }; }
export async function submitRoadmapClaim(claimId: string, submittedBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(roadmapClaims).set({ status: "submitted" }).where(and(eq(roadmapClaims.claimId, claimId), eq(roadmapClaims.submittedBy, submittedBy))); return { claimId, status: "submitted" as const }; }
export async function reviewRoadmapClaim(input: { claimId: string; reviewerId: number; decision: "approve" | "reject" | "request_changes"; rationale: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const status = input.decision === "approve" ? "approved" : input.decision === "reject" ? "rejected" : "draft"; await db.update(roadmapClaims).set({ status, reviewedBy: input.reviewerId, reviewedAt: new Date() }).where(eq(roadmapClaims.claimId, input.claimId)); await db.insert(claimReviews).values({ reviewId: `${input.claimId}-${Date.now()}`, claimId: input.claimId, reviewerId: input.reviewerId, decision: input.decision, rationale: input.rationale }); return { claimId: input.claimId, status }; }
export async function createEvidenceExport(payload: unknown, requestedBy: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const exportId = `data-room-${Date.now()}`; await db.insert(evidenceExports).values({ exportId, requestedBy, payload: payload as Record<string, unknown> }); return { exportId, payload }; }

export async function savePredictionRun(input: { runId: string; modelVersion: string; coordinateSystem: string; payload: unknown; uncertainty?: number; createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(predictionRuns).values({ ...input, payload: input.payload as Record<string, unknown>, uncertainty: input.uncertainty ?? null, evidenceClass: "simulated" });
  return { runId: input.runId };
}
