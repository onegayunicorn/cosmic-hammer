import { describe, expect, it, vi } from "vitest";
import {
  createControlCenterAdapter,
  createReadOnlyControlApiAdapter,
} from "../integrations/sovereign-control/adapter";
import { snapshotContainsSecret } from "../integrations/sovereign-control/contracts";
import {
  canApproveRollback,
  canExecuteRollback,
  canRequestActivation,
} from "../integrations/sovereign-control/governance";

describe("Sovereign Control Center integration", () => {
  it("uses a deterministic fixture when no control API is configured", async () => {
    const adapter = createControlCenterAdapter();
    const snapshot = await adapter.getDeploymentStatus("demo-project");
    expect(adapter.mode).toBe("fixture");
    expect(snapshot.projectId).toBe("demo-project");
    expect(snapshot.activationRequested).toBe(false);
  });

  it("performs only authenticated GET requests against the remote adapter", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          projectId: "sovereign-saas",
          repository: "onegayunicorn/sovereign-saas",
          buildStatus: "passed",
          smokeTestStatus: "passed",
          deploymentStatus: "registered",
          activationStatus: "disabled",
          approvalStatus: "pending",
          rollbackStatus: "not_requested",
          activationRequested: false,
          serverEnforced: true,
          health: { status: "sandbox" },
          auditEventCount: 0,
          observedAt: "2026-08-21T00:00:00.000Z",
        }),
        { status: 200 }
      )
    );
    const snapshot = await createReadOnlyControlApiAdapter({
      baseUrl: "https://control.example",
      getBearerToken: () => "session-token",
      fetchImpl,
    }).getDeploymentStatus("sovereign-saas");
    expect(snapshot.serverEnforced).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://control.example/api/deployments/status/sovereign-saas",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer session-token",
        }),
      })
    );
  });

  it("keeps secret-like fields out of normalized snapshot contracts", () => {
    expect(
      snapshotContainsSecret({
        health: { status: "ok" },
        authorization: "Bearer secret",
      })
    ).toBe(true);
    expect(
      snapshotContainsSecret({ projectId: "safe", auditEventCount: 0 })
    ).toBe(false);
  });

  it("enforces approval, separation of duties, and health gates", () => {
    const approved = {
      deploymentId: "d1",
      projectId: "p1",
      approvalStatus: "approved" as const,
      rollbackStatus: "not_requested" as const,
      activationRequested: false,
      deploymentStatus: "registered" as const,
    };
    expect(canRequestActivation(approved)).toBe(true);
    expect(
      canApproveRollback(
        {
          ...approved,
          deploymentStatus: "published",
          rollbackStatus: "requested",
          rollbackRequesterId: "requester",
        },
        "ADMIN",
        "requester"
      )
    ).toBe(false);
    expect(
      canApproveRollback(
        {
          ...approved,
          deploymentStatus: "published",
          rollbackStatus: "requested",
          rollbackRequesterId: "requester",
        },
        "ADMIN",
        "approver"
      )
    ).toBe(true);
    expect(
      canExecuteRollback({
        ...approved,
        deploymentStatus: "published",
        rollbackStatus: "approved",
        rollbackApproverId: "approver",
        healthStatus: "healthy",
      })
    ).toBe(true);
  });
});
