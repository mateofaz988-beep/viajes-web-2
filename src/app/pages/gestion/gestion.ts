import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ViajeService, Viaje } from '../../services/viaje';
import { finalize, delay } from 'rxjs/operators';

/**
 * Estados posibles de la transacción para controlar la UI
 */
type TransactionStatus = 'IDLE' | 'VERIFYING' | 'AUTHORIZED' | 'FAILED';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion.html'
})
export class GestionComponent implements OnInit {
  // --- Inyecciones de Dependencia ---
  private readonly _viajeService = inject(ViajeService);
  private readonly fb = inject(FormBuilder);

  // --- Signals de Estado ---
  itinerario = signal<Viaje[]>([]);
  status = signal<TransactionStatus>('IDLE');
  verPago = signal<boolean>(false);
  
  // Nuevo: Detección de marca de tarjeta
  tarjetaMarca = signal<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');

  // --- Cálculos Financieros Reactivos ---
  subtotal = computed(() => this.itinerario().reduce((acc, v) => acc + v.precio, 0));
  iva = computed(() => this.subtotal() * 0.15); // IVA 15% (Ecuador 2026)
  total = computed(() => this.subtotal() + this.iva());

  // --- Formulario de Liquidación ---
  formPago: FormGroup;

  constructor() {
    this.formPago = this.fb.group({
      titular: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z ]*$/)]],
      // Ajustamos el patrón para permitir espacios cada 4 dígitos (19 caracteres en total)
      tarjeta: ['', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)]],
      // Validador personalizado para fecha no caducada
      fecha: ['', [Validators.required, this.validarFechaExpiracion()]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });
  }

  ngOnInit(): void {
    this.cargarReservas();
  }

  private cargarReservas(): void {
    const reservas = this._viajeService.obtenerReservas();
    this.itinerario.set(reservas);
  }

  // --- Lógica de Formateo y Validación de Inputs ---

  /**
   * Formatea el número de tarjeta: 0000 0000 0000 0000 y detecta la marca
   */
  formatearTarjeta(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, ''); // Solo números
    
    // Detección de marca (BIN)
    if (valor.startsWith('4')) this.tarjetaMarca.set('visa');
    else if (/^5[1-5]/.test(valor)) this.tarjetaMarca.set('mastercard');
    else if (/^3[47]/.test(valor)) this.tarjetaMarca.set('amex');
    else this.tarjetaMarca.set('unknown');

    // Insertar espacios cada 4 dígitos
    let valorFormateado = valor.match(/.{1,4}/g)?.join(' ') || valor;
    input.value = valorFormateado.substring(0, 19); // Limite de 16 dígitos + 3 espacios
    
    this.formPago.get('tarjeta')?.setValue(input.value, { emitEvent: false });
  }

  /**
   * Validador para asegurar que la tarjeta no esté vencida
   */
  private validarFechaExpiracion(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (!valor || !/^\d{2}\/\d{2}$/.test(valor)) return { format: true };

      const [mes, anioStr] = valor.split('/').map(Number);
      const hoy = new Date();
      const mesActual = hoy.getMonth() + 1;
      const anioActual = parseInt(hoy.getFullYear().toString().substring(2));

      if (mes < 1 || mes > 12) return { mesInvalido: true };
      
      // Compara año y mes
      if (anioStr < anioActual || (anioStr === anioActual && mes < mesActual)) {
        return { caducada: true };
      }

      return null;
    };
  }

  validarSoloNumeros(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }

  formatearFecha(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    
    input.value = value;
    this.formPago.get('fecha')?.setValue(value, { emitEvent: false });
  }

  // --- Acciones del Panel de Gestión ---

  eliminarItem(index: number): void {
    this.itinerario.update(items => items.filter((_, i) => i !== index));
  }

  toggleModalPago(estado: boolean): void {
    if (estado && this.total() === 0) return;
    this.verPago.set(estado);
    
    if (!estado) {
      this.formPago.reset();
      this.status.set('IDLE');
      this.tarjetaMarca.set('unknown');
    }
  }

  // --- Lógica de Transacción Final ---

  confirmarTransaccion(): void {
    if (this.formPago.invalid || this.status() !== 'IDLE') return;

    this.status.set('VERIFYING');

    const orderRef = `AIR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const payload = {
      titular: this.formPago.value.titular.toUpperCase(),
      subtotal: this.subtotal(),
      iva: this.iva(),
      total: this.total(),
      fecha: new Date().toLocaleString('es-EC'),
      items: this.itinerario().map(v => v.destino).join(' | '),
      orderId: orderRef,
      status: 'AUTHORIZED',
      // Solo enviamos los últimos 4 dígitos por seguridad
      lastFour: this.formPago.value.tarjeta.replace(/\s/g, '').slice(-4)
    };

    this._viajeService.guardarVenta(payload)
      .pipe(
        delay(2000), 
        finalize(() => {
          if (this.status() === 'VERIFYING') this.status.set('IDLE');
        })
      )
      .subscribe({
        next: (res) => {
          this.status.set('AUTHORIZED');
          setTimeout(() => this.finalizarProcesoExitoso(), 1500);
        },
        error: (err) => {
          this.status.set('FAILED');
          alert('Error en la red bancaria. Transacción declinada.');
        }
      });
  }

  private finalizarProcesoExitoso(): void {
    alert('Pago Procesado. Su código de abordaje ha sido generado.');
    this.itinerario.set([]);
    this._viajeService.limpiarReservas(); 
    this.toggleModalPago(false);
  }
}