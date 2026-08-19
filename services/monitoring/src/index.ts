export type MonitoringAlert = { kind: "CALIBRATION_EXPIRY" | "SNAPSHOT_STALE" | "DRIFT_CHECK"; severity: "info" | "warning" | "critical"; message: string; stationId: string };
export function evaluateMonitoring(input: { stationId: string; stationName: string; calibrationExpiryDates: string[]; latestSnapshotAt?: string; now: string; snapshotMaxAgeMinutes: number; driftDetected: boolean }): MonitoringAlert[] {
  const now = Date.parse(input.now);
  const alerts: MonitoringAlert[] = [];
  const expiring = input.calibrationExpiryDates.filter((value) => { const time = Date.parse(value); return !Number.isNaN(time) && time >= now && time <= now + 30 * 24 * 60 * 60 * 1000; });
  if (expiring.length) alerts.push({ kind: "CALIBRATION_EXPIRY", severity: "warning", stationId: input.stationId, message: `${expiring.length} calibration record(s) expire within 30 days for ${input.stationName}.` });
  if (!input.latestSnapshotAt || now - Date.parse(input.latestSnapshotAt) > input.snapshotMaxAgeMinutes * 60 * 1000) alerts.push({ kind: "SNAPSHOT_STALE", severity: "warning", stationId: input.stationId, message: `Provider snapshot is stale for ${input.stationName}.` });
  if (input.driftDetected) alerts.push({ kind: "DRIFT_CHECK", severity: "critical", stationId: input.stationId, message: `Verification drift detected for ${input.stationName}.` });
  return alerts;
}
