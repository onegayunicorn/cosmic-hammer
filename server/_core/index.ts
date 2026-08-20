import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  calibrationExpiryHandler,
  driftCheckHandler,
  operatorAlertHandler,
  providerSnapshotHandler,
} from "../scheduled";
import { createControlPlaneSnapshot } from "../control-plane/snapshot";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/health", (_req, res) =>
    res.status(200).json({
      status: "ok",
      service: "cosmic-hammer",
      modelState: "simulation",
      externalWrites: false,
      timestamp: new Date().toISOString(),
    })
  );
  app.get("/api/v1/health", (_req, res) =>
    res.status(200).json({
      status: "healthy",
      environment: process.env.ENVIRONMENT || "development",
      provenance: "DEMO",
      externalWrites: false,
      timestamp: new Date().toISOString(),
    })
  );
  app.get("/api/v1/system", (_req, res) =>
    res.status(200).json(createControlPlaneSnapshot().system)
  );
  app.get("/api/v1/control-plane", (_req, res) =>
    res.status(200).json(createControlPlaneSnapshot())
  );
  app.get("/api/v1/capabilities", (_req, res) =>
    res.status(200).json({
      capabilities: createControlPlaneSnapshot().governance.permissions,
      timestamp: new Date().toISOString(),
      externalWrites: false,
    })
  );
  app.get("/api/v1/devices", (_req, res) =>
    res.status(200).json({
      devices: createControlPlaneSnapshot().devices,
      provenance: "SIMULATION",
      timestamp: new Date().toISOString(),
    })
  );
  app.get("/api/v1/digital-twins", (_req, res) =>
    res.status(200).json({
      twins: createControlPlaneSnapshot().digitalTwins,
      provenance: "SIMULATION",
      timestamp: new Date().toISOString(),
    })
  );
  app.get("/api/v1/telemetry", (_req, res) =>
    res.status(200).json({
      telemetry: createControlPlaneSnapshot().telemetry,
      provenance: "SIMULATION",
      timestamp: new Date().toISOString(),
    })
  );
  app.get("/api/v1/simulations", (_req, res) =>
    res.status(200).json({
      simulations: createControlPlaneSnapshot().simulations,
      provenance: "SIMULATION",
      timestamp: new Date().toISOString(),
    })
  );
  app.get("/api/v1/agents", (_req, res) =>
    res.status(200).json({
      agents: createControlPlaneSnapshot().agents,
      provenance: "DEMO",
      timestamp: new Date().toISOString(),
    })
  );
  app.get("/api/v1/pipelines", (_req, res) =>
    res.status(200).json({
      pipelines: createControlPlaneSnapshot().pipelines,
      provenance: "DEMO",
      timestamp: new Date().toISOString(),
    })
  );
  app.get("/api/v1/events", (_req, res) =>
    res.status(200).json({
      events: createControlPlaneSnapshot().events,
      count: 0,
      provenance: "DEMO",
      timestamp: new Date().toISOString(),
    })
  );
  app.get("/api/v1/governance/status", (_req, res) =>
    res.status(200).json(createControlPlaneSnapshot().governance)
  );
  app.get("/api/v1/audit/events", (_req, res) =>
    res.status(200).json({
      events: createControlPlaneSnapshot().audit,
      count: 0,
      provenance: "DEMO",
      timestamp: new Date().toISOString(),
    })
  );
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.post("/api/scheduled/providerSnapshot", providerSnapshotHandler);
  app.post("/api/scheduled/calibrationExpiry", calibrationExpiryHandler);
  app.post("/api/scheduled/driftCheck", driftCheckHandler);
  app.post("/api/scheduled/operatorAlert", operatorAlertHandler);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
