export type EvidenceClass = "observed" | "derived" | "simulated" | "hypothesis" | "unverified";

export interface EvidenceRecordInput {
  id?: string; timestamp: string; source: string; sensorId?: string; experimentId: string; value: number; unit: string; evidenceClass: EvidenceClass; uncertainty?: number; calibrationId?: string; coordinateSystem?: string; provenance: { device: string; firmware?: string; softwareVersion: string; operator?: string };
}

export interface DeviceIdentityInput { deviceId: string; hardwareRevision: string; firmwareVersion: string; calibrationVersion: string; publicKey: string; coordinateSystem: string; }
export interface SignedTelemetryInput { deviceId: string; observedAt: string; sequenceNumber: number; experimentId: string; coordinateSystem: string; readings: Array<{ sensorId: string; value: number; unit: string; uncertainty?: number; calibrationId?: string }>; signature: string; }

export interface PhysicalTwinState {
  timestamp: string;
  position: { x: number; y: number; z: number; frame: "WGS84" | "ITRF2014" | "ENU" | "ECEF" | "LOCAL_CHAMBER" };
  velocity: { x: number; y: number; z: number; unit: string };
  environment: { pressurePa: number; temperatureK: number; humidityPercent: number; co2Ppm?: number };
  uncertainty: { positionMeters?: number; velocityMetersPerSecond?: number };
  provenance: "sensor" | "fusion" | "simulation";
}

export interface WeatherPoint { time: string; temperatureC: number | null; humidityPercent: number | null; pressureHpa: number | null; windKmh: number | null; precipitationProbability: number | null; }
export interface WeatherProviderResponse { provider: "open-meteo"; latitude: number; longitude: number; timezone: string; points: WeatherPoint[]; fetchedAt: string; attributionUrl: string; }
export interface ForecastComparison { metric: "temperatureC" | "humidityPercent" | "pressureHpa" | "windKmh"; count: number; mae: number | null; rmse: number | null; bias: number | null; source: "open-meteo"; observationSource: string; }
export const coordinateSystems = ["WGS84", "ITRF2014", "ENU", "ECEF", "LOCAL_CHAMBER"] as const;
export type CoordinateSystem = (typeof coordinateSystems)[number];
