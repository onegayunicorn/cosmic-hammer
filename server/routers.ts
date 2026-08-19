import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDevice, getLatestDeviceSequence, getObservationSeries, registerDevice, saveObservationSeries, savePredictionRun, saveTelemetry } from "./db";
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
