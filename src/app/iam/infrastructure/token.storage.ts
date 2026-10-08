import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private readonly key='agroleak.accessToken';
  getToken(): string | null { return localStorage.getItem(this.key); }
  setToken(token:string): void { localStorage.setItem(this.key, token); }
  hasToken(): boolean { return !!this.getToken(); }
  clear(): void { localStorage.removeItem(this.key); }
}
