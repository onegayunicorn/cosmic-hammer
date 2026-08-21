# API Guide

Base path `/api/v1`.

`GET /health`; `GET /ready`; `POST /capture/sessions`; `POST /capture/sessions/{id}/start`; `POST /capture/sessions/{id}/stop`; `GET /capture/sessions/{id}`; `POST /fields/map`; `POST /reconstruction/pnp-admm`; `GET /devices`; `POST /devices/{id}/telemetry`; `GET /experiments/{id}/evidence`.

Mutating requests require `Idempotency-Key`. Responses include schema version, provenance and correlation ID. Hardware-control endpoints require device capability authorization in addition to user/service authentication.
