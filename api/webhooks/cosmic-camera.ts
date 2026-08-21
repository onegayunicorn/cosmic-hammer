import { handleCosmicCameraWebhook } from "../../server/cosmic-camera-webhook";

type RequestLike = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type ResponseLike = { status: (code: number) => ResponseLike; json: (body: unknown) => void; setHeader?: (name: string, value: string) => void };

export default function cosmicCameraWebhook(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const secret = process.env.COSMIC_CAMERA_WEBHOOK_SECRET;
  if (!secret) {
    res.status(503).json({ error: "Webhook secret is not configured" });
    return;
  }
  const signatureHeader = req.headers["x-cosmic-camera-signature"];
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  const result = handleCosmicCameraWebhook({ secret, signature: signature ?? "", body });
  res.status(result.accepted ? 202 : 401).json(result);
}
