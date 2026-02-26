import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Propiedades del formulario
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  // Estados de interfaz
  loading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;

  // Validaciones
  get isEmailValid(): boolean {
    return this.email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  get isPasswordValid(): boolean {
    return this.password.length === 0 || this.password.length >= 6;
  }

  get formIsValid(): boolean {
    return this.email.trim().length > 0 && 
           this.password.length >= 6 && 
           this.isEmailValid;
  }

  iniciarsecion(): void {
    if (!this.formIsValid) {
      this.errorMessage = this.getValidationError();
      this.shakeForm();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: (response: any) => {
        // Si response es true o un objeto usuario, el login fue exitoso
        if (response) {
          console.log('Login exitoso, procesando redirección...');
          this.handleLoginSuccess();
        } else {
          this.handleLoginFailed();
        }
      },
      error: (error: any) => {
        this.handleLoginError(error);
      }
    });
  }

  private handleLoginSuccess(): void {
    const usuario = this.authService.getUsuarioActual();
    
    // 1. Guardar sesión
    this.persistSession(usuario);

    // 2. IMPORTANTE: Apagamos el loading antes de navegar
    this.loading = false;

    // 3. Notificación y Redirección
    this.showNotification('¡Bienvenido! 🎉', 'success');
    this.redirectByRole(usuario?.rol);
  }

  private handleLoginFailed(): void {
    this.errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
    this.password = '';
    this.loading = false;
    this.shakeForm();
  }

  private handleLoginError(error: any): void {
    console.error('Error en el servidor:', error);
    this.errorMessage = 'Error de conexión. Intenta más tarde.';
    this.loading = false;
    this.shakeForm();
  }

  private persistSession(usuario: any): void {
    const userData = {
      email: usuario?.email || this.email,
      rol: usuario?.rol,
      lastLogin: new Date().toISOString()
    };

    if (this.rememberMe) {
      localStorage.setItem('usuario', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('usuario', JSON.stringify(userData));
    }
  }

  private redirectByRole(rol?: string): void {
    // Normalizamos el rol para evitar errores de mayúsculas/minúsculas
    const rolNormalizado = (rol || '').trim().toUpperCase();
    
    console.log('Rol detectado:', rolNormalizado);

    if (rolNormalizado === 'ADMIN') {
      console.log('Redirigiendo a Panel de Administración...');
      this.router.navigate(['/admin']);
    } else {
      console.log('Redirigiendo a Gestión de Cliente...');
      this.router.navigate(['/gestion']);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private getValidationError(): string {
    if (!this.email.trim()) return 'El correo es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) return 'Formato de correo inválido';
    if (this.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  }

  private showNotification(message: string, type: 'success' | 'error' = 'error'): void {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg border-l-4 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  private shakeForm(): void {
    const form = document.querySelector('form');
    if (form) {
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
    }
  }
}