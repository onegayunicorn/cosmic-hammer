export interface DeviceIdentity {id:string;model:string;firmware:string;serialHash:string;state:"UNENROLLED"|"ENROLLED"|"CALIBRATED"|"ACTIVE"|"REVOKED"}
export interface DeviceTelemetry {timestamp:string;temperatureC:number;supplyV:number;tecDuty:number;droppedFrames:number;acquisitionHz:number}
