import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BaseGraphQLService } from './base-graphql.service';
import { IUser } from '../models/user';
import { IApiResponse, IPaginatedResponseES } from '../models/api-response';
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

@Injectable({
  providedIn: 'root',
})
export class UsuarioService extends BaseGraphQLService {

  /**
   * Obtiene la lista de usuarios de Keycloak
   */
  getUsuarios(page = 0, pageSize = 16) {
    const variables = { pagina: page, tamano: pageSize };
    return this.query<any>(GET_USUARIOS, variables);
  }

  /**
   * Obtiene un usuario por ID
   */
  getUsuarioById(id: string) {
    return this.query<IApiResponse<IKeycloakUser>>(GET_USUARIO_BY_ID, { id });
  }

  /**
   * Busca usuarios por término
   */
  searchUsuarios(page = 0, pageSize = 16, search: string) {
    const variables = { search, pagina: page, tamano: pageSize };
    return this.query<any>(SEARCH_USUARIOS, variables);
  }

  /**
   * Activa o desactiva un usuario
   */
  toggleUsuarioStatus(id: string, enabled: boolean) {
    return this.mutation<IApiResponse<IKeycloakUser>>(TOGGLE_USUARIO_STATUS, { id, enabled });
  }

  /**
   * Crea un nuevo usuario en Keycloak
   */
  createUsuario(userData: IKeycloakUserCreate) {
    return this.mutation<IApiResponse<IKeycloakUser>>(CREATE_USUARIO, { input: userData });
  }

  /**
   * Actualiza un usuario en Keycloak
   */
  updateUsuario(id: string, userData: Partial<IKeycloakUserCreate>) {
    return this.mutation<IApiResponse<IKeycloakUser>>(UPDATE_USUARIO, { id, input: userData });
  }

  /**
   * Elimina un usuario
   */
  deleteUsuario(id: string) {
    return this.mutation<void>(DELETE_USUARIO, { id });
  }

  /**
   * Reinicia la contraseña de un usuario
   */
  resetPassword(usuarioId: string) {
    return this.mutation<boolean>(RESET_PASSWORD, { usuarioId });
  }
}
