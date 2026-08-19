import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookie } from "cookie";
import { createHeartbeatJob } from "./_core/heartbeat";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createCalibration, createSensor, createStation, deleteStation, getDevice, getLatestDeviceSequence, getObservationSeries, listCalibrations, listForensicTraces, listSensors, listStations, registerDevice, saveForensicTrace, saveObservationSeries, savePredictionRun, saveScheduledAlert, saveTelemetry, setStationTaskUid, updateSensor, updateStation } from "./db";
import { compareForecastToObservations } from "./weather";
import { fetchOpenMeteoForecast } from "./weather";
import { validateDeviceIdentity, validateTelemetry, verifyTelemetrySignature } from "./telemetry";

const coordinateSystem = z.enum(["WGS84", "ITRF2014", "ENU", "ECEF", "LOCAL_CHAMBER"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  weather: router({
    forecast: publicProcedure.input(z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), timezone: z.string().optional(), forecastDays: z.number().int().min(1).max(16).optional() })).query(({ input }) => fetchOpenMeteoForecast(input)),
  }),
  stations: router({
    list: protectedProcedure.query(({ ctx }) => listStations(ctx.user.id)),
    create: protectedProcedure.input(z.object({ stationId: z.string().min(1), name: z.string().min(1), latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), elevationMeters: z.number(), hardwareModel: z.string().min(1), firmwareVersion: z.string().min(1), owner: z.string().min(1), coordinateSystem })).mutation(({ input, ctx }) => createStation(input, ctx.user.id)),
    update: protectedProcedure.input(z.object({ stationId: z.string().min(1), patch: z.object({ name: z.string().min(1).optional(), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(), elevationMeters: z.number().optional(), hardwareModel: z.string().min(1).optional(), firmwareVersion: z.string().min(1).optional(), owner: z.string().min(1).optional(), coordinateSystem: coordinateSystem.optional(), status: z.enum(["online", "offline", "maintenance", "error"]).optional() }) })).mutation(({ input, ctx }) => updateStation(input.stationId, ctx.user.id, input.patch)),
    delete: protectedProcedure.input(z.object({ stationId: z.string().min(1), confirm: z.literal(true) })).mutation(({ input, ctx }) => deleteStation(input.stationId, ctx.user.id)),
    sensors: protectedProcedure.input(z.object({ stationId: z.string().min(1) })).query(({ input, ctx }) => listSensors(input.stationId, ctx.user.id)),
    addSensor: protectedProcedure.input(z.object({ sensorId: z.string().min(1), stationId: z.string().min(1), sensorType: z.string().min(1), unit: z.string().min(1), status: z.enum(["active", "maintenance", "retired"]).optional(), calibrationVersion: z.string().optional() })).mutation(({ input, ctx }) => createSensor(input, ctx.user.id)),
    updateSensor: protectedProcedure.input(z.object({ sensorId: z.string().min(1), patch: z.object({ sensorType: z.string().min(1).optional(), unit: z.string().min(1).optional(), status: z.enum(["active", "maintenance", "retired"]).optional(), calibrationVersion: z.string().nullable().optional() }) })).mutation(({ input, ctx }) => updateSensor(input.sensorId, ctx.user.id, input.patch)),
    calibrations: protectedProcedure.input(z.object({ stationId: z.string().min(1) })).query(({ input }) => listCalibrations(input.stationId)),
    addCalibration: protectedProcedure.input(z.object({ stationId: z.string().min(1), sensorId: z.string().min(1), version: z.string().min(1), certificate: z.string().min(1), calibratedAt: z.string(), expiresAt: z.string(), offset: z.number(), scale: z.number().positive() })).mutation(({ input, ctx }) => createCalibration({ ...input, calibratedAt: new Date(input.calibratedAt), expiresAt: new Date(input.expiresAt) }, ctx.user.id)),
    scheduleMonitoring: protectedProcedure.input(z.object({ stationId: z.string().min(1), cron: z.string().regex(/^\\d+ \\d+ \\d+ \\S+ \\S+ \\S+$/), kind: z.enum(["providerSnapshot", "calibrationExpiry", "driftCheck", "operatorAlert"]).default("providerSnapshot") })).mutation(async ({ input, ctx }) => { const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? ""; const job = await createHeartbeatJob({ name: `cosmic-${input.kind}-${input.stationId}`, cron: input.cron, path: `/api/scheduled/${input.kind}`, payload: {}, description: `${input.kind} monitoring for ${input.stationId}` }, sessionToken); return setStationTaskUid(input.stationId, ctx.user.id, job.taskUid, input.kind); }),
  }),
  telemetry: router({
    registerDevice: protectedProcedure.input(z.object({ deviceId: z.string().min(1), hardwareRevision: z.string().min(1), firmwareVersion: z.string().min(1), calibrationVersion: z.string().min(1), publicKey: z.string().min(1), coordinateSystem })).mutation(async ({ input, ctx }) => {
      const validation = validateDeviceIdentity(input);
      if (!validation.ok) throw new Error(validation.errors.join("; "));
      return registerDevice(input, ctx.user.id);
    }),
    ingest: protectedProcedure.input(z.object({ deviceId: z.string().min(1), observedAt: z.string(), sequenceNumber: z.number().int().positive(), experimentId: z.string().min(1), coordinateSystem, readings: z.array(z.object({ sensorId: z.string().min(1), value: z.number(), unit: z.string().min(1), uncertainty: z.number().nonnegative().optional(), calibrationId: z.string().min(1).optional() })).min(1), signature: z.string().min(1) })).mutation(async ({ input }) => {
      const device = await getDevice(input.deviceId);
      if (!device) throw new Error("Unknown device");
      const validation = validateTelemetry(input, device, await getLatestDeviceSequence(input.deviceId));
      if (!validation.ok) throw new Error(validation.errors.join("; "));
      if (!verifyTelemetrySignature(input, device.publicKey)) throw new Error("Invalid telemetry signature");
      return saveTelemetry(input, "cosmic-hammer-api/1.0.0");
    }),
  }),
  forensic: router({
    list: protectedProcedure.input(z.object({ stationId: z.string().min(1) })).query(({ input, ctx }) => listForensicTraces(input.stationId, ctx.user.id)),
    save: protectedProcedure.input(z.object({ traceId: z.string().min(1), observationId: z.string().min(1), stationId: z.string().min(1), deviceId: z.string().min(1), seriesId: z.string().optional(), terminalStatus: z.enum(["open", "verified", "rejected", "sealed"]), events: z.array(z.record(z.string(), z.unknown())), completedAt: z.string().optional() })).mutation(({ input, ctx }) => saveForensicTrace({ ...input, completedAt: input.completedAt ? new Date(input.completedAt) : undefined }, ctx.user.id)),
  }),
  observations: router({
    saveSeries: protectedProcedure.input(z.object({ seriesId: z.string().min(1), source: z.string().min(1), coordinateSystem, latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), points: z.array(z.object({ time: z.string(), temperatureC: z.number().nullable(), humidityPercent: z.number().nullable(), pressureHpa: z.number().nullable(), windKmh: z.number().nullable(), precipitationProbability: z.number().nullable() })).min(1) })).mutation(({ input, ctx }) => saveObservationSeries({ ...input, payload: input.points, createdBy: ctx.user.id })),
    compare: protectedProcedure.input(z.object({ seriesId: z.string().min(1), forecast: z.array(z.object({ time: z.string(), temperatureC: z.number().nullable(), humidityPercent: z.number().nullable(), pressureHpa: z.number().nullable(), windKmh: z.number().nullable(), precipitationProbability: z.number().nullable() })).min(1) })).query(async ({ input }) => {
      const series = await getObservationSeries(input.seriesId);
      if (!series) throw new Error("Observation series not found");
      return { seriesId: input.seriesId, source: series.source, coordinateSystem: series.coordinateSystem, metrics: compareForecastToObservations(input.forecast, series.payload as never[], series.source) };
    }),
  }),
  predictions: router({
    recordRun: protectedProcedure.input(z.object({ runId: z.string().min(1), modelVersion: z.string().min(1), coordinateSystem, payload: z.record(z.string(), z.unknown()), uncertainty: z.number().nonnegative().optional() })).mutation(({ input, ctx }) => savePredictionRun({ ...input, createdBy: ctx.user.id })),
  }),
});

export type AppRouter = typeof appRouter;
