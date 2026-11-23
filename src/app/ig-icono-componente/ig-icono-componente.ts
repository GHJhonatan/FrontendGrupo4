import { Component, computed, input } from '@angular/core';
import { IG_ICONOS } from '../ig-utiles';

@Component({
  selector: 'app-ig-icono',
  template: `<svg [attr.width]="tamano()" [attr.height]="tamano()" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path [attr.d]="trazo()" /></svg>`,
  styles: [':host { display: inline-flex; line-height: 0; flex: none; }']
})
export class IgIconoComponente {
  nombre = input.required<string>();
  tamano = input(20);
  trazo = computed(() => IG_ICONOS[this.nombre()] ?? '');
}
