CXX ?= g++
CXXFLAGS ?= -Wall -Wextra -O2 -std=c++17
PYTHON ?= python3
BUILD_DIR ?= build

.PHONY: all core test sim clean

all: core

core: core/main.cpp
	mkdir -p $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) core/main.cpp -o $(BUILD_DIR)/cosmic_camera_core

sim:
	$(PYTHON) sim/simulator.py --nodes 50 --seed 20260822

test: core sim
	@$(BUILD_DIR)/cosmic_camera_core >/tmp/cosmic-camera-core.out
	@grep -q 'provenance=SIMULATED nodes=50' /tmp/cosmic-camera-core.out
	@echo 'reference-kit tests: PASS'

clean:
	rm -rf $(BUILD_DIR)
