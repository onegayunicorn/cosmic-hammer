# Dual-Agent Release Operations v3.0.0

This directory implements the user-supplied release-operations specifications as a software governance layer for Cosmic Camera and the two-repository release process.

## Agent separation

The **Release Governor** verifies evidence, enforces provenance, maintains gate state, and decides `PASS`, `HOLD`, or `BLOCK`. The **Validation Engineer** produces technical evidence through tests, builds, simulations, and approved hardware procedures. The engineer cannot authorize a release, and the governor cannot convert simulated output into measured evidence.

## Implemented assets

| Requirement | Implementation | State |
|---|---|---|
| Shared gate state | `packages/release-operations/src/index.ts` | Implemented |
| Evidence hash | `computeEvidenceHash` and `makeEvidence` | Implemented |
| Provenance enforcement | Hardware/live gates reject `SIMULATED`, `REFERENCE`, and `UNKNOWN` evidence | Implemented |
| Two-key decision | `softwareDecision()` versus `authorizeRelease()` | Implemented |
| Validation runner | `scripts/release-operations-v3.ts` | Implemented and simulated |
| Cross-repository parity | Mirrored implementation under Cosmic Hammer integrations | Implemented |
| Hardware and live validation | Requires approved measured evidence | Unverified / gated |

The pasted wealth-bridge, blockchain, marketplace, NFT, and trading examples are retained as **conceptual source material only**. They are not activated as financial products, trading bots, wallets, marketplaces, production blockchain services, or wealth-generation promises. Any future implementation must receive a separate product, legal, security, and financial-risk review.

## Operational rule

> Software release may be `PASS` while physical validation remains `HOLD`; the overall release cannot advance to production hardware or live validation until the relevant measured evidence exists.

## Validation command

```bash
pnpm simulate:release-operations-v3
```

The expected deterministic result is software `PASS`, overall `HOLD`, simulated hardware evidence rejected, hardware control disabled, raw-media persistence disabled, and external writes disabled.
