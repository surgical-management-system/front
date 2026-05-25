import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseGraphQLService } from './base-graphql.service';
import { Observable, map } from 'rxjs';
import { IPaciente, IPacienteLite } from '../models/paciente';
import { IPacienteExterno } from '../models/paciente-externo';
import { IApiResponse, IPaginatedResponseES } from '../models/api-response';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { 
  GET_PACIENTES, 
  GET_PACIENTE_BY_ID, 
  SEARCH_PACIENTES 
} from '../graphql/queries/paciente.queries';
import {
  CREATE_PACIENTE,
  UPDATE_PACIENTE,
  DELETE_PACIENTE,
  ACTIVATE_PACIENTE,
  DEACTIVATE_PACIENTE
} from '../graphql/mutations/paciente.mutations';

interface PacientesQueryResponse {
  pacientes: IPaginatedResponseES<IPaciente>;
}

interface PacientesLiteQueryResponse {
  pacientes: {
    contenido?: IPacienteLite[];
    content?: IPacienteLite[];
    totalElementos?: number;
    totalElements?: number;
    totalPaginas?: number;
    totalPages?: number;
    pagina?: number;
    currentPage?: number;
    tamaño?: number;
    pageSize?: number;
  };
}

interface PacienteMutationResponse<T> {
  createPaciente?: T;
  updatePaciente?: T;
  deletePaciente?: boolean;
  activatePaciente?: T;
  deactivatePaciente?: T;
}

@Injectable({
  providedIn: 'root',
})
export class PacienteService extends BaseGraphQLService {
  private readonly http = inject(HttpClient);
  private readonly restBaseUrl = environment.backendForFrontendUrl.startsWith('http')
    ? environment.backendForFrontendUrl
    : `http://${environment.backendForFrontendUrl}`;

  private buildRestUrl(endpoint: string): string {
    return endpoint.startsWith('http') ? endpoint : `${this.restBaseUrl}${endpoint}`;
  }

  searchPacientes(q: string): Observable<IPacienteLite[]> {
    return this.query<PacientesLiteQueryResponse>(SEARCH_PACIENTES, { search: q }).pipe(
      map((response) => response.pacientes?.content ?? response.pacientes?.contenido ?? [])
    );
  }

  getPacientesExternos(cantidad: number): Observable<IApiResponse<IPacienteExterno[]>> {
    return this.http.get<IApiResponse<IPacienteExterno[]>>(
      this.buildRestUrl(API_ENDPOINTS.BFF.PACIENTES_EXTERNOS),
      {
        params: { cantidad: String(cantidad) },
      }
    );
  }

  getPacientes(page = 0, pageSize = 16): Observable<IPaginatedResponseES<IPaciente>> {
    const variables = { page, limit: pageSize };
    return this.query<PacientesQueryResponse>(GET_PACIENTES, variables).pipe(
      map((response) => response.pacientes)
    );
  }

  getPacientesLite(page = 0, pageSize = 16, filter: string = ''): Observable<IPaginatedResponseES<IPacienteLite>> {
    const variables: any = { page, limit: pageSize };

    if (filter) {
      variables.filter = { search: filter };
    }

    return this.query<PacientesLiteQueryResponse>(GET_PACIENTES, variables).pipe(
      map((response) => {
        const pacientes = response.pacientes;
        const contenido = pacientes?.content ?? pacientes?.contenido ?? [];
        const totalElementos = pacientes?.totalElements ?? pacientes?.totalElementos ?? contenido.length;
        const tamaño = pacientes?.pageSize ?? pacientes?.tamaño ?? pageSize;

        return {
          pagina: pacientes?.currentPage ?? pacientes?.pagina ?? page,
          tamaño,
          totalElementos,
          totalPaginas: pacientes?.totalPages ?? pacientes?.totalPaginas ?? Math.max(1, Math.ceil(totalElementos / Math.max(tamaño, 1))),
          contenido,
        };
      })
    );
  }

  createPaciente(paciente: IPacienteExterno): Observable<IPaciente> {
    return this.mutation<PacienteMutationResponse<IPaciente>>(CREATE_PACIENTE, { input: paciente }).pipe(
      map((response) => response.createPaciente as IPaciente)
    );
  }

  updatePaciente(id: number, paciente: Partial<IPacienteExterno>): Observable<IPaciente> {
    return this.mutation<PacienteMutationResponse<IPaciente>>(UPDATE_PACIENTE, { id, input: paciente }).pipe(
      map((response) => response.updatePaciente as IPaciente)
    );
  }

  deletePaciente(id: number): Observable<void> {
    return this.mutation<PacienteMutationResponse<never>>(DELETE_PACIENTE, { id }).pipe(
      map(() => void 0)
    );
  }

  deactivatePaciente(id: number): Observable<IPaciente> {
    return this.mutation<PacienteMutationResponse<IPaciente>>(DEACTIVATE_PACIENTE, { id }).pipe(
      map((response) => response.deactivatePaciente as IPaciente)
    );
  }

  activatePaciente(id: number): Observable<IPaciente> {
    return this.mutation<PacienteMutationResponse<IPaciente>>(ACTIVATE_PACIENTE, { id }).pipe(
      map((response) => response.activatePaciente as IPaciente)
    );
  }
}
