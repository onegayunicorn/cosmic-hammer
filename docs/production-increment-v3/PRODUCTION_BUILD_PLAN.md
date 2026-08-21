# Cosmic Camera v3.0.0 Production Build Plan

## Decision boundary

The v3.0.0 increment is a **release candidate for software and controlled staging**. It is not a certification of physical hardware, calibration, measured photon counts, or production readiness. Every live or physical result must carry a provenance value and an auditable device/calibration record.

## Build stages

| Stage | Scope | Required gates | Exit evidence |
|---|---|---|---|
| Development | Local TypeScript packages, UI, simulation, and mocked transports | Typecheck, unit tests, deterministic harness | CI logs and fixture results |
| Integration | Architect Orchestrator and Cosmic Hammer contract alignment | Cross-repository tests, provenance checks, API schema review | Contract diff and integration report |
| Staging | Containerized service with raw-media persistence and hardware control disabled | Build, dependency scan, SAST, DAST, health/readiness, rollback rehearsal | Staging deployment record |
| Hardware verification | Controlled lab device using enrolled identity and calibration record | Thermal envelope, dropped-frame threshold, reference target, uncertainty budget, abort controls | Signed calibration and measurement packet |
| Production | Approved software release with operational controls | Independent review, secret-manager validation, observability, backup/restore, incident runbook | Change approval and provider deployment evidence |

## Environment configuration

Development and staging must keep `RAW_MEDIA_PERSISTENCE=false`, `HARDWARE_CONTROL_ENABLED=false`, and external writes disabled. Production may only change these values through an approved configuration change with secret-manager-backed credentials, audit logging, and rollback. No credentials belong in source control or client bundles.

## UI and UX acceptance

The everyday-user flow must allow a user to select a mode, enter a bounded label, understand the current provenance, submit an observation summary, and see the resulting identifier and safety state. Controls must be keyboard reachable, have visible labels and accessible names, announce created results, and show empty/error states. The interface must not imply that a simulation is a measurement or that a confidence score is calibration evidence.

## Hardware verification plan

Use an enrolled device identity with hashed serial, firmware version, and calibration version. The sensor transport must open and close deterministically, the TEC loop must reject targets outside its thermal envelope, and telemetry must record temperature, supply voltage, TEC duty, acquisition rate, and dropped frames. A reference target must be captured before any experimental run. Abort on thermal excursion, unexpected power behavior, excessive dropped frames, invalid timestamps, or provenance mismatch.

## Metrics and SLO candidates

Track capture-session success rate, p50/p95 acquisition latency, dropped-frame rate, mean and maximum temperature, TEC duty, reconstruction convergence rate, API error rate, and user-flow completion rate. Initial thresholds are proposal-level until baselined in staging: zero committed credentials, zero external writes by default, 100% provenance coverage, zero unexplained dropped frames in the baseline fixture, and all health/readiness checks passing.

## Operations and rollback

Use the supplied runbook for deployment, migration, health checks, incident response, and rollback. Deploy immutable artifacts, verify readiness and liveness, perform a smoke capture using simulation provenance, and retain audit events. Roll back to the previous known-good image when health checks fail, error rates breach threshold, provenance is missing, or hardware safety controls trip. Preserve evidence before clearing the affected environment.

## Security and compliance gates

Run secret scanning, dependency auditing, SAST, container scanning, DAST against a locally owned staging endpoint, and configuration review. Review browser storage, CSP, CORS, authentication, authorization, rate limits, webhook signatures, and log redaction. The external security audit remains separate from this repository-level validation.

## Release checklist

1. Reconcile API, device, and photonic contracts across both repositories.
2. Run the full test, typecheck, build, simulation, and validation suite.
3. Produce a signed release manifest with commit identifiers and evidence locations.
4. Deploy to staging with hardware control and raw-media persistence disabled.
5. Complete UI/UX acceptance with keyboard and screen-reader checks.
6. Complete hardware verification only with calibrated equipment and independent review.
7. Obtain production approval, configure monitoring and rollback, and record provider evidence.
