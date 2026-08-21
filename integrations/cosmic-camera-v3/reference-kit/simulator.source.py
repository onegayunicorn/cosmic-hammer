import argparse
import time
import random

def simulate_charge_to_photon(node_id):
    """Simulates physical charge-to-photon transfer for a specific node."""
    charge = random.uniform(0.1, 1.0)
    photons = charge * 1e6  # Quantum efficiency model
    print(f"Node {node_id:02}: Charge {charge:.4f}C -> Photons {int(photons)}")
    return photons

def run_simulation(nodes, dry_run=False):
    print(f"--- Cosmic Camera v3.0.0 Simulator ---")
    print(f"Target: Samsung Galaxy A17 Ω")
    print(f"Nodes: {nodes} camera positions\n")
    
    start_time = time.time()
    
    for i in range(nodes):
        if not dry_run:
            time.sleep(0.05)
        simulate_charge_to_photon(i)
        
    duration = time.time() - start_time
    print(f"\nSimulation complete in {duration:.2f} seconds.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cosmic Camera 50-node Simulator")
    parser.add_argument("--nodes", type=int, default=50, help="Number of camera positions")
    parser.add_argument("--dry-run", action="store_true", help="Execute without delays")
    args = parser.parse_args()
    
    run_simulation(args.nodes, args.dry_run)
