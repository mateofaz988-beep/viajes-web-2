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

  cargandoVentas = false;
  cargandoViajes = false;

  nuevoViaje: Viaje = { id: 0, destino: '', precio: 0, categoria: 'Playa', oferta: false, estrellas: 5, imagen: '', descripcion: '' };

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarViajes();
  }

  cargarVentas() {
    this.cargandoVentas = true;
    this.viajeService.obtenerVentas().subscribe({
      next: (data) => {
        this.ventas = data || [];
        this.cargandoVentas = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al cargar ventas:", err);
        this.cargandoVentas = false;
      }
    });
  }

  actualizarVenta(venta: Venta) {
    if (!venta.id) return;
    this.viajeService.actualizarVenta(venta.id, venta).subscribe({
      next: () => alert('Venta actualizada correctamente.'),
      error: (err) => alert('Hubo un error al actualizar la venta.')
    });
  }

  eliminarVenta(id: string | undefined) {
    if (!id || !confirm('¿Estás seguro de eliminar esta venta de forma permanente?')) return;
    this.viajeService.eliminarVenta(id).subscribe({
      next: () => this.cargarVentas(),
      error: (err) => alert('Error al eliminar la venta.')
    });
  }

  cargarViajes() {
    this.cargandoViajes = true;
    this.viajeService.getViajes().subscribe({
      next: (data) => {
        this.viajes = data || [];
        this.cargandoViajes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al cargar viajes:", err);
        this.cargandoViajes = false;
      }
    });
  }

  agregarViaje() {
    if (!this.nuevoViaje.destino.trim() || this.nuevoViaje.precio <= 0 || !this.nuevoViaje.imagen.trim()) {
      alert('Por favor, completa correctamente el destino, el precio y la imagen antes de añadir.');
      return;
    }

    const maxId = this.viajes.length > 0 ? Math.max(...this.viajes.map(v => v.id)) : 0;
    const idNuevo = maxId + 1;

    this.viajeService.guardarViaje({ ...this.nuevoViaje, id: idNuevo }).subscribe({
      next: () => {
        alert('¡Nuevo destino añadido con éxito!');
        this.cargarViajes();
        this.resetFormulario();
      },
      error: (err) => alert('Error al guardar el nuevo viaje.')
    });
  }

  actualizarViaje(viaje: Viaje) {
    if (!viaje.destino.trim() || viaje.precio <= 0) {
      alert('El destino y el precio no pueden estar vacíos o en 0.');
      return;
    }

    this.viajeService.actualizarViaje(viaje.id, viaje).subscribe({
      next: () => alert('Catálogo actualizado correctamente.'),
      error: (err) => alert('Error al actualizar el viaje.')
    });
  }

  eliminarViaje(id: number) {
    if (!confirm('¿Seguro que deseas quitar este destino del catálogo? Esta acción no se puede deshacer.')) return;
    
    this.viajeService.eliminarViaje(id).subscribe({
      next: () => this.cargarViajes(),
      error: (err) => alert('Error al eliminar el viaje del catálogo.')
    });
  }

  private resetFormulario() {
    this.nuevoViaje = { id: 0, destino: '', precio: 0, categoria: 'Playa', oferta: false, estrellas: 5, imagen: '', descripcion: '' };
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}