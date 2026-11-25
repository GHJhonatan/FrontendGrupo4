import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { IgAuthService } from '../ig-auth';
import { IgDatosService } from '../ig-datos';
import { IgVisorService } from '../ig-visor';
import { IgLeccion } from '../ig-modelos';
import { IgIconoComponente } from '../ig-icono-componente/ig-icono-componente';

interface IgNivelChip { id: number; nombre: string; }
interface IgTarjeta { id: number; nombre: string; descripcion: string; tema: 'quechua' | 'aymara'; niveles: IgNivelChip[]; }
interface IgTexto { icono?: string; titulo: string; texto: string; }

// Lo que ve un invitado (sin conexión a datos)
const IG_DEMO: IgTarjeta[] = [
  { id: 0, nombre: 'Quechua', descripcion: 'Aprende Quechua desde cero con lecciones organizadas por niveles.', tema: 'quechua', niveles: [{ id: 0, nombre: 'Básico' }, { id: 0, nombre: 'Intermedio' }] },
  { id: 0, nombre: 'Aymara', descripcion: 'Aprende Aymara desde cero con lecciones organizadas por niveles.', tema: 'aymara', niveles: [{ id: 0, nombre: 'Básico' }, { id: 0, nombre: 'Intermedio' }] }
];

@Component({
  selector: 'app-ig-inicio-componente',
  imports: [MatButtonModule, IgIconoComponente],
  templateUrl: './ig-inicio-componente.html',
  styleUrl: './ig-inicio-componente.css'
})
export class IgInicioComponente {
  iDatos = inject(IgDatosService);
  iAuth = inject(IgAuthService);
  private iVisor = inject(IgVisorService);
  private iRouter = inject(Router);

  iTarjetas = computed<IgTarjeta[]>(() => {
    if (!this.iAuth.iTieneCuenta()) return IG_DEMO;
    return this.iDatos.iIdiomas().map((i) => ({
      id: i.id,
      nombre: i.nombre,
      descripcion: i.descripcion || `Aprende ${i.nombre} desde cero con lecciones organizadas por niveles.`,
      tema: /aymara/i.test(i.nombre) ? 'aymara' : 'quechua',
      niveles: this.iNivelesDe(i.id)
    }));
  });

  // Lección en la que el estudiante se quedó (o la siguiente disponible)
  iContinuar = computed(() => {
    if (!this.iAuth.iTieneCuenta()) return null;
    const ls = this.iDatos.iLeccionesOrdenadas();
    const prog = this.iDatos.iMapaProgreso();
    const enProgreso = ls
      .filter((l) => this.iDatos.iEstadoDe(l) === 'en_progreso')
      .sort((a, b) => (prog.get(b.id)?.id ?? 0) - (prog.get(a.id)?.id ?? 0));
    const leccion = enProgreso[0] ?? ls.find((l) => this.iDatos.iEstadoDe(l) === 'disponible');
    if (!leccion) return null;
    const grupo = ls.filter((l) => l.idioma?.id === leccion.idioma?.id && l.nivel?.id === leccion.nivel?.id);
    const hechas = grupo.filter((l) => this.iDatos.iEstadoDe(l) === 'completada').length;
    return { leccion, empezada: enProgreso.length > 0, pct: grupo.length ? Math.round((hechas * 100) / grupo.length) : 0 };
  });

  iSinContinuar = computed(() =>
    this.iDatos.iLecciones().length ? '¡Has completado todas las lecciones disponibles!' : 'Aún no hay lecciones disponibles.'
  );

  iTiles = computed(() => {
    const g = this.iDatos.iResumenGlobal();
    return [
      { icono: 'libro', valor: `${g.completadas}`, detalle: `de ${g.totalLecciones}`, etiqueta: 'Lecciones completadas', tono: 'verde' },
      { icono: 'evaluacion', valor: `${g.evaluaciones}`, detalle: '', etiqueta: 'Evaluaciones realizadas', tono: 'naranja' },
      { icono: 'grafico', valor: `${g.pct}%`, detalle: '', etiqueta: 'Progreso general', tono: 'verde' }
    ];
  });

  iPasos: IgTexto[] = [
    { titulo: 'Elige tu idioma y nivel', texto: 'Selecciona Quechua o Aymara y decide por qué nivel quieres comenzar.' },
    { titulo: 'Aprende con las lecciones', texto: 'Disfruta de contenidos multimedia diseñados para un aprendizaje efectivo.' },
    { titulo: 'Evalúa lo aprendido', texto: 'Completa cuestionarios al final de cada lección para validar lo aprendido.' },
    { titulo: 'Revisa tu progreso', texto: 'Consulta tus lecciones completadas y los resultados de tus evaluaciones.' }
  ];

  iRecursos: IgTexto[] = [
    { icono: 'libro', titulo: 'Lecciones por niveles', texto: 'Contenidos estructurados pedagógicamente para facilitar la comprensión desde cero.' },
    { icono: 'video', titulo: 'Material multimedia', texto: 'Audios de hablantes nativos y videos explicativos para una experiencia inmersiva.' },
    { icono: 'evaluacion', titulo: 'Evaluaciones', texto: 'Pruebas dinámicas para poner a prueba tus conocimientos y tu vocabulario.' },
    { icono: 'grafico', titulo: 'Seguimiento del progreso', texto: 'Visualiza tus logros y mantén la motivación viendo cuánto has avanzado.' }
  ];

  private iNivelesDe(idiomaId: number): IgNivelChip[] {
    const usados = new Map<number, IgNivelChip & { orden: number }>();
    for (const l of this.iDatos.iLecciones()) {
      if (l.idioma?.id === idiomaId && l.nivel) usados.set(l.nivel.id, { id: l.nivel.id, nombre: l.nivel.nombre, orden: l.nivel.orden });
    }
    const lista = usados.size ? [...usados.values()].sort((a, b) => a.orden - b.orden) : this.iDatos.iNiveles();
    return lista.map((n) => ({ id: n.id, nombre: n.nombre }));
  }

  // "Comenzar a aprender" y "Ver lecciones": si no hay cuenta, la guarda lleva al login
  iIr(idiomaId?: number, nivelId?: number): void {
    if (idiomaId) this.iDatos.iIdiomaSel.set(idiomaId);
    if (nivelId) this.iDatos.iNivelSel.set(nivelId);
    this.iRouter.navigate(['/grupo4/lecciones']);
  }

  iContinuarLeccion(l: IgLeccion): void {
    this.iVisor.abrirLeccion(l);
  }

  iIniciarSesion(): void {
    this.iAuth.iCerrarSesion();
    this.iRouter.navigate(['/grupo4/login']);
  }
}
