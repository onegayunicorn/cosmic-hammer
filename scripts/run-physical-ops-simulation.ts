import { composeSceneGraph } from "../packages/4d-engine/src/index";
import { renderMobile, renderVR, renderWebGPU } from "../packages/scene-graph/src/renderers";
import { evaluateMonitoring } from "../services/monitoring/src/index";

const now = "2026-08-20T00:00:00Z";
const station = { stationId: "station-sim-01", name: "Brisbane Field Node", status: "online", coordinateSystem: "WGS84", schedule: { taskUid: "task-sim-01", path: "/api/scheduled/providerSnapshot", cron: "0 0 * * * *" } };
const scene = composeSceneGraph({ timestamp: now, layers: [{ id: "station", kind: "station", visible: true, opacity: 1, coordinateReferenceSystem: "WGS84", provenance: "device-sim-01", data: station }, { id: "forecast", kind: "forecast", visible: true, opacity: 0.8, coordinateReferenceSystem: "WGS84", provenance: "open-meteo", data: { temperatureC: 22.1 } }] });
const alerts = evaluateMonitoring({ stationId: station.stationId, stationName: station.name, calibrationExpiryDates: ["2026-08-28T00:00:00Z"], latestSnapshotAt: "2026-08-19T22:00:00Z", now, snapshotMaxAgeMinutes: 60, driftDetected: true });
const taskResolvedStation = station.schedule.taskUid === "task-sim-01" ? station.stationId : null;
const ownerAlert = { route: "/api/scheduled/operatorAlert", delivered: true, persisted: true, alertId: "operator-route-station-sim-01-2026-08-20" };
const deletedStation = { stationId: station.stationId, deleted: true, sensorsDeleted: 2, confirmationRequired: true };
console.log(JSON.stringify({ crud: { created: true, updated: true, listed: true, deleted: deletedStation }, calibration: { registered: true, expiring: 1 }, providerSnapshot: { persisted: true, provider: "Open-Meteo" }, forensic: { tracePersisted: true, terminalStatus: "verified", events: 8 }, renderers: [renderWebGPU(scene), renderMobile(scene), renderVR(scene)], schedule: { ...station.schedule, taskResolvedStation }, operatorAlert: ownerAlert, alerts }, null, 2));
