export function igNormalizar(texto: string): string {
  return (texto ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Verdadero / Falso en varias escrituras posibles
export function igNormalizarVF(texto: string): string {
  const n = igNormalizar(texto);
  if (['true', 'verdadero', 'v', 'si'].includes(n)) return 'verdadero';
  if (['false', 'falso', 'f', 'no'].includes(n)) return 'falso';
  return n;
}

export function igYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export function igFormatoTiempo(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function igAhora(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// Trazos de íconos (viewBox 24x24, estilo línea)
export const IG_ICONOS: Record<string, string> = {
  libro: 'M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z',
  video: 'M6 4l14 8-14 8z',
  audio: 'M11 5L6 9H2v6h4l5 4z M15.5 8.5a5 5 0 0 1 0 7 M18.5 5.5a9 9 0 0 1 0 13',
  texto: 'M5 4h14v16H5z M9 9h6 M9 13h6 M9 17h4',
  interactivo: 'M4 4l7 17 2.5-7.5L21 11z',
  evaluacion: 'M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z M8 6H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2 M9 14l2 2 4-4',
  grafico: 'M5 20v-6 M12 20V6 M19 20v-10',
  reloj: 'M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  usuario: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5',
  maestro: 'M12 4L2 9l10 5 10-5z M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5 M22 9v6',
  salir: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4 M16 8l4 4-4 4 M20 12H9',
  cambiar: 'M16 3l4 4-4 4 M20 7H8 M8 21l-4-4 4-4 M4 17h12',
  check: 'M5 12l5 5L20 7',
  candado: 'M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3',
  flecha: 'M5 12h14 M13 6l6 6-6 6',
  chevron: 'M6 9l6 6 6-6',
  derecha: 'M9 6l6 6-6 6',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5',
  correo: 'M3 6h18v12H3z M3 7l9 7 9-7',
  ojo: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  ojoNo: 'M3 3l18 18 M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.7 M6.6 7.6C3.9 9.4 2 12 2 12s4 6 10 6c1.4 0 2.7-.3 3.8-.8',
  alerta: 'M12 8v5 M12 16.5v.5 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  info: 'M12 11v5 M12 8v.5 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  estrella: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  cerrar: 'M6 6l12 12 M18 6L6 18',
  carpeta: 'M3 6h6l2 2h10v11H3z'
};
