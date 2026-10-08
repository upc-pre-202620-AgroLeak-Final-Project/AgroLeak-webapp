import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../domain/model/auth.model';
import { User } from '../domain/model/user.model';

@Injectable({ providedIn:'root' })
export class AuthApi {
  private readonly base=`${environment.apiUrl}/iam`;
  constructor(private readonly http:HttpClient) {}
  register(body:RegisterRequest):Observable<User>{ return this.http.post<User>(`${this.base}/auth/register`,body); }
  login(body:LoginRequest):Observable<LoginResponse>{ return this.http.post<LoginResponse>(`${this.base}/auth/login`,body); }
  me():Observable<User>{ return this.http.get<User>(`${this.base}/users/me`); }
}
