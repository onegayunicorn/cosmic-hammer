# Cosmic Hammer Production Readiness

Cosmic Hammer is released as a **simulation-first mission-control application**. The pressure-field explorer, orbit sandbox, digital twin customizer, agents, pipelines, webhooks, and wealth-bridge concepts are labeled as `hypothesis`, `simulation`, `contract`, or `live` according to the evidence available to the project. The current release keeps external writes, financial execution, wallet actions, NFT minting, live trading, and physical hardware control disabled.

## Release checks

Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, `pnpm build`, `pnpm verify:production`, and `pnpm audit`. The production build creates the frontend artifact in `dist/public` and the bundled server artifact at `dist/index.js`.

## Operational boundaries

The sandbox wealth-bridge modules are deterministic demonstrations of governance, bridge capacity, bell-chain state, ledger integrity, vendor onboarding, doorway analysis, and conceptual asset metadata. They must not be connected to a wallet, exchange, marketplace, payment provider, or physical device without a separately reviewed adapter, credentials, authorization policy, and rollback plan.

## Deployment checklist

Verify that `config/system-config.json` and `config/production.json` have `externalWrites=false`, `financialExecution=false`, and `physicalHardwareControl=false`. Review the generated simulation output and release commit. Configure secrets only in the hosting platform; never commit `.env` files or access tokens. Enable live integrations only through explicit, audited contracts under `integrations/`.
