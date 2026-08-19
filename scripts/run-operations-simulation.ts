import { runOperationsSimulation } from "../sandbox/wealth-bridge/operations-engine";

const result = runOperationsSimulation();
console.log(JSON.stringify(result, null, 2));
