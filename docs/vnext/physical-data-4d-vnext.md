# Cosmic Hammer — Physical Data & 4D Digital Twin vNext

This release turns Cosmic Hammer into a **physical-data control-plane scaffold**. It distinguishes simulated output, provider-derived observations, cryptographically authenticated device observations, verified comparisons, and sealed release artifacts. No code in this release controls hardware actuators, places trades, moves funds, mints assets, or makes scientific claims from the supplied speculative material.

## Trust gates

| Gate | Implemented boundary | Simulation behavior |
|---|---|---|
| Identity | Ed25519 device identity, station identity, sensor inventory, calibration version, key ID, key version | Demo key pair generated in memory |
| Integrity | Canonical payload signing, timestamp window, nonce replay protection, signature verification, key revocation and rotation | Signed demo telemetry is accepted; replay is rejected |
| Calibration | Versioned sensor metadata and calibration expiry fields | Pipeline raises calibration-expiry alerts |
| Verification | Forecast/observation alignment, MAE, RMSE, mean bias error, missing-data count, drift detection, health score | Deterministic paired series returns reproducible metrics |
| Visualization | Canonical 4D scene graph with overlay visibility, opacity, provenance, CRS, temporal state, and renderer adapters | The same scene renders to web, Android, desktop, VR, mobile, and wall adapters |
| Seal | Manifest hashing, artifact hashes, test results, schema/version metadata, cryptographic seal verification | Demo release manifest verifies successfully |

## Canonical data path

```text
PhysicalTwinState
  -> coordinate transform
  -> temporal state
  -> field/vector/point overlay layers
  -> 4D scene graph
  -> platform renderer adapter
  -> dashboard, mobile, desktop, VR, wall, or gateway surface
```

The current implementation keeps the scene representation platform-neutral. It deliberately avoids separate platform-specific truth models so that later clients consume the same signed and provenance-aware state.

## Verification pipeline

The deterministic verification pipeline accepts forecast points, quality-filtered observations, forecast age, observation latency, calibration age, and provider identity. It returns paired count, missing observations, MAE, RMSE, mean bias error, drift state, alert codes, health score, and a verification provenance state. Raw inputs should remain alongside derived output in production so metrics remain reproducible.

## Sandbox wealth-bridge concepts

The supplied wealth-bridge content is represented only as a **sandbox concept module**. Hyperfusion, star-seed, bridge, bell-chain, ledger, council, Tele Os, and Quantum Bio AI operations are deterministic demonstrations. Financial execution, wallet operations, exchange connectivity, NFT minting, APY claims, and wealth promises are disabled.

## Running the vNext simulation

```bash
pnpm exec tsx scripts/run-vnext-simulation.ts
pnpm test
pnpm check
pnpm build
```

The simulation prints JSON suitable for inspection or later ingestion into a run artifact. It reports Ed25519 trust state, verification metrics, platform render coverage, release-seal validity, and sandbox concept operations.
