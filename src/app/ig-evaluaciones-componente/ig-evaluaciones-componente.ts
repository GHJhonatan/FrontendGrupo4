import { Component, computed, inject, signal } from '@angular/core';
import { IgDatosService } from '../ig-datos';
import { IgVisorService } from '../ig-visor';
import { IgEvaluacion } from '../ig-modelos';
import { igNormalizar } from '../ig-utiles';
import { IgFiltrosComponente } from '../ig-filtros-componente/ig-filtros-componente';
import { IgIconoComponente } from '../ig-icono-componente/ig-icono-componente';

type IgPestana = 'todas' | 'pendientes' | 'completadas';

@Component({
  selector: 'app-ig-evaluaciones-componente',
  imports: [IgFiltrosComponente, IgIconoComponente],
  templateUrl: './ig-evaluaciones-componente.html',
  styleUrl: './ig-evaluaciones-componente.css'
})
export class IgEvaluacionesComponente {
  iDatos = inject(IgDatosService);
  private iVisor = inject(IgVisorService);

  iPestana = signal<IgPestana>('todas');
  iBusqueda = signal('');
  iPestanas: { id: IgPestana; texto: string }[] = [
    { id: 'todas', texto: 'Todas' },
    { id: 'pendientes', texto: 'Pendientes' },
    { id: 'completadas', texto: 'Completadas' }
  ];

  iLista = computed(() => {
    const q = igNormalizar(this.iBusqueda());
    const pestana = this.iPestana();
    return this.iDatos.iEvaluacionesSel().filter((e) => {
      const estado = this.iDatos.iEstadoEval(e);
      if (pestana === 'pendientes' && estado === 'completada') return false;
      if (pestana === 'completadas' && estado !== 'completada') return false;
      return !q || igNormalizar(e.titulo).includes(q);
    });
  });

  iIdiomaNombre = computed(() => this.iDatos.iIdiomas().find((i) => i.id === this.iDatos.iIdiomaSel())?.nombre ?? '');
  iNivelNombre = computed(() => this.iDatos.iNiveles().find((n) => n.id === this.iDatos.iNivelSel())?.nombre ?? '');

  iEscribir(ev: Event): void {
    this.iBusqueda.set((ev.target as HTMLInputElement).value);
  }

  iAbrir(e: IgEvaluacion): void {
    this.iVisor.abrirEvaluacion(e);
  }
}
