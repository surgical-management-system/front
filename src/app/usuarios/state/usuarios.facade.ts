import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { IKeycloakUserCreate } from '../../core/services/usuario.service';
import {
  createUsuario,
  loadUsuariosPage,
  toggleUsuarioStatus,
  updateUsuario,
} from './usuarios.actions';
import { usuariosFeature } from './usuarios.reducer';

@Injectable({
  providedIn: 'root',
})
export class UsuariosFacade {
  private readonly store = inject(Store);

  readonly items$ = this.store.select(usuariosFeature.selectItems);
  readonly totalItems$ = this.store.select(usuariosFeature.selectTotalItems);
  readonly page$ = this.store.select(usuariosFeature.selectPage);
  readonly pageSize$ = this.store.select(usuariosFeature.selectPageSize);
  readonly search$ = this.store.select(usuariosFeature.selectSearch);
  readonly isLoading$ = this.store.select(usuariosFeature.selectIsLoading);
  readonly isSaving$ = this.store.select(usuariosFeature.selectIsSaving);
  readonly error$ = this.store.select(usuariosFeature.selectError);

  loadPage(page: number, pageSize: number, search?: string): void {
    this.store.dispatch(loadUsuariosPage({ page, pageSize, search }));
  }

  create(userData: IKeycloakUserCreate): void {
    this.store.dispatch(createUsuario({ userData }));
  }

  update(id: string, userData: Partial<IKeycloakUserCreate>): void {
    this.store.dispatch(updateUsuario({ id, userData }));
  }

  toggleStatus(id: string, enabled: boolean): void {
    this.store.dispatch(toggleUsuarioStatus({ id, enabled }));
  }
}