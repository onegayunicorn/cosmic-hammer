export interface CaptureSessionRequest {source:"camera"|"simulation"|"lux-codex";deviceId?:string;resolution:number;durationMs:number;idempotencyKey:string}
export interface CaptureSession {id:string;state:"CREATED"|"RUNNING"|"STOPPED"|"FAILED";provenance:"LIVE"|"SIMULATION"|"HYBRID";createdAt:string}
export interface ReconstructionRequest {sessionId:string;algorithm:"pnp-admm";iterations:number;tolerance:number}
export interface ApiError {code:string;message:string;correlationId:string}
