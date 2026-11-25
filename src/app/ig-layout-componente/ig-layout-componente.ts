import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { IgAuthService } from '../ig-auth';
import { IgDatosService } from '../ig-datos';
import { IgIconoComponente } from '../ig-icono-componente/ig-icono-componente';

@Component({
  selector: 'app-ig-layout-componente',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatMenuModule, IgIconoComponente],
  templateUrl: './ig-layout-componente.html',
  styleUrl: './ig-layout-componente.css'
})
export class IgLayoutComponente implements OnInit {
  iAuth = inject(IgAuthService);
  iDatos = inject(IgDatosService);
  private iRouter = inject(Router);

  ngOnInit(): void {
    this.iDatos.iCargar();
  }

  iCerrar(): void {
    this.iAuth.iCerrarSesion();
    this.iRouter.navigate(['/grupo4/login']);
  }

  iOtraCuenta(): void {
    this.iAuth.iCerrarSesion();
    this.iRouter.navigate(['/grupo4/login'], { queryParams: { otra: 1 } });
  }
}
