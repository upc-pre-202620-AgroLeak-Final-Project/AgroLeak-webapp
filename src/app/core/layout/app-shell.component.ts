import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { I18nService } from '../i18n/i18n.service';
import { AuthFacade } from '../../iam/application/auth.facade';
import { BackendHealthService } from '../health/backend-health.service';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/dashboard"><span class="brand-mark">A</span><div><strong>AgroLeak</strong><small>Smart irrigation</small></div></a>
        <nav>
          @for(item of nav; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active"><mat-icon>{{ item.icon }}</mat-icon><span>{{ i18n.t(item.label) }}</span></a>
          }
        </nav>
        <div class="sidebar-foot">
          <button mat-button class="lang" (click)="i18n.toggle()"><mat-icon>language</mat-icon>{{ i18n.label() }}</button>
          <button mat-button class="logout" (click)="logout()"><mat-icon>logout</mat-icon>{{ i18n.t('auth.logout') }}</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="connection" [class.is-offline]="!health.online()"><span class="online-dot"></span>{{ health.online() ? i18n.t('common.connected') : i18n.t('common.offline') }}</div>
          <a routerLink="/profile" class="user"><span class="avatar">{{ initials() }}</span><div><strong>{{ auth.user()?.firstName || 'AgroLeak' }}</strong><small>{{ auth.user()?.role || 'FARMER' }}</small></div></a>
        </header>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell{min-height:100vh;display:grid;grid-template-columns:248px minmax(0,1fr)}
    .sidebar{position:sticky;top:0;height:100vh;background:#0d3e31;color:#fff;padding:22px 16px;display:flex;flex-direction:column;z-index:4}
    .brand{display:flex;align-items:center;gap:12px;padding:6px 8px 22px}.brand-mark{width:38px;height:38px;border-radius:12px;background:#d7f1bf;color:#0d3e31;display:grid;place-items:center;font-weight:900}.brand strong,.brand small{display:block}.brand small{font-size:.7rem;color:#b9d0c5;margin-top:3px}
    nav{display:grid;gap:6px}nav a{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:12px;color:#d9e7e1;font-size:.9rem;font-weight:550}nav a:hover,nav a.active{background:rgba(255,255,255,.1);color:#fff}nav mat-icon{font-size:20px;width:20px;height:20px}
    .sidebar-foot{margin-top:auto;display:grid;gap:6px}.sidebar-foot button{justify-content:flex-start;color:#d9e7e1}.logout{color:#ffd9d9!important}
    .main{min-width:0}.topbar{height:68px;padding:0 28px;background:rgba(255,255,255,.85);backdrop-filter:blur(14px);border-bottom:1px solid var(--ag-border);display:flex;align-items:center;justify-content:flex-end;gap:24px;position:sticky;top:0;z-index:3}.connection{margin-right:auto;font-size:.8rem;color:var(--ag-muted);display:flex;gap:8px;align-items:center}.online-dot{width:8px;height:8px;border-radius:50%;background:#3ba56a;box-shadow:0 0 0 4px #e7f5ec}.connection.is-offline .online-dot{background:#c33e3e;box-shadow:0 0 0 4px #fde8e8}.user{display:flex;align-items:center;gap:10px}.avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#e4efdf;color:#0f4c3a;font-weight:800}.user strong,.user small{display:block}.user strong{font-size:.84rem}.user small{font-size:.68rem;color:var(--ag-muted);margin-top:2px}
    @media(max-width:880px){.shell{grid-template-columns:1fr}.sidebar{height:auto;position:fixed;left:0;right:0;bottom:0;top:auto;padding:8px 10px;background:#0d3e31}.brand,.sidebar-foot{display:none}nav{grid-template-columns:repeat(7,1fr);gap:2px}nav a{padding:8px 4px;justify-content:center}nav a span{display:none}.topbar{padding:0 16px}.main{padding-bottom:62px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent implements OnInit {
  readonly i18n = inject(I18nService);
  readonly auth = inject(AuthFacade);
  readonly health = inject(BackendHealthService);
  private readonly router = inject(Router);
  readonly nav = [
    { path:'/dashboard', icon:'dashboard', label:'nav.dashboard' },
    { path:'/farms', icon:'agriculture', label:'nav.farms' },
    { path:'/devices', icon:'sensors', label:'nav.devices' },
    { path:'/monitoring', icon:'monitor_heart', label:'nav.monitoring' },
    { path:'/alerts', icon:'warning', label:'nav.alerts' },
    { path:'/irrigation', icon:'water_drop', label:'nav.irrigation' },
    { path:'/pests', icon:'pest_control', label:'nav.pests' }
  ];
  ngOnInit(): void { this.auth.loadCurrentUser().subscribe(); this.health.check().subscribe(); }
  initials(): string { const u=this.auth.user(); return u ? `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase() : 'AG'; }
  logout(): void { this.auth.logout(); void this.router.navigate(['/login']); }
}
