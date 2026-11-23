import { Routes } from '@angular/router';
import { igCuentaGuard, igPublicoGuard, igSesionGuard } from './ig-guardas';
import { IgLayoutComponente } from './ig-layout-componente/ig-layout-componente';
import { IgLoginComponente } from './ig-login-componente/ig-login-componente';
import { IgRegistroComponente } from './ig-registro-componente/ig-registro-componente';
import { IgInicioComponente } from './ig-inicio-componente/ig-inicio-componente';
import { IgLeccionesComponente } from './ig-lecciones-componente/ig-lecciones-componente';
import { IgEvaluacionesComponente } from './ig-evaluaciones-componente/ig-evaluaciones-componente';
import { IgProgresoComponente } from './ig-progreso-componente/ig-progreso-componente';

export const routes: Routes = [
  { path: '', redirectTo: 'grupo4/inicio', pathMatch: 'full' },
  { path: 'grupo4/login', component: IgLoginComponente, canActivate: [igPublicoGuard] },
  { path: 'grupo4/registro', component: IgRegistroComponente, canActivate: [igPublicoGuard] },
  {
    path: 'grupo4',
    component: IgLayoutComponente,
    canActivate: [igSesionGuard],
    children: [
      { path: 'inicio', component: IgInicioComponente },
      { path: 'lecciones', component: IgLeccionesComponente, canActivate: [igCuentaGuard] },
      { path: 'evaluaciones', component: IgEvaluacionesComponente, canActivate: [igCuentaGuard] },
      { path: 'progreso', component: IgProgresoComponente, canActivate: [igCuentaGuard] },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'grupo4/inicio' }
];
