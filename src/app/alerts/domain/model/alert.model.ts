export type AlertType='LEAK'|'OBSTRUCTION'|'LOW_PRESSURE'|'HIGH_PRESSURE'|'DEVICE_OFFLINE'|'PEST_DETECTED'|'PRESSURE_OUT_OF_RANGE';
export type AlertSeverity='LOW'|'MEDIUM'|'HIGH'|'CRITICAL';
export type AlertStatus='ACTIVE'|'ACKNOWLEDGED'|'RESOLVED';
export interface Alert{ id:string; deviceId:string|null; type:AlertType; severity:AlertSeverity; message:string; status:AlertStatus; createdAt:string; resolvedAt:string|null; acknowledgedAt:string|null; acknowledgedBy:string|null; resolvedBy:string|null; sectorId:string|null; }
