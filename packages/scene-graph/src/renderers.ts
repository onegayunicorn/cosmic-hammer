import type { SceneGraph4D } from "../../4d-engine/src/index";

export interface RenderFrame { platform: "webgpu" | "mobile" | "vr"; supported: boolean; visibleLayers: number; timestamp: string; notes: string[]; }
export function detectWebGPU(): boolean { return typeof navigator !== "undefined" && "gpu" in navigator; }
export function renderWebGPU(scene: SceneGraph4D): RenderFrame { return { platform: "webgpu", supported: detectWebGPU(), visibleLayers: scene.layers.filter((layer) => layer.visible).length, timestamp: scene.temporal.timestamp, notes: detectWebGPU() ? ["adapter-request-ready"] : ["fallback-to-canvas"] }; }
export function renderMobile(scene: SceneGraph4D): RenderFrame { return { platform: "mobile", supported: true, visibleLayers: scene.layers.filter((layer) => layer.visible && ["station", "weather", "forecast", "trust", "digital-twin"].includes(layer.kind)).length, timestamp: scene.temporal.timestamp, notes: ["reduced-layer-profile", "touch-playback-ready"] }; }
export function renderVR(scene: SceneGraph4D): RenderFrame { return { platform: "vr", supported: typeof navigator !== "undefined" && "xr" in navigator, visibleLayers: scene.layers.filter((layer) => layer.visible).length, timestamp: scene.temporal.timestamp, notes: ["world-space-layer-contract", "headset-runtime-optional"] }; }
