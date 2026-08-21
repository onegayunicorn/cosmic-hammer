import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const kit = path.join(root, "integrations", "cosmic-camera-v3", "reference-kit");
const outDir = path.join(root, "dist", "cosmic-camera-v3");
const packageName = "cosmic-camera-v3-reference-kit.tar.gz";
const archivePath = path.join(outDir, packageName);
const required = ["README.md", "Makefile", "core/main.cpp", "sim/simulator.py"];

for (const relative of required) {
  const file = path.join(kit, relative);
  if (!fs.existsSync(file)) throw new Error(`Missing package input: ${relative}`);
}
fs.mkdirSync(outDir, { recursive: true });
execFileSync("make", ["test"], { cwd: kit, stdio: "inherit" });
execFileSync("tar", ["-czf", archivePath, "-C", path.dirname(kit), path.basename(kit)], { stdio: "inherit" });
const digest = crypto.createHash("sha256").update(fs.readFileSync(archivePath)).digest("hex");
const manifest = {
  package: packageName,
  version: "3.0.0",
  provenance: "SIMULATED",
  sourceDirectory: "integrations/cosmic-camera-v3/reference-kit",
  archiveSha256: digest,
  requiredFiles: required,
  hardwareControl: "DISABLED",
  rawMediaPersistence: "DISABLED",
  externalWrites: false,
};
fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ archivePath, manifestPath: path.join(outDir, "manifest.json"), ...manifest }, null, 2));
