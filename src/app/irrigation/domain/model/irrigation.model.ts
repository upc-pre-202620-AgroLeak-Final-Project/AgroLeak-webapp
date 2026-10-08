export type ValveAction='OPEN'|'CLOSE';
export type ValveCommandStatus='PENDING'|'CONFIRMED'|'FAILED';
export type OperationMode='MONITOR_ONLY'|'MANUAL'|'AUTO_SAFE';
export interface ValveCommand{ id:string; deviceId:string; action:ValveAction; status:ValveCommandStatus; requestedAt:string; confirmedAt:string|null; }
export interface ModeResponse{ deviceId:string; mode:OperationMode; }
