import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `<div class="loading"><mat-spinner diameter="30"/><span>{{ label }}</span></div>`,
  styles: [`.loading{min-height:180px;display:flex;gap:14px;align-items:center;justify-content:center;color:var(--ag-muted)}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingStateComponent { @Input() label = 'Cargando…'; }
