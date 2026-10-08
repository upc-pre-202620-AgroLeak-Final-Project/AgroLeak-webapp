import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./iam/presentation/pages/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./iam/presentation/pages/register-page.component').then(m => m.RegisterPageComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./analytics/presentation/pages/dashboard-page.component').then(m => m.DashboardPageComponent) },
      { path: 'farms', loadComponent: () => import('./farm/presentation/pages/farm-list-page.component').then(m => m.FarmListPageComponent) },
      { path: 'farms/:farmId', loadComponent: () => import('./farm/presentation/pages/farm-detail-page.component').then(m => m.FarmDetailPageComponent) },
      { path: 'devices', loadComponent: () => import('./devices/presentation/pages/device-list-page.component').then(m => m.DeviceListPageComponent) },
      { path: 'monitoring', loadComponent: () => import('./monitoring/presentation/pages/monitoring-page.component').then(m => m.MonitoringPageComponent) },
      { path: 'alerts', loadComponent: () => import('./alerts/presentation/pages/alerts-page.component').then(m => m.AlertsPageComponent) },
      { path: 'irrigation', loadComponent: () => import('./irrigation/presentation/pages/irrigation-page.component').then(m => m.IrrigationPageComponent) },
      { path: 'pests', loadComponent: () => import('./pests/presentation/pages/pests-page.component').then(m => m.PestsPageComponent) },
      { path: 'profile', loadComponent: () => import('./iam/presentation/pages/profile-page.component').then(m => m.ProfilePageComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '' }
];
