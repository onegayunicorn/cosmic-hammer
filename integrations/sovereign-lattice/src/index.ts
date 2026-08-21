export type LatticeProvenance = "SIMULATED" | "DERIVED" | "MEASURED";

export type Glyph = "Δ" | "Ω" | "Φ" | "X" | "∅" | "Σ" | "⚠" | "⇋" | "◇" | "⌁" | "⊡" | "⟲";

export interface StaticDNACell {
  cellId: string;
  lux: number;
  shadow: number;
  phase: number;
  symbol: Glyph;
  isOriginal: boolean;
  originFrequencyHz: number;
}

export interface RffFragment {
  id: string;
  baseLux: number;
  baseShadow: number;
  basePhase: number;
  symbols: Glyph[];
  grammar: Record<string, string>;
  stabilityThreshold: number;
  maxParadoxDurationSec: number;
}

export interface FrequencyBand {
  name: "VOID" | "SHADOW" | "BASE" | "FLUX" | "NEXUS";
  frequencyHz: number;
  provenance: LatticeProvenance;
}

export interface LatticeSnapshot {
  provenance: "SIMULATED" | "DERIVED";
  lux: number;
  shadow: number;
  phase: number;
  alignmentScore: number;
  phaseLocked: boolean;
  frequencyBands: FrequencyBand[];
  hardwareActuation: false;
  rawMediaPersisted: false;
  externalWrite: false;
}

const TAU = Math.PI * 2;
const PHASE_LOCK_TOLERANCE = Math.PI / 12;

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function validateCell(cell: StaticDNACell): boolean {
  return Number.isFinite(cell.lux) && cell.lux >= 0 && cell.lux <= 1
    && Number.isFinite(cell.shadow) && cell.shadow >= 0
    && Number.isFinite(cell.phase)
    && Number.isFinite(cell.originFrequencyHz) && cell.originFrequencyHz >= 0
    && cell.cellId.length > 0;
}

export function energyDensity(cell: StaticDNACell): number {
  return Math.max(0, cell.lux - cell.shadow);
}

export function mergeCells(left: StaticDNACell, right: StaticDNACell): StaticDNACell {
  const phaseDistance = Math.abs(left.phase - right.phase);
  const decoherencePenalty = phaseDistance > PHASE_LOCK_TOLERANCE ? 0.5 : 1;
  return {
    cellId: `${left.cellId}+${right.cellId}`,
    lux: clamp(((left.lux + right.lux) / 2) * decoherencePenalty),
    shadow: (left.shadow + right.shadow) / 2,
    phase: normalizePhase((left.phase + right.phase) / 2),
    symbol: left.symbol === right.symbol ? left.symbol : "∅",
    isOriginal: left.isOriginal && right.isOriginal,
    originFrequencyHz: (left.originFrequencyHz + right.originFrequencyHz) / 2,
  };
}

export function normalizePhase(phase: number): number {
  return ((phase % TAU) + TAU) % TAU;
}

export function phaseLock(left: number, right: number, tolerance = PHASE_LOCK_TOLERANCE): boolean {
  const distance = Math.abs(normalizePhase(left) - normalizePhase(right));
  return Math.min(distance, TAU - distance) <= tolerance;
}

export function validateRff(fragment: RffFragment): boolean {
  return fragment.id.length > 0 && fragment.baseLux > 0 && fragment.baseLux <= 1
    && fragment.baseShadow >= 0 && fragment.symbols.includes("Δ")
    && fragment.symbols.includes("Φ") && Object.keys(fragment.grammar).length >= 3
    && fragment.stabilityThreshold >= 0 && fragment.stabilityThreshold <= 1
    && fragment.maxParadoxDurationSec > 0;
}

export function frequencyBands(): FrequencyBand[] {
  return [
    { name: "VOID", frequencyHz: 0, provenance: "DERIVED" },
    { name: "SHADOW", frequencyHz: 19.8, provenance: "DERIVED" },
    { name: "BASE", frequencyHz: 432, provenance: "DERIVED" },
    { name: "FLUX", frequencyHz: 720, provenance: "DERIVED" },
    { name: "NEXUS", frequencyHz: 880, provenance: "DERIVED" },
  ];
}

export function nodeAlignmentMatrix(weights: number[][]): number {
  if (weights.length === 0 || weights.some((row) => row.length !== weights.length)) return 0;
  const diagonal = weights.reduce((sum, row, index) => sum + (row[index] ?? 0), 0);
  const total = weights.flat().reduce((sum, value) => sum + Math.max(0, value), 0);
  return total === 0 ? 0 : clamp(diagonal / total * weights.length);
}

export function deriveLatticeSnapshot(cell: StaticDNACell, alignment: number, referencePhase = 0): LatticeSnapshot {
  const safeAlignment = clamp(alignment);
  return {
    provenance: "DERIVED",
    lux: clamp(cell.lux),
    shadow: Math.max(0, cell.shadow),
    phase: normalizePhase(cell.phase),
    alignmentScore: safeAlignment,
    phaseLocked: phaseLock(cell.phase, referencePhase),
    frequencyBands: frequencyBands(),
    hardwareActuation: false,
    rawMediaPersisted: false,
    externalWrite: false,
  };
}

export const DEFAULT_RFF: RffFragment = {
  id: "gold-coast-baseline-rff",
  baseLux: 0.63,
  baseShadow: 0.29,
  basePhase: 0,
  symbols: ["Δ", "Ω", "Φ", "X", "∅"],
  grammar: { continuity: "Δ", flux: "Φ", null: "∅" },
  stabilityThreshold: 0.72,
  maxParadoxDurationSec: 9.6,
};
