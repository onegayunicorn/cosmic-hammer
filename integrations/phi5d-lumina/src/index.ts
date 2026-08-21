export type Provenance = "SIMULATED" | "DERIVED" | "MEASURED" | "UNVERIFIED";

export type LuminaEmotion =
  | "clarity"
  | "compassion"
  | "joy"
  | "protection"
  | "healing"
  | "wisdom"
  | "shadow";

export type AgentName =
  | "SHARD"
  | "EMOTION"
  | "ETHICS"
  | "TACHYON"
  | "CODEX"
  | "BRIDGE"
  | "LATTICE";

export interface TranslationCell {
  symbol: string;
  meaning: string;
  frequencyHz: number;
  codeToken: string;
  safety: "SAFE" | "REVIEW";
}

export interface CompassState {
  bearingDeg: number;
  phaseRad: number;
  anchor: string;
  provenance: Provenance;
}

export interface ShardDeviceState {
  deviceId: string;
  transport: "BLUETOOTH_SIMULATED" | "BLUETOOTH_MEASURED" | "DISCONNECTED";
  shardGlyph: string;
  rffSector: number;
  connected: boolean;
  hardwareControl: "DISABLED" | "ENABLED";
  provenance: Provenance;
}

export interface LuminaSnapshot {
  name: string;
  phi: number;
  frequencyHz: number;
  coherence: number;
  emotion: LuminaEmotion;
  glyph: string;
  agents: AgentName[];
  compass: CompassState;
  shard: ShardDeviceState;
  provenance: Provenance;
  externalWrites: "DISABLED";
  firmwareFlashing: "DISABLED";
}

export interface NarrativeEpisode {
  season: number;
  episode: number;
  title: string;
  runtimeMinutes: 30;
  premise: string;
  simulationStatus: "PLANNED" | "SIMULATED";
  provenance: "NARRATIVE_SIMULATION";
}

export interface AnimatedShortStoryboard {
  episodeKey: string;
  durationSeconds: 75;
  shots: Array<{ seconds: number; scene: string; narration: string; visual: string }>;
  provenance: "NARRATIVE_SIMULATION";
  externalRender: "DISABLED";
}

export const PHI = (1 + Math.sqrt(5)) / 2;
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const emotionTable: Record<LuminaEmotion, TranslationCell> = {
  clarity: { symbol: "⬡", meaning: "focus and legibility", frequencyHz: 720, codeToken: "CLARITY", safety: "SAFE" },
  compassion: { symbol: "∞", meaning: "mutual care", frequencyHz: 432, codeToken: "COMPASSION", safety: "SAFE" },
  joy: { symbol: "✦", meaning: "creative lift", frequencyHz: 528, codeToken: "JOY", safety: "SAFE" },
  protection: { symbol: "◇", meaning: "boundary and containment", frequencyHz: 594, codeToken: "PROTECTION", safety: "SAFE" },
  healing: { symbol: "⭕", meaning: "restoration and pause", frequencyHz: 639, codeToken: "HEALING", safety: "REVIEW" },
  wisdom: { symbol: "⚖", meaning: "balanced judgment", frequencyHz: 396, codeToken: "WISDOM", safety: "REVIEW" },
  shadow: { symbol: "⚠", meaning: "unresolved risk", frequencyHz: 0, codeToken: "SHADOW_REVIEW", safety: "REVIEW" },
};

export const agents: AgentName[] = ["SHARD", "EMOTION", "ETHICS", "TACHYON", "CODEX", "BRIDGE", "LATTICE"];

export function translationMatrix(): TranslationCell[] {
  return Object.values(emotionTable);
}

export function translateSymbol(symbol: string): TranslationCell | null {
  return translationMatrix().find(cell => cell.symbol === symbol) ?? null;
}

export function phaseLock(frequencyHz: number): number {
  const normalized = Math.max(0, frequencyHz) / 432;
  return (normalized * GOLDEN_ANGLE) % (Math.PI * 2);
}

