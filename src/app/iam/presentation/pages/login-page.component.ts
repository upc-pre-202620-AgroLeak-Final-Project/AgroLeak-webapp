import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthFacade } from '../../application/auth.facade';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  standalone:true,
  imports:[ReactiveFormsModule,RouterLink,MatButtonModule,MatFormFieldModule,MatInputModule,MatIconModule,MatProgressSpinnerModule],
  template:`
  <div class="auth-shell">
    <section class="hero">
      <div class="brand"><span>A</span><strong>AgroLeak</strong></div>
      <div class="hero-copy"><div class="eyebrow">IoT + DDD + Smart Agriculture</div><h1>{{i18n.t('login.heroTitle')}}</h1><p>{{i18n.t('login.heroText')}}</p></div>
      <div class="sensor-card"><span class="pulse"></span><div><small>{{i18n.t('login.demo')}}</small><strong>demo@agroleak.local</strong><small>AgroLeakDemo123!</small></div></div>
    </section>
    <main class="auth-card">
      <button class="lang" mat-button (click)="i18n.toggle()"><mat-icon>language</mat-icon>{{i18n.label()}}</button>
      <div><div class="kicker">{{i18n.t('auth.welcome')}}</div><h2>{{i18n.t('auth.login')}}</h2><p>{{i18n.t('auth.loginHint')}}</p></div>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" formControlName="email" autocomplete="email"><mat-icon matSuffix>mail</mat-icon></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{i18n.t('auth.password')}}</mat-label><input matInput type="password" formControlName="password" autocomplete="current-password"><mat-icon matSuffix>lock</mat-icon></mat-form-field>
        @if(error()){<div class="error"><mat-icon>error</mat-icon>{{error()}}</div>}
        <button mat-flat-button color="primary" class="submit" [disabled]="form.invalid||loading()">@if(loading()){<mat-spinner diameter="20"/>}@else{ {{i18n.t('auth.login')}} }</button>
      </form>
      <p class="switch">{{i18n.t('auth.noAccount')}} <a routerLink="/register">{{i18n.t('auth.register')}}</a></p>
    </main>
  </div>`,
  styles:[`
    .auth-shell{min-height:100vh;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(420px,.9fr);background:#f6f8f4}.hero{position:relative;overflow:hidden;background:linear-gradient(150deg,#0b392d,#176b52 68%,#8bbb68);color:white;padding:42px 7vw;display:flex;flex-direction:column}.hero:after{content:'';position:absolute;width:520px;height:520px;border-radius:50%;right:-180px;bottom:-220px;border:1px solid rgba(255,255,255,.18);box-shadow:0 0 0 70px rgba(255,255,255,.03),0 0 0 140px rgba(255,255,255,.025)}.brand{display:flex;align-items:center;gap:10px;font-size:1.1rem}.brand span{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:#d7f1bf;color:#0d3e31;font-weight:900}.hero-copy{margin:auto 0;max-width:650px;position:relative;z-index:1}.eyebrow{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:#c9dfd6;font-weight:700}.hero h1{font-size:clamp(2.4rem,5vw,4.9rem);line-height:.96;letter-spacing:-.055em;margin:18px 0}.hero p{font-size:1.05rem;line-height:1.7;color:#dcebe4;max-width:580px}.sensor-card{position:relative;z-index:1;align-self:flex-start;display:flex;gap:12px;align-items:center;padding:13px 16px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);backdrop-filter:blur(10px);border-radius:14px}.pulse{width:10px;height:10px;background:#a7e38d;border-radius:50%;box-shadow:0 0 0 5px rgba(167,227,141,.18)}.sensor-card strong,.sensor-card small{display:block}.sensor-card small{color:#cfe1d9;font-size:.7rem}.auth-card{padding:9vh clamp(32px,7vw,90px);display:flex;flex-direction:column;justify-content:center;position:relative}.lang{position:absolute;right:28px;top:24px}.kicker{color:var(--ag-primary-2);font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.auth-card h2{font-size:2.2rem;letter-spacing:-.04em;margin:8px 0}.auth-card p{color:var(--ag-muted)}form{display:grid;gap:8px;margin-top:26px}.submit{height:48px}.error{display:flex;gap:8px;align-items:center;padding:11px 12px;border-radius:10px;background:#fde8e8;color:#a92f2f;font-size:.84rem;margin-bottom:6px}.switch{text-align:center;margin-top:22px}.switch a{color:var(--ag-primary-2);font-weight:700}@media(max-width:820px){.auth-shell{grid-template-columns:1fr}.hero{display:none}.auth-card{min-height:100vh;padding:80px 24px 40px}}
  `],changeDetection:ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent{
  readonly i18n=inject(I18nService); private readonly fb=inject(FormBuilder); private readonly auth=inject(AuthFacade); private readonly router=inject(Router);
  readonly loading=signal(false); readonly error=signal('');
  readonly form=this.fb.nonNullable.group({email:['demo@agroleak.local',[Validators.required,Validators.email]],password:['AgroLeakDemo123!',[Validators.required,Validators.minLength(8)]]});
  submit(){ if(this.form.invalid)return; this.loading.set(true);this.error.set(''); this.auth.login(this.form.getRawValue()).subscribe({next:()=>this.router.navigate(['/dashboard']),error:e=>{this.loading.set(false);this.error.set(e?.error?.message||this.i18n.t('auth.invalidCredentials'));}}); }
}
