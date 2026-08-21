import { useEffect, useMemo, useState } from "react";

type DashboardEvent = {
  id: string;
  label: string;
  detail: string;
  provenance: "SIMULATED" | "USER_INPUT";
};

const baseEvents: DashboardEvent[] = [
  { id: "evt-001", label: "Frame window opened", detail: "16 samples queued for deterministic review", provenance: "SIMULATED" },
  { id: "evt-002", label: "Thermal interlock checked", detail: "No actuation path available in this build", provenance: "SIMULATED" },
  { id: "evt-003", label: "Provenance boundary enforced", detail: "Synthetic output cannot become measured evidence", provenance: "SIMULATED" },
];

function nextMetric(tick: number) {
  return {
    throughput: 10 + (tick % 3) * 0.1,
    coherence: 0.92 + ((tick * 7) % 5) / 100,
    queue: 2 + (tick % 4),
    uptime: `00:${String((tick * 3) % 60).padStart(2, "0")}`,
  };
}

export default function CosmicCameraLiveDashboard() {
  const [tick, setTick] = useState(0);
  const [events, setEvents] = useState(baseEvents);

  useEffect(() => {
    const timer = window.setInterval(() => setTick(value => value + 1), 3000);
    return () => window.clearInterval(timer);
  }, []);

  const metrics = useMemo(() => nextMetric(tick), [tick]);

  useEffect(() => {
    if (tick === 0) return;
    const event: DashboardEvent = {
      id: `evt-${String(tick + 3).padStart(3, "0")}`,
      label: "Telemetry heartbeat",
      detail: `Frame ${tick + 16} accepted; no raw media persisted`,
      provenance: "SIMULATED",
    };
    setEvents(current => [event, ...current].slice(0, 4));
  }, [tick]);

  return (
    <section aria-labelledby="live-dashboard-title" className="rounded-2xl border border-[#73c9c2]/20 bg-[#091720] p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mono-label text-[#73c9c2]">LIVE OPERATIONS / READ ONLY</div>
          <h2 id="live-dashboard-title" className="mt-2 text-2xl font-semibold tracking-tight">Cosmic Camera signal board</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9daeb1]">
            This board updates from a deterministic local heartbeat. It is a useful product preview, not a live camera, laboratory bench, or hardware telemetry feed.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#7fe0c0]" aria-live="polite">
          <span className="pulse-dot" />
          <span>{tick === 0 ? "Starting" : "Streaming simulated events"}</span>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Acquisition", `${metrics.throughput.toFixed(1)} Hz`, "SIMULATED"],
          ["Coherence", `${(metrics.coherence * 100).toFixed(1)}%`, "DERIVED"],
          ["Queue depth", String(metrics.queue), "LOCAL"],
          ["Session uptime", metrics.uptime, "LOCAL"],
        ].map(([label, value, status]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#0d1c26] p-4">
            <div className="mono-label text-[#6f848b]">{label}</div>
            <div className="mt-3 font-mono text-2xl text-[#eef4ef]">{value}</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#f4a261]">{status}</div>
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="mono-label text-[#6f848b]">EVENT STREAM</div>
          <div className="mt-3 space-y-2" aria-live="polite">
            {events.map(event => (
              <div key={event.id} className="flex items-start justify-between gap-4 border-b border-white/5 py-3 text-sm">
                <div>
                  <div className="text-[#d9e4e1]">{event.label}</div>
                  <div className="mt-1 text-xs text-[#82979c]">{event.detail}</div>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-[#73c9c2]">{event.provenance}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-l border-white/10 pl-0 lg:pl-6">
          <div className="mono-label text-[#6f848b]">GUARDRAILS</div>
          <div className="mt-3 space-y-3 text-sm">
            {["Camera actuation", "Raw media persistence", "External webhooks", "Financial or wallet writes"].map(label => (
              <div key={label} className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[#9daeb1]">{label}</span>
                <span className="font-mono text-[#7fe0c0]">DISABLED</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
