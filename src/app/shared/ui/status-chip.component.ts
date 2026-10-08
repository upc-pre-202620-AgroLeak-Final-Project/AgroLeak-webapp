import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  template: `<span class="chip" [class]="'chip ' + tone"><span class="dot"></span>{{ label }}</span>`,
  styles: [`
    .chip{display:inline-flex;align-items:center;gap:7px;padding:6px 10px;border-radius:999px;font-size:.74rem;font-weight:700;background:#eef3ed;color:#42544a}
    .dot{width:7px;height:7px;border-radius:50%;background:currentColor}
    .success{background:#e7f5ec;color:#1f7a4c}.warning{background:#fff4df;color:#9a651e}.danger{background:#fde8e8;color:#b93535}.info{background:#e7f0f8;color:#2d6f9f}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusChipComponent {
  @Input({ required: true }) label = '';
  @Input() tone: 'success' | 'warning' | 'danger' | 'info' | '' = '';
}
