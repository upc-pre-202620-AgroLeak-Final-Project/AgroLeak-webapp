import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({providedIn:'root'})
export class BackendHealthService {
  readonly online=signal(false);
  constructor(private http:HttpClient){}
  check(){return this.http.get<{status:string}>(`${environment.backendUrl}/actuator/health`).pipe(map(r=>r.status==='UP'),catchError(()=>of(false)),tap(v=>this.online.set(v)))}
}
