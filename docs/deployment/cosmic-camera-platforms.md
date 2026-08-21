# Cosmic Camera platform operations

## Supported software paths

| Surface | Entry point | Scope |
|---|---|---|
| Browser dashboard | `pnpm dev` | React/Vite live simulated telemetry board |
| Linux/terminal | `deploy/linux/build-cosmic-camera.sh` | Reproducible checks, build, simulation, and package |
| Windows | `deploy/windows/build-cosmic-camera.ps1` | PowerShell equivalent of the Linux workflow |
| Termux | `deploy/termux/bootstrap-cosmic-camera.sh` | User-space Node/pnpm validation on Android terminal |
| CLI | `pnpm cosmic-camera -- status` | Status, simulation, verification, and packaging commands |
| Webhook | `/api/webhooks/cosmic-camera` | Signed inbound event envelope; no outbound writes |
| Vercel | `vercel.json` | Vite build and static hosting configuration |

Every path is software-only by default. `SIMULATED`, `USER_INPUT`, and `MEASURED` provenance are preserved; a deployment, dashboard heartbeat, or signed webhook does not convert a synthetic event into measured hardware evidence. The webhook requires `COSMIC_CAMERA_WEBHOOK_SECRET` and rejects requests when the secret is absent or invalid.

## Operator commands

```bash
pnpm cosmic-camera -- status
pnpm cosmic-camera -- simulate
pnpm cosmic-camera -- verify
pnpm cosmic-camera -- package
```

The CI pipeline repeats the type check, tests, production build, simulation, release verification, evidence-package verification, package generation, and high-severity dependency audit. Hardware actuation, raw media persistence, financial execution, wallet custody, and external writes remain disabled.
