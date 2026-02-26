import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { CatalogoComponent } from './pages/catalogo/catalogo';
import { GestionComponent } from './pages/gestion/gestion';
import { NosotrosComponent } from './pages/nosotros/nosotros';
import { ContactanosComponent } from './pages/contactanos/contactanos';
import { Admin } from './pages/admin/admin';

import { Login } from './shared/login/login';
import { FormularioCuenta } from './shared/formulario-cuenta/formulario-cuenta';
import { clienteSoloLoginGuard } from './guards/cliente-solo-login-guard-guard';
import { sesionActivaGuard } from './guards/sesion-activa-guard-guard';
import { adminGuard } from './guards/admin-guard-guard';

export const routes: Routes = [

  { path: '', component: HomeComponent },

  // 🔹 AHORA SÍ: El catálogo solo se ve si la sesión está activaxsxd
  { 
    path: 'catalogo', 
    component: CatalogoComponent, 
    canActivate: [sesionActivaGuard] 
  },

  { 
    path: 'gestion', 
    component: GestionComponent,
    canActivate: [sesionActivaGuard],
  },

  // 🔴 Zona Administrador protegida
  { 
    path: 'admin', 
    component: Admin, 
    canActivate: [adminGuard] 
  },

  { path: 'nosotros', component: NosotrosComponent },

  { path: 'contactanos', component: ContactanosComponent },

  {
    path: 'login',
    component: Login,
    // El guard de cliente solo login evita que alguien ya logueado vuelva a ver el login
    canActivate: [clienteSoloLoginGuard]
  },

  { path: 'formulariocuenta', component: FormularioCuenta },

  { path: '**', redirectTo: '' }

];