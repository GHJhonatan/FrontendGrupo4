import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { IgAuthService } from './ig-auth';

// Agrega el token JWT a cada petición y, si el servidor lo rechaza, cierra la sesión.
export const igInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(IgAuthService);
  const router = inject(Router);
  const token = auth.iSesion()?.token;
  const conToken = token && !req.url.includes('/api/auth/') ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(conToken).pipe(
    catchError((e: HttpErrorResponse) => {
      if (conToken !== req && (e.status === 401 || e.status === 403)) {
        auth.iCerrarSesion();
        router.navigate(['/grupo4/login'], { queryParams: { expirada: 1 } });
      }
      return throwError(() => e);
    })
  );
};
