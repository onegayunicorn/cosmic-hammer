import { createHmac, timingSafeEqual } from "node:crypto";

export type CosmicCameraWebhookEvent = {
  eventId: string;
  eventType: "telemetry.heartbeat" | "observation.created";
  provenance: "SIMULATED" | "USER_INPUT" | "MEASURED";
  payload: Record<string, unknown>;
};

export type WebhookResult = {
  accepted: boolean;
  reason: string;
  eventId?: string;
  externalWrites: false;
  hardwareActuation: false;
};

function signatureFor(secret: string, body: string) {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

export function verifyCosmicCameraSignature(secret: string, body: string, signature: string) {
  if (!secret || !signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = Buffer.from(signatureFor(secret, body), "hex");
  const received = Buffer.from(signature, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function handleCosmicCameraWebhook(input: {
  secret: string;
  signature: string;
  body: string;
}): WebhookResult {
  if (!verifyCosmicCameraSignature(input.secret, input.body, input.signature)) {
    return { accepted: false, reason: "Invalid signature", externalWrites: false, hardwareActuation: false };
  }

  let event: CosmicCameraWebhookEvent;
  try {
    event = JSON.parse(input.body) as CosmicCameraWebhookEvent;
  } catch {
    return { accepted: false, reason: "Body must be valid JSON", externalWrites: false, hardwareActuation: false };
  }

  if (!event.eventId || !event.eventType || !event.provenance || !event.payload) {
    return { accepted: false, reason: "Missing event envelope fields", externalWrites: false, hardwareActuation: false };
  }

  return {
    accepted: true,
    reason: event.provenance === "MEASURED" ? "Measured event accepted for review only" : "Non-measured event accepted as labeled telemetry",
    eventId: event.eventId,
    externalWrites: false,
    hardwareActuation: false,
  };
}

export function cosmicCameraSignatureForTests(secret: string, body: string) {
  return signatureFor(secret, body);
}
