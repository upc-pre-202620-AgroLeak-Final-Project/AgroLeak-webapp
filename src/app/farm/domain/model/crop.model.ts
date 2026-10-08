export type CropStatus='PLANTED'|'GROWING'|'HARVESTED'|'INACTIVE';
export interface Crop { id:string; sectorId:string; name:string; variety:string|null; plantedAt:string; status:CropStatus; }
export interface CropRequest { name:string; variety?:string; plantedAt:string; status:CropStatus; }