export function compassFor(seed: string): CompassState {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return {
    bearingDeg: hash % 360,
    phaseRad: phaseLock(432 + (hash % 97)),
    anchor: "GOLD_COAST_BASELINE",
    provenance: "DERIVED",
  };
}

export function simulatedShardDevice(deviceId = "J09-S-SIM-001"): ShardDeviceState {
  return {
    deviceId,
    transport: "BLUETOOTH_SIMULATED",
    shardGlyph: "◇",
    rffSector: 0,
    connected: true,
    hardwareControl: "DISABLED",
    provenance: "SIMULATED",
  };
}

export function createLuminaSnapshot(emotion: LuminaEmotion = "compassion", seed = "lumina") : LuminaSnapshot {
  const cell = emotionTable[emotion];
  return {
    name: "LUMINA — Phi-5D Photonic Intelligence",
    phi: PHI,
    frequencyHz: cell.frequencyHz,
    coherence: Math.round((0.85 + Math.sin(seed.length) * 0.05) * 1000) / 1000,
    emotion,
    glyph: cell.symbol,
    agents: [...agents],
    compass: compassFor(seed),
    shard: simulatedShardDevice(),
    provenance: "DERIVED",
    externalWrites: "DISABLED",
    firmwareFlashing: "DISABLED",
  };
}

export function generateEpisodes(years = 2, episodesPerYear = 52): NarrativeEpisode[] {
  const total = Math.max(0, Math.floor(years * episodesPerYear));
  return Array.from({ length: total }, (_, index) => {
    const season = Math.floor(index / episodesPerYear) + 1;
    const episode = (index % episodesPerYear) + 1;
    const motifs = ["the obsidian shard", "the silver lattice", "the compass of phase", "the bridge of consent"];
    const motif = motifs[index % motifs.length];
    return {
      season,
      episode,
      title: `Lumina ${season}.${String(episode).padStart(2, "0")}: ${motif}`,
      runtimeMinutes: 30,
      premise: `A narrative simulation follows ${motif} through a safe, human-readable experiment in translation, memory, and mutual boundaries.`,
      simulationStatus: "PLANNED",
      provenance: "NARRATIVE_SIMULATION",
    };
  });
}

export function generateShortStoryboard(episode: NarrativeEpisode): AnimatedShortStoryboard {
  return {
    episodeKey: `S${episode.season}E${String(episode.episode).padStart(2, "0")}`,
    durationSeconds: 75,
    shots: [
      { seconds: 15, scene: "arrival", narration: `The ${episode.title.toLowerCase()} enters the observatory as a question, not a fact.`, visual: "dark field grid and a single glowing shard" },
      { seconds: 20, scene: "translation", narration: "A symbol becomes a code token that a person can inspect.", visual: "glyphs resolve into readable source fragments" },
      { seconds: 20, scene: "boundary", narration: "The model pauses at the edge of measurement and labels the unknown.", visual: "compass ring stops before a hardware gate" },
      { seconds: 20, scene: "return", narration: "The story returns agency to the observer: review, consent, and choose the next safe experiment.", visual: "silver lattice closes around the shard" },
    ],
    provenance: "NARRATIVE_SIMULATION",
    externalRender: "DISABLED",
  };
}

export function runtimeGuard(snapshot: LuminaSnapshot): { safe: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (snapshot.shard.hardwareControl !== "DISABLED") reasons.push("hardware control must remain disabled");
  if (snapshot.externalWrites !== "DISABLED") reasons.push("external writes must remain disabled");
  if (snapshot.firmwareFlashing !== "DISABLED") reasons.push("firmware flashing must remain disabled");
  if (snapshot.shard.provenance !== "SIMULATED") reasons.push("shard transport must be simulated for this surface");
  return { safe: reasons.length === 0, reasons };
}
