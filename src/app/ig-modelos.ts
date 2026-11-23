export interface IgIdioma { id: number; nombre: string; descripcion?: string | null; iconoUrl?: string | null; }
export interface IgNivel { id: number; nombre: string; orden: number; }

export interface IgLeccion {
  id: number;
  idioma: IgIdioma;
  nivel: IgNivel;
  titulo: string;
  descripcion?: string | null;
  tipoContenido?: string | null;
  urlContenido?: string | null;
  duracionMin?: number | null;
  orden?: number | null;
}

export interface IgEvaluacion {
  id: number;
  leccion: IgLeccion;
  titulo: string;
  cantidadPreguntas?: number | null;
  duracionMin?: number | null;
}

export interface IgPregunta { id: number; evaluacion: { id: number }; enunciado: string; tipo?: string | null; respuestaCorrecta?: string | null; }
export interface IgOpcion { id: number; pregunta: { id: number }; textoOpcion: string; esCorrecta?: boolean | null; }

export type IgEstadoProgreso = 'BLOQUEADA' | 'EN_PROGRESO' | 'COMPLETADA';
export type IgEstadoLeccion = 'completada' | 'en_progreso' | 'disponible' | 'bloqueada';
export type IgEstadoEvaluacion = 'completada' | 'en_progreso' | 'pendiente';

export interface IgProgreso {
  id?: number;
  usuarioId: number;
  leccionId: number;
  estado: IgEstadoProgreso;
  porcentajeAvance?: number | null;
  tiempoEstudioMin?: number | null;
  fechaInicio?: string | null;
  fechaCompletado?: string | null;
}

export interface IgResultado {
  id?: number;
  usuarioId: number;
  evaluacionId: number;
  respuestasCorrectas?: number | null;
  totalPreguntas?: number | null;
  puntajePorcentaje?: number | null;
  aprobada?: boolean | null;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';
  fecha?: string | null;
}

export interface IgUsuario { id: number; nombres: string; apellidos: string; correo: string; rol?: { id: number; nombre: string } | null; estado?: string; }

export interface IgSesion {
  token: string | null;
  correo: string;
  rol: string;
  nombre: string;
  usuarioId: number | null;
  invitado: boolean;
  recordar: boolean;
}

export type IgTipoUsuario = 'estudiante' | 'maestro' | 'administrador' | 'invitado';
