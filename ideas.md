# Cosmic Hammer Design Direction

## Three stylistic approaches

### Theme Name: Orbital Cartography

Very Brief Intro: A dark observatory interface that treats the platform as a living map of pressure fields, agents, and experiments. It pairs scientific instrument cues with warm stellar accents and asymmetric editorial framing.

Probability: 0.07

### Theme Name: Mineral Archive

Very Brief Intro: A warm, archival research system with paper-like surfaces, mineral reds, and annotated diagrams. It makes speculative cosmology feel tactile, collected, and legible.

Probability: 0.03

### Theme Name: Signal Garden

Very Brief Intro: A luminous, modular interface where data behaves like a cultivated ecosystem. Soft greens, pale sand, and kinetic signal lines create an inviting environment for experimentation.

Probability: 0.05

## Selected approach: Orbital Cartography

### Design Movement
Contemporary scientific instrument design blended with brutalist editorial cartography and observatory control-room interfaces.

### Core Principles
1. Make invisible systems visible through maps, traces, and measurable states.
2. Use asymmetry and layered panels to create the feeling of navigating an active instrument rather than reading a static dashboard.
3. Pair severe, high-contrast data typography with a warm, human editorial voice.
4. Every interaction should clarify system state, confidence, or next action.

### Color Philosophy
The base is near-black space blue, chosen for depth and concentration. The signature accent is solar apricot, used sparingly to represent pressure, motion, and moments that need attention. Mineral cyan marks stable systems and measurable instrumentation; a muted rose marks uncertainty or model divergence. The palette is intentionally not neon: it should feel like a calibrated observatory with warm metal components.

### Layout Paradigm
A persistent left rail anchors navigation while the main canvas uses offset modules, wide data bands, and split-screen instrument views. Hero content is aligned to the upper-left with an orbit trace crossing the page, avoiding centered marketing layouts. Detail pages preserve a stable instrument header and allow modules to stack vertically on smaller screens.

### Signature Elements
- Solar-apricot orbit traces and fine technical crosshair marks.
- A compact "pressure pulse" indicator that appears wherever live or simulated state is shown.
- Dark glass instrument cards with hairline rules, clipped corners, and annotation labels.

### Interaction Philosophy
Controls should behave like instrument toggles: explicit, reversible, and stateful. Hover reveals the meaning of a metric, selection reveals downstream effects, and destructive or experimental actions are framed as sandbox operations. Placeholder actions surface a clear "coming soon" state rather than implying a live backend.

### Animation
Use short, precise transitions for tabs, sliders, and card focus. Orbit traces should drift slowly only in hero or simulation contexts. Data updates should use opacity and transform, not layout reflow. Motion is disabled or reduced under prefers-reduced-motion. Entrances use staggered 40ms offsets and never begin from scale zero.

### Typography System
Display: Space Grotesk, 600–700, for system titles and hero statements. Body: IBM Plex Sans, 400–500, for explanations and controls. Data: IBM Plex Mono, 400–600, for IDs, timestamps, and equations. Headlines use tight tracking; annotations use uppercase mono with generous letter spacing.

### Brand Essence
Cosmic Hammer is a visual laboratory for exploring invisible pressure, digital twins, and competing models—built for speculative researchers, builders, and systems thinkers who want to see their assumptions move. Personality: rigorous, insurgent, cinematic.

### Brand Voice
Headlines are declarative and observant. CTAs are verbs that describe the experiment, not generic conversion language. Microcopy states what is live, simulated, or unverified.

Example line: "Map the pressure you cannot see."

Example line: "Run the orbit as a hypothesis."

### Wordmark & Logo
The mark is a compact solar disc interrupted by a diagonal hammer strike, rendered as a bold geometric symbol without text. The wordmark uses a custom-spaced uppercase treatment with a small orbital cut through the O.

### Signature Brand Color
Solar Apricot — `#F4A261`, used as the ownable signal of pressure, motion, and experimental focus.

## Product scope extracted from source material

The source PDFs describe a speculative invisible-pressure cosmology and a digital twin universe system. The frontend will present this as an explicitly labeled hypothesis/simulation workspace, not as validated physical fact. The first release will include a public landing surface, a dashboard shell, pressure field explorer, simulation sandbox, digital twin customizer, agent and pipeline surfaces, webhook/event catalog, documentation, and integration contracts for Universal Driver and analytics.

## Implementation guardrails

All frontend modules are static and demo-backed. Live webhooks, external repository execution, authenticated agents, and physical sensors are represented as contracts and states, not claimed as connected services. No customer reviews, ratings, or testimonials will be fabricated. Large visual assets will remain outside the project directory and be referenced through webdev storage URLs.

## Style Decisions

- Use dark observatory surfaces, warm solar apricot, mineral cyan, and rose uncertainty accents.
- Prefer asymmetric instrument layouts over centered marketing grids.
- Keep the theory framed as a hypothesis and make simulation state explicit.
- Use premium motion sparingly, with reduced-motion support.

## Style Decisions

- Desktop Cosmic Hammer keeps a persistent left-side brand/navigation rail as the primary chrome; the top bar is a supporting instrument header.
- The solar-disc/diagonal-hammer mark and custom-spaced uppercase wordmark appear in persistent chrome and on the landing surface.
- Solar Apricot `#F4A261` remains reserved for primary pressure/action signals.
- Human and avatar imagery is treated as an annotated instrument scan with calibration grid, orbital framing, and explicit simulated/unverified labels.
- Secondary pages retain cartographic language through crosshair grids, pressure-pulse labels, coordinate-style metadata, and system-state tags.
