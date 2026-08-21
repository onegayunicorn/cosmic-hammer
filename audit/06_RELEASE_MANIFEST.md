# Cosmic Camera Release Manifest

## Release decision

**Software simulation and local staging:** PASS  
**Physical hardware, calibration, production deployment, and independent validation:** HOLD / UNVERIFIED

## Included scope

The release includes the Cosmic Camera Photon Count software module, Lux Codex integration surfaces, digital-twin simulation flows, consumer onboarding documentation, defensive security scanner, security evidence, and cross-repository validation logs.

## Validation evidence

- Cross-repository static audit: `audit/evidence/security/cross-repository-static-audit.json` — `high: 0`, `medium: 0`, `low: 0` after remediation.
- Repository hygiene: `git diff --check` passed in both repositories.
- Literal credential scan: passed in both repositories.
- Architect Orchestrator: typecheck, tests, build, Lux Codex test, and Lux Codex verification passed.
- Cosmic Hammer: typecheck, tests, build, operations simulation, vNext simulation, platform simulation, platform verification, and production verification passed.

## Security remediation

The chart component no longer uses `dangerouslySetInnerHTML`; stylesheet content is supplied as React text. The Lux Codex webhook secret is environment-backed and returns a configuration error when absent. No committed credential patterns were found.

## Operational boundaries

All simulation results must display `SIMULATION` or equivalent provenance. No external writes, financial execution, physical sensor claims, or production deployment claims are enabled by this manifest. Provider-side staging and production evidence must be attached separately before changing the release state.

## Required handoff evidence

A future physical or production release requires a calibrated device record, raw measurement provenance, uncertainty analysis, independent validation, secret-manager configuration, provider deployment record, monitoring/rollback plan, and signed change approval.
