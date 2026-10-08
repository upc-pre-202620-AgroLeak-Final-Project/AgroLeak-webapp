import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  it('loads a dictionary and resolves a key', () => {
    TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});
    const service=TestBed.inject(I18nService);
    const http=TestBed.inject(HttpTestingController);
    http.expectOne(`/assets/i18n/${service.language()}.json`).flush({'common.save':'Guardar'});
    expect(service.t('common.save')).toBe('Guardar');
    http.verify();
  });
});
