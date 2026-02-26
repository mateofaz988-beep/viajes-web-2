import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service/auth-service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const autenticado = authService.estaAutenticado();
  const esAdmin = authService.esAdmin();

  console.log('Guard revisando acceso - Autenticado:', autenticado, 'Es Admin:', esAdmin);

  if (!autenticado) {
    return router.createUrlTree(['/login']);
  }

  // 🟢 IMPORTANTE: Si es admin, devolvemos TRUE para que cargue el componente.
  // NO redirigimos a /admin aquí porque causaríamos un bucle.
  if (esAdmin) {
    return true;
  }

  // Si no es admin, lo mandamos a gestión
  return router.createUrlTree(['/gestion']);
};