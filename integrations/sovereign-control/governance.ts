export type GovernanceRole = "USER" | "ADMIN" | "OWNER";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "stale";
export type RollbackStatus =
  | "not_requested"
  | "requested"
  | "approved"
  | "rejected"
  | "executed";

export interface DeploymentGovernanceRecord {
  deploymentId: string;
  projectId: string;
  approvalStatus: ApprovalStatus;
  rollbackStatus: RollbackStatus;
  activationRequested: boolean;
  deploymentStatus: "registered" | "published" | "failed";
  requesterId?: string;
  approverId?: string;
  rollbackRequesterId?: string;
  rollbackApproverId?: string;
  healthStatus?: "healthy" | "degraded" | "failed";
}

export function canApprove(role: GovernanceRole): boolean {
  return role === "ADMIN" || role === "OWNER";
}

export function canRequestActivation(
  record: DeploymentGovernanceRecord
): boolean {
  return (
    record.approvalStatus === "approved" &&
    !record.activationRequested &&
    record.deploymentStatus === "registered"
  );
}

export function canRequestRollback(
  record: DeploymentGovernanceRecord,
  actorId: string
): boolean {
  return (
    record.deploymentStatus === "published" &&
    record.rollbackStatus === "not_requested" &&
    actorId.length > 0
  );
}

export function canApproveRollback(
  record: DeploymentGovernanceRecord,
  role: GovernanceRole,
  approverId: string
): boolean {
  return (
    canApprove(role) &&
    record.rollbackStatus === "requested" &&
    !!record.rollbackRequesterId &&
    approverId !== record.rollbackRequesterId
  );
}

export function canExecuteRollback(
  record: DeploymentGovernanceRecord
): boolean {
  return (
    record.rollbackStatus === "approved" &&
    record.healthStatus === "healthy" &&
    !!record.rollbackApproverId
  );
}
