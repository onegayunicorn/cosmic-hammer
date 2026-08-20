# Cosmic Hammer Unified Platform

## Purpose

The platform combines three domains without pretending that a successful frontend build is a live physical integration:

| Domain                 | Responsibility                                                                  | Current repository state                                      |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Cosmic Hammer          | Observation, visualisation, bounded simulations, and provenance-aware dashboard | Implemented in the React/Vite application                     |
| Architect Orchestrator | Policy-bound planning, agent visibility, and pipeline state                     | Represented by typed system records and integration contracts |
| ONENESS Control Center | Governance, identity, deployment visibility, permissions, and audit             | Implemented as read-only control-plane surfaces               |

The event and data plane is represented by canonical TypeScript contracts for systems, telemetry, digital twins, events, capabilities, governance, and audit records. Physical hardware remains behind an adapter boundary; the browser cannot control devices directly.

## Runtime surfaces

The unified dashboard is available at `/platform`. The read-only deployment view is available at `/control-center`. The server exposes the following provider-neutral development endpoints:

```text
GET /api/v1/health
GET /api/v1/system
GET /api/v1/control-plane
GET /api/v1/capabilities
GET /api/v1/devices
GET /api/v1/digital-twins
GET /api/v1/telemetry
GET /api/v1/simulations
GET /api/v1/agents
GET /api/v1/pipelines
GET /api/v1/events
GET /api/v1/governance/status
GET /api/v1/audit/events
```

These endpoints return deterministic development/demo data and explicitly include environment and provenance. They do not expose secrets, do not invoke external providers, and do not enable external writes.

## Simulation engines

The bounded engine in `simulation-engine/src/unified-engine.ts` provides pressure-field simulation, orbit simulation, digital-twin comparison, and a unified pipeline trace. Every simulation output is labeled `SIMULATION`; the pressure model remains classified as `HYPOTHESIS`. Physical state is preserved separately from simulated state, and no engine function performs hardware, deployment, financial, or marketplace execution.

The recommended lifecycle is:

```text
HYPOTHESIS → PARAMETERISED MODEL → SIMULATION → NUMERICAL VALIDATION → EXPERIMENTAL DATA → COMPARISON
```

The implementation does not promote synthetic output to `LIVE`, `MEASURED`, or `VERIFIED`.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test
pnpm build
pnpm build:packages
pnpm simulate:platform
pnpm verify:platform
pnpm verify:deployment
pnpm audit
```

The package build emits declarations and JavaScript into `dist/packages`. The platform simulation emits JSON to stdout, including a correlation ID, stage trace, provenance, pressure output, and orbit output.

## Docker

Build and run the production image locally:

```bash
pnpm docker:build
pnpm docker:run
```

Or use Compose:

```bash
docker compose --profile app up --build
```

The optional disposable PostgreSQL profile is isolated from application runtime and uses temporary storage:

```bash
docker compose --profile integration up -d postgres-integration
```

Production credentials, database URLs, hardware credentials, and provider tokens must be injected by the deployment environment. They must not be copied into the image or committed to source control.

## Vercel

`vercel.json` configures a Vite build with `dist/public` as the static output directory, frozen-lockfile installation, SPA fallback, and basic security headers. Deploy with the Vercel project connected to this repository. The static deployment is suitable for the frontend; the Node control-plane runtime should remain deployed behind an authenticated server endpoint when remote data is enabled.

## Environments

| Environment | Data posture                                                                 | Allowed default behavior                                                |
| ----------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Development | Mock devices, synthetic telemetry, local orchestration                       | Fixture and simulation data allowed; external writes disabled           |
| Integration | Test APIs, approved test hardware, disposable database, test event transport | Authenticated contracts and end-to-end tests; no production credentials |
| Production  | Authenticated devices, production telemetry, immutable audit                 | Restricted execution only after explicit approval and deployment gates  |

The UI must always display the current environment and provenance. Missing authenticated data must be shown as unavailable or fixture data, never inferred to be live.

## Live integration release gate

The platform is not fully live until all of the following are proven through authenticated tests: Cosmic Hammer is deployed, the orchestrator and Control Center are reachable, shared contracts validate, the event bus is operational, the Digital Twin Runtime is operational, a Universal Driver is registered, an approved test device is connected, live telemetry is received, the event is visible in Cosmic Hammer, the orchestrator consumes it, a simulation receives a copy, the Control Center records an audit event, and failure/recovery behavior is tested.

Until that gate is satisfied, the correct labels are `DEMO`, `SIMULATION`, `TEST`, or `HYPOTHESIS`.
