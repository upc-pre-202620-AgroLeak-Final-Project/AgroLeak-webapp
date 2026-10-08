export type DeviceType='GATEWAY'|'FLOW_SENSOR'|'PRESSURE_SENSOR'|'SOIL_MOISTURE_SENSOR'|'CAMERA'|'VALVE';
export type DeviceStatus='ONLINE'|'OFFLINE'|'MAINTENANCE';
export interface Device{ id:string; name:string; location:string; status:DeviceStatus; lastSeen:string|null; deviceType:DeviceType; batteryLevel:number|null; firmwareVersion:string|null; installationDate:string|null; sectorId:string|null; }
export interface CreateDeviceRequest{ name:string; location:string; deviceType:DeviceType; status:DeviceStatus; batteryLevel:number|null; firmwareVersion:string; installationDate:string; sectorId?:string|null; }
