import { Component, computed, inject } from '@angular/core';
import { IgDatosService } from '../ig-datos';
import { IgEstadoLeccion } from '../ig-modelos';
import { igFormatoTiempo } from '../ig-utiles';
import { IgFiltrosComponente } from '../ig-filtros-componente/ig-filtros-componente';
import { IgIconoComponente } from '../ig-icono-componente/ig-icono-componente';

@Component({
  selector: 'app-ig-progreso-componente',
  imports: [IgFiltrosComponente, IgIconoComponente],
  templateUrl: './ig-progreso-componente.html',
  styleUrl: './ig-progreso-componente.css'
})
export class IgProgresoComponente {
  iDatos = inject(IgDatosService);

  iIdiomaNombre = computed(() => this.iDatos.iIdiomas().find((i) => i.id === this.iDatos.iIdiomaSel())?.nombre ?? '');
  iNivelNombre = computed(() => this.iDatos.iNiveles().find((n) => n.id === this.iDatos.iNivelSel())?.nombre ?? '');
  iDash = computed(() => `${(this.iDatos.iResumen().pctLecciones / 100) * 263.9} 263.9`);
  iTiempo = computed(() => igFormatoTiempo(this.iDatos.iResumen().tiempoMin));
  iMensaje = computed(() => {
    const pct = this.iDatos.iResumen().pctLecciones;
    if (pct >= 100) return '¡Completaste este nivel! Felicitaciones.';
    if (pct > 0) return '¡Vas por buen camino! Continúa aprendiendo cada día.';
    return 'Empieza tu primera lección y comienza a avanzar.';
  });

  iChip(estado: IgEstadoLeccion): { texto: string; clase: string } {
    if (estado === 'completada') return { texto: 'Completado', clase: 'iChipOk' };
    if (estado === 'en_progreso') return { texto: 'En progreso', clase: 'iChipAzul' };
    return { texto: 'Pendiente', clase: '' };
  }
}
