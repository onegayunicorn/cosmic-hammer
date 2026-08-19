import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { notifyOwner } from "./_core/notification";
import { fetchOpenMeteoForecast } from "./weather";
import { getStationByTaskUid, listExpiringCalibrations, saveProviderSnapshot, saveScheduledAlert } from "./db";

async function authenticateCron(req: Request) {
  const user = await sdk.authenticateRequest(req);
  if (!user.isCron || !user.taskUid) throw new Error("cron-only");
  return user;
}

export async function providerSnapshotHandler(req: Request, res: Response) {
  try {
    const user = await authenticateCron(req);
    const station = await getStationByTaskUid(user.taskUid!);
    if (!station) return res.json({ ok: true, skipped: "orphan" });
    const forecast = await fetchOpenMeteoForecast({ latitude: station.latitude, longitude: station.longitude, timezone: "UTC", forecastDays: 1 });
    const snapshotId = `snapshot-${station.stationId}-${Date.now()}`;
    await saveProviderSnapshot({ snapshotId, stationId: station.stationId, provider: forecast.provider, fetchedAt: new Date(forecast.fetchedAt), payload: forecast });
    return res.json({ ok: true, stationId: station.stationId, snapshotId, provider: forecast.provider, points: forecast.points.length, fetchedAt: forecast.fetchedAt });
  } catch (error) { return res.status(500).json({ error: String(error), timestamp: new Date().toISOString(), context: { path: req.path } }); }
}

export async function calibrationExpiryHandler(req: Request, res: Response) {
  try {
    const user = await authenticateCron(req);
    const station = await getStationByTaskUid(user.taskUid!);
    if (!station) return res.json({ ok: true, skipped: "orphan" });
    const expiring = await listExpiringCalibrations(station.stationId, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    if (expiring.length) {
      const message = `${expiring.length} calibration record(s) expire within 30 days for ${station.name}.`;
      await saveScheduledAlert({ alertId: `calibration-${station.stationId}-${new Date().toISOString().slice(0, 10)}`, stationId: station.stationId, kind: "CALIBRATION_EXPIRY", severity: "warning", message, payload: { count: expiring.length } });
      await notifyOwner({ title: "Cosmic Hammer calibration alert", content: message });
    }
    return res.json({ ok: true, stationId: station.stationId, expiringCount: expiring.length });
  } catch (error) { return res.status(500).json({ error: String(error), timestamp: new Date().toISOString(), context: { path: req.path } }); }
}

export async function driftCheckHandler(req: Request, res: Response) {
  try {
    const user = await authenticateCron(req);
    const station = await getStationByTaskUid(user.taskUid!);
    if (!station) return res.json({ ok: true, skipped: "orphan" });
    const alertId = `drift-${station.stationId}-${new Date().toISOString().slice(0, 10)}`;
    await saveScheduledAlert({ alertId, stationId: station.stationId, kind: "DRIFT_CHECK", severity: "info", message: `Drift check completed for ${station.name}; awaiting paired observation data.`, payload: { drift: "no-data", action: "await-observation-window" } });
    return res.json({ ok: true, stationId: station.stationId, drift: "no-data", alertId });
  } catch (error) { return res.status(500).json({ error: String(error), timestamp: new Date().toISOString(), context: { path: req.path } }); }
}

export async function operatorAlertHandler(req: Request, res: Response) {
  try {
    const user = await authenticateCron(req);
    const station = await getStationByTaskUid(user.taskUid!);
    if (!station) return res.json({ ok: true, skipped: "orphan" });
    const alertId = `operator-route-${station.stationId}-${new Date().toISOString().slice(0, 10)}`;
    const message = `Operator alert route healthy for ${station.name}.`;
    await saveScheduledAlert({ alertId, stationId: station.stationId, kind: "OPERATOR_ROUTE", severity: "info", message, payload: { route: "/api/scheduled/operatorAlert", taskUid: user.taskUid } });
    const delivered = await notifyOwner({ title: "Cosmic Hammer operator route", content: message });
    return res.json({ ok: true, stationId: station.stationId, alertId, delivered });
  } catch (error) { return res.status(500).json({ error: String(error), timestamp: new Date().toISOString(), context: { path: req.path } }); }
}
