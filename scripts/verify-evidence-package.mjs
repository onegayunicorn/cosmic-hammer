import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const manifestPath = path.join(root, "evidence", "package", "manifest.json");
const matrixPath = path.join(root, "release", "gates", "matrix.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));

const requiredArtifacts = manifest.requiredPhysicalArtifacts;
const presentArtifacts = requiredArtifacts.filter((relative) => fs.existsSync(path.join(root, relative)));
const missingArtifacts = requiredArtifacts.filter((relative) => !fs.existsSync(path.join(root, relative)));
const sha256 = /^[a-f0-9]{64}$/i;
const physicalGates = matrix.gates.filter((gate) => ["Physical Hardware", "Live Optical", "Live Parity"].includes(gate.tier));
const measuredPhysicalPasses = physicalGates.filter((gate) => gate.status === "PASS" && gate.provenance === "MEASURED");
const unsafePhysicalPasses = physicalGates.filter((gate) => gate.status === "PASS" && gate.provenance !== "MEASURED");
const claimedDigestShape = typeof manifest.claimedMerkleRoot === "string" && sha256.test(manifest.claimedMerkleRoot);
const localEvidenceComplete = missingArtifacts.length === 0;
const physicalEvidenceSufficient = localEvidenceComplete && unsafePhysicalPasses.length === 0 && measuredPhysicalPasses.length === physicalGates.length;
const softwareGates = matrix.gates.filter((gate) => gate.tier === "Software");
const softwarePass = softwareGates.every((gate) => gate.status === "PASS");

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

const result = {
  status: physicalEvidenceSufficient && softwarePass ? "PASS" : softwarePass ? "HOLD" : "BLOCK",
  classification: manifest.classification,
  packageVersion: manifest.packageVersion,
  claimedMerkleRoot: manifest.claimedMerkleRoot,
  claimedMerkleRootWellFormed: claimedDigestShape,
  localMatrixMerkleRoot: merkleLevel(leaves)[0],
  requiredPhysicalArtifactCount: requiredArtifacts.length,
  presentPhysicalArtifactCount: presentArtifacts.length,
  missingArtifacts,
  softwarePass,
  physicalGateCount: physicalGates.length,
  measuredPhysicalPassCount: measuredPhysicalPasses.length,
  unsafePhysicalPasses,
  physicalEvidenceSufficient,
  controls: matrix.controls,
  decision: physicalEvidenceSufficient && softwarePass
    ? "SOFTWARE_AND_PHYSICAL_PASS"
    : softwarePass
      ? "SOFTWARE_PASS_PHYSICAL_HOLD"
      : "SOFTWARE_BLOCK",
  reason: missingArtifacts.length
    ? "The supplied evidence package is a pasted source claim; referenced raw and signed physical artifacts are not present locally."
    : physicalEvidenceSufficient
      ? "All required physical artifacts are present and locally attributable."
      : "Physical gates are not independently satisfied by the local evidence set."
};

console.log(JSON.stringify(result, null, 2));
if (result.status === "BLOCK") process.exitCode = 2;
