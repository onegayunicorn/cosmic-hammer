import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("operations.sandbox", () => {
  it("returns the complete conceptual operation run without external writes", async () => {
    const result = await appRouter.createCaller(context).operations.sandbox();
    expect(result.classification).toBe("VALIDATED_SANDBOX_SIMULATION");
    expect(result.financialExecution).toBe(false);
    expect(result.ledger.valid).toBe(true);
    expect(result.asset.financialExecution).toBe(false);
  });
});
