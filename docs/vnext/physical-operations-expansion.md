# Physical Operations Expansion

Cosmic Hammer now exposes an authenticated station-management control plane and a shared physical-data monitoring lifecycle.

## Station management

Protected tRPC procedures under `stations.*` support registry listing, station creation, patch updates, calibration record creation and retrieval, and schedule creation. Ownership is enforced through the authenticated user ID. Forensic traces are stored under `forensic.*` and can be queried by station owner, preserving the trace event chain from observation through dashboard rendering.

## Shared scene clients

The canonical scene graph remains the source of truth. `packages/scene-graph/src/renderers.ts` provides three clients: WebGPU capability detection with a canvas fallback note, a reduced-layer touch-oriented mobile profile, and a world-space VR profile. These adapters return a normalized render frame rather than inventing platform-specific data.

## Scheduled monitoring

Scheduled work is implemented as platform-managed Heartbeat callbacks under `/api/scheduled/`. The supported callback paths are:

| Callback | Purpose | Durable output |
|---|---|---|
| `/api/scheduled/providerSnapshot` | Fetch an Open-Meteo forecast for the station | `providerSnapshots` raw snapshot |
| `/api/scheduled/calibrationExpiry` | Find calibration records expiring within 30 days | `scheduledAlerts` plus owner notification |
| `/api/scheduled/driftCheck` | Run the station verification gate | JSON status and future drift alert insertion point |

Each station has independent task UID columns for the three monitoring jobs. Schedule creation uses the decoded session token and persists the returned task UID by monitoring kind. The callback authenticates the cron identity, resolves the station by task UID rather than request-body fields, returns an idempotent orphan response when the task no longer maps to a station, and JSON-encodes failures for platform investigation.

> **Deployment requirement:** the callback code must be deployed before production schedules are created. The development preview is not reachable by the scheduling platform.

## Alert routing

Calibration-expiry alerts are persisted and routed to the project owner through the built-in notification helper. The pure monitoring evaluator also emits deterministic stale-snapshot and drift alert decisions for tests and future production persistence.
