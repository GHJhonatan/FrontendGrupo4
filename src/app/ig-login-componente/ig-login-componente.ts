import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IgAuthService } from '../ig-auth';
import { IgIconoComponente } from '../ig-icono-componente/ig-icono-componente';

@Component({
  selector: 'app-ig-login-componente',
  imports: [ReactiveFormsModule, RouterLink, IgIconoComponente],
  templateUrl: './ig-login-componente.html',
  styleUrl: './ig-login-componente.css'
})
export class IgLoginComponente {
  private iAuth = inject(IgAuthService);
  private iRouter = inject(Router);
  private iAviso = inject(MatSnackBar);

  iVer = signal(false);
  iCargando = signal(false);
  iError = signal<string | null>(null);
  iInfo: string | null = null;

  iForm = new FormGroup({
    correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    recordar: new FormControl(false, { nonNullable: true })
  });

  constructor() {
    const q = inject(ActivatedRoute).snapshot.queryParamMap;
    if (q.get('expirada')) this.iInfo = 'Tu sesión expiró. Vuelve a iniciar sesión.';
    else if (q.get('otra')) this.iInfo = 'Ingresa con otra cuenta.';
    else if (q.get('necesita')) this.iInfo = 'Inicia sesión para ver este contenido.';
  }

  iInvalido(campo: 'correo' | 'password'): boolean {
    const c = this.iForm.controls[campo];
    return (c.invalid && c.touched) || !!this.iError();
  }

  iMensaje(campo: 'correo' | 'password'): string {
    const c = this.iForm.controls[campo];
    if (!(c.invalid && c.touched)) return '';
    return c.hasError('required') ? 'Este campo es obligatorio' : 'Ingresa un correo electrónico válido';
  }

  iEnviar(): void {
    this.iForm.markAllAsTouched();
    if (this.iForm.invalid || this.iCargando()) return;
    this.iError.set(null);
    this.iCargando.set(true);
    const { correo, password, recordar } = this.iForm.getRawValue();

    this.iAuth.iIniciarSesion(correo.trim(), password, recordar).subscribe({
      next: () => this.iRouter.navigate(['/grupo4/inicio']),
      error: (e: HttpErrorResponse) => {
        this.iCargando.set(false);
        if (e.status === 401 || e.status === 403) this.iError.set('Correo o contraseña incorrectos');
        else if (e.status === 0) this.iError.set('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
        else this.iError.set('Ocurrió un error en el servidor. Inténtalo nuevamente.');
      }
    });
  }

  iInvitado(): void {
    this.iAuth.iEntrarInvitado();
    this.iRouter.navigate(['/grupo4/inicio']);
  }

  iOlvido(): void {
    this.iAviso.open('Para recuperar tu contraseña, comunícate con el administrador.', 'Cerrar', { duration: 5000 });
  }
}
