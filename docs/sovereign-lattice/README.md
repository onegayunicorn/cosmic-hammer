# Sovereign Lattice integration

This directory documents the software-only integration of the supplied Sovereign Lattice specification into Cosmic Camera v3.

## Integrated module

`integrations/sovereign-lattice/src/index.ts` provides deterministic TypeScript primitives for Static DNA cells, Reality-Founding Fragments, frequency-band metadata, phase locking, Node Alignment Matrix scoring, and derived lattice snapshots. The implementation avoids native device access, camera I/O, optical control, audio emission, wallet operations, trading, NFT minting, and external writes.

The module is intentionally framed as a computational metaphor and telemetry derivation layer. Terms such as `lux`, `shadow`, `phase`, `coherence`, `frequency`, and `alignment` are software fields or derived values unless an independently attributable measured evidence package is supplied.

## Commands

```bash
pnpm test:unit -- sovereign-lattice
pnpm simulate:sovereign-lattice
```

The smoke simulation emits `DERIVED` provenance and explicitly reports physical hardware and live optical status as `UNVERIFIED`.

## Source traceability

The complete supplied PDF is preserved at `audit/source-materials/sovereign-lattice/sovereign-lattice-specification.pdf`. The supplied reference image is preserved at `integrations/cosmic-camera-v3/reference-assets/sovereign-lattice-reference.png` for design traceability only. Neither source is treated as proof of physical calibration, sensor identity, FPGA timing, optical alignment, or measured photon counts.

## Release gate

Software tests and builds may pass independently of physical qualification. Any future measured gate must include raw telemetry, calibration metadata, device identity, signed provenance, reproducible hashes, and independent review before release authorization can change from `HOLD`.
