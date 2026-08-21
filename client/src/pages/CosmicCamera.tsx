import { useMemo, useState } from "react";

type CameraMode = "personal" | "business" | "operations" | "simulation";

type CameraResult = {
  id: string;
  mode: CameraMode;
  provenance: "USER_INPUT" | "SIMULATION";
  label: string;
  confidence: number;
  externalWrites: false;
  rawMediaPersisted: false;
};

const modeCopy: Record<CameraMode, string> = {
  personal: "Private capture notes for everyday planning. Consent is required.",
  business:
    "Inventory, workspace, and customer-flow observations without raw-media retention.",
  operations:
    "Read-only workflow and telemetry inspection for authorized operators.",
  simulation: "Deterministic Lux Codex-connected sandbox observations.",
};

function stableId(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `camera-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export default function CosmicCamera() {
  const [mode, setMode] = useState<CameraMode>("simulation");
  const [label, setLabel] = useState("Northstar workspace");
  const [result, setResult] = useState<CameraResult | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const description = useMemo(() => modeCopy[mode], [mode]);

  function createObservation() {
    const cleanLabel = label.trim().slice(0, 120);
    if (!cleanLabel) return;
    setResult({
      id: stableId(`${mode}:${cleanLabel}`),
      mode,
      provenance: mode === "simulation" ? "SIMULATION" : "USER_INPUT",
      label: cleanLabel,
      confidence: 0.92,
      externalWrites: false,
      rawMediaPersisted: false,
    });
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1c26] p-6 sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#f4a261]/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mono-label mb-3 text-[#f4a261]">
            COSMIC CAMERA / HUMAN-SCALE OBSERVATION
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Turn a moment into a useful signal.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#aab9bd]">
            A privacy-first observation layer for everyday planning,
            small-business workflows, operations review, and deterministic
            simulation. The camera is optional; raw media is never persisted;
            external writes remain disabled.
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-white/10 bg-[#0b1821] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="mono-label text-[#6f848b]">
                OBSERVATION STUDIO
              </div>
              <h2 className="mt-2 text-xl font-medium">
                Create a safe observation
              </h2>
            </div>
            <button
              className={`rounded-full border px-3 py-1 text-[11px] ${cameraReady ? "border-[#7fe0c0]/40 text-[#7fe0c0]" : "border-white/10 text-[#89999e]"}`}
              onClick={() => setCameraReady(value => !value)}
            >
              {cameraReady ? "Camera optional / ready" : "Use camera input"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-[#8fa1a5]">
              Mode
              <select
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#101f29] px-3 py-3 text-sm text-white"
                value={mode}
                onChange={event => setMode(event.target.value as CameraMode)}
              >
                {Object.keys(modeCopy).map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-[#8fa1a5]">
              Observation label
              <input
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#101f29] px-3 py-3 text-sm text-white"
                value={label}
                maxLength={120}
                onChange={event => setLabel(event.target.value)}
              />
            </label>
          </div>
          <p className="mt-4 rounded-lg border border-white/10 bg-[#101923] p-4 text-sm leading-6 text-[#9daeb1]">
            {description}
          </p>
          <button
            className="mt-5 rounded-lg bg-[#f4a261] px-4 py-3 text-sm font-semibold text-[#071018] transition hover:bg-[#ffc184] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!label.trim()}
            onClick={createObservation}
          >
            Create observation summary
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b1821] p-6">
          <div className="mono-label text-[#6f848b]">SAFETY POSTURE</div>
          <div className="mt-5 space-y-3 text-sm">
            {[
              ["Raw media persistence", "Disabled"],
              ["External writes", "Disabled"],
              ["Hardware control", "Disabled"],
              ["Sensitive fields", "Redacted"],
            ].map(([name, value]) => (
              <div
                className="flex items-center justify-between border-b border-white/5 pb-3"
                key={name}
              >
                <span className="text-[#9daeb1]">{name}</span>
                <strong className="text-[#7fe0c0]">{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {result && (
        <section className="rounded-2xl border border-[#7fe0c0]/20 bg-[#0b1821] p-6">
          <div className="mono-label text-[#7fe0c0]">OBSERVATION CREATED</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div>
              <div className="text-xs text-[#6f848b]">Identifier</div>
              <code className="text-sm text-[#d9e4e1]">{result.id}</code>
            </div>
            <div>
              <div className="text-xs text-[#6f848b]">Provenance</div>
              <strong className="text-sm text-[#d9e4e1]">
                {result.provenance}
              </strong>
            </div>
            <div>
              <div className="text-xs text-[#6f848b]">Confidence</div>
              <strong className="text-sm text-[#d9e4e1]">
                {Math.round(result.confidence * 100)}%
              </strong>
            </div>
            <div>
              <div className="text-xs text-[#6f848b]">Label</div>
              <strong className="text-sm text-[#d9e4e1]">{result.label}</strong>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
