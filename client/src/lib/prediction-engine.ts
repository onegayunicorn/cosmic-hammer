// Orbital Cartography style note: prediction outputs are rendered as instrument traces with explicit simulation labels and uncertainty instead of claims of certainty.

export type PredictionMode = "weather" | "digital-twin";

export interface WeatherInput {
  location: string;
  baselineTemperatureC: number;
  baselineHumidity: number;
  baselinePressureHpa: number;
  horizonHours: number;
  pressureSignal: number;
}

export interface WeatherPrediction {
  mode: "weather";
  location: string;
  horizonHours: number;
  timestamp: string;
  temperatureC: number;
  humidity: number;
  pressureHpa: number;
  windKmh: number;
  precipitationChance: number;
  condition: "stable" | "drift" | "watch";
  confidence: number;
  uncertainty: number;
  modelState: "simulation";
  caveat: string;
}

export interface TwinInput {
  twinId: string;
  anchorX: number;
  anchorY: number;
  anchorZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  horizonSeconds: number;
  pressureSignal: number;
}

export interface TwinPositionPrediction {
  mode: "digital-twin";
  twinId: string;
  timestamp: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  displacement: number;
  confidence: number;
  uncertaintyMeters: number;
  modelState: "simulation";
  caveat: string;
}

export interface PredictionRun {
  runId: string;
  startedAt: string;
  weather: WeatherPrediction;
  digitalTwin: TwinPositionPrediction;
  model: "cosmic-hammer-pressure-hypothesis-v0.1";
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, digits = 2) => Number(value.toFixed(digits));

export function predictWeather(input: WeatherInput, now = new Date("2026-08-20T00:00:00.000Z")): WeatherPrediction {
  const horizonFactor = Math.max(1, input.horizonHours / 6);
  const pressureDelta = input.pressureSignal * 3.8;
  const temperatureC = input.baselineTemperatureC + Math.sin(input.horizonHours / 8) * 1.7 - pressureDelta * 0.12;
  const humidity = clamp(input.baselineHumidity + Math.cos(input.horizonHours / 10) * 4 - pressureDelta * 0.6, 0, 100);
  const pressureHpa = input.baselinePressureHpa + pressureDelta;
  const windKmh = clamp(12 + Math.abs(pressureDelta) * 2.2 + Math.sin(input.horizonHours / 4) * 3, 0, 160);
  const precipitationChance = clamp(42 + (humidity - 60) * 0.85 - pressureDelta * 2.4, 0, 100);
  const uncertainty = clamp(8 + horizonFactor * 3.5 + Math.abs(input.pressureSignal) * 6, 4, 45);
  const confidence = round(100 - uncertainty, 1);
  const condition = uncertainty > 28 ? "watch" : Math.abs(pressureDelta) > 2.2 ? "drift" : "stable";

  return {
    mode: "weather",
    location: input.location,
    horizonHours: input.horizonHours,
    timestamp: now.toISOString(),
    temperatureC: round(temperatureC, 1),
    humidity: round(humidity, 1),
    pressureHpa: round(pressureHpa, 1),
    windKmh: round(windKmh, 1),
    precipitationChance: round(precipitationChance, 1),
    condition,
    confidence,
    uncertainty: round(uncertainty, 1),
    modelState: "simulation",
    caveat: "Sandbox estimate only. Connect an approved weather data source and validate against observations before operational use.",
  };
}

export function predictTwinPosition(input: TwinInput, now = new Date("2026-08-20T00:00:00.000Z")): TwinPositionPrediction {
  const pressureAcceleration = input.pressureSignal * 0.0008;
  const position = {
    x: input.anchorX + input.velocityX * input.horizonSeconds + 0.5 * pressureAcceleration * input.horizonSeconds ** 2,
    y: input.anchorY + input.velocityY * input.horizonSeconds,
    z: input.anchorZ + input.velocityZ * input.horizonSeconds - 0.25 * pressureAcceleration * input.horizonSeconds ** 2,
  };
  const velocity = {
    x: input.velocityX + pressureAcceleration * input.horizonSeconds,
    y: input.velocityY,
    z: input.velocityZ - 0.5 * pressureAcceleration * input.horizonSeconds,
  };
  const displacement = Math.sqrt((position.x - input.anchorX) ** 2 + (position.y - input.anchorY) ** 2 + (position.z - input.anchorZ) ** 2);
  const uncertaintyMeters = round(0.5 + input.horizonSeconds * 0.018 + Math.abs(input.pressureSignal) * 2.4, 2);
  const confidence = round(clamp(100 - uncertaintyMeters * 2.7, 40, 98), 1);

  return {
    mode: "digital-twin",
    twinId: input.twinId,
    timestamp: now.toISOString(),
    position: { x: round(position.x, 3), y: round(position.y, 3), z: round(position.z, 3) },
    velocity: { x: round(velocity.x, 3), y: round(velocity.y, 3), z: round(velocity.z, 3) },
    displacement: round(displacement, 3),
    confidence,
    uncertaintyMeters,
    modelState: "simulation",
    caveat: "Position is a deterministic sandbox trajectory, not a live location signal or physical-world prediction.",
  };
}

export function runPredictionSimulation(now = new Date("2026-08-20T00:00:00.000Z")): PredictionRun {
  return {
    runId: "pred-0042",
    startedAt: now.toISOString(),
    model: "cosmic-hammer-pressure-hypothesis-v0.1",
    weather: predictWeather({ location: "Brisbane, AU", baselineTemperatureC: 22.4, baselineHumidity: 63, baselinePressureHpa: 1012.6, horizonHours: 12, pressureSignal: 0.42 }, now),
    digitalTwin: predictTwinPosition({ twinId: "AST-0042", anchorX: 12, anchorY: -4, anchorZ: 7, velocityX: 0.84, velocityY: 0.12, velocityZ: -0.22, horizonSeconds: 30, pressureSignal: 0.42 }, now),
  };
}
