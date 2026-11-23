import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { IG_API_URL, IG_ROL_ESTUDIANTE_ID } from './ig-config';
import { IgSesion, IgTipoUsuario, IgUsuario } from './ig-modelos';

const CLAVE = 'indilingua_sesion';

@Injectable({ providedIn: 'root' })
export class IgAuthService {
  private iHttp = inject(HttpClient);

  iSesion = signal<IgSesion | null>(this.iLeer());

  iLogueado = computed(() => this.iSesion() !== null);
  iEsInvitado = computed(() => this.iSesion()?.invitado === true);
  iTieneCuenta = computed(() => {
    const s = this.iSesion();
    return !!s && !s.invitado && !!s.token;
  });

  // Según el rol que devuelve el backend al iniciar sesión
  iTipo = computed<IgTipoUsuario>(() => {
    const s = this.iSesion();
    if (!s || s.invitado) return 'invitado';
    const rol = (s.rol ?? '').toUpperCase();
    if (/DOCENTE|MAESTRO|PROFESOR|TEACHER/.test(rol)) return 'maestro';
    if (/ADMIN/.test(rol)) return 'administrador';
    return 'estudiante';
  });

  iEtiquetaRol = computed(() => {
    const etiquetas: Record<IgTipoUsuario, string> = {
      estudiante: 'Estudiante', maestro: 'Maestro', administrador: 'Administrador', invitado: 'Invitado'
    };
    return etiquetas[this.iTipo()];
  });

  iIconoUsuario = computed(() => (this.iTipo() === 'maestro' || this.iTipo() === 'administrador' ? 'maestro' : 'usuario'));

  iIniciarSesion(correo: string, password: string, recordar: boolean): Observable<void> {
    return this.iHttp.post<{ token: string; correo: string; rol: string }>(`${IG_API_URL}/api/auth/login`, { correo, password }).pipe(
      tap((r) => this.iGuardar({ token: r.token, correo: r.correo, rol: r.rol, nombre: r.correo, usuarioId: null, invitado: false, recordar })),
      switchMap(() => this.iCargarPerfil()),
      map(() => undefined)
    );
  }

  // Busca el id y el nombre del usuario (el login solo devuelve correo y rol)
  iCargarPerfil(): Observable<null> {
    const s = this.iSesion();
    if (!s || s.invitado || s.usuarioId !== null) return of(null);
    return this.iHttp.get<IgUsuario[]>(`${IG_API_URL}/api/usuarios`).pipe(
      tap((lista) => {
        const u = lista.find((x) => x.correo?.toLowerCase() === s.correo.toLowerCase());
        if (u) this.iGuardar({ ...s, usuarioId: u.id, nombre: `${u.nombres} ${u.apellidos}`.trim() });
      }),
      map(() => null),
      catchError(() => of(null))
    );
  }

  iRegistrar(d: { nombres: string; apellidos: string; correo: string; password: string }): Observable<unknown> {
    return this.iHttp.post(`${IG_API_URL}/api/usuarios`, {
      nombres: d.nombres, apellidos: d.apellidos, correo: d.correo,
      passwordHash: d.password, rolId: IG_ROL_ESTUDIANTE_ID, estado: 'activo'
    });
  }

  iEntrarInvitado(): void {
    this.iGuardar({ token: null, correo: '', rol: 'INVITADO', nombre: 'Invitado', usuarioId: null, invitado: true, recordar: false });
  }

  iCerrarSesion(): void {
    this.iBorrar();
    this.iSesion.set(null);
  }

  private iGuardar(sesion: IgSesion): void {
    this.iBorrar();
    try {
      (sesion.recordar ? localStorage : sessionStorage).setItem(CLAVE, JSON.stringify(sesion));
    } catch { /* almacenamiento no disponible */ }
    this.iSesion.set(sesion);
  }

  private iBorrar(): void {
    try {
      localStorage.removeItem(CLAVE);
      sessionStorage.removeItem(CLAVE);
    } catch { /* ignorar */ }
  }

  private iLeer(): IgSesion | null {
    try {
      const crudo = localStorage.getItem(CLAVE) ?? sessionStorage.getItem(CLAVE);
      if (!crudo) return null;
      const s = JSON.parse(crudo) as IgSesion;
      if (!s.invitado && (!s.token || this.iExpirado(s.token))) {
        this.iBorrar();
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }

  private iExpirado(token: string): boolean {
    try {
      const carga = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return carga.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
