import { z } from "zod";

export const deploymentStatusSnapshotSchema = z.object({
  projectId: z.string().min(1),
  repository: z.string().min(1),
  buildStatus: z.string().min(1),
  smokeTestStatus: z.string().min(1),
  deploymentStatus: z.string().min(1),
  activationStatus: z.string().min(1),
  approvalStatus: z.string().min(1),
  rollbackStatus: z.string().min(1),
  activationRequested: z.boolean(),
  serverEnforced: z.boolean(),
  health: z.object({
    status: z.string().min(1),
    detail: z.string().optional(),
  }),
  auditEventCount: z.number().int().nonnegative(),
  observedAt: z.string().datetime(),
});

export type DeploymentStatusSnapshot = z.infer<
  typeof deploymentStatusSnapshotSchema
>;
export type ControlApiErrorKind =
  | "authentication"
  | "authorization"
  | "not_found"
  | "server"
  | "timeout"
  | "unavailable"
  | "invalid";

export class ControlApiError extends Error {
  constructor(
    public readonly kind: ControlApiErrorKind,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ControlApiError";
  }
}

function objectValue(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeDeploymentStatus(
  input: unknown
): DeploymentStatusSnapshot {
  const envelope = objectValue(input);
  const source = objectValue(envelope.data ?? input);
  const parsed = deploymentStatusSnapshotSchema.safeParse(source);
  if (!parsed.success)
    throw new ControlApiError(
      "invalid",
      "Control API returned an invalid deployment status snapshot"
    );
  return parsed.data;
}

export function snapshotContainsSecret(snapshot: unknown): boolean {
  const serialized = JSON.stringify(snapshot).toLowerCase();
  return [
    "authorization",
    "bearer ",
    "private_key",
    "privatekey",
    "database_url",
    "webhook_secret",
    "client_secret",
    "jwt_secret",
  ].some(token => serialized.includes(token));
}
