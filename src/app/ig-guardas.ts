import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IgAuthService } from './ig-auth';

// Cualquier sesión (cuenta o invitado)
export const igSesionGuard: CanActivateFn = () =>
  inject(IgAuthService).iLogueado() ? true : inject(Router).createUrlTree(['/grupo4/login']);

// Solo con cuenta real (las páginas que usan datos del servidor)
export const igCuentaGuard: CanActivateFn = () =>
  inject(IgAuthService).iTieneCuenta() ? true : inject(Router).createUrlTree(['/grupo4/login'], { queryParams: { necesita: 1 } });

// Login y registro: si ya hay cuenta, ir al inicio
export const igPublicoGuard: CanActivateFn = () =>
  inject(IgAuthService).iTieneCuenta() ? inject(Router).createUrlTree(['/grupo4/inicio']) : true;
