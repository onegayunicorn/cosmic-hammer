import { describe, expect, it } from "vitest";
import {
  DEFAULT_RFF,
  deriveLatticeSnapshot,
  energyDensity,
  mergeCells,
  nodeAlignmentMatrix,
  phaseLock,
  validateCell,
  validateRff,
} from "../../integrations/sovereign-lattice/src/index";

describe("Sovereign Lattice software boundary", () => {
  const cell = {
    cellId: "cell-0",
    lux: 0.8,
    shadow: 0.1,
    phase: 0,
    symbol: "Φ" as const,
    isOriginal: true,
    originFrequencyHz: 432,
  };

  it("validates bounded cells and derives non-negative energy", () => {
    expect(validateCell(cell)).toBe(true);
    expect(energyDensity(cell)).toBeCloseTo(0.7);
    expect(validateCell({ ...cell, lux: 2 })).toBe(false);
  });

  it("penalizes out-of-phase merges and preserves provenance-safe fields", () => {
    const merged = mergeCells(cell, { ...cell, cellId: "cell-1", phase: Math.PI });
    expect(merged.lux).toBeCloseTo(0.4);
    expect(merged.symbol).toBe("Φ");
    expect(merged.isOriginal).toBe(true);
  });

  it("handles phase wraparound and validates the baseline RFF", () => {
    expect(phaseLock(0.01, Math.PI * 2 - 0.01)).toBe(true);
    expect(phaseLock(0, Math.PI / 2)).toBe(false);
    expect(validateRff(DEFAULT_RFF)).toBe(true);
  });

  it("computes a normalized diagonal alignment score", () => {
    expect(nodeAlignmentMatrix([[1, 0], [0, 1]])).toBe(1);
    expect(nodeAlignmentMatrix([[0, 1], [1, 0]])).toBe(0);
    expect(nodeAlignmentMatrix([[1, 0, 0], [0, 1]])).toBe(0);
  });

  it("emits derived telemetry with all side effects disabled", () => {
    const snapshot = deriveLatticeSnapshot(cell, 0.84);
    expect(snapshot.provenance).toBe("DERIVED");
    expect(snapshot.alignmentScore).toBeCloseTo(0.84);
    expect(snapshot.frequencyBands.map((band) => band.frequencyHz)).toEqual([0, 19.8, 432, 720, 880]);
    expect(snapshot.hardwareActuation).toBe(false);
    expect(snapshot.rawMediaPersisted).toBe(false);
    expect(snapshot.externalWrite).toBe(false);
  });
});
