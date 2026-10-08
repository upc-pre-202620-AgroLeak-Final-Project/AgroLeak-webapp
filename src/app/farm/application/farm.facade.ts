import { Injectable, signal } from '@angular/core';
import { finalize,tap } from 'rxjs';
import { FarmApi } from '../infrastructure/farm.api';
import { FarmRequest } from '../domain/model/farm.model';
@Injectable({providedIn:'root'})
export class FarmFacade{
 readonly farms=signal<any[]>([]); readonly loading=signal(false); constructor(private api:FarmApi){}
 load(){this.loading.set(true);return this.api.farms().pipe(tap(v=>this.farms.set(v)),finalize(()=>this.loading.set(false)))}
 create(r:FarmRequest){return this.api.createFarm(r).pipe(tap(()=>this.load().subscribe()))}
 delete(id:string){return this.api.deleteFarm(id).pipe(tap(()=>this.load().subscribe()))}
}
