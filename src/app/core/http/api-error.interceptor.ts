import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  return next(req).pipe(catchError((error: HttpErrorResponse) => {
    const isApi = req.url.startsWith(environment.backendUrl);
    if (isApi && error.status !== 401) {
      const message = error?.error?.message || (error.status === 0 ? 'No se pudo conectar con AgroLeak API.' : `Error ${error.status}`);
      snack.open(message, 'OK', { duration: 3500 });
    }
    return throwError(() => error);
  }));
};
