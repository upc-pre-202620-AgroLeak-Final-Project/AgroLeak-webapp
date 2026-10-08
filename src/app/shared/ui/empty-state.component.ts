import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state', standalone: true,
  template: `<div class="empty"><div class="icon">{{ icon }}</div><strong>{{ title }}</strong><p>{{ message }}</p></div>`,
  styles:[`.empty{padding:38px;text-align:center;color:var(--ag-muted)}.icon{font-size:2rem;margin-bottom:10px}.empty strong{display:block;color:var(--ag-text);margin-bottom:6px}.empty p{margin:0}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent { @Input() icon='🌱'; @Input() title='Sin datos'; @Input() message='No hay información disponible todavía.'; }
