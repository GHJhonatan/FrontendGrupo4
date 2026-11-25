import { Component, computed, inject, input } from '@angular/core';
import { IgDatosService } from '../ig-datos';

@Component({
  selector: 'app-ig-filtros',
  imports: [],
  templateUrl: './ig-filtros-componente.html',
  styleUrl: './ig-filtros-componente.css'
})
export class IgFiltrosComponente {
  iDatos = inject(IgDatosService);
  modo = input<'lecciones' | 'evaluaciones' | 'progreso'>('lecciones');

  iPct = computed(() => (this.modo() === 'evaluaciones' ? this.iDatos.iResumen().promedio : this.iDatos.iResumen().pctLecciones));
  iDash = computed(() => `${(this.iPct() / 100) * 213.63} 213.63`);
  iTitulo = computed(() => (this.modo() === 'evaluaciones' ? 'Tu desempeño' : 'Progreso general'));
  iLeyenda = computed(() => (this.modo() === 'evaluaciones' ? 'Promedio general' : 'Completado'));
  iDetalle = computed(() => {
    const r = this.iDatos.iResumen();
    return this.modo() === 'evaluaciones'
      ? `${r.aprobadas} de ${r.totalEvaluaciones} evaluaciones aprobadas`
      : `${r.completadas} de ${r.totalLecciones} lecciones`;
  });
  iAnimo = computed(() => {
    switch (this.modo()) {
      case 'evaluaciones': return ['¡Sigue practicando!', 'Cada evaluación te acerca más a dominar el idioma.'];
      case 'progreso': return ['¡Sigue aprendiendo!', 'La constancia te acerca a tus metas.'];
      default: return ['¡Sigue aprendiendo!', 'Cada lección te acerca más a dominar un nuevo idioma.'];
    }
  });
}
