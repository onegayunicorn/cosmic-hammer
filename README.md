# Cosmic Hammer

> **Map the pressure you cannot see.**

Cosmic Hammer is a frontend-first visual laboratory for exploring the supplied **Invisible Pressure Universe** manifesto and the accompanying **Complete Digital Twin Universe System**. The project turns the source material into a navigable workspace for pressure-field models, orbital simulations, digital twin design, agent orchestration, pipelines, webhooks, and research notes.

The application deliberately distinguishes between **hypothesis, simulation, contract, and live integration**. Values shown in the current release are simulated demo states. Nothing in the interface should be read as empirical validation of the source theory or as a claim that an external service is connected.

## What is included

The current release contains a responsive mission-control shell, a public-facing hero surface, model explorer, pressure-field visualization, orbit sandbox, digital twin customizer, agents workspace, pipeline runbook, webhook event catalog, integration status cards, a read-only Sovereign SaaS ↔ ONENESS Control Center surface, and field-note documentation. The folder structure also includes explicit contracts for future Universal Driver, Digital Twin Runtime, and Sovereign Control Center adapters.

| Surface            | Purpose                                                                                     | Current state                                 |
| ------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Mission control    | Read the system posture and simulated telemetry                                             | Implemented with demo data                    |
| Pressure field     | Inspect pressure assumptions and field visualization                                        | Implemented as a hypothesis explorer          |
| Simulation sandbox | Run/resettable orbit experiments                                                            | Implemented as a client-side demo             |
| Digital twin       | Customize an avatar profile and apply a preset                                              | Implemented as a visual contract              |
| Agents             | Show solver, mapper, and operator roles                                                     | Implemented as a static orchestration surface |
| Pipelines          | Visualize ingest, normalize, solve, and render stages                                       | Implemented as a runbook surface              |
| Webhooks           | Catalog event names, sources, and modes                                                     | Contract-only in this release                 |
| Control Center     | Read-only Sovereign SaaS deployment visibility and governance summary                       | Implemented with fixture fallback             |
| Unified Platform   | Systems registry, provenance, telemetry, twin, pipeline, governance, and simulation cockpit | Implemented with development snapshot         |
| Documentation      | Explain provenance, limitations, and integration intent                                     | Implemented                                   |

## Source framing

The supplied PDFs propose a speculative pressure-based cosmology and a digital twin system with pressure, quantum, simulation, hardware, agent, engine, UI, webhook, and pipeline modules. Cosmic Hammer presents these concepts as a **research and design workspace**, not as established scientific fact. The app is therefore built for visualization, assumption tracking, and future experimentation.

## Repository map

```text
client/
  src/
    components/       Reusable UI and Cosmic Hammer visual primitives
    contexts/         Theme and application contexts
    hooks/            Reusable interaction hooks
    lib/              Typed demo data and utility logic
    pages/            Mission-control routes and module pages
  public/             Small configuration assets only
config/               Pressure, quantum, and system configuration placeholders
docs/
  contracts/          Provider-neutral adapter and event contracts
  modules/            Module-level architecture notes
  operations/         Runbooks and sandbox safety notes
integrations/
  universal-driver/   Driver adapter boundary and mapping notes
  digital-twin/       Character/twin profile contract
  sovereign-control/  Read-only deployment status and governance contracts
  platform/           Unified platform dashboard and control-plane view
simulation-engine/    Simulation concepts and numerical boundary notes
agents/               Agent roles and orchestration notes
pipelines/            Pipeline definitions and stage contracts
webhooks/             Event names and delivery policy notes
sandbox/              Isolation and export rules
ideas.md              Chosen Orbital Cartography design system
```

## Local development

The project uses the managed React + Tailwind static scaffold. Install dependencies and start the development server with:

```bash
pnpm install
pnpm dev
```

Type-check and build with:

```bash
pnpm check
pnpm build
pnpm build:packages
pnpm simulate:platform
pnpm verify:platform
```

## Integration strategy

The complete Sovereign SaaS ↔ ONENESS Control Center integration contract, governance lifecycle, authentication guidance, secret-handling rules, disposable PostgreSQL test boundary, validation matrix, troubleshooting guide, production prerequisites, and handoff ownership are documented in [`INTEGRATION_README.md`](./INTEGRATION_README.md). The unified platform architecture, package build commands, simulation engine, Docker template, Compose profiles, Vercel configuration, environment strategy, and live-integration release gate are documented in [`docs/architecture/unified-platform.md`](./docs/architecture/unified-platform.md).

The web release uses provider-neutral contracts rather than direct runtime dependencies. A future full-stack upgrade can attach a real Universal Driver, Digital Twin Runtime, webhook receiver, simulation worker, or analytics adapter behind these boundaries without changing the visual language.

The integration notes reference the research workflow requested for the project. GitHub discovery was used to look for relevant Universal Driver and digital-twin repositories; the search did not identify a uniquely attributable repository named exactly `universal_driver` or a maintained repository matching the phrase “digital twin character customizer.” The project therefore avoids falsely claiming a specific upstream implementation.

SimilarWeb analytics is represented as a future research hook. It should only be activated for a real public domain and only through a configured analytics connector; no traffic values are fabricated in this repository.

## Design system

The selected direction is **Orbital Cartography**: a dark observatory palette, solar-apricot signal accents, mineral-cyan stability cues, asymmetrical instrument layouts, Space Grotesk display typography, IBM Plex Sans body text, and IBM Plex Mono data labels. The full design rationale lives in [`ideas.md`](./ideas.md).

## Safety and limitations

This is a static frontend release. It does not receive webhooks, run external agents, access user MCP tools, execute arbitrary repository code, connect to hardware, or store user data. Any control that implies a future runtime must be wired to a reviewed backend contract before production use. The source theory is speculative and must be independently assessed against established physics and empirical evidence.

## License

This repository is scaffolded for private development and public review. Add the project-specific license you want before distributing derivative work.

## Cosmic Camera audit and onboarding

- [Consumer onboarding guide](docs/onboarding/cosmic-camera-consumer-guide.md)
- [Defensive security audit](audit/05_SECURITY_AUDIT.md)
- Run the cross-repository static audit from Architect Orchestrator with `node scripts/security/audit-repositories.mjs`.

- [Cosmic Camera v3 production build plan](docs/production-increment-v3/PRODUCTION_BUILD_PLAN.md)

- [Cosmic Camera v3 validation evidence](audit/07_V3_VALIDATION.md)

- [Dual-agent release operations](docs/dual-agent-release-operations/README.md)
