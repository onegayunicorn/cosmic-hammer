#include <cmath>
#include <iomanip>
#include <iostream>

int main() {
  constexpr int nodes = 50;
  double aggregate = 0.0;
  for (int node = 0; node < nodes; ++node) {
    const double charge = 0.10 + (static_cast<double>((node * 37) % 91) / 100.0);
    const double photons = charge * 1'000'000.0;
    aggregate += photons;
    std::cout << "node=" << std::setw(2) << std::setfill('0') << node
              << " charge=" << std::fixed << std::setprecision(4) << charge
              << " photons=" << static_cast<long long>(std::llround(photons)) << '\n';
  }
  std::cout << "provenance=SIMULATED nodes=" << nodes
            << " aggregate_photons=" << static_cast<long long>(std::llround(aggregate)) << '\n';
  return 0;
}
