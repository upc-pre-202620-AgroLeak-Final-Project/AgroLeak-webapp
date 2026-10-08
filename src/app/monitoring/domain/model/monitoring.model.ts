export type SensorType='FLOW_IN'|'FLOW_OUT'|'PRESSURE'|'SOIL_MOISTURE';
export interface Reading{ id:string; deviceId:string; sensorType:SensorType; value:number; unit:string; recordedAt:string; }
export interface ReadingStatistics{ average:number|null; min:number|null; max:number|null; samples:number; }
export interface MonitoringSummary{ flowIn:ReadingStatistics; flowOut:ReadingStatistics; pressure:ReadingStatistics; soilMoisture:ReadingStatistics; }
export interface CreateReadingRequest{ deviceId:string; sensorType:SensorType; value:number; unit:string; recordedAt?:string|null; }
