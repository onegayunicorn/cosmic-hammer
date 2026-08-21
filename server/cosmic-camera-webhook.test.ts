import { describe, expect, it } from "vitest";
import { cosmicCameraSignatureForTests, handleCosmicCameraWebhook } from "./cosmic-camera-webhook";

const secret = "local-test-secret";
const body = JSON.stringify({
  eventId: "evt-001",
  eventType: "telemetry.heartbeat",
  provenance: "SIMULATED",
  payload: { frameCount: 16 },
});

describe("Cosmic Camera webhook", () => {
  it("accepts a correctly signed labeled event without side effects", () => {
    const result = handleCosmicCameraWebhook({ secret, body, signature: cosmicCameraSignatureForTests(secret, body) });
    expect(result.accepted).toBe(true);
    expect(result.reason).toContain("Non-measured");
    expect(result.externalWrites).toBe(false);
    expect(result.hardwareActuation).toBe(false);
  });

  it("rejects an invalid signature", () => {
    const result = handleCosmicCameraWebhook({ secret, body, signature: "0".repeat(64) });
    expect(result.accepted).toBe(false);
    expect(result.reason).toContain("Invalid signature");
  });

  it("rejects malformed JSON after signature validation", () => {
    const malformed = "not-json";
    const signature = cosmicCameraSignatureForTests(secret, malformed);
    const result = handleCosmicCameraWebhook({ secret, body: malformed, signature });
    expect(result.accepted).toBe(false);
    expect(result.reason).toContain("valid JSON");
  });
});
