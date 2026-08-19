import type { ForecastComparison, WeatherPoint, WeatherProviderResponse } from "../shared/contracts";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const ATTRIBUTION_URL = "https://open-meteo.com/";

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function fetchOpenMeteoForecast(input: { latitude: number; longitude: number; timezone?: string; forecastDays?: number }): Promise<WeatherProviderResponse> {
  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    timezone: input.timezone ?? "UTC",
    forecast_days: String(Math.min(16, Math.max(1, input.forecastDays ?? 3))),
    hourly: "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation_probability",
  });
  const response = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!response.ok) throw new Error(`Open-Meteo request failed: ${response.status}`);
  const json = await response.json() as { latitude: number; longitude: number; timezone: string; hourly?: { time?: string[]; temperature_2m?: unknown[]; relative_humidity_2m?: unknown[]; surface_pressure?: unknown[]; wind_speed_10m?: unknown[]; precipitation_probability?: unknown[] } };
  const time = json.hourly?.time ?? [];
  const points: WeatherPoint[] = time.map((timestamp, index) => ({
    time: timestamp,
    temperatureC: nullableNumber(json.hourly?.temperature_2m?.[index]),
    humidityPercent: nullableNumber(json.hourly?.relative_humidity_2m?.[index]),
    pressureHpa: nullableNumber(json.hourly?.surface_pressure?.[index]),
    windKmh: nullableNumber(json.hourly?.wind_speed_10m?.[index]),
    precipitationProbability: nullableNumber(json.hourly?.precipitation_probability?.[index]),
  }));
  return { provider: "open-meteo", latitude: json.latitude, longitude: json.longitude, timezone: json.timezone, points, fetchedAt: new Date().toISOString(), attributionUrl: ATTRIBUTION_URL };
}

export function compareForecastToObservations(forecast: WeatherPoint[], observations: WeatherPoint[], observationSource: string): ForecastComparison[] {
  const metrics: Array<[ForecastComparison["metric"], keyof WeatherPoint]> = [["temperatureC", "temperatureC"], ["humidityPercent", "humidityPercent"], ["pressureHpa", "pressureHpa"], ["windKmh", "windKmh"]];
  return metrics.map(([metric, key]) => {
    const pairs: Array<[number, number]> = [];
    forecast.forEach((point, index) => {
      const predicted = point[key];
      const observed = observations[index]?.[key];
      if (typeof predicted === "number" && typeof observed === "number" && Number.isFinite(predicted) && Number.isFinite(observed)) pairs.push([predicted, observed]);
    });
    if (!pairs.length) return { metric, count: 0, mae: null, rmse: null, bias: null, source: "open-meteo", observationSource };
    const errors = pairs.map(([predicted, observed]) => predicted - observed);
    return { metric, count: pairs.length, mae: errors.reduce((sum, error) => sum + Math.abs(error), 0) / pairs.length, rmse: Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / pairs.length), bias: errors.reduce((sum, error) => sum + error, 0) / pairs.length, source: "open-meteo", observationSource };
  });
}
