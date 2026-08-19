// Orbital Cartography style note: persistent instrument rail, explicit model state, warm solar focus, and no centered marketing dead-end.
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Route, Switch, useLocation } from "wouter";
import { navItems, type ModuleKey } from "@/lib/cosmic-data";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { Activity, ArrowUpRight, Bell, ChevronDown, Command, Menu, Orbit, PanelLeftClose, Search, Sparkles, X } from "lucide-react";

function WorkspaceLayout() {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = (location.replace("/", "") || "overview") as ModuleKey;
  const go = (key: ModuleKey) => {
    setLocation(key === "overview" ? "/" : `/${key}`);
    setMobileOpen(false);
  };

  // make sure to consider if you need authentication for certain routes
  return (
    <div className="min-h-screen bg-[#071018] text-[#edf2ed] selection:bg-[#f4a261] selection:text-[#071018]">
      <div className="noise-layer" />
      <aside className={`fixed inset-y-0 left-0 z-50 w-[276px] border-r border-white/10 bg-[#0a141d]/95 px-5 py-6 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-10 flex items-center justify-between">
          <button onClick={() => go("overview")} className="flex items-center gap-3 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#f4a261] text-[#071018] shadow-[0_0_30px_rgba(244,162,97,.22)]"><img src="/manus-storage/cosmic-hammer-mark_a69d041a.png" alt="Cosmic Hammer mark" className="h-7 w-7 object-contain" /></span>
            <span><strong className="block font-display text-[17px] tracking-[.02em]">COSMIC HAMMER</strong><small className="mono-label text-[#7c8d99]">FIELD SYSTEM / 01</small></span>
          </button>
          <button className="rounded-lg p-1 text-[#7c8d99] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="mb-4 flex items-center justify-between"><span className="mono-label text-[#657985]">Workspace</span><span className="mono-label text-[#f4a261]">LIVE / SIM</span></div>
        <nav className="space-y-1">
          {navItems.map((item) => <button key={item.key} onClick={() => go(item.key)} className={`nav-item ${current === item.key ? "nav-item-active" : ""}`}><span className="grid h-7 w-7 place-items-center rounded-md border border-white/10 font-mono text-sm">{item.icon}</span><span className="min-w-0 flex-1"><strong className="block text-[13px] font-medium">{item.label}</strong><small className="block truncate text-[11px] text-[#71838d]">{item.detail}</small></span>{current === item.key && <span className="h-1.5 w-1.5 rounded-full bg-[#f4a261]" />}</button>)}
        </nav>
        <div className="mt-10 border-t border-white/10 pt-5"><span className="mono-label text-[#657985]">System posture</span><div className="mt-3 flex items-center gap-3 rounded-xl bg-[#0e1d27] p-3"><span className="pulse-dot" /><span className="text-xs text-[#a3b2b6]">Sandbox isolated<br /><span className="mono-label text-[#5f747f]">No external writes</span></span></div></div>
        <div className="absolute bottom-6 left-5 right-5"><div className="flex items-center justify-between text-[11px] text-[#5c707b]"><span>v0.1.0 / static</span><span className="font-mono">⌘K</span></div></div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}
      <main className="lg:pl-[276px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/10 bg-[#071018]/80 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3"><button className="rounded-lg border border-white/10 p-2 text-[#a7b7bb] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={18} /></button><div className="hidden items-center gap-2 text-xs text-[#70828a] sm:flex"><span className="font-mono">WORKSPACE</span><span>/</span><span className="text-[#d3dcda]">{navItems.find((n) => n.key === current)?.label ?? "Mission control"}</span></div><div className="flex items-center gap-2 sm:hidden"><Activity size={15} className="text-[#f4a261]" /><span className="font-display text-sm">COSMIC HAMMER</span></div></div>
          <div className="flex items-center gap-2"><button className="header-tool hidden sm:flex"><Search size={15} /><span>Search</span><kbd>⌘ K</kbd></button><button className="header-icon"><Bell size={16} /></button><div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#1c4b58] font-mono text-[11px] text-[#c2e2dd]">TP</span><span className="hidden text-left sm:block"><strong className="block text-xs font-medium">Operator</strong><small className="mono-label text-[#627680]">ORIGIN / 01</small></span><ChevronDown size={14} className="text-[#6c7d84]" /></div></div>
        </header>
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-10"><Switch><Route path="/" component={Home} /><Route path="/:module" component={Home} /><Route component={NotFound} /></Switch></div>
      </main>
      <Toaster />
    </div>
  );
}

export default function App() { return <ThemeProvider defaultTheme="dark"><TooltipProvider><WorkspaceLayout /></TooltipProvider></ThemeProvider>; }
