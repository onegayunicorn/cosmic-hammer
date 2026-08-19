# Integration Contracts

## Contract posture

These contracts describe boundaries only. The static frontend does not invoke external services, accept secrets, or claim that a driver is installed. A production adapter must implement authentication, retries, observability, and policy checks outside the frontend.

## Universal Driver adapter

The adapter presents a normalized driver interface to the simulation and pipeline layers.

```ts
export type DriverCapability = "sensor.read" | "field.write" | "simulation.step" | "twin.sync";

export interface UniversalDriver {
  id: string;
  label: string;
  version: string;
  capabilities: DriverCapability[];
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  read(channel: string): Promise<{ timestamp: string; values: Record<string, number> }>;
  health(): Promise<{ ok: boolean; latencyMs: number; message?: string }>;
}
```

Any implementation must make capability scope explicit and refuse unsupported operations. The frontend should only show `CONNECTED` after a backend health check and a signed session is present.

## Digital Twin Runtime adapter

```ts
export interface TwinProfile {
  id: string;
  callSign: string;
  materials: string[];
  pressureSensitivity: number;
  temperament: "measured" | "curious" | "assertive";
  updatedAt: string;
}

export interface DigitalTwinRuntime {
  loadProfile(id: string): Promise<TwinProfile>;
  saveProfile(profile: TwinProfile): Promise<TwinProfile>;
  applyToSimulation(profileId: string, runId: string): Promise<{ accepted: boolean; traceId: string }>;
}
```

## Webhook event envelope

```json
{
  "id": "evt_01HYPOTHESIS",
  "type": "simulation.run.completed",
  "occurredAt": "2026-08-20T00:00:00.000Z",
  "source": "cosmic-hammer/sandbox",
  "mode": "simulation",
  "traceId": "trace_01",
  "data": {}
}
```

Event consumers must validate the signature, enforce an allow-list of event types, and treat deliveries as at-least-once. Idempotency keys should be derived from the event ID.
