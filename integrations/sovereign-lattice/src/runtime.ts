import { createHash } from "node:crypto";
import {
  DEFAULT_RFF,
  deriveLatticeSnapshot,
  nodeAlignmentMatrix,
  type LatticeSnapshot,
} from "./index";

export type RuntimeState = "OFFLINE" | "BOOTING" | "ACTIVE" | "PAUSED" | "SHUTDOWN";

export interface DeviceAdapterStatus {
  deviceId: string;
  transport: "SIMULATED_BLE" | "SIMULATED_NFC";
  connected: false;
  provenance: "SIMULATED";
  hardwareActuation: false;
  externalWrite: false;
}

export interface DigitalTwinState {
  deviceId: string;
  batteryPercent: number;
  bleRssi: number;
  phaseRad: number;
  coherence: number;
  currentRff: string | null;
  railConnected: boolean;
  displayBuffer: [string, string, string];
  provenance: "SIMULATED";
}

export interface LocalLedgerEntry {
  index: number;
  type: "OBSERVATION" | "STATE_SYNC" | "VALIDATION";
  payloadDigest: string;
  previousHash: string;
  hash: string;
  externalWrite: false;
}

export interface SafeRuntimeSmokeResult {
  runtimeState: RuntimeState;
  modules: string[];
  device: DeviceAdapterStatus;
  twin: DigitalTwinState;
  lattice: LatticeSnapshot;
  bridge: { activeConnections: number; capacity: number; externalWrite: false };
  bellChain: { rung: number[]; next: number | null };
  ledger: { height: number; valid: boolean; externalWrite: false };
  claims: { physicalHardware: "UNVERIFIED"; firmwareFlash: "DISABLED"; liveOpticalBench: "UNVERIFIED" };
}

export class SafeOrchestrator {
  state: RuntimeState = "OFFLINE";
  tick = 0;
  readonly modules = ["lattice", "digital_twin", "bridge", "bell_chain", "local_ledger"];

  boot(): void {
    this.state = "BOOTING";
    this.tick = 0;
  }

  activate(): void {
    if (this.state !== "BOOTING") throw new Error("orchestrator must boot before activation");
    this.state = "ACTIVE";
  }

  shutdown(): void {
    this.state = "SHUTDOWN";
  }
}

export class SimulatedDeviceAdapter {
  constructor(private readonly deviceId: string) {}

  status(transport: DeviceAdapterStatus["transport"]): DeviceAdapterStatus {
    return {
      deviceId: this.deviceId,
      transport,
      connected: false,
      provenance: "SIMULATED",
      hardwareActuation: false,
      externalWrite: false,
    };
  }

  flashFirmware(): never {
    throw new Error("firmware flashing is disabled in the software-only runtime");
  }
}

export class J09StyleDigitalTwin {
  readonly state: DigitalTwinState;

  constructor(deviceId: string) {
    this.state = {
      deviceId,
      batteryPercent: 100,
      bleRssi: -90,
      phaseRad: 0,
      coherence: DEFAULT_RFF.stabilityThreshold,
      currentRff: null,
      railConnected: false,
      displayBuffer: ["", "", ""],
      provenance: "SIMULATED",
    };
  }

  connectSimulated(): void {
    this.state.bleRssi = -42;
    this.state.coherence = 0.92;
    this.state.displayBuffer = ["SIMULATED", "J09 S TWIN", "READY"];
  }

  loadRff(rffId: string): void {
    this.state.currentRff = rffId;
    this.state.displayBuffer = ["RFF", rffId.slice(0, 8), "DERIVED"];
  }

  setPhase(phaseRad: number): void {
    this.state.phaseRad = ((phaseRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    this.state.displayBuffer = [`PHASE ${this.state.phaseRad.toFixed(2)}`, `LUX ${this.state.coherence.toFixed(2)}`, "SIMULATED"];
  }
}

export class SafeBridge {
  private readonly connections: string[] = [];
  constructor(readonly capacity = 3) {}

  connect(id: string): boolean {
    if (this.connections.includes(id) || this.connections.length >= this.capacity) return false;
    this.connections.push(id);
    return true;
  }

  status(): { activeConnections: number; capacity: number; externalWrite: false } {
    return { activeConnections: this.connections.length, capacity: this.capacity, externalWrite: false };
  }
}

export class BellChain {
  private readonly rung = new Set<number>();
  constructor(readonly count = 5) {}

  ring(index: number): boolean {
    if (index < 0 || index >= this.count) return false;
    this.rung.add(index);
    return true;
  }

  status(): { rung: number[]; next: number | null } {
    const rung = Array.from(this.rung).sort((a, b) => a - b);
    return { rung, next: Array.from({ length: this.count }, (_, i) => i).find((i) => !this.rung.has(i)) ?? null };
  }
}

export class LocalHashLedger {
  private readonly entries: LocalLedgerEntry[] = [];

  append(type: LocalLedgerEntry["type"], payload: unknown): LocalLedgerEntry {
    const previousHash = this.entries.at(-1)?.hash ?? "GENESIS";
    const payloadDigest = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const hash = createHash("sha256").update(`${this.entries.length}|${type}|${payloadDigest}|${previousHash}`).digest("hex");
    const entry: LocalLedgerEntry = {
      index: this.entries.length,
      type,
      payloadDigest,
      previousHash,
      hash,
      externalWrite: false,
    };
    this.entries.push(entry);
    return entry;
  }

  status(): { height: number; valid: boolean; externalWrite: false } {
    const valid = this.entries.every((entry, index) => entry.index === index
      && entry.previousHash === (index === 0 ? "GENESIS" : this.entries[index - 1].hash));
    return { height: this.entries.length, valid, externalWrite: false };
  }
}

export function runSafeRuntimeSmoke(): SafeRuntimeSmokeResult {
  const orchestrator = new SafeOrchestrator();
  orchestrator.boot();
  orchestrator.activate();

  const adapter = new SimulatedDeviceAdapter("J09-S-SIM-001");
  const device = adapter.status("SIMULATED_BLE");
  const twin = new J09StyleDigitalTwin(device.deviceId);
  twin.connectSimulated();
  twin.loadRff(DEFAULT_RFF.id);
  twin.setPhase(DEFAULT_RFF.basePhase);

  const lattice = deriveLatticeSnapshot(
    { cellId: "runtime", lux: DEFAULT_RFF.baseLux, shadow: DEFAULT_RFF.baseShadow, phase: DEFAULT_RFF.basePhase, symbol: "Δ", isOriginal: true, originFrequencyHz: 432 },
    nodeAlignmentMatrix([[1, 0.1], [0.1, 1]]),
  );
  const bridge = new SafeBridge();
  bridge.connect("J09-S-SIM-001");
  const bellChain = new BellChain();
  bellChain.ring(0);
  bellChain.ring(1);
  const ledger = new LocalHashLedger();
  ledger.append("STATE_SYNC", { device, twin: twin.state });
  ledger.append("OBSERVATION", { lattice });

  return {
    runtimeState: orchestrator.state,
    modules: orchestrator.modules,
    device,
    twin: twin.state,
    lattice,
    bridge: bridge.status(),
    bellChain: bellChain.status(),
    ledger: ledger.status(),
    claims: { physicalHardware: "UNVERIFIED", firmwareFlash: "DISABLED", liveOpticalBench: "UNVERIFIED" },
  };
}
