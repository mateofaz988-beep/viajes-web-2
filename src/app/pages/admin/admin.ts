import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth-service';
import { ViajeService, Venta } from '../../services/viaje';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private viajeService = inject(ViajeService);
  private cdr = inject(ChangeDetectorRef);

  usuario = this.authService.getUsuarioActual();
  ventas: Venta[] = [];

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas() {
    this.viajeService.obtenerVentas().subscribe({
      next: (data) => {
        if (data) {
          this.ventas = Object.entries(data).map(([id, venta]: any) => ({ id, ...venta }));
        } else {
          this.ventas = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al cargar ventas", err)
    });
  }

  actualizar(venta: Venta) {
    if (!venta.id) return;
    this.viajeService.actualizarVenta(venta.id, venta).subscribe(() => {
      alert('Venta actualizada correctamente');
      this.cargarVentas();
    });
  }

  eliminar(id: string | undefined) {
    if (!id) return;
    this.viajeService.eliminarVenta(id).subscribe(() => {
      alert('Venta eliminada');
      this.cargarVentas();
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}