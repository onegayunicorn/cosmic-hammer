export interface SensorTransport{open():Promise<void>;close():Promise<void>;readFrame():Promise<Uint16Array>}
export class ScientificCmosDriver{constructor(private t:SensorTransport){}async capture(){await this.t.open();try{return await this.t.readFrame()}finally{await this.t.close()}}}
