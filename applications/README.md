# Application Modules

The source document proposes four launchable applications and a wider set of future modules. The repository includes provider-neutral boundaries for weather forecasting, health monitoring, density analysis, produce growth, propulsion, materials, and satellite integration. Only the weather and digital-twin prediction surfaces are active in the current frontend release.

| Module | Status | Boundary |
| --- | --- | --- |
| Weather forecast | Implemented sandbox | `client/src/lib/prediction-engine.ts` |
| Produce growth | Contract placeholder | `applications/produce-growth/` |
| Density engine | Contract placeholder | `applications/density-engine/` |
| Health monitor | Contract placeholder | `applications/health-monitor/` |
| Propulsion system | Contract placeholder | `applications/propulsion-system/` |
| Material science | Contract placeholder | `applications/material-science/` |
| Satellite integration | Contract placeholder | `applications/satellite-integration/` |

All future applications must preserve the same model-state labels: `hypothesis`, `simulation`, `contract`, and `live`.
