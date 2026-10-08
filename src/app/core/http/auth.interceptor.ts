import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorage } from '../../iam/infrastructure/token.storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(TokenStorage);
  const router = inject(Router);
  const token = storage.getToken();
  const isApi = req.url.startsWith(environment.apiUrl);
  const isAuth = req.url.includes('/iam/auth/login') || req.url.includes('/iam/auth/register');

  const request = token && isApi && !isAuth
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isApi && !isAuth) {
        storage.clear();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
