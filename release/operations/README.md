# Release Operations

## Two-key protocol

The **Validation Engineer** produces reproducible technical evidence. The **Release Governor** independently verifies evidence, provenance, hashes, incidents, and gate completeness. Neither role may bypass the other, and neither role may convert simulated evidence into measured evidence.

## Safe execution order

1. Inspect repository state and commit identifiers.
2. Run development and integration checks.
3. Run static security and dependency checks.
4. Run staging simulations and rollback rehearsal.
5. Keep hardware control and raw-media persistence disabled until the hardware precheck is approved.
6. Import physical evidence only when it contains device identity, calibration metadata, timestamp source, raw-data reference, expected range, tolerance, reviewer, and evidence hash.
7. Run `node scripts/verify-release-seal.mjs`.
8. Authorize only when all required gates are complete and provenance rules pass.

## Failure handling

A blocking gate stops authorization. Missing or unknown evidence produces `HOLD`; tampered evidence produces `BLOCK`. Preserve logs and hashes before remediation. Re-run the failed gate after remediation and record the new commit, build, test, and evidence identifiers.

## Current safe defaults

`hardwareControl=DISABLED`, `rawMediaPersistence=DISABLED`, and `externalWrites=false`. These controls are not changed by the seal-verification script.
