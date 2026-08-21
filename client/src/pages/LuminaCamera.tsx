import { Activity, Camera, Eye, ShieldCheck, Sparkles } from "lucide-react";

const metrics = [
  ["Frame stream", "SIMULATED", "10 Hz"],
  ["Coherence", "DERIVED", "0.942"],
  ["Phase lock", "DERIVED", "1.047 rad"],
  ["Photon count", "UNVERIFIED", "not measured"],
];

export default function LuminaCamera() {
  return <div className="space-y-8">
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><span className="mono-label text-[#f4a261]">LUMINA / CAMERA SURFACE</span><h1 className="mt-3 font-display text-4xl tracking-tight">Live Camera Observatory</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#9aabb1]">A software-only camera narrative surface for exploring frames, coherence, and safe observation workflows. No physical camera or optical bench is connected.</p></div>
      <div className="flex items-center gap-2 rounded-full border border-[#3b8c94]/40 bg-[#0e2730] px-4 py-2 text-xs text-[#9ad8d1]"><Activity size={14}/> SIMULATION FEED / READ ONLY</div>
    </header>
    <section className="grid gap-4 md:grid-cols-4">{metrics.map(([label, provenance, value]) => <div key={label} className="border border-white/10 bg-[#0b1821] p-4"><span className="mono-label text-[#71838d]">{label}</span><strong className="mt-3 block font-display text-2xl">{value}</strong><small className="mt-2 block text-xs text-[#82c7c0]">{provenance}</small></div>)}</section>
    <section className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
      <div className="relative min-h-[360px] overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_center,#123e4b_0,#08131b_55%,#050b10_100%)] p-8"><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(120,220,220,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(120,220,220,.18)_1px,transparent_1px)] [background-size:42px_42px]"/><div className="relative flex h-full flex-col items-center justify-center text-center"><Camera size={36} className="text-[#70d3d0]"/><div className="mt-6 h-44 w-44 rounded-full border border-[#70d3d0]/60 shadow-[0_0_70px_rgba(112,211,208,.25)]"><div className="m-8 grid h-28 w-28 place-items-center rounded-full border border-[#f4a261]/70 text-5xl text-[#f4a261]">◇</div></div><p className="mt-5 text-xs text-[#9aabb1]">Obsidian shard reference frame · generated locally</p></div></div>
      <div className="space-y-4 border border-white/10 bg-[#0b1821] p-6"><div className="flex items-center gap-3"><ShieldCheck className="text-[#9ad8d1]" size={20}/><h2 className="font-display text-lg">Safety envelope</h2></div><p className="text-sm leading-6 text-[#9aabb1]">Controls are intentionally read-only. Hardware actuation, raw-media persistence, Bluetooth writes, and external endpoints remain disabled.</p><div className="space-y-3 text-xs">{["Hardware control: DISABLED","External writes: DISABLED","Raw media: DISABLED","Provenance: SIMULATED / DERIVED"].map(item => <div key={item} className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-[#768991]">{item.split(":")[0]}</span><strong className="text-[#9ad8d1]">{item.split(":")[1]}</strong></div>)}</div><button className="mt-4 flex w-full items-center justify-center gap-2 border border-[#f4a261]/40 px-4 py-3 text-sm text-[#f4a261]"><Sparkles size={15}/> Generate next simulated frame</button></div>
    </section>
  </div>;
}
