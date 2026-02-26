import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth-service';
import { ViajeService, Venta, Viaje } from '../../services/viaje';

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
  viajes: Viaje[] = [];

  nuevoViaje: Viaje = { id: 0, destino: '', precio: 0, categoria: 'Playa', oferta: false, estrellas: 5, imagen: '' };

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarViajes();
  }

  cargarVentas() {
    this.viajeService.obtenerVentas().subscribe(data => {
      this.ventas = data || [];
      this.cdr.detectChanges();
    });
  }

  cargarViajes() {
    this.viajeService.getViajes().subscribe(data => {
      this.viajes = data || [];
      this.cdr.detectChanges();
    });
  }

  // Acciones de Ventas
  actualizarVenta(venta: Venta) {
    if (!venta.id) return;
    this.viajeService.actualizarVenta(venta.id, venta).subscribe(() => alert('Venta actualizada'));
  }

  eliminarVenta(id: string | undefined) {
    if (!id || !confirm('¿Eliminar venta?')) return;
    this.viajeService.eliminarVenta(id).subscribe(() => this.cargarVentas());
  }

  // Acciones de Catálogo (Viajes)
  agregarViaje() {
    const idNuevo = Math.floor(Math.random() * 10000);
    this.viajeService.guardarViaje({ ...this.nuevoViaje, id: idNuevo }).subscribe(() => {
      this.cargarViajes();
      this.nuevoViaje = { id: 0, destino: '', precio: 0, categoria: 'Playa', oferta: false, estrellas: 5, imagen: '' };
    });
  }

  actualizarViaje(viaje: Viaje) {
    this.viajeService.actualizarViaje(viaje.id, viaje).subscribe(() => alert('Catálogo actualizado'));
  }

  eliminarViaje(id: number) {
    if (!confirm('¿Quitar del catálogo?')) return;
    this.viajeService.eliminarViaje(id).subscribe(() => this.cargarViajes());
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}