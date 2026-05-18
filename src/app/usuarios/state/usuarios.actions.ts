import { createAction, props } from '@ngrx/store';
import { IKeycloakUser, IKeycloakUserCreate } from '../../core/services/usuario.service';

export const loadUsuariosPage = createAction(
  '[Usuarios Page] Load Usuarios Page',
  props<{ page: number; pageSize: number; search?: string }>()
);

export const loadUsuariosPageSuccess = createAction(
  '[Usuarios API] Load Usuarios Page Success',
  props<{
    items: IKeycloakUser[];
    totalItems: number;
    page: number;
    pageSize: number;
    search: string;
  }>()
);

export const loadUsuariosPageFailure = createAction(
  '[Usuarios API] Load Usuarios Page Failure',
  props<{ error: string }>()
);

export const createUsuario = createAction(
  '[Usuario Dialog] Create Usuario',
  props<{ userData: IKeycloakUserCreate }>()
);

export const createUsuarioSuccess = createAction(
  '[Usuarios API] Create Usuario Success',
  props<{ user: IKeycloakUser }>()
);

export const createUsuarioFailure = createAction(
  '[Usuarios API] Create Usuario Failure',
  props<{ error: string }>()
);

export const updateUsuario = createAction(
  '[Usuario Dialog] Update Usuario',
  props<{ id: string; userData: Partial<IKeycloakUserCreate> }>()
);

export const updateUsuarioSuccess = createAction(
  '[Usuarios API] Update Usuario Success',
  props<{ user: IKeycloakUser }>()
);

export const updateUsuarioFailure = createAction(
  '[Usuarios API] Update Usuario Failure',
  props<{ error: string }>()
);

export const toggleUsuarioStatus = createAction(
  '[Usuarios List] Toggle Usuario Status',
  props<{ id: string; enabled: boolean }>()
);

export const toggleUsuarioStatusSuccess = createAction(
  '[Usuarios API] Toggle Usuario Status Success',
  props<{ user: IKeycloakUser }>()
);

export const toggleUsuarioStatusFailure = createAction(
  '[Usuarios API] Toggle Usuario Status Failure',
  props<{ error: string }>()
);