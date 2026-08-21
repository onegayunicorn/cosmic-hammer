import {
  DEFAULT_RFF,
  deriveLatticeSnapshot,
  energyDensity,
  nodeAlignmentMatrix,
  validateRff,
} from "../integrations/sovereign-lattice/src/index";

const cell = {
  cellId: "gold-coast-baseline-cell",
  lux: DEFAULT_RFF.baseLux,
  shadow: DEFAULT_RFF.baseShadow,
  phase: DEFAULT_RFF.basePhase,
  symbol: "Δ" as const,
  isOriginal: true,
  originFrequencyHz: 432,
};

const alignment = nodeAlignmentMatrix([
  [1, 0.2, 0.1, 0.1, 0.05],
  [0.2, 1, 0.2, 0.1, 0.05],
  [0.1, 0.2, 1, 0.2, 0.1],
  [0.1, 0.1, 0.2, 1, 0.2],
  [0.05, 0.05, 0.1, 0.2, 1],
]);

const snapshot = deriveLatticeSnapshot(cell, alignment, DEFAULT_RFF.basePhase);
console.log(JSON.stringify({
  simulation: "Sovereign Lattice software smoke test",
  rffValid: validateRff(DEFAULT_RFF),
  energyDensity: energyDensity(cell),
  snapshot,
  claims: {
    provenance: "DERIVED",
    physicalHardware: "UNVERIFIED",
    liveOpticalBench: "UNVERIFIED",
  },
}, null, 2));
