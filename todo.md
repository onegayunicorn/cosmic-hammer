# Cosmic Hammer Extension Checklist

- [x] Extract and summarize the new source PDF.
- [x] Audit the existing repository for missing folders, modules, and integration contracts.
- [x] Define the prediction engine boundary and explicit uncertainty/model-state labels.
- [x] Implement weather prediction outputs using a deterministic sandbox model.
- [x] Implement digital-twin position prediction outputs using a deterministic trajectory model.
- [x] Add prediction pages, cards, controls, and simulation status to the frontend.
- [x] Add missing configuration, API contract, pipeline, webhook, agent, sandbox, and integration files.
- [x] Run unit checks, type checks, production build, and simulation commands.
- [x] Push the validated changes to the public GitHub repository.
- [x] Save a managed checkpoint and report results and limitations.

## Physical Integration Extension

- [x] Choose and document the approved meteorological provider and data provenance.
- [x] Add provider client and forecast-versus-observation comparison workflow.
- [x] Upgrade the project for authenticated telemetry ingestion if backend procedures are required.
- [x] Add evidence classification, signed telemetry, device identity, and validation boundaries.
- [x] Add coordinate-system metadata and physical twin state contracts.
- [x] Add automated regression tests for prediction formulas, uncertainty bounds, and exported traces.
- [x] Run integration checks, frontend checks, simulation tests, and production build.
- [x] Push all changes and save a managed checkpoint.

## Verification and Twin Contract Completion

- [x] Add persisted observation-series inputs and a forecast-verification tRPC procedure.
- [x] Render MAE, RMSE, bias, paired-source labels, and observation status in the UI.Predictions workspace.
- [x] Add an explicit frame-aware PhysicalTwinState contract with velocity, environment, uncertainty, and provenance.
- [x] Re-run regression tests, type checks, production build, and browser verification after completing the gaps.

## Final Verification Wiring

- [x] Wire the Predictions workspace to the persisted observation-series comparison procedure with loading, error, and empty states.
- [x] Push the latest full-stack changes to the public GitHub repository.
- [x] Save a new managed checkpoint after the latest validation.
