# Module Map

The source system describes a broader native engine architecture. This repository maps that architecture into frontend-visible module boundaries so implementation can grow without collapsing the distinction between simulation and production runtime.

| Source concept | Frontend surface | Future runtime boundary |
| --- | --- | --- |
| Pressure Engine | Pressure field explorer and metric cards | Numerical solver service |
| Quantum Engine | Agent role and future state mapper | Quantum/state adapter |
| Simulation Engine | Sandbox orbit stage and run output | Worker or dedicated simulation service |
| Hardware | Integration cards and driver contracts | Sensor gateway |
| Agents | Agents page and graph surface | Orchestrator with tool policy |
| Matrix/Webhook/Pipeline/Trigger/Task engines | Pipelines and webhook pages | Event-driven backend |
| Dashboard/Pages/Components | React pages and shared UI | Frontend design system |
| CLI | Documentation placeholder | Authenticated operator CLI |

## Model states

The UI uses four semantic states: `hypothesis` for source claims, `simulation` for generated demo output, `contract` for an interface that is defined but not connected, and `live` for data confirmed by a production adapter. The current repository only uses the first three.

## Numerical notes

The supplied materials use a solar pressure function of the form `P(r) = P₀(r₀/r)^α` and discuss a pressure-gradient force approximation. The frontend intentionally avoids presenting those expressions as validated outputs. A future numerical worker should define units, numerical stability, integration tolerances, initial conditions, and comparison baselines before rendering results.

## Acceptance criteria for a runtime upgrade

A runtime upgrade should expose reproducible run IDs, immutable input configuration, deterministic seeds where possible, explicit unit metadata, traceable solver versions, and an export format that can be independently inspected. Model comparison should include the baseline model and uncertainty bounds rather than a single visually persuasive trace.
