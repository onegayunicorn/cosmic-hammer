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

## Physical Data & 4D Digital Twin vNext

- [x] Map the supplied vNext requirements to the current repository.
- [x] Scaffold apps, packages, services, hardware, infrastructure, experiments, and simulation folders.
- [x] Add Ed25519 device identity, key rotation, replay protection, and provenance state-machine contracts.
- [x] Add station management, observation quality, calibration, and forensic-view contracts.
- [x] Add automated verification pipeline stages, health scoring, drift detection, and alert evaluation.
- [x] Add canonical 4D scene graph, overlay layers, coordinate transforms, temporal playback, and renderer adapters.
- [x] Add platform-seal manifest and deterministic seal verification.
- [x] Add wealth-bridge concept modules as clearly labeled sandbox-only simulations without financial execution.
- [x] Run simulations for all supported operations, processes, and functions.
- [x] Run regression tests, type checks, production build, and visual verification.
- [x] Push the completed changes and save a managed checkpoint.

## vNext Coverage Completion

- [x] Add an explicit forensic trace contract linking observation, device, signature, calibration, ingestion, persistence, verification, and dashboard rendering.
- [x] Expand simulations for station ingestion, duplicate and missing-data detection, key rotation and revocation, drift alerts, and forensic trace generation.
- [x] Push the vNext changes to the public repository and save a new managed checkpoint after coverage validation.

## Physical Operations Expansion

- [x] Audit current vNext schema, routers, renderer contracts, and heartbeat SDK boundaries.
- [x] Add authenticated station CRUD, sensor inventory, calibration records, and station health persistence.
- [x] Add persisted forensic trace history and protected trace query procedures.
- [x] Add shared WebGPU capability/renderer adapter and mobile/VR scene clients using the canonical scene graph.
- [x] Add station-management and physical-data health UI surfaces.
- [x] Add scheduled provider snapshot, calibration-expiry, drift-check, and operator-alert handlers under /api/scheduled/.
- [x] Add schedule ownership/task UID persistence and document deploy-before-schedule requirements.
- [x] Simulate CRUD, forensic, renderer, schedule, calibration, and alert flows.
- [x] Run tests, type checks, production build, and visual verification.
- [x] Push changes and save a managed checkpoint.

## Physical Operations Completion Gaps

- [x] Add protected station delete and persisted sensor-inventory tables, queries, and mutations.
- [x] Add a dedicated operator-alert scheduled callback and persist/route drift alerts.
- [x] Expand the physical-operations simulation to cover delete, scheduled callback resolution, and owner alert routing.
- [x] Push the physical-operations expansion and save a new managed checkpoint after final validation.

## Operations PDF Expansion

- [x] Extract and classify the operations PDF into evidence-backed, conceptual, sandbox-only, and investor-facing requirements.
- [x] Add a reproducible wealth-bridge simulation for hyperfusion, bridge capacity, bell-chain sequencing, and an integrity-checked ledger.
- [x] Add governance, vendor onboarding, doorway-state analysis, and conceptual NFT metadata modules without financial execution or fabricated value claims.
- [x] Add an operations/investor-readiness page that separates measured telemetry, simulations, hypotheses, and roadmap claims.
- [x] Add regression tests and an end-to-end operations simulation output.
- [x] Run type checks, production build, and visual verification.
- [x] Push the operations expansion and save a new managed checkpoint.

## Evidence and Investor Data-Room Expansion

- [x] Audit persisted station, telemetry, observation, provider-snapshot, forecast, and forensic data sources for evidence aggregates.
- [x] Add formal citation records and source provenance references.
- [x] Add persisted roadmap claims with actual, target, assumption, hypothesis, and unverified states.
- [x] Add authenticated claim submission, review, approval, rejection, and audit-history procedures.
- [x] Add evidence dashboard metrics for station counts, verified observations, provider coverage, forecast accuracy, calibration, and drift.
- [x] Add investor data-room export that separates actuals, targets, assumptions, simulations, and unverified claims.
- [x] Add regression tests, simulation output, type checks, production build, and visual verification.
- [ ] Push the evidence-system expansion and save a new managed checkpoint.

## Evidence Completion Gaps

- [x] Add protected claim-review history queries and render audit history in the evidence workflow.
- [x] Add explicit forecast-accuracy and drift metrics to evidence aggregates and dashboard cards.
- [x] Add a deterministic evidence/data-room simulation script with machine-readable output.
- [x] Re-run tests, type checks, production build, and visual verification after closing the gaps.
- [ ] Push the completed evidence system and save a new managed checkpoint.
