import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViajeService, Viaje } from '../../services/viaje';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion.html'
})
export class GestionComponent implements OnInit {

  private _viajeService = inject(ViajeService);
  private fb = inject(FormBuilder);

  carrito: Viaje[] = [];
  total: number = 0;
  verPago: boolean = false;
  formPago: FormGroup;

  constructor() {
    this.formPago = this.fb.group({
      titular: ['', [Validators.required, Validators.minLength(3)]],
      tarjeta: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      fecha: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]]
    });
  }

  ngOnInit(): void {
    const reservasDelServicio = this._viajeService.obtenerReservas();
    this.carrito = [...this.carrito, ...reservasDelServicio];
    this.calcularTotal();
  }

  validarSoloNumeros(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    const controlName = input.getAttribute('formControlName');
    this.formPago.get(controlName)?.setValue(input.value);
  }

  formatearFecha(event: any): void {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 2) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
    }
    input.value = valor;
    this.formPago.get('fecha')?.setValue(valor);
  }

  calcularTotal(): void {
    this.total = this.carrito.reduce((suma, viaje) => suma + viaje.precio, 0);
  }

  eliminar(index: number): void {
    this.carrito = this.carrito.filter((_, i) => i !== index);
    this.calcularTotal();
  }

  abrirCaja(): void {
    if (this.total > 0) {
      this.verPago = true;
      this.formPago.reset();
    }
  }

  cerrarCaja(): void {
    this.verPago = false;
  }

  // MÉTODO ACTUALIZADO PARA MOCKAPI
  pagarTodo(): void {
    if (this.formPago.valid) {
      
      // 1. Preparamos el objeto con los datos de la venta
      const datosVenta = {
        titular: this.formPago.value.titular,
        total: this.total,
        fecha: new Date().toLocaleString(), // Fecha y hora actual
        items: this.carrito.map(v => v.destino).join(', ') // Nombres de los destinos
      };

      // 2. Llamamos al servicio para guardar en MockAPI
      this._viajeService.guardarVenta(datosVenta).subscribe({
        next: (respuesta) => {
          // Si la API responde con éxito
          console.log('Venta guardada:', respuesta);
          alert('¡Pago exitoso! La reserva se ha guardado en la nube.');
          
          // Limpiamos la interfaz
          this.carrito = []; 
          this.total = 0;    
          this.cerrarCaja();
        },
        error: (err) => {
          // Si hay un error (ej. URL mal puesta o sin internet)
          console.error('Error al guardar:', err);
          alert('Hubo un problema al registrar la venta en el servidor.');
        }
      });
    }
  }
}