# Cosmic Camera v3.0.0 Release Phases

| Phase | Purpose | Exit condition | Current state |
|---|---|---|---|
| Development | Typecheck, lint, unit tests, deterministic harness, build | All software checks pass | PASS |
| Integration | Cross-repository contracts, schemas, provenance propagation | Interfaces and provenance checks pass | PASS |
| Security | SAST, secret scanning, dependency review, unsafe DOM review | No blocking findings | PASS |
| Staging | Container/configuration/readiness/rollback rehearsal | Reproducible staging evidence | PASS (simulation) |
| Hardware precheck | Device identity, calibration, safety interlocks | Approved device and measured setup | HOLD |
| H1–H6 | Sensor, thermal, optical, acquisition, FPGA/HIL, parity | Independently attributable measured evidence | HOLD |
| Live validation | Optical bench, telemetry, orchestrator, dashboard | Measured live evidence and audit trail | HOLD |
| Release authorization | Governor verifies all required gates | Two-key approval with complete evidence | HOLD |

A software `PASS` does not authorize hardware or live operation. The phase state is intentionally conservative until measured evidence is imported with device identity, calibration metadata, test configuration, tolerance, evidence hash, and independent review.
