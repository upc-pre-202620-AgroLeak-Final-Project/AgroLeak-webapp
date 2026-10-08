import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthApi } from '../infrastructure/auth.api';
import { TokenStorage } from '../infrastructure/token.storage';
import { LoginRequest, RegisterRequest } from '../domain/model/auth.model';
import { User } from '../domain/model/user.model';

@Injectable({ providedIn:'root' })
export class AuthFacade {
  readonly user=signal<User|null>(null);
  constructor(private readonly api:AuthApi, private readonly storage:TokenStorage) {}
  login(body:LoginRequest){ return this.api.login(body).pipe(tap(r=>{ this.storage.setToken(r.accessToken); this.user.set(r.user); })); }
  register(body:RegisterRequest){ return this.api.register(body); }
  loadCurrentUser():Observable<User>{ return this.api.me().pipe(tap(u=>this.user.set(u))); }
  logout():void{ this.storage.clear(); this.user.set(null); }
}
