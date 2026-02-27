import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Viaje {
  id: number;
  destino: string;
  precio: number;
  categoria: string;
  oferta: boolean;
  estrellas: number;
  imagen: string;
  descripcion?: string;
}

export interface Venta {
  id?: string;
  titular: string;
  total: number;
  fecha: string;
  items: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViajeService {
  private http = inject(HttpClient);

  private urlVentas = 'http://localhost:3000/ventas';
  private urlViajes = 'http://localhost:3000/viajes';

  private reservas: Viaje[] = [];

  agregarReserva(viaje: Viaje): void {
    this.reservas = [...this.reservas, viaje];
    alert('Viaje agregado al carrito: ' + viaje.destino);
  }

  obtenerReservas(): Viaje[] { return this.reservas; }
  limpiarReservas(): void { this.reservas = []; }

  getViajes(): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(this.urlViajes);
  }

  guardarViaje(viaje: Viaje): Observable<Viaje> {
    return this.http.post<Viaje>(this.urlViajes, viaje);
  }

  actualizarViaje(id: number, datos: Viaje): Observable<Viaje> {
    return this.http.put<Viaje>(`${this.urlViajes}/${id}`, datos);
  }

  eliminarViaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlViajes}/${id}`);
  }

  obtenerVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.urlVentas);
  }

  guardarVenta(datosVenta: Venta): Observable<Venta> {
    return this.http.post<Venta>(this.urlVentas, datosVenta);
  }

  actualizarVenta(id: string, datos: Venta): Observable<Venta> {
    return this.http.put<Venta>(`${this.urlVentas}/${id}`, datos);
  }

  eliminarVenta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlVentas}/${id}`);
  }
}