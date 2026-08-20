// Orbital Cartography style note: this module feeds an observatory-like interface where every value is explicitly marked as live, simulated, or unverified.
export type ModuleKey =
  | "overview"
  | "pressure"
  | "simulation"
  | "prediction"
  | "twin"
  | "operations"
  | "evidence"
  | "agents"
  | "pipelines"
  | "webhooks"
  | "control-center"
  | "platform"
  | "docs";

export const navItems: Array<{
  key: ModuleKey;
  label: string;
  detail: string;
  icon: string;
}> = [
  {
    key: "overview",
    label: "Mission control",
    detail: "System overview",
    icon: "◈",
  },
  {
    key: "pressure",
    label: "Pressure field",
    detail: "Model explorer",
    icon: "◎",
  },
  {
    key: "simulation",
    label: "Sandbox",
    detail: "Orbit experiments",
    icon: "⌁",
  },
  {
    key: "prediction",
    label: "Predictions",
    detail: "Weather + twin positions",
    icon: "⌂",
  },
  {
    key: "twin",
    label: "Digital twin",
    detail: "Character customizer",
    icon: "◌",
  },
  {
    key: "operations",
    label: "Operations",
    detail: "Readiness + sandbox",
    icon: "✺",
  },
  {
    key: "evidence",
    label: "Evidence",
    detail: "Metrics + data room",
    icon: "▣",
  },
  { key: "agents", label: "Agents", detail: "Orchestrator", icon: "✦" },
  {
    key: "pipelines",
    label: "Pipelines",
    detail: "Runbooks & flow",
    icon: "↗",
  },
  { key: "webhooks", label: "Webhooks", detail: "Event contracts", icon: "⌘" },
  {
    key: "control-center",
    label: "Control Center",
    detail: "Read-only deployment view",
    icon: "◉",
  },
  {
    key: "platform",
    label: "Unified Platform",
    detail: "Systems + engines",
    icon: "⌬",
  },
  { key: "docs", label: "Field notes", detail: "Documentation", icon: "▤" },
];

export const pressureSeries = [
  { t: "00:00", pressure: 36, orbit: 48, coherence: 71 },
  { t: "02:00", pressure: 44, orbit: 52, coherence: 74 },
  { t: "04:00", pressure: 39, orbit: 55, coherence: 77 },
  { t: "06:00", pressure: 58, orbit: 62, coherence: 82 },
  { t: "08:00", pressure: 52, orbit: 68, coherence: 80 },
  { t: "10:00", pressure: 67, orbit: 72, coherence: 88 },
  { t: "12:00", pressure: 61, orbit: 78, coherence: 91 },
];

export const bodies = [
  {
    name: "Helios",
    role: "Pressure source",
    pressure: "1.00e−11 Pa",
    stability: 98,
    color: "apricot",
  },
  {
    name: "Terra",
    role: "Twin anchor",
    pressure: "2.70e−06 Pa",
    stability: 92,
    color: "cyan",
  },
  {
    name: "Luna",
    role: "Field lens",
    pressure: "8.20e−08 Pa",
    stability: 81,
    color: "rose",
  },
];

export const pipelineStages = [
  { label: "Ingest", value: 96, tone: "cyan" },
  { label: "Normalize", value: 84, tone: "cyan" },
  { label: "Solve", value: 68, tone: "apricot" },
  { label: "Render", value: 51, tone: "rose" },
];

export const docs = [
  {
    title: "Pressure-field manifesto",
    type: "source",
    status: "Hypothesis",
    text: "The supplied manifesto proposes a solar pressure gradient as a speculative alternative model. This workspace treats it as a testable hypothesis rather than established physics.",
  },
  {
    title: "Digital twin universe system",
    type: "system",
    status: "Mapped",
    text: "The second source defines pressure, quantum, simulation, agent, hardware, webhook, pipeline, and UI modules. The web build turns that architecture into explorable frontend contracts.",
  },
  {
    title: "Universal Driver adapter",
    type: "integration",
    status: "Contract",
    text: "A provider-neutral adapter surface is included for external drivers. No third-party repository is executed or claimed as connected in this static release.",
  },
  {
    title: "Cosmic Hammer Operation",
    type: "strategy",
    status: "Mapped",
    text: "The operations plan is mapped into measured, simulated, hypothesis, and unverified-claim states. Investor-facing projections are not treated as observed results.",
  },
];
