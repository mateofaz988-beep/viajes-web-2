import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HeroComponent } from '../../shared/hero/hero';
import { ViajeService, Viaje } from '../../services/viaje';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, HeroComponent], 
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class CatalogoComponent implements OnInit {

  private _viajeService = inject(ViajeService);
  private _cdr = inject(ChangeDetectorRef); // Para asegurar que la vista se actualice al recibir datos

  filtro: string = '';
  viajes: Viaje[] = []; 

  ngOnInit(): void {
    // 🔄 Ahora nos suscribimos porque getViajes() es una petición HTTP (Observable)
    this._viajeService.getViajes().subscribe({
      next: (data) => {
        this.viajes = data;
        this._cdr.detectChanges(); // Forzamos la detección de cambios
        console.log('Viajes cargados desde JSON Server:', this.viajes);
      },
      error: (err) => {
        console.error('Error al conectar con JSON Server:', err);
      }
    });
  }

  get viajesFiltrados(): Viaje[] {
    if (!this.filtro) {
      return this.viajes;
    }
    return this.viajes.filter(v => 
      v.destino.toLowerCase().includes(this.filtro.toLowerCase()) ||
      v.categoria.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  agregarReserva(viaje: Viaje): void {
    this._viajeService.agregarReserva(viaje);
  }
}