import { Activity, Box, CheckCircle2, LockKeyhole, Orbit, ShieldCheck } from "lucide-react";

const cards = [
  ["Identity", "ED25519 / REPLAY-RESISTANT", "Device identity and signed payload gates are available.", ShieldCheck],
  ["Verification", "MAE · RMSE · BIAS", "Forecast and observation metrics remain provenance-aware.", Activity],
  ["4D scene", "X + Y + Z + T", "One canonical scene graph feeds six renderer adapters.", Orbit],
  ["Platform seal", "SHA-256 MANIFEST", "Release metadata and artifact hashes can be sealed.", LockKeyhole],
  ["Sandbox", "NO EXTERNAL WRITES", "Wealth-bridge concepts are simulation-only.", Box],
];

export default function VNext() {
  return <main className="min-h-screen bg-[#071018] px-6 py-12 text-[#eef4ef] lg:px-12"><div className="mx-auto max-w-6xl"><div className="mono-label text-[#f4a261]">PHYSICAL DATA & 4D DIGITAL TWIN / VNEXT</div><h1 className="mt-4 max-w-3xl font-display text-5xl tracking-[-.06em] sm:text-7xl">One physical-data model. Every surface.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-[#9aacab]">The vNext control plane keeps provenance, coordinate systems, temporal state, uncertainty, and release seals visible across dashboard, mobile, desktop, VR, wall, and gateway surfaces.</p><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map(([title, status, description, Icon]) => <article className="instrument-card p-6" key={title as string}><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#f4a261]/12 text-[#f4a261]"><Icon size={19} /></div><CheckCircle2 size={17} className="text-[#73c9c2]" /></div><div className="mt-7 mono-label text-[#73c9c2]">{title as string}</div><h2 className="mt-2 font-display text-xl">{status as string}</h2><p className="mt-3 text-sm leading-6 text-[#82979c]">{description as string}</p></article>)}</div><div className="mt-6 rounded-2xl border border-[#f4a261]/20 bg-[#f4a261]/5 p-6 text-sm leading-6 text-[#c6d1cb]">All physical truth gates are explicit: successful arrival does not imply physical truth. A record must carry device identity, coordinate validity, temporal validity, calibration state, provenance, and verification status.</div></div></main>;
}
