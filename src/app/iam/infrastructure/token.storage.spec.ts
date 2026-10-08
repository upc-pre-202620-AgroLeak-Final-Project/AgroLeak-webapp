import { TestBed } from '@angular/core/testing';
import { TokenStorage } from './token.storage';

describe('TokenStorage', () => {
  let service: TokenStorage;
  beforeEach(() => { TestBed.configureTestingModule({}); service = TestBed.inject(TokenStorage); localStorage.clear(); });
  it('stores and clears the JWT', () => {
    service.setToken('abc');
    expect(service.getToken()).toBe('abc');
    expect(service.hasToken()).toBeTrue();
    service.clear();
    expect(service.hasToken()).toBeFalse();
  });
});
