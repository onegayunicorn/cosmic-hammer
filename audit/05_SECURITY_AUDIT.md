# Defensive Security Audit — Architect Orchestrator and Cosmic Hammer

## Scope and authorization

This audit is limited to the two checked-out repositories and their local test surfaces. It is non-destructive: it does not probe third-party systems, bypass authentication, exploit services, or attempt persistence. Dynamic checks are limited to locally started application endpoints owned by the project.

## Checks

| Control | Method | Evidence |
|---|---|---|
| Dependency risk | `pnpm audit --audit-level high` in each repository | Package-manager output captured at release time |
| Lockfile integrity | `pnpm install --frozen-lockfile` where supported | Install result and lockfile diff |
| Secret exposure | `scripts/security/audit-repositories.mjs` plus repository hygiene scan | `audit/evidence/security/cross-repository-static-audit.json` |
| Browser injection | Scan for unsafe HTML, dynamic code, credential storage, and untrusted URL flows | Static findings reviewed manually |
| Configuration | Review `.env*`, deployment manifests, Docker files, and runtime flags | Configuration findings in release report |
| API posture | Local health and read-only control-plane smoke tests | HTTP status and response-shape evidence |
| Provenance | Confirm simulation, user-input, and physical states are not conflated | Contract and UI tests |
| Reproducibility | Repeat deterministic simulations and compare output shape | Simulation evidence |

## Security invariants

No API key, bearer token, private key, password, database credential, signing key, or webhook secret may be committed. Browser storage must not contain credentials. Raw media must not be persisted by the safe Cosmic Camera workflow. The control plane must remain read-only unless a separately governed, authenticated, reviewed mutation path is introduced.

## Penetration-test boundary

The repository suite provides safe application-level negative checks: malformed input handling, unauthorized read-only requests, invalid response classification, secret-pattern detection, route exposure review, and local health/API smoke tests. It is not a substitute for an external penetration test, cloud configuration review, dependency provenance review, or hardware security assessment.

## Findings policy

A high-severity finding blocks release. Medium findings require an owner and remediation plan. Low findings may ship only when documented and accepted. A clean static scan is evidence that the checked patterns were not found; it is not proof that no vulnerability exists.

## Current posture

The repositories are simulation-first. Hardware connection, physical measurement, calibration, production traffic, and independent validation remain `UNVERIFIED` until evidence is attached. The release gate is therefore software-release eligible only when builds, tests, dependency checks, secret scans, provenance checks, and documentation checks pass; it is not a physical-hardware or production-readiness certification.
