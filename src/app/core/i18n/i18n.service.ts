import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export type AppLanguage = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly dictionary = signal<Record<string, string>>({});
  readonly language = signal<AppLanguage>((localStorage.getItem('agroleak.lang') as AppLanguage) || environment.defaultLanguage);
  readonly label = computed(() => this.language() === 'es' ? 'ES' : 'EN');

  constructor(private readonly http: HttpClient) {
    this.load(this.language());
  }

  load(language: AppLanguage): void {
    this.http.get<Record<string, string>>(`/assets/i18n/${language}.json`).subscribe({
      next: dict => {
        this.language.set(language);
        localStorage.setItem('agroleak.lang', language);
        this.dictionary.set(dict);
        document.documentElement.lang = language;
      },
      error: () => this.dictionary.set({})
    });
  }

  toggle(): void { this.load(this.language() === 'es' ? 'en' : 'es'); }
  t(key: string): string { return this.dictionary()[key] ?? key; }
};
