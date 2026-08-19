import { describe, expect, it } from "vitest";
import { composeSceneGraph } from "../../../packages/4d-engine/src/index";
import { renderMobile, renderVR, renderWebGPU } from "../../../packages/scene-graph/src/renderers";
import { evaluateMonitoring } from "./index";

describe("physical operations expansion", () => {
  it("renders one canonical scene through webgpu, mobile, and vr adapters", () => {
    const scene = composeSceneGraph({ timestamp: "2026-08-20T00:00:00Z", layers: [{ id: "station", kind: "station", visible: true, opacity: 1, coordinateReferenceSystem: "WGS84", provenance: "device", data: {} }, { id: "forecast", kind: "forecast", visible: true, opacity: 0.7, coordinateReferenceSystem: "WGS84", provenance: "provider", data: {} }] });
    expect(renderWebGPU(scene).visibleLayers).toBe(2);
    expect(renderMobile(scene).visibleLayers).toBe(2);
    expect(renderVR(scene).timestamp).toBe("2026-08-20T00:00:00Z");
  });
  it("routes calibration, stale snapshot, and drift alerts deterministically", () => {
    const alerts = evaluateMonitoring({ stationId: "s1", stationName: "Brisbane", calibrationExpiryDates: ["2026-08-25T00:00:00Z"], latestSnapshotAt: "2026-08-19T00:00:00Z", now: "2026-08-20T00:00:00Z", snapshotMaxAgeMinutes: 60, driftDetected: true });
    expect(alerts.map((alert) => alert.kind)).toEqual(["CALIBRATION_EXPIRY", "SNAPSHOT_STALE", "DRIFT_CHECK"]);
    expect(alerts.find((alert) => alert.kind === "DRIFT_CHECK")?.severity).toBe("critical");
  });
});
