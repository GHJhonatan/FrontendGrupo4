import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IgDatosService } from '../ig-datos';
import { IgLeccion } from '../ig-modelos';
import { igYoutubeId } from '../ig-utiles';
import { IgIconoComponente } from '../ig-icono-componente/ig-icono-componente';

@Component({
  selector: 'app-ig-leccion-dialogo',
  imports: [MatDialogModule, MatButtonModule, IgIconoComponente],
  templateUrl: './ig-leccion-dialogo.html',
  styleUrl: './ig-leccion-dialogo.css'
})
export class IgLeccionDialogo implements OnInit, OnDestroy {
  iLeccion = inject<IgLeccion>(MAT_DIALOG_DATA);
  private iRef = inject(MatDialogRef<IgLeccionDialogo>);
  private iDatos = inject(IgDatosService);
  private iSanitizador = inject(DomSanitizer);
  private iAviso = inject(MatSnackBar);
  private iInicio = Date.now();

  iEstado = computed(() => this.iDatos.iEstadoDe(this.iLeccion));
  iGuardando = signal(false);
  iYoutube: SafeResourceUrl | null = null;
  iTipo = (this.iLeccion.tipoContenido ?? 'video').toLowerCase();
  iUrl = this.iLeccion.urlContenido ?? '';

  ngOnInit(): void {
    const id = igYoutubeId(this.iUrl);
    if (id) this.iYoutube = this.iSanitizador.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);

    // Al abrir la lección queda "en progreso"
    if (this.iEstado() !== 'completada') {
      const pct = Math.max(10, this.iDatos.iPorcentajeDe(this.iLeccion));
      this.iDatos.iGuardarProgreso(this.iLeccion, { estado: 'EN_PROGRESO', porcentajeAvance: pct }).subscribe({ error: () => undefined });
    }
  }

  iCompletar(): void {
    this.iGuardando.set(true);
    this.iDatos.iGuardarProgreso(this.iLeccion, { estado: 'COMPLETADA', porcentajeAvance: 100, fechaCompletado: this.iDatos.iAhora() }).subscribe({
      next: () => {
        this.iAviso.open('¡Lección completada!', 'Cerrar', { duration: 3000 });
        this.iRef.close(true);
      },
      error: () => {
        this.iGuardando.set(false);
        this.iAviso.open('No se pudo guardar tu progreso. Inténtalo de nuevo.', 'Cerrar', { duration: 4000 });
      }
    });
  }

  ngOnDestroy(): void {
    // Suma el tiempo que estuviste en la lección
    this.iDatos.iSumarTiempo(this.iLeccion, Math.round((Date.now() - this.iInicio) / 60000));
  }
}
