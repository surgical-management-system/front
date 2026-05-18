import { createFeature, createReducer, on } from '@ngrx/store';
import { IKeycloakUser } from '../../core/services/usuario.service';
import * as UsuariosActions from './usuarios.actions';

export interface UsuariosState {
  items: IKeycloakUser[];
  totalItems: number;
  page: number;
  pageSize: number;
  search: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialUsuariosState: UsuariosState = {
  items: [],
  totalItems: 0,
  page: 0,
  pageSize: 16,
  search: '',
  isLoading: false,
  isSaving: false,
  error: null,
};

export const usuariosFeature = createFeature({
  name: 'usuarios',
  reducer: createReducer(
    initialUsuariosState,
    on(UsuariosActions.loadUsuariosPage, (state, { page, pageSize, search }) => ({
      ...state,
      page,
      pageSize,
      search: search ?? '',
      isLoading: true,
      error: null,
    })),
    on(UsuariosActions.loadUsuariosPageSuccess, (state, { items, totalItems, page, pageSize, search }) => ({
      ...state,
      items,
      totalItems,
      page,
      pageSize,
      search,
      isLoading: false,
      error: null,
    })),
    on(UsuariosActions.loadUsuariosPageFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
    on(UsuariosActions.createUsuario, UsuariosActions.updateUsuario, UsuariosActions.toggleUsuarioStatus, (state) => ({
      ...state,
      isSaving: true,
      error: null,
    })),
    on(
      UsuariosActions.createUsuarioSuccess,
      UsuariosActions.updateUsuarioSuccess,
      UsuariosActions.toggleUsuarioStatusSuccess,
      (state) => ({
        ...state,
        isSaving: false,
        error: null,
      })
    ),
    on(
      UsuariosActions.createUsuarioFailure,
      UsuariosActions.updateUsuarioFailure,
      UsuariosActions.toggleUsuarioStatusFailure,
      (state, { error }) => ({
        ...state,
        isSaving: false,
        error,
      })
    )
  ),
});