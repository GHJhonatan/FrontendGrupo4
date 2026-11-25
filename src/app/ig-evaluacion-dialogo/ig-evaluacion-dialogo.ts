import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IG_NOTA_MINIMA } from '../ig-config';
import { IgDatosService } from '../ig-datos';
import { IgEvaluacion, IgOpcion, IgPregunta } from '../ig-modelos';
import { igNormalizar, igNormalizarVF } from '../ig-utiles';
import { IgIconoComponente } from '../ig-icono-componente/ig-icono-componente';

interface IgVista { pregunta: IgPregunta; opciones: IgOpcion[]; modo: 'opciones' | 'vf' | 'texto'; }
interface IgDetalle { enunciado: string; tuya: string; correcta: string; acierto: boolean; }
interface IgResumenEval { correctas: number; total: number; puntaje: number; aprobada: boolean; detalle: IgDetalle[]; }

@Component({
  selector: 'app-ig-evaluacion-dialogo',
  imports: [MatDialogModule, MatButtonModule, IgIconoComponente],
  templateUrl: './ig-evaluacion-dialogo.html',
  styleUrl: './ig-evaluacion-dialogo.css'
})
export class IgEvaluacionDialogo implements OnInit {
  iEval = inject<IgEvaluacion>(MAT_DIALOG_DATA);
  private iDatos = inject(IgDatosService);
  private iAviso = inject(MatSnackBar);

  iNotaMinima = IG_NOTA_MINIMA;
  iCargando = signal(true);
  iError = signal<string | null>(null);
  iGuardando = signal(false);
  iVistas = signal<IgVista[]>([]);
  iRespuestas = signal<Record<number, string>>({});
  iResultado = signal<IgResumenEval | null>(null);

  iRespondidas = computed(() => this.iVistas().filter((v) => (this.iRespuestas()[v.pregunta.id] ?? '').trim() !== '').length);

  ngOnInit(): void {
    this.iDatos.iPreguntasDe(this.iEval.id).subscribe({
      next: ({ preguntas, opciones }) => {
        this.iVistas.set(
          preguntas.map((p) => {
            const ops = opciones.filter((o) => o.pregunta?.id === p.id);
            const tipo = (p.tipo ?? '').toLowerCase();
            const modo: IgVista['modo'] = ops.length ? 'opciones' : tipo.includes('verdadero') ? 'vf' : 'texto';
            return { pregunta: p, opciones: ops, modo };
          })
        );
        this.iCargando.set(false);
      },
      error: () => {
        this.iError.set('No se pudieron cargar las preguntas.');
        this.iCargando.set(false);
      }
    });
  }

  iResponder(id: number, valor: string): void {
    this.iRespuestas.update((r) => ({ ...r, [id]: valor }));
  }

  iEscribir(id: number, ev: Event): void {
    this.iResponder(id, (ev.target as HTMLInputElement).value);
  }

  iReintentar(): void {
    this.iRespuestas.set({});
    this.iResultado.set(null);
  }

  iEnviar(): void {
    const respuestas = this.iRespuestas();
    const detalle: IgDetalle[] = this.iVistas().map((v) => {
      const r = respuestas[v.pregunta.id] ?? '';
      return { enunciado: v.pregunta.enunciado, tuya: this.iTextoRespuesta(v, r), correcta: this.iTextoCorrecto(v), acierto: this.iEsCorrecta(v, r) };
    });
    const correctas = detalle.filter((d) => d.acierto).length;
    const total = detalle.length;
    const puntaje = total ? Math.round((correctas * 10000) / total) / 100 : 0;
    const aprobada = puntaje >= IG_NOTA_MINIMA;

    this.iGuardando.set(true);
    this.iDatos.iGuardarResultado({
      evaluacionId: this.iEval.id,
      respuestasCorrectas: correctas,
      totalPreguntas: total,
      puntajePorcentaje: puntaje,
      aprobada,
      estado: 'COMPLETADA',
      fecha: this.iDatos.iAhora()
    }).subscribe({
      next: () => {
        this.iResultado.set({ correctas, total, puntaje, aprobada, detalle });
        this.iGuardando.set(false);
      },
      error: () => {
        this.iGuardando.set(false);
        this.iAviso.open('No se pudo guardar tu resultado. Inténtalo de nuevo.', 'Cerrar', { duration: 4000 });
      }
    });
  }

  private iEsCorrecta(v: IgVista, r: string): boolean {
    const correcta = v.pregunta.respuestaCorrecta ?? '';
    if (v.modo === 'opciones') {
      const op = v.opciones.find((o) => String(o.id) === r);
      if (!op) return false;
      if (v.opciones.some((o) => o.esCorrecta)) return op.esCorrecta === true;
      return igNormalizar(op.textoOpcion) === igNormalizar(correcta);
    }
    if (v.modo === 'vf') return igNormalizarVF(r) === igNormalizarVF(correcta);
    return igNormalizar(r) === igNormalizar(correcta);
  }

  private iTextoCorrecto(v: IgVista): string {
    if (v.modo === 'opciones') return v.opciones.find((o) => o.esCorrecta)?.textoOpcion ?? v.pregunta.respuestaCorrecta ?? '';
    return v.pregunta.respuestaCorrecta ?? '';
  }

  private iTextoRespuesta(v: IgVista, r: string): string {
    if (v.modo === 'opciones') return v.opciones.find((o) => String(o.id) === r)?.textoOpcion ?? '';
    if (v.modo === 'vf') return r === 'verdadero' ? 'Verdadero' : r === 'falso' ? 'Falso' : '';
    return r;
  }
}
