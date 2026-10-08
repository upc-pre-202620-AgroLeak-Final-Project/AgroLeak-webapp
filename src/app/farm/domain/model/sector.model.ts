export type SectorStatus='ACTIVE'|'INACTIVE'|'MAINTENANCE';
export interface Sector { id:string; fieldId:string; name:string; areaHectares:number; status:SectorStatus; }
export interface SectorRequest { name:string; areaHectares:number; status:SectorStatus; }
