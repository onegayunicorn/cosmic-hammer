# Cosmic Camera v3.0.0 Reference Kit

This directory contains a deterministic software reference implementation derived from the supplied Cosmic Camera materials. It is a **simulation and integration fixture**, not a kernel driver, calibrated optical instrument, or proof of physical photon measurements.

## Contents

- `core/main.cpp` builds a 50-node deterministic charge-to-photon demonstration.
- `sim/simulator.py` emits seedable node readings with explicit `SIMULATED` provenance.
- `Makefile` provides `core`, `sim`, `test`, and `clean` targets.
- `Makefile.source`, `simulator.source.py`, `architecture.source.md`, and `README.source.md` preserve supplied source materials for traceability.

## Commands

```bash
make
make test
python3 sim/simulator.py --nodes 50 --seed 20260822
```

The reference kit performs no device I/O, does not access a camera, does not control an AMOLED panel, does not persist raw media, and does not send external writes. Any future hardware adapter must be separately reviewed, authenticated, calibrated, and admitted through the repository release gates.

## Source boundary

The supplied architecture and README describe a proposed Galaxy A17 Omega integration. Those statements are preserved as source material. This kit does not claim that the named device, 50-camera array, quantum processing core, direct AMOLED path, or physical charge-to-photon transfer has been implemented or measured.
