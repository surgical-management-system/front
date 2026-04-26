import { Routes } from '@angular/router';
import { RoleAGuard } from './core/guards/role.guard';
import { RoleBGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home').then((m) => m.HomeComponent) },
  {
    path: 'table-grid',
    loadComponent: () => import('./table-grid/table-grid').then((m) => m.TableGridComponent),
    canActivate: [RoleAGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard-view/dashboard-view').then((m) => m.DashboardViewComponent),
    canActivate: [RoleBGuard],
  },
  {
    path: 'solicitudes',
    loadComponent: () => import('./cirugia/solicitudes').then((m) => m.SolicitudesComponent),
    canActivate: [RoleBGuard],
  },
  {
    path: 'urgencias',
    loadComponent: () => import('./urgencia/urgencias').then((m) => m.UrgenciasComponent),
    canActivate: [RoleBGuard],
  },
  {
    path: 'personal',
    loadComponent: () => import('./personal/personal').then((m) => m.PersonalComponent),
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./usuarios/usuarios').then((m) => m.Usuarios),
  },
  { path: 'paciente', loadComponent: () => import('./paciente/paciente').then((m) => m.Paciente) },
  { path: '**', redirectTo: '/home' },
];
