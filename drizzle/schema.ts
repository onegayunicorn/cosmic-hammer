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
export type Device = typeof devices.$inferSelect;
export type TelemetryRecord = typeof telemetryRecords.$inferSelect;
export type PredictionRun = typeof predictionRuns.$inferSelect;
export type WeatherObservationSeries = typeof weatherObservationSeries.$inferSelect;
