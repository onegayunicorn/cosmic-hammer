# Implementation Backlog

## P0 Release-critical
- Integrate photonic core into existing Cosmic Camera.
- Use seeded deterministic fixtures for CI.
- Validate PnP-ADMM reference model against controlled fixtures.
- Enforce provenance on every field/reconstruction.
- Validate API schemas and idempotency keys.
- Add capture lifecycle, health and telemetry.
- Keep hardware control and raw-media persistence OFF by default.
- Generate SBOM, hashes and release manifest.

## P1 Hardware
- Verify exact sensor datasheet/interface and supplier.
- Validate TEC electrical/thermal envelope.
- Implement selected transport driver.
- Characterize dark current/read noise versus temperature.
- Measure optical PSF and populate reconstruction matrix.
- Compare FPGA fixed-point output with reference model.
- Benchmark target resolution/iteration latency.
- Produce revision-controlled CAD/manufacturing drawings.
- Execute controlled lab acceptance tests.

## P2 Product
- Consumer onboarding/tutorial.
- Research dashboard and evidence registry.
- Device enrollment/attestation/certificate rotation.
- Offline capture queue and exports.
- Fleet management for approved hardware.
- Staged global rollout.

## P3 Research
- Alternative detector comparison.
- Detector efficiency/photon-statistics characterization.
- Classical vs learned denoisers.
- FPGA vs GPU benchmark.
- Independent validation.
