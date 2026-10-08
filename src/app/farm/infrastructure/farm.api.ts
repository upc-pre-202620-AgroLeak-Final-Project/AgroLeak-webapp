import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Farm,FarmRequest } from '../domain/model/farm.model';
import { Field,FieldRequest } from '../domain/model/field.model';
import { Sector,SectorRequest } from '../domain/model/sector.model';
import { Crop,CropRequest } from '../domain/model/crop.model';
@Injectable({providedIn:'root'})
export class FarmApi{
 private readonly b=environment.apiUrl; constructor(private http:HttpClient){}
 farms(){return this.http.get<Farm[]>(`${this.b}/farms`)} farm(id:string){return this.http.get<Farm>(`${this.b}/farms/${id}`)}
 createFarm(r:FarmRequest){return this.http.post<Farm>(`${this.b}/farms`,r)} updateFarm(id:string,r:FarmRequest){return this.http.put<Farm>(`${this.b}/farms/${id}`,r)} deleteFarm(id:string){return this.http.delete<void>(`${this.b}/farms/${id}`)}
 fields(farmId:string){return this.http.get<Field[]>(`${this.b}/farms/${farmId}/fields`)} createField(farmId:string,r:FieldRequest){return this.http.post<Field>(`${this.b}/farms/${farmId}/fields`,r)} updateField(id:string,r:FieldRequest){return this.http.put<Field>(`${this.b}/fields/${id}`,r)} deleteField(id:string){return this.http.delete<void>(`${this.b}/fields/${id}`)}
 sectors(fieldId:string){return this.http.get<Sector[]>(`${this.b}/fields/${fieldId}/sectors`)} createSector(fieldId:string,r:SectorRequest){return this.http.post<Sector>(`${this.b}/fields/${fieldId}/sectors`,r)} updateSector(id:string,r:SectorRequest){return this.http.put<Sector>(`${this.b}/sectors/${id}`,r)} deleteSector(id:string){return this.http.delete<void>(`${this.b}/sectors/${id}`)}
 crops(sectorId:string){return this.http.get<Crop[]>(`${this.b}/sectors/${sectorId}/crops`)} createCrop(sectorId:string,r:CropRequest){return this.http.post<Crop>(`${this.b}/sectors/${sectorId}/crops`,r)} updateCrop(id:string,r:CropRequest){return this.http.put<Crop>(`${this.b}/crops/${id}`,r)} deleteCrop(id:string){return this.http.delete<void>(`${this.b}/crops/${id}`)}
}
