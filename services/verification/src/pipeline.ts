export interface VerificationInput { forecast: Array<{ timestamp: string; value: number }>; observations: Array<{ timestamp: string; value: number; quality: "excellent" | "good" | "fair" | "poor" | "missing" }>; forecastAgeMinutes: number; observationLatencyMinutes: number; calibrationAgeDays: number; provider: string; }
export interface VerificationResult { pairedCount: number; missingObservations: number; mae: number | null; rmse: number | null; meanBiasError: number | null; forecastAgeMinutes: number; observationLatencyMinutes: number; calibrationAgeDays: number; driftDetected: boolean; alerts: string[]; healthScore: number; provenanceState: "VERIFIED" | "UNVERIFIED"; }

export function runVerificationPipeline(input: VerificationInput): VerificationResult {
  const pairs = input.forecast.map((forecast) => { const observed = input.observations.find((candidate) => candidate.timestamp === forecast.timestamp && candidate.quality !== "missing" && candidate.quality !== "poor"); return observed ? [forecast.value, observed.value] as const : null; }).filter((pair): pair is [number, number] => Boolean(pair));
  const errors = pairs.map(([forecast, observed]) => forecast - observed);
  const mae = pairs.length ? errors.reduce((sum, error) => sum + Math.abs(error), 0) / pairs.length : null;
  const rmse = pairs.length ? Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / pairs.length) : null;
  const meanBiasError = pairs.length ? errors.reduce((sum, error) => sum + error, 0) / pairs.length : null;
  const missingObservations = input.forecast.length - pairs.length;
  const alerts: string[] = [];
  if (input.calibrationAgeDays > 180) alerts.push("CALIBRATION_EXPIRING");
  if (input.forecastAgeMinutes > 180) alerts.push("STALE_FORECAST");
  if (input.observationLatencyMinutes > 60) alerts.push("OBSERVATION_LATENCY");
  if ((mae ?? Infinity) > 3) alerts.push("FORECAST_DRIFT");
  const driftDetected = alerts.includes("FORECAST_DRIFT");
  const healthScore = Math.max(0, Math.min(100, 100 - alerts.length * 15 - missingObservations * 2));
  return { pairedCount: pairs.length, missingObservations, mae, rmse, meanBiasError, forecastAgeMinutes: input.forecastAgeMinutes, observationLatencyMinutes: input.observationLatencyMinutes, calibrationAgeDays: input.calibrationAgeDays, driftDetected, alerts, healthScore, provenanceState: pairs.length ? "VERIFIED" : "UNVERIFIED" };
}
