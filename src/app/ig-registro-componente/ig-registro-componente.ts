import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IgAuthService } from '../ig-auth';
import { IgIconoComponente } from '../ig-icono-componente/ig-icono-componente';

function igCoinciden(g: AbstractControl): ValidationErrors | null {
  const p = g.get('password')?.value;
  const c = g.get('confirmar')?.value;
  return p && c && p !== c ? { noCoincide: true } : null;
}

type IgCampo = 'nombres' | 'apellidos' | 'correo' | 'password' | 'confirmar';

@Component({
  selector: 'app-ig-registro-componente',
  imports: [ReactiveFormsModule, RouterLink, IgIconoComponente],
  templateUrl: './ig-registro-componente.html',
  styleUrl: './ig-registro-componente.css'
})
export class IgRegistroComponente {
  private iAuth = inject(IgAuthService);
  private iRouter = inject(Router);
  private iAviso = inject(MatSnackBar);

  iVer = signal(false);
  iCargando = signal(false);
  iError = signal<string | null>(null);

  iForm = new FormGroup(
    {
      nombres: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      apellidos: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
      confirmar: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    },
    { validators: igCoinciden }
  );

  iInvalido(campo: IgCampo): boolean {
    const c = this.iForm.controls[campo];
    if (campo === 'confirmar' && c.touched && this.iForm.hasError('noCoincide')) return true;
    return c.invalid && c.touched;
  }

  iMensaje(campo: IgCampo): string {
    const c = this.iForm.controls[campo];
    if (!c.touched) return '';
    if (c.hasError('required')) return 'Este campo es obligatorio';
    if (c.hasError('email')) return 'Ingresa un correo electrónico válido';
    if (c.hasError('minlength')) return 'Mínimo 8 caracteres';
    if (campo === 'confirmar' && this.iForm.hasError('noCoincide')) return 'Las contraseñas no coinciden';
    return '';
  }

  iEnviar(): void {
    this.iForm.markAllAsTouched();
    if (this.iForm.invalid || this.iCargando()) return;
    this.iError.set(null);
    this.iCargando.set(true);
    const v = this.iForm.getRawValue();

    this.iAuth.iRegistrar({ nombres: v.nombres.trim(), apellidos: v.apellidos.trim(), correo: v.correo.trim(), password: v.password }).subscribe({
      next: () => {
        this.iAviso.open('¡Cuenta creada! Ya puedes iniciar sesión.', 'Cerrar', { duration: 5000 });
        this.iRouter.navigate(['/grupo4/login']);
      },
      error: (e: HttpErrorResponse) => {
        this.iCargando.set(false);
        if (e.status === 0) this.iError.set('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
        else if (e.status === 401 || e.status === 403) this.iError.set('El servidor aún no permite el registro público. Pide al administrador que cree tu cuenta.');
        else this.iError.set('No se pudo crear la cuenta. Es posible que el correo ya esté registrado.');
      }
    });
  }
}
