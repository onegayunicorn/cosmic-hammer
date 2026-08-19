import { describe, expect, it } from "vitest";
import { buildDataRoomPayload } from "../shared/evidence";

describe("evidence data room", () => {
  it("includes only approved actual claims in actuals", () => {
    const payload = buildDataRoomPayload({ stations: 2 }, [{ title: "Source" }], [
      { status: "approved", category: "actual", label: "stations" },
      { status: "draft", category: "actual", label: "draft actual" },
      { status: "approved", category: "target", label: "target" },
      { status: "approved", category: "unverified", label: "unverified" },
    ], "2026-08-20T00:00:00.000Z");
    expect(payload.classification).toBe("EVIDENCE_DATA_ROOM");
    expect(payload.actuals.claims).toHaveLength(1);
    expect(payload.targets).toHaveLength(1);
    expect(payload.assumptions).toHaveLength(1);
    expect(payload.generatedAt).toBe("2026-08-20T00:00:00.000Z");
  });
});
