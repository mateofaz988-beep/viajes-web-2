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
}

// 🟢 Interfaz Venta ajustada para coincidir con tu gestion.ts
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
  private apiUrl = 'https://veterinaria-84459-default-rtdb.firebaseio.com/ventas';

  private viajes: Viaje[] = [
    { id: 1, destino: 'Galápagos', precio: 1200, categoria: 'Playa', oferta: true, estrellas: 5, imagen: 'https://www.civitatis.com/blog/wp-content/uploads/2022/12/que-ver-islas-galapagos.jpg' },
    { id: 2, destino: 'Cotopaxi', precio: 80, categoria: 'Montaña', oferta: false, estrellas: 4, imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Cotopaxi_volcano_2008-06-27T1322.jpg/500px-Cotopaxi_volcano_2008-06-27T1322.jpg' },
    { id: 3, destino: 'Baños de Agua Santa', precio: 120, categoria: 'Aventura', oferta: true, estrellas: 5, imagen: 'https://www.turismo.gob.ec/wp-content/uploads/2020/12/Basilica-de-la-Virgen-de-Agua-Santa.jpg' },
    { id: 4, destino: 'Cartagena', precio: 450, categoria: 'Playa', oferta: true, estrellas: 4, imagen: 'https://media.staticontent.com/media/pictures/9495889e-54f9-40d2-939d-b04bf30b47c7' },
    { id: 5, destino: 'Medellín', precio: 380, categoria: 'Ciudad', oferta: false, estrellas: 5, imagen: 'https://www.metropolitan-touring.com/wp-content/uploads/2024/11/el-poblado-discrict.webp' },
    { id: 6, destino: 'Machu Picchu', precio: 650, categoria: 'Montaña', oferta: false, estrellas: 5, imagen: 'https://cuscoperu.b-cdn.net/wp-content/uploads/2024/06/Llama-en-Machu-Picchu-pc.jpg.webp' },
    { id: 7, destino: 'Cusco', precio: 300, categoria: 'Ciudad', oferta: true, estrellas: 4, imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Plaza_de_Cusco_Allison_Bellido.jpg/330px-Plaza_de_Cusco_Allison_Bellido.jpg' },
    { id: 8, destino: 'Cancún', precio: 850, categoria: 'Playa', oferta: true, estrellas: 5, imagen: 'https://content.r9cdn.net/rimg/dimg/f2/b1/89e06bf7-city-34713-16ed2f2c7f1.jpg' },
    { id: 9, destino: 'Riviera Maya', precio: 900, categoria: 'Playa', oferta: false, estrellas: 5, imagen: 'https://img.oyster.com/production/Articles/The%20Best%20Itinerary%20for%20Riviera%20Maya/Feature/The_Best_Itinerary_for_Riviera_Maya_feature_image_516aca30b2.jpeg' }
  ];

  getViajes(): Viaje[] { return this.viajes; }

  private reservas: Viaje[] = [];
  agregarReserva(viaje: Viaje): void {
    this.reservas = [...this.reservas, viaje];
    alert('Viaje agregado al carrito: ' + viaje.destino);
  }
  obtenerReservas(): Viaje[] { return this.reservas; }
  limpiarReservas(): void { this.reservas = []; }

  guardarVenta(datosVenta: Venta): Observable<{ name: string }> {
    return this.http.post<{ name: string }>(`${this.apiUrl}.json`, datosVenta);
  }
  obtenerVentas(): Observable<Record<string, Venta> | null> {
    return this.http.get<Record<string, Venta> | null>(`${this.apiUrl}.json`);
  }
  eliminarVenta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}.json`);
  }
  actualizarVenta(id: string, datos: Venta): Observable<Venta> {
    return this.http.put<Venta>(`${this.apiUrl}/${id}.json`, datos);
  }
}