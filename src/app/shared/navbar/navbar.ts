import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../services/theme';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  // ✅ Inyección del servicio de tema Titanium/Tornasol
  public themeService = inject(ThemeService);
  private router = inject(Router);

  isOpen = false;
  isAdmin = false;
  isLogged = false;

  constructor() {
    // Escucha cambios de ruta para re-verificar la sesión automáticamente
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.verificarSesion();
    });
  }

  ngOnInit() {
    this.verificarSesion();
  }

  // ✅ Alternar entre modo claro y oscuro (Titanium)
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  verificarSesion() {
    const usuarioString = localStorage.getItem('usuario');
    
    if (usuarioString) {
      try {
        const usuario = JSON.parse(usuarioString);
        this.isLogged = true;
        
        // ✅ Verificación flexible para Admin (por rol o por correo)
        // Puedes ajustar 'admin@gmail.com' por tu correo real
        this.isAdmin = usuario.rol === 'ADMIN' || usuario.email === 'admin@gmail.com'; 
      } catch (e) {
        console.error("Error al leer la sesión:", e);
        this.isLogged = false;
      }
    } else {
      this.isLogged = false;
      this.isAdmin = false;
    }
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  cerrarSesion() {
    // Limpieza total de sesión
    localStorage.removeItem('usuario');
    this.isLogged = false;
    this.isAdmin = false;
    this.isOpen = false;
    
    // Redirección al login con el nuevo estilo aplicado
    this.router.navigate(['/login']);
  }
}