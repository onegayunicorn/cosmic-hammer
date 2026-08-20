import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  Database,
  Gauge,
  GitBranch,
  Play,
  RefreshCw,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import type { ControlPlaneSnapshot } from "../../../packages/contracts/src/unified";
import { simulatePressureField } from "../../../simulation-engine/src/unified-engine";

const fallbackSnapshot: ControlPlaneSnapshot = {
  schemaVersion: "1.0.0",
  snapshotId: "local-fallback",
  observedAt: "2026-08-21T00:00:00.000Z",
  environment: "development",
  provenance: "DEMO",
  system: {
    id: "cosmic-hammer-unified",
    status: "healthy",
    version: "3.0.0",
    externalWrites: false,
  },
  systems: [
    {
      id: "cosmic-hammer",
      name: "Cosmic Hammer",
      version: "3.0.0",
      environment: "development",
      status: "healthy",
      provenance: "DEMO",
      capabilities: ["simulation.execute"],
      lastHeartbeat: "2026-08-21T00:00:00.000Z",
    },
    {
      id: "architect-orchestrator",
      name: "Architect Orchestrator",
      version: "0.1.0",
      environment: "development",
      status: "healthy",
      provenance: "TEST",
      capabilities: ["agent.execute"],
      lastHeartbeat: "2026-08-21T00:00:00.000Z",
    },
    {
      id: "universal-driver",
      name: "Universal Driver",
      version: "0.1.0",
      environment: "development",
      status: "offline",
      provenance: "TEST",
      capabilities: ["device.read"],
      lastHeartbeat: "2026-08-21T00:00:00.000Z",
    },
  ],
  devices: [
    {
      id: "synthetic-01",
      name: "Synthetic sensor",
      status: "ONLINE",
      lastHeartbeat: "2026-08-21T00:00:00.000Z",
      provenance: "SIMULATION",
    },
  ],
  digitalTwins: [],
  simulations: [
    { id: "pressure-001", status: "completed", provenance: "SIMULATION" },
  ],
  agents: [
    {
      id: "solver",
      name: "Solver Agent",
      status: "available",
      capabilities: ["simulation.execute"],
    },
  ],
  pipelines: [
    {
      id: "unified-001",
      name: "Unified telemetry pipeline",
      status: "completed",
      stage: "AUDIT",
    },
  ],
  events: [],
  telemetry: [],
  governance: {
    systemId: "cosmic-hammer-unified",
    status: "SANDBOXED",
    permissions: [
      { capability: "simulation.execute", allowed: true, scope: "development" },
    ],
    lastAudit: "2026-08-21T00:00:00.000Z",
    rollbackAvailable: false,
    externalWrites: false,
  },
  audit: [],
};

function Metric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="instrument-card p-5">
      <div className="flex items-center justify-between text-[#73c9c2]">
        <span className="mono-label text-[#71848e]">{label}</span>
        {icon}
      </div>
      <div className="mt-5 font-display text-3xl tracking-[-.06em]">
        {value}
      </div>
      <div className="mt-2 text-xs text-[#82979c]">{detail}</div>
    </div>
  );
}

