import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap, tap, throwError } from 'rxjs';
import { IG_API_URL } from './ig-config';
import { IgAuthService } from './ig-auth';
import {
  IgEstadoEvaluacion, IgEstadoLeccion, IgEvaluacion, IgIdioma, IgLeccion, IgNivel,
  IgOpcion, IgPregunta, IgProgreso, IgResultado
} from './ig-modelos';
import { igAhora } from './ig-utiles';

@Injectable({ providedIn: 'root' })
export class IgDatosService {
  private iHttp = inject(HttpClient);
  private iAuth = inject(IgAuthService);

  iIdiomas = signal<IgIdioma[]>([]);
  iNiveles = signal<IgNivel[]>([]);
  iLecciones = signal<IgLeccion[]>([]);
  iEvaluaciones = signal<IgEvaluacion[]>([]);
  iProgresos = signal<IgProgreso[]>([]);
  iResultados = signal<IgResultado[]>([]);

  iCargando = signal(false);
  iError = signal<string | null>(null);

  // Idioma y nivel elegidos (se comparten entre Lecciones, Evaluaciones y Mi progreso)
  iIdiomaSel = signal<number | null>(null);
  iNivelSel = signal<number | null>(null);

  constructor() {
    effect(() => {
      if (!this.iAuth.iSesion()) this.iLimpiar();
    });
  }

