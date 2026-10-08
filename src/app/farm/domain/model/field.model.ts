export interface Field { id:string; farmId:string; name:string; areaHectares:number; description:string|null; }
export interface FieldRequest { name:string; areaHectares:number; description?:string; }
