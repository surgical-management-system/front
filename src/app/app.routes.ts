import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { RoleAGuard } from './core/guards/role.guard';
import { RoleBGuard } from './core/guards/role.guard';
import { PacienteEffects } from './paciente/state/paciente.effects';
import { pacienteFeature } from './paciente/state/paciente.reducer';
import { PersonalEffects } from './personal/state/personal.effects';
import { personalFeature } from './personal/state/personal.reducer';
import { UsuariosEffects } from './usuarios/state/usuarios.effects';
import { usuariosFeature } from './usuarios/state/usuarios.reducer';
import { CirugiaEffects } from './cirugia/state/cirugia.effects';
import { cirugiaFeature } from './cirugia/state/cirugia.reducer';

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
    providers: [provideState(cirugiaFeature), provideEffects(CirugiaEffects)],
  },
  {
    path: 'urgencias',
    loadComponent: () => import('./urgencia/urgencias').then((m) => m.UrgenciasComponent),
    canActivate: [RoleBGuard],
  },
  {
    path: 'personal',
    loadComponent: () => import('./personal/personal').then((m) => m.PersonalComponent),
    providers: [provideState(personalFeature), provideEffects(PersonalEffects)],
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./usuarios/usuarios').then((m) => m.Usuarios),
    providers: [provideState(usuariosFeature), provideEffects(UsuariosEffects)],
  },
  {
    path: 'paciente',
    loadComponent: () => import('./paciente/paciente').then((m) => m.Paciente),
    providers: [provideState(pacienteFeature), provideEffects(PacienteEffects)],
  },
  { path: '**', redirectTo: '/home' },
];
