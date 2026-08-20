# Browser smoke test

The public GitHub repository `onegayunicorn/cosmic-hammer` was inspected on the `main` branch. The local production server rendered the Cosmic Hammer mission-control shell at `http://localhost:3000/` with the Orbital Cartography sidebar, mission-control hero, simulated telemetry cards, pressure pulse chart, and navigation surfaces for pressure field, sandbox, predictions, digital twin, operations, evidence, agents, pipelines, webhooks, and field notes.

The local server health endpoint responded with HTTP 200 and JSON status `ok`. The UI remains explicitly labeled `LIVE / SIM`, `MODEL STATUS HYPOTHESIS`, and `Sandbox isolated / No external writes`.
