#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const command = process.argv[2] === "--" ? (process.argv[3] ?? "status") : (process.argv[2] ?? "status");
const root = process.cwd();
const run = (file, args) => execFileSync(file, args, { cwd: root, stdio: "inherit" });

switch (command) {
  case "status":
    console.log(JSON.stringify({ service: "cosmic-camera", mode: "SIMULATION", hardwareControl: "DISABLED", externalWrites: "DISABLED", rawMediaPersistence: "DISABLED" }, null, 2));
    break;
  case "simulate":
    run("pnpm", ["simulate:cosmic-camera-v3"]);
    break;
  case "verify":
    run("pnpm", ["verify:release-seal"]);
    run("pnpm", ["verify:evidence-package"]);
    break;
  case "package":
    run("pnpm", ["package:cosmic-camera-v3"]);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error("Usage: cosmic-camera <status|simulate|verify|package>");
    process.exit(2);
}

if (!existsSync(join(root, "client"))) process.exit(0);
