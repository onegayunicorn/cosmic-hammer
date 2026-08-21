# Calibration Runbook

1. Record ambient temperature and supplies.
2. Stabilize TEC set point.
3. Acquire dark frames.
4. Estimate bias/dark-current parameters.
5. Acquire uniform-field frames.
6. Estimate flat-field response.
7. Measure optical PSF.
8. Record detector gain/read noise.
9. Validate timestamps.
10. Run PnP-ADMM reference.
11. Compare FPGA output to reference within the approved lab tolerance.
12. Seal calibration manifest with hashes and operator identity.

Acceptance limits are configured from the selected sensor/laboratory standard; this package does not invent metrology limits.
