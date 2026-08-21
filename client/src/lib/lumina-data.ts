export const luminaTranslationCells = [
  { symbol: "⬡", meaning: "focus and legibility", frequency: "720 Hz", token: "CLARITY", safety: "SAFE" },
  { symbol: "∞", meaning: "mutual care", frequency: "432 Hz", token: "COMPASSION", safety: "SAFE" },
  { symbol: "✦", meaning: "creative lift", frequency: "528 Hz", token: "JOY", safety: "SAFE" },
  { symbol: "◇", meaning: "boundary and containment", frequency: "594 Hz", token: "PROTECTION", safety: "SAFE" },
  { symbol: "⭕", meaning: "restoration and pause", frequency: "639 Hz", token: "HEALING", safety: "REVIEW" },
  { symbol: "⚖", meaning: "balanced judgment", frequency: "396 Hz", token: "WISDOM", safety: "REVIEW" },
  { symbol: "⚠", meaning: "unresolved risk", frequency: "0 Hz", token: "SHADOW_REVIEW", safety: "REVIEW" },
] as const;

export const luminaEpisodes = Array.from({ length: 104 }, (_, index) => ({
  season: Math.floor(index / 52) + 1,
  episode: (index % 52) + 1,
  title: ["The Obsidian Shard", "The Silver Lattice", "The Compass of Phase", "The Bridge of Consent"][index % 4],
  runtime: 30,
  status: "PLANNED",
  provenance: "NARRATIVE_SIMULATION",
}));

export const luminaCompass = {
  bearing: 217,
  phase: "1.047 rad",
  anchor: "GOLD_COAST_BASELINE",
  provenance: "DERIVED",
};

export const luminaShard = {
  id: "J09-S-SIM-001",
  transport: "BLUETOOTH_SIMULATED",
  glyph: "◇",
  rffSector: "LOCAL-ONLY / SECTOR-0",
  control: "DISABLED",
  provenance: "SIMULATED",
};
