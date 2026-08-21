# Operations Runbook

Health: `/health`. Readiness: `/ready`. Metrics: capture rate, dropped frames, reconstruction latency, queue depth, sensor temperature, TEC duty, API errors.

P0 security/data integrity; P1 outage; P2 degraded capture/reconstruction; P3 non-critical UI/telemetry.

Rollback: stop promotion -> preserve evidence -> route to previous immutable image digest -> verify readiness -> run deterministic simulation smoke test -> record incident/release correlation IDs.
