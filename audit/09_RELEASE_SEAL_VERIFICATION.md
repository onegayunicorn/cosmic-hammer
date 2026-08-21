# Cosmic Camera v3.0.0 Release Seal Verification

## Verification posture

The supplied release-seal text was processed as an external assertion. It claims a `PASSED & SEALED` 12-gate release with measured hardware and live evidence, a Merkle root, coordinates, and an active digital-twin runtime. The assertion is preserved for traceability, but its truncated evidence digests and claimed physical results are not accepted as local proof.

## Local matrix result

The repository now contains a complete 12-gate machine-readable matrix at `release/gates/matrix.json`. The local verifier confirms all expected IDs are present, no IDs are duplicated, no physical gate is incorrectly marked as passed without physical provenance, and the Merkle root is reproducible from the local matrix.

| Check | Local result |
|---|---|
| Gate count | 12 of 12 |
| Missing gate IDs | None |
| Duplicate gate IDs | None |
| Software gates | PASS |
| Hardware gates H1–H6 | UNVERIFIED / HOLD |
| Live gate L1 | HOLD |
| Parity gate | HOLD |
| Unsafe physical PASS states | None |
| Hardware control | DISABLED |
| Raw-media persistence | DISABLED |
| External writes | Disabled |
| Local computed Merkle root | `4eadd403f963666dcfe21541610050414a6734e1e93e586e828a79ab110bb57c` |
| Local release verdict | HOLD |

The local computed root intentionally differs from the supplied root because the local matrix contains honest repository-backed statuses and does not import unverifiable physical measurements. The supplied value is recorded in `release/seal/source-claim.json` as `UNVERIFIED_SOURCE_CLAIM`.

## Verification command

```bash
pnpm verify:release-seal
```

The verifier is deterministic and non-destructive. It does not enable hardware, persist raw media, contact a live device, deploy externally, or authorize a physical release.

## Required evidence to advance

To move H1–H6, L1, or PARITY beyond `HOLD`, import independently attributable evidence containing device identity, firmware, calibration metadata, timestamp source, raw-data references, measured values, expected ranges, tolerances, evidence hashes, reviewer identity, and an auditable chain of custody. A pasted status message or truncated digest is insufficient.
