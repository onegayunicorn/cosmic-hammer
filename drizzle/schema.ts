import { double, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const stations = mysqlTable("stations", {
  id: int("id").autoincrement().primaryKey(),
  stationId: varchar("stationId", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  elevationMeters: double("elevationMeters").notNull().default(0),
  hardwareModel: varchar("hardwareModel", { length: 128 }).notNull(),
  firmwareVersion: varchar("firmwareVersion", { length: 64 }).notNull(),
  owner: varchar("owner", { length: 160 }).notNull(),
  coordinateSystem: varchar("coordinateSystem", { length: 64 }).notNull().default("WGS84"),
  status: mysqlEnum("status", ["online", "offline", "maintenance", "error"]).notNull().default("offline"),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  providerSnapshotTaskUid: varchar("providerSnapshotTaskUid", { length: 65 }),
  calibrationExpiryTaskUid: varchar("calibrationExpiryTaskUid", { length: 65 }),
  driftCheckTaskUid: varchar("driftCheckTaskUid", { length: 65 }),
  operatorAlertTaskUid: varchar("operatorAlertTaskUid", { length: 65 }),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const sensors = mysqlTable("sensors", {
  id: int("id").autoincrement().primaryKey(),
  sensorId: varchar("sensorId", { length: 128 }).notNull().unique(),
  stationId: varchar("stationId", { length: 128 }).notNull(),
  sensorType: varchar("sensorType", { length: 128 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
  status: mysqlEnum("sensorStatus", ["active", "maintenance", "retired"]).notNull().default("active"),
  calibrationVersion: varchar("calibrationVersion", { length: 64 }),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const calibrationRecords = mysqlTable("calibrationRecords", {
  id: int("id").autoincrement().primaryKey(),
  stationId: varchar("stationId", { length: 128 }).notNull(),
  sensorId: varchar("sensorId", { length: 128 }).notNull(),
  version: varchar("version", { length: 64 }).notNull(),
  certificate: varchar("certificate", { length: 256 }).notNull(),
  calibratedAt: timestamp("calibratedAt").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  offset: double("offset").notNull().default(0),
  scale: double("scale").notNull().default(1),
  createdBy: int("createdBy").notNull(),
});

export const devices = mysqlTable("devices", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: varchar("deviceId", { length: 128 }).notNull().unique(),
  hardwareRevision: varchar("hardwareRevision", { length: 64 }).notNull(),
  firmwareVersion: varchar("firmwareVersion", { length: 64 }).notNull(),
  calibrationVersion: varchar("calibrationVersion", { length: 64 }).notNull(),
  publicKey: text("publicKey").notNull(),
  coordinateSystem: varchar("coordinateSystem", { length: 64 }).notNull().default("WGS84"),
  registeredBy: int("registeredBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt"),
});

export const telemetryRecords = mysqlTable("telemetryRecords", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: varchar("deviceId", { length: 128 }).notNull(),
  sensorId: varchar("sensorId", { length: 128 }).notNull(),
  experimentId: varchar("experimentId", { length: 128 }).notNull(),
  observedAt: timestamp("observedAt").notNull(),
  ingestedAt: timestamp("ingestedAt").defaultNow().notNull(),
  sequenceNumber: int("sequenceNumber").notNull(),
  value: double("value").notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
  evidenceClass: mysqlEnum("evidenceClass", ["observed", "derived", "simulated", "hypothesis", "unverified"]).notNull(),
  uncertainty: double("uncertainty"),
  calibrationId: varchar("calibrationId", { length: 128 }),
  coordinateSystem: varchar("coordinateSystem", { length: 64 }).notNull(),
  provenance: json("provenance").notNull(),
  signature: text("signature").notNull(),
});

export const weatherObservationSeries = mysqlTable("weatherObservationSeries", {
  id: int("id").autoincrement().primaryKey(),
  seriesId: varchar("seriesId", { length: 128 }).notNull().unique(),
  source: varchar("source", { length: 256 }).notNull(),
  coordinateSystem: varchar("coordinateSystem", { length: 64 }).notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  payload: json("payload").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const forensicTraces = mysqlTable("forensicTraces", {
  id: int("id").autoincrement().primaryKey(),
  traceId: varchar("traceId", { length: 128 }).notNull().unique(),
  observationId: varchar("observationId", { length: 128 }).notNull(),
  stationId: varchar("stationId", { length: 128 }).notNull(),
  deviceId: varchar("deviceId", { length: 128 }).notNull(),
  seriesId: varchar("seriesId", { length: 128 }),
  terminalStatus: mysqlEnum("terminalStatus", ["open", "verified", "rejected", "sealed"]).notNull().default("open"),
  events: json("events").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const providerSnapshots = mysqlTable("providerSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  snapshotId: varchar("snapshotId", { length: 128 }).notNull().unique(),
  stationId: varchar("stationId", { length: 128 }).notNull(),
  provider: varchar("provider", { length: 128 }).notNull(),
  fetchedAt: timestamp("fetchedAt").notNull(),
  payload: json("payload").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const scheduledAlerts = mysqlTable("scheduledAlerts", {
  id: int("id").autoincrement().primaryKey(),
  alertId: varchar("alertId", { length: 128 }).notNull().unique(),
  stationId: varchar("stationId", { length: 128 }),
  kind: varchar("kind", { length: 64 }).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).notNull(),
  message: text("message").notNull(),
  payload: json("payload").notNull(),
  acknowledgedAt: timestamp("acknowledgedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const predictionRuns = mysqlTable("predictionRuns", {
  id: int("id").autoincrement().primaryKey(),
  runId: varchar("runId", { length: 128 }).notNull().unique(),
  modelVersion: varchar("modelVersion", { length: 128 }).notNull(),
  coordinateSystem: varchar("coordinateSystem", { length: 64 }).notNull(),
  evidenceClass: mysqlEnum("evidenceClass", ["observed", "derived", "simulated", "hypothesis", "unverified"]).notNull().default("simulated"),
  payload: json("payload").notNull(),
  uncertainty: double("uncertainty"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Station = typeof stations.$inferSelect;
export type Sensor = typeof sensors.$inferSelect;
export type CalibrationRecord = typeof calibrationRecords.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type ForensicTrace = typeof forensicTraces.$inferSelect;
export type ProviderSnapshot = typeof providerSnapshots.$inferSelect;
export type ScheduledAlert = typeof scheduledAlerts.$inferSelect;
export type TelemetryRecord = typeof telemetryRecords.$inferSelect;
export type PredictionRun = typeof predictionRuns.$inferSelect;
export type WeatherObservationSeries = typeof weatherObservationSeries.$inferSelect;
