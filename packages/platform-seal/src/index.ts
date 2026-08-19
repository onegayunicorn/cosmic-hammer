import { createHash } from "node:crypto";

export interface PlatformSealManifest { application: string; version: string; commit: string; buildId: string; schemaVersion: string; physicalTwinStateVersion: string; providerVersions: Record<string, string>; stationRegistryVersion: string; calibrationRegistryVersion: string; rendererVersion: string; configurationHash: string; databaseMigration: string; artifactHashes: Record<string, string>; testResults: { passed: number; failed: number }; securityVerification: string; timestamp: string; sealHash?: string; }
export function canonicalManifest(manifest: Omit<PlatformSealManifest, "sealHash">): string { return JSON.stringify(manifest, Object.keys(manifest).sort()); }
export function sealManifest(manifest: Omit<PlatformSealManifest, "sealHash">): PlatformSealManifest { const sealHash = createHash("sha256").update(canonicalManifest(manifest)).digest("hex"); return { ...manifest, sealHash }; }
export function verifyManifest(manifest: PlatformSealManifest): boolean { if (!manifest.sealHash) return false; const { sealHash, ...unsigned } = manifest; return createHash("sha256").update(canonicalManifest(unsigned)).digest("hex") === sealHash; }
export function artifactHash(content: string | Uint8Array): string { return createHash("sha256").update(content).digest("hex"); }
