#!/usr/bin/env python3
"""Cosmic Camera reference simulator; it never talks to hardware."""
from __future__ import annotations

import argparse
import random
from dataclasses import dataclass


@dataclass(frozen=True)
class NodeReading:
    node_id: int
    charge: float
    photons: int


def simulate_charge_to_photon(node_id: int, rng: random.Random) -> NodeReading:
    charge = round(rng.uniform(0.1, 1.0), 4)
    return NodeReading(node_id=node_id, charge=charge, photons=round(charge * 1_000_000))


def run_simulation(nodes: int = 50, seed: int = 20260822) -> list[NodeReading]:
    if not 1 <= nodes <= 50:
        raise ValueError("nodes must be between 1 and 50")
    rng = random.Random(seed)
    readings = [simulate_charge_to_photon(node_id, rng) for node_id in range(nodes)]
    print("--- Cosmic Camera v3.0.0 reference simulator ---")
    print("target=mobile-photonic-module provenance=SIMULATED")
    print(f"nodes={nodes} seed={seed}")
    for reading in readings:
        print(f"node={reading.node_id:02d} charge={reading.charge:.4f} photons={reading.photons}")
    print(f"aggregate_photons={sum(reading.photons for reading in readings)}")
    return readings


def main() -> None:
    parser = argparse.ArgumentParser(description="Deterministic Cosmic Camera simulator")
    parser.add_argument("--nodes", type=int, default=50)
    parser.add_argument("--seed", type=int, default=20260822)
    args = parser.parse_args()
    run_simulation(args.nodes, args.seed)


if __name__ == "__main__":
    main()
