import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const matrixPath = path.join(root, "release", "gates", "matrix.json");
const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
const required = ["D1", "I1", "S1", "ST1", "H1", "H2", "H3", "H4", "H5", "H6", "L1", "PARITY"];
const actualIds = matrix.gates.map((gate) => gate.id);
const missing = required.filter((id) => !actualIds.includes(id));
const duplicateIds = actualIds.filter((id, index) => actualIds.indexOf(id) !== index);
const physical = matrix.gates.filter((gate) => ["Physical Hardware", "Live Optical", "Live Parity"].includes(gate.tier));
const unsafePhysicalPass = physical.filter((gate) => gate.status === "PASS" && !["MEASURED", "DERIVED"].includes(gate.provenance));
const software = matrix.gates.filter((gate) => gate.tier === "Software");
const softwarePass = software.every((gate) => gate.status === "PASS");
const physicalReady = physical.every((gate) => gate.status === "PASS" && ["MEASURED", "DERIVED"].includes(gate.provenance));
const leaves = matrix.gates.map((gate) => crypto.createHash("sha256").update(JSON.stringify(gate)).digest("hex"));
function merkleLevel(nodes) {
  if (nodes.length <= 1) return nodes;
  const next = [];
  for (let index = 0; index < nodes.length; index += 2) {
    const right = nodes[index + 1] ?? nodes[index];
    next.push(crypto.createHash("sha256").update(nodes[index] + right).digest("hex"));
  }
  return merkleLevel(next);
}
const merkleRoot = merkleLevel(leaves)[0];
const status = missing.length || duplicateIds.length || unsafePhysicalPass.length
  ? "BLOCK"
  : softwarePass && physicalReady
    ? "PASS"
    : softwarePass
      ? "HOLD"
      : "BLOCK";
const result = {
  status,
  protocol: matrix.protocol,
  version: matrix.version,
  gateCount: matrix.gates.length,
  expectedGateCount: required.length,
  missing,
  duplicateIds,
  unsafePhysicalPass,
  softwarePass,
  physicalReady,
  computedMerkleRoot: merkleRoot,
  controls: matrix.controls,
  externalWrites: false,
  sourceSealClaim: "unverified-until-independent-evidence-is-imported",
};
console.log(JSON.stringify(result, null, 2));
if (status === "BLOCK") process.exitCode = 2;
