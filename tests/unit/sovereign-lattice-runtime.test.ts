import { describe, expect, it } from "vitest";
import {
  J09StyleDigitalTwin,
  SafeBridge,
  SafeOrchestrator,
  SimulatedDeviceAdapter,
  runSafeRuntimeSmoke,
} from "../../integrations/sovereign-lattice/src/runtime";

describe("Sovereign Lattice connected runtime smoke", () => {
  it("boots and activates only through the explicit state sequence", () => {
    const orchestrator = new SafeOrchestrator();
    expect(() => orchestrator.activate()).toThrow("must boot");
    orchestrator.boot();
    orchestrator.activate();
    expect(orchestrator.state).toBe("ACTIVE");
  });

  it("connects simulated twin state without claiming a physical device", () => {
    const adapter = new SimulatedDeviceAdapter("J09-S-SIM-001");
    const status = adapter.status("SIMULATED_BLE");
    expect(status.connected).toBe(false);
    expect(status.provenance).toBe("SIMULATED");
    expect(() => adapter.flashFirmware()).toThrow("disabled");

    const twin = new J09StyleDigitalTwin(status.deviceId);
    twin.connectSimulated();
    twin.loadRff("gold-coast-baseline-rff");
    expect(twin.state.displayBuffer[0]).toBe("RFF");
    expect(twin.state.coherence).toBeGreaterThan(0.8);
  });

  it("enforces bridge capacity and reports no external writes", () => {
    const bridge = new SafeBridge(1);
    expect(bridge.connect("one")).toBe(true);
    expect(bridge.connect("two")).toBe(false);
    expect(bridge.status()).toEqual({ activeConnections: 1, capacity: 1, externalWrite: false });
  });

  it("connects the complete safe runtime smoke path", () => {
    const result = runSafeRuntimeSmoke();
    expect(result.runtimeState).toBe("ACTIVE");
    expect(result.modules).toContain("digital_twin");
    expect(result.device.connected).toBe(false);
    expect(result.twin.provenance).toBe("SIMULATED");
    expect(result.lattice.provenance).toBe("DERIVED");
    expect(result.bellChain.rung).toEqual([0, 1]);
    expect(result.ledger.height).toBe(2);
    expect(result.ledger.valid).toBe(true);
    expect(result.ledger.externalWrite).toBe(false);
    expect(result.claims.firmwareFlash).toBe("DISABLED");
  });
});
