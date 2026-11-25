import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IgEvaluacion, IgLeccion } from './ig-modelos';
import { IgLeccionDialogo } from './ig-leccion-dialogo/ig-leccion-dialogo';
import { IgEvaluacionDialogo } from './ig-evaluacion-dialogo/ig-evaluacion-dialogo';

@Injectable({ providedIn: 'root' })
export class IgVisorService {
  private iDialogo = inject(MatDialog);

  abrirLeccion(leccion: IgLeccion) {
    return this.iDialogo.open(IgLeccionDialogo, { data: leccion, width: '880px', maxWidth: '95vw', autoFocus: false }).afterClosed();
  }

  abrirEvaluacion(evaluacion: IgEvaluacion) {
    return this.iDialogo.open(IgEvaluacionDialogo, { data: evaluacion, width: '720px', maxWidth: '95vw', autoFocus: false }).afterClosed();
  }
}
