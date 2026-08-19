export type EvidenceBucket = "actuals" | "targets" | "assumptions" | "simulations";

export function buildDataRoomPayload(overview: unknown, citations: unknown[], claims: Array<{ status: string; category: string }>, generatedAt = new Date().toISOString()) {
  return {
    generatedAt,
    classification: "EVIDENCE_DATA_ROOM" as const,
    actuals: { overview, claims: claims.filter((claim) => claim.status === "approved" && claim.category === "actual") },
    targets: claims.filter((claim) => claim.category === "target"),
    assumptions: claims.filter((claim) => ["assumption", "hypothesis", "unverified"].includes(claim.category)),
    simulations: claims.filter((claim) => claim.category === "simulation"),
    citations,
    disclosure: "Approved actuals are separated from targets, assumptions, simulations, and unverified source claims. This export is not an investment offer or guarantee.",
  };
}