export default function UnifiedPlatform() {
  const [snapshot, setSnapshot] =
    useState<ControlPlaneSnapshot>(fallbackSnapshot);
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<{
    pressure: number;
    forceVector: number;
    uncertainty: number;
  }>();
  const refresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/control-plane");
      if (!response.ok) throw new Error("unavailable");
      setSnapshot((await response.json()) as ControlPlaneSnapshot);
    } catch {
      setSnapshot(fallbackSnapshot);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
  }, []);
  const healthySystems = useMemo(
    () => snapshot.systems.filter(system => system.status === "healthy").length,
    [snapshot]
  );
  const runSimulation = () =>
    setSimulation(
      simulatePressureField({
        referencePressure: 1e-11,
        decayExponent: 2,
        distance: 1.2,
        quantumEnhancement: 0.08,
      })
    );
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mono-label text-[#f4a261]">11 / UNIFIED PLATFORM</div>
          <h1 className="mt-3 font-display text-4xl tracking-[-.06em] sm:text-5xl">
            One plane. Three domains.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#a4b3b2]">
            Observe through Cosmic Hammer, execute only through policy-bound
            orchestration, and govern through an auditable control plane. The
            current snapshot is explicitly labeled {snapshot.provenance} in{" "}
            {snapshot.environment}.
          </p>
        </div>
        <button
          className="header-tool"
          onClick={() => void refresh()}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />{" "}
          Refresh platform
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <span className="tag tag-cyan">
          <ShieldCheck size={13} /> {snapshot.environment.toUpperCase()}
        </span>
        <span className="tag tag-apricot">
          <Activity size={13} /> {snapshot.provenance}
        </span>
        <span className="tag tag-rose">NO EXTERNAL WRITES</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Systems"
          value={`${healthySystems}/${snapshot.systems.length}`}
          detail="healthy components"
          icon={<Gauge size={17} />}
        />
        <Metric
          label="Devices"
          value={`${snapshot.devices.filter(d => d.status === "ONLINE").length}`}
          detail="synthetic/live boundary"
          icon={<Wifi size={17} />}
        />
        <Metric
          label="Digital twins"
          value={`${snapshot.digitalTwins.length}`}
          detail="state representations"
          icon={<Database size={17} />}
        />
        <Metric
          label="Pipelines"
          value={`${snapshot.pipelines.length}`}
          detail="visible execution paths"
          icon={<GitBranch size={17} />}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="instrument-card overflow-hidden">
          <div className="border-b border-white/10 p-6">
            <div className="mono-label text-[#73c9c2]">SYSTEM REGISTRY</div>
            <h2 className="mt-3 font-display text-2xl tracking-[-.04em]">
              Connected surfaces, provenance first.
            </h2>
          </div>
          <div className="divide-y divide-white/8">
            {snapshot.systems.map(system => (
              <div
                className="flex flex-wrap items-center justify-between gap-4 p-5"
                key={system.id}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${system.status === "healthy" ? "bg-[#73c9c2]" : "bg-[#e78b94]"}`}
                    />
                    <strong className="text-sm">{system.name}</strong>
                  </div>
                  <div className="mt-2 text-xs text-[#82979c]">
                    {system.version} · {system.environment} ·{" "}
                    {system.capabilities.join(", ")}
                  </div>
                </div>
                <span className="mono-label text-[#f4a261]">
                  {system.provenance}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="instrument-card p-6">
            <div className="mono-label text-[#f4a261]">
              BOUNDED ENGINE / PRESSURE MODEL
            </div>
            <h2 className="mt-3 font-display text-2xl tracking-[-.04em]">
              Run a safe experiment.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#82979c]">
              This engine produces simulation output only. Physical state is
              never overwritten.
            </p>
            <button className="button-primary mt-6" onClick={runSimulation}>
              <Play size={14} fill="currentColor" /> Run simulation
            </button>
            {simulation && (
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 font-mono text-xs">
                <div>
                  <span className="block text-[#71848e]">PRESSURE</span>
                  <span className="text-[#f4a261]">
                    {simulation.pressure.toExponential(2)}
                  </span>
                </div>
                <div>
                  <span className="block text-[#71848e]">FORCE</span>
                  <span className="text-[#73c9c2]">
                    {simulation.forceVector.toExponential(2)}
                  </span>
                </div>
                <div>
                  <span className="block text-[#71848e]">UNCERTAINTY</span>
                  <span className="text-[#e78b94]">
                    {(simulation.uncertainty * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="instrument-card p-6">
            <div className="mono-label text-[#73c9c2]">GOVERNANCE</div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-[#a8b7b3]">Lifecycle</span>
              <span className="font-mono text-xs text-[#f4a261]">
                {snapshot.governance.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-[#a8b7b3]">Audit records</span>
              <span className="font-mono text-xs text-[#73c9c2]">
                {snapshot.audit.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
