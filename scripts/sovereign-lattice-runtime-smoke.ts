import { runSafeRuntimeSmoke } from "../integrations/sovereign-lattice/src/runtime";

const result = runSafeRuntimeSmoke();
console.log(JSON.stringify({
  name: "sovereign-lattice-runtime-smoke",
  status: result.runtimeState === "ACTIVE" && result.ledger.valid ? "PASS" : "HOLD",
  result,
}, null, 2));
