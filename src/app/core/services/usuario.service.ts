import { Injectable } from '@angular/core';
import { BaseGraphQLService } from './base-graphql.service';
import { Observable, map } from 'rxjs';
import { IPaginatedResponseES } from '../models/api-response';
import {
  GET_USUARIOS,
  GET_USUARIO_BY_ID,
  SEARCH_USUARIOS
} from '../graphql/queries/usuario.queries';
import {
  CREATE_USUARIO,
  UPDATE_USUARIO,
  DELETE_USUARIO,
  TOGGLE_USUARIO_STATUS,
  RESET_PASSWORD
} from '../graphql/mutations/usuario.mutations';

/**
 * Interfaz para usuario de Keycloak
 */
export interface IKeycloakUser {
  id: string;
  legajo?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp?: number;
  roles?: string[];
  attributes?: Record<string, string[]>;
}

/**
 * Interfaz para credenciales de Keycloak
 */
export interface IKeycloakCredential {
  type: string;
  value: string;
  temporary: boolean;
}

/**
 * Interfaz para crear usuario en Keycloak
 */
export interface IKeycloakUserCreate {
  legajo: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  credentials: IKeycloakCredential[];
  roles?: string[];
  attributes?: Record<string, string[]>;
}

interface UsuariosPageQueryResponse {
  usuarios: IPaginatedResponseES<IKeycloakUser>;
}

interface UsuarioMutationResponse<T> {
  createUsuario?: T;
  updateUsuario?: T;
  toggleUsuarioStatus?: T;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService extends BaseGraphQLService {
  getUsuarios(page = 0, pageSize = 16): Observable<IPaginatedResponseES<IKeycloakUser>> {
    const variables = { page, limit: pageSize };
    return this.query<UsuariosPageQueryResponse>(GET_USUARIOS, variables).pipe(
      map((response) => response.usuarios)
    );
  }

  getUsuarioById(id: string): Observable<IKeycloakUser> {
    return this.query<{ usuarioById: IKeycloakUser }>(GET_USUARIO_BY_ID, { id }).pipe(
      map((response) => response.usuarioById)
    );
  }

  searchUsuarios(page = 0, pageSize = 16, search: string): Observable<IPaginatedResponseES<IKeycloakUser>> {
    const variables = { search, page, limit: pageSize };
    return this.query<UsuariosPageQueryResponse>(SEARCH_USUARIOS, variables).pipe(
      map((response) => response.usuarios)
    );
  }

  toggleUsuarioStatus(id: string, enabled: boolean): Observable<IKeycloakUser> {
    return this.mutation<UsuarioMutationResponse<IKeycloakUser>>(TOGGLE_USUARIO_STATUS, { id, enabled }).pipe(
      map((response) => response.toggleUsuarioStatus as IKeycloakUser)
    );
  }

  createUsuario(userData: IKeycloakUserCreate): Observable<IKeycloakUser> {
    return this.mutation<UsuarioMutationResponse<IKeycloakUser>>(CREATE_USUARIO, { input: userData }).pipe(
      map((response) => response.createUsuario as IKeycloakUser)
    );
  }

  updateUsuario(id: string, userData: Partial<IKeycloakUserCreate>): Observable<IKeycloakUser> {
    return this.mutation<UsuarioMutationResponse<IKeycloakUser>>(UPDATE_USUARIO, { id, input: userData }).pipe(
      map((response) => response.updateUsuario as IKeycloakUser)
    );
  }

  deleteUsuario(id: string): Observable<void> {
    return this.mutation<{ deleteUsuario: boolean }>(DELETE_USUARIO, { id }).pipe(
      map(() => void 0)
    );
  }

  resetPassword(usuarioId: string): Observable<boolean> {
    return this.mutation<{ resetPassword: boolean }>(RESET_PASSWORD, { usuarioId }).pipe(
      map((response) => Boolean(response.resetPassword))
    );
  }
}
