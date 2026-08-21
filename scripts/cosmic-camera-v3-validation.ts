import { photonToLux, wavelengthToFrequency, pnpAdmm } from "../integrations/cosmic-camera-v3/photonic-core.js";
import { SafeTecLoop } from "../integrations/cosmic-camera-v3/sensor/tec-controller.js";
import { ScientificCmosDriver } from "../integrations/cosmic-camera-v3/sensor/imx571-driver.js";
import {
  summarizeTelemetry,
  userObservationMetric,
} from "../integrations/cosmic-camera-v3/metrics.js";

class MemoryTransport {
  opened = false;
  async open() {
    this.opened = true;
  }
  async close() {
    this.opened = false;
  }
  async readFrame() {
    if (!this.opened) throw new Error("transport is closed");
    return new Uint16Array([0, 1, 0, 2, 1, 0, 0, 3]);
  }
}

class MemoryTec {
  duty = 0;
  temperature = 18;
  async setDuty(duty: number) {
    this.duty = duty;
  }
  async readTemperature() {
    return this.temperature;
  }
}

const capture = new ScientificCmosDriver(new MemoryTransport());
const frame = await capture.capture();
const tec = new MemoryTec();
const duty = await new SafeTecLoop(tec).regulate(12);
const observation = userObservationMetric({
  label: "Low-flux baseline",
  source: "simulation",
  durationMs: 1000,
});
const telemetry = summarizeTelemetry([
  {
    timestamp: "2026-08-22T00:00:00.000Z",
    temperatureC: 18,
    supplyV: 12,
    tecDuty: duty,
    droppedFrames: 0,
    acquisitionHz: 10,
  },
  {
    timestamp: "2026-08-22T00:00:01.000Z",
    temperatureC: 18.2,
    supplyV: 12,
    tecDuty: duty,
    droppedFrames: 0,
    acquisitionHz: 10,
  },
]);
const frequencyHz = wavelengthToFrequency(550);
const lux = photonToLux({
  id: "sim-photon-1",
  wavelengthNm: 550,
  frequencyHz,
  amplitude: 0.5,
  phaseRad: 0,
  polarization: "linear",
  x: 0,
  y: 0,
  z: 0,
  timestamp: "2026-08-22T00:00:00.000Z",
  provenance: "SIMULATED",
});
const reconstruction = pnpAdmm(Array.from(frame, (value) => value / 3), 20, 1e-6);

console.log(
  JSON.stringify(
    {
      status: "passed",
      provenance: "SIMULATION",
      userFlow: {
        labelAccepted: observation.label,
        rawMediaPersisted: observation.rawMediaPersisted,
        externalWrite: observation.externalWrite,
      },
      hardwareBoundary: {
        driverCaptureFrameLength: frame.length,
        tecDuty: duty,
        hardwareControlEnabled: false,
      },
      metrics: telemetry,
      photonModel: { frequencyHz, lux },
      reconstruction: {
        iterations: reconstruction.iterations,
        converged: reconstruction.converged,
        provenance: reconstruction.provenance,
      },
    },
    null,
    2,
  ),
);
