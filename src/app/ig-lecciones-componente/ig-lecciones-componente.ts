import { Component, computed, inject, signal } from '@angular/core';
import { IgDatosService } from '../ig-datos';
import { IgVisorService } from '../ig-visor';
import { IgLeccion } from '../ig-modelos';
import { igNormalizar, igYoutubeId } from '../ig-utiles';
import { IgFiltrosComponente } from '../ig-filtros-componente/ig-filtros-componente';
import { IgIconoComponente } from '../ig-icono-componente/ig-icono-componente';

@Component({
  selector: 'app-ig-lecciones-componente',
  imports: [IgFiltrosComponente, IgIconoComponente],
  templateUrl: './ig-lecciones-componente.html',
  styleUrl: './ig-lecciones-componente.css'
})
export class IgLeccionesComponente {
  iDatos = inject(IgDatosService);
  private iVisor = inject(IgVisorService);

  iBusqueda = signal('');

  iFiltradas = computed(() => {
    const q = igNormalizar(this.iBusqueda());
    return this.iDatos.iLeccionesSel().filter(
      (l) => !q || igNormalizar(l.titulo).includes(q) || igNormalizar(l.descripcion ?? '').includes(q)
    );
  });

  iIdiomaNombre = computed(() => this.iDatos.iIdiomas().find((i) => i.id === this.iDatos.iIdiomaSel())?.nombre ?? '');
  iNivelNombre = computed(() => this.iDatos.iNiveles().find((n) => n.id === this.iDatos.iNivelSel())?.nombre ?? '');

  iEscribir(ev: Event): void {
    this.iBusqueda.set((ev.target as HTMLInputElement).value);
  }

  iAbrir(l: IgLeccion): void {
    if (this.iDatos.iEstadoDe(l) !== 'bloqueada') this.iVisor.abrirLeccion(l);
  }

  iMiniatura(l: IgLeccion): string | null {
    const id = igYoutubeId(l.urlContenido);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  }

  iIconoTipo(l: IgLeccion): string {
    const t = (l.tipoContenido ?? 'video').toLowerCase();
    return ['video', 'audio', 'texto', 'interactivo'].includes(t) ? t : 'video';
  }

  iTipoTexto(l: IgLeccion): string {
    const textos: Record<string, string> = { video: 'Video', audio: 'Audio', texto: 'Lectura', interactivo: 'Interactivo' };
    return textos[this.iIconoTipo(l)];
  }
}
