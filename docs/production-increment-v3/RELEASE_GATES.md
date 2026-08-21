# CI/CD Release Gates

Required gates: format, typecheck, unit tests, integration tests, deterministic simulation, JSON/OpenAPI validation, dependency audit, secret scan, SAST, container scan, SBOM, artifact digest, deployment-manifest validation, staging smoke test and rollback test.

Promotion: DEV -> STAGING requires software gates. STAGING -> PROD requires software gates plus operational approval. HARDWARE_PRODUCTION remains blocked until calibration, optical, thermal, detector, interface and independent validation evidence is attached.

No signing keys or API secrets are committed. Production credentials are injected by the CI/provider secret manager.