  // ---------- Carga ----------
  iCargar(): void {
    if (!this.iAuth.iTieneCuenta() || this.iCargando()) return;
    this.iCargando.set(true);
    this.iError.set(null);
    let fallos = 0;

    const lista = <T>(ruta: string): Observable<T[]> =>
      this.iHttp.get<T[]>(`${IG_API_URL}${ruta}`).pipe(
        catchError(() => {
          fallos++;
          return of([] as T[]);
        })
      );

    this.iAuth.iCargarPerfil().pipe(
      switchMap(() => {
        const uid = this.iAuth.iSesion()?.usuarioId;
        return forkJoin({
          idiomas: lista<IgIdioma>('/api/idiomas'),
          niveles: lista<IgNivel>('/api/niveles'),
          lecciones: lista<IgLeccion>('/api/lecciones'),
          evaluaciones: lista<IgEvaluacion>('/api/evaluaciones'),
          progresos: uid ? lista<IgProgreso>(`/api/progreso-lecciones/usuario/${uid}`) : of([] as IgProgreso[]),
          resultados: uid ? lista<IgResultado>(`/api/resultados-evaluacion/usuario/${uid}`) : of([] as IgResultado[])
        });
      })
    ).subscribe((r) => {
      this.iIdiomas.set(r.idiomas);
      this.iNiveles.set([...r.niveles].sort((a, b) => a.orden - b.orden));
      this.iLecciones.set(r.lecciones);
      this.iEvaluaciones.set(r.evaluaciones);
      this.iProgresos.set(r.progresos);
      this.iResultados.set(r.resultados);
      this.iElegirPorDefecto();
      if (fallos >= 4) this.iError.set('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
      this.iCargando.set(false);
    });
  }

  iReintentar(): void {
    this.iCargando.set(false);
    this.iCargar();
  }

  private iElegirPorDefecto(): void {
    const idiomas = this.iIdiomas();
    if (!idiomas.some((i) => i.id === this.iIdiomaSel())) {
      const conLecciones = idiomas.find((i) => this.iLecciones().some((l) => l.idioma?.id === i.id));
      this.iIdiomaSel.set((conLecciones ?? idiomas[0])?.id ?? null);
    }
    const niveles = this.iNiveles();
    if (!niveles.some((n) => n.id === this.iNivelSel())) this.iNivelSel.set(niveles[0]?.id ?? null);
  }

  private iLimpiar(): void {
    this.iIdiomas.set([]); this.iNiveles.set([]); this.iLecciones.set([]);
    this.iEvaluaciones.set([]); this.iProgresos.set([]); this.iResultados.set([]);
    this.iIdiomaSel.set(null); this.iNivelSel.set(null);
    this.iError.set(null); this.iCargando.set(false);
  }

  // ---------- Lecciones ----------
  iLeccionesOrdenadas = computed(() =>
    [...this.iLecciones()].sort(
      (a, b) =>
        (a.idioma?.id ?? 0) - (b.idioma?.id ?? 0) ||
        (a.nivel?.orden ?? 0) - (b.nivel?.orden ?? 0) ||
        (a.orden ?? 0) - (b.orden ?? 0)
    )
  );

  iMapaProgreso = computed(() => {
    const mapa = new Map<number, IgProgreso>();
    for (const p of this.iProgresos()) {
      const previo = mapa.get(p.leccionId);
      if (!previo || (p.id ?? 0) > (previo.id ?? 0)) mapa.set(p.leccionId, p);
    }
    return mapa;
  });

  // Una lección se desbloquea cuando la anterior (mismo idioma y nivel) está completada
  iEstados = computed(() => {
    const estados = new Map<number, IgEstadoLeccion>();
    const progreso = this.iMapaProgreso();
    let grupo = '';
    let anteriorCompleta = true;
    for (const l of this.iLeccionesOrdenadas()) {
      const clave = `${l.idioma?.id}-${l.nivel?.id}`;
      if (clave !== grupo) {
        grupo = clave;
        anteriorCompleta = true;
      }
      const p = progreso.get(l.id);
      let estado: IgEstadoLeccion;
      if (p?.estado === 'COMPLETADA') estado = 'completada';
      else if (p?.estado === 'EN_PROGRESO') estado = 'en_progreso';
      else estado = anteriorCompleta ? 'disponible' : 'bloqueada';
      estados.set(l.id, estado);
      anteriorCompleta = estado === 'completada';
    }
    return estados;
  });

  iEstadoDe(l: IgLeccion): IgEstadoLeccion {
    return this.iEstados().get(l.id) ?? 'bloqueada';
  }

  iPorcentajeDe(l: IgLeccion): number {
    const estado = this.iEstadoDe(l);
    if (estado === 'completada') return 100;
    if (estado === 'en_progreso') return Math.round(Number(this.iMapaProgreso().get(l.id)?.porcentajeAvance ?? 0));
    return 0;
  }

  iLeccionesSel = computed(() =>
    this.iLeccionesOrdenadas().filter((l) => l.idioma?.id === this.iIdiomaSel() && l.nivel?.id === this.iNivelSel())
  );

  // ---------- Evaluaciones ----------
  iMapaResultado = computed(() => {
    const mapa = new Map<number, IgResultado>();
    for (const r of this.iResultados()) {
      const previo = mapa.get(r.evaluacionId);
      if (!previo || (r.id ?? 0) > (previo.id ?? 0)) mapa.set(r.evaluacionId, r);
    }
    return mapa;
  });

  iEstadoEval(e: IgEvaluacion): IgEstadoEvaluacion {
    const r = this.iMapaResultado().get(e.id);
    if (!r) return 'pendiente';
    if (r.estado === 'COMPLETADA') return 'completada';
    if (r.estado === 'EN_PROGRESO') return 'en_progreso';
    return 'pendiente';
  }

  iResultadoDe(e: IgEvaluacion): IgResultado | undefined {
    return this.iMapaResultado().get(e.id);
  }

  iEvaluacionesSel = computed(() =>
    this.iEvaluaciones()
      .filter((e) => e.leccion?.idioma?.id === this.iIdiomaSel() && e.leccion?.nivel?.id === this.iNivelSel())
      .sort((a, b) => (a.leccion?.orden ?? 0) - (b.leccion?.orden ?? 0))
  );

  // ---------- Resúmenes ----------
  iResumen = computed(() => {
    const ls = this.iLeccionesSel();
    const es = this.iEvaluacionesSel();
    const completadas = ls.filter((l) => this.iEstadoDe(l) === 'completada').length;
    const mapaP = this.iMapaProgreso();
    const tiempoMin = ls.reduce((s, l) => s + (mapaP.get(l.id)?.tiempoEstudioMin ?? 0), 0);
    const mapaR = this.iMapaResultado();
    const hechas = es.map((e) => mapaR.get(e.id)).filter((r): r is IgResultado => !!r && r.estado === 'COMPLETADA');
    const promedio = hechas.length ? Math.round(hechas.reduce((s, r) => s + Number(r.puntajePorcentaje ?? 0), 0) / hechas.length) : 0;
    return {
      totalLecciones: ls.length,
      completadas,
      pctLecciones: ls.length ? Math.round((completadas * 100) / ls.length) : 0,
      tiempoMin,
      totalEvaluaciones: es.length,
      realizadas: hechas.length,
      aprobadas: hechas.filter((r) => r.aprobada).length,
      promedio
    };
  });

  iResumenGlobal = computed(() => {
    const ls = this.iLecciones();
    const completadas = ls.filter((l) => this.iEstadoDe(l) === 'completada').length;
    const realizadas = this.iResultados().filter((r) => r.estado === 'COMPLETADA');
    return {
      totalLecciones: ls.length,
      completadas,
      pct: ls.length ? Math.round((completadas * 100) / ls.length) : 0,
      evaluaciones: new Set(realizadas.map((r) => r.evaluacionId)).size
    };
  });

  // ---------- Escritura ----------
  iAhora(): string {
    return igAhora();
  }

  iGuardarProgreso(l: IgLeccion, cambios: Partial<IgProgreso>): Observable<IgProgreso> {
    const uid = this.iAuth.iSesion()?.usuarioId;
    if (!uid) return throwError(() => new Error('Sin usuario'));
    const actual = this.iMapaProgreso().get(l.id);
    const cuerpo: IgProgreso = {
      id: actual?.id,
      usuarioId: uid,
      leccionId: l.id,
      estado: actual?.estado ?? 'EN_PROGRESO',
      porcentajeAvance: actual?.porcentajeAvance ?? 0,
      tiempoEstudioMin: actual?.tiempoEstudioMin ?? 0,
      fechaInicio: actual?.fechaInicio ?? this.iAhora(),
      fechaCompletado: actual?.fechaCompletado ?? null,
      ...cambios
    };
    const peticion = actual?.id
      ? this.iHttp.put<IgProgreso>(`${IG_API_URL}/api/progreso-lecciones/${actual.id}`, cuerpo)
      : this.iHttp.post<IgProgreso>(`${IG_API_URL}/api/progreso-lecciones`, cuerpo);
    return peticion.pipe(
      tap((g) => this.iProgresos.update((lista) => [...lista.filter((p) => p.leccionId !== g.leccionId), g]))
    );
  }

  iSumarTiempo(l: IgLeccion, minutos: number): void {
    const actual = this.iMapaProgreso().get(l.id);
    if (!actual || minutos <= 0) return;
    this.iGuardarProgreso(l, { tiempoEstudioMin: (actual.tiempoEstudioMin ?? 0) + minutos }).subscribe({ error: () => undefined });
  }

  iGuardarResultado(r: Omit<IgResultado, 'id' | 'usuarioId'>): Observable<IgResultado> {
    const uid = this.iAuth.iSesion()?.usuarioId;
    if (!uid) return throwError(() => new Error('Sin usuario'));
    return this.iHttp.post<IgResultado>(`${IG_API_URL}/api/resultados-evaluacion`, { ...r, usuarioId: uid }).pipe(
      tap((g) => this.iResultados.update((lista) => [...lista, g]))
    );
  }

  iPreguntasDe(evaluacionId: number): Observable<{ preguntas: IgPregunta[]; opciones: IgOpcion[] }> {
    return forkJoin({
      preguntas: this.iHttp.get<IgPregunta[]>(`${IG_API_URL}/api/preguntas-evaluacion`),
      opciones: this.iHttp.get<IgOpcion[]>(`${IG_API_URL}/api/opciones-pregunta`)
    }).pipe(
      map((r) => ({ preguntas: r.preguntas.filter((p) => p.evaluacion?.id === evaluacionId), opciones: r.opciones }))
    );
  }
}
