import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BaseGraphQLService } from './base-graphql.service';
import { Observable } from 'rxjs';
import { IPaciente, IPacienteLite } from '../models/paciente';
import { IPacienteExterno } from '../models/paciente-externo';
import { IApiResponse, IPaginatedResponse } from '../models/api-response';
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

@Injectable({
  providedIn: 'root',
})
export class PacienteService extends BaseGraphQLService {

  searchPacientes(q: string) {
    return this.query<IPacienteLite[]>(SEARCH_PACIENTES, { search: q });
  }

  getPacientesExternos(cantidad: number): Observable<IApiResponse<IPacienteExterno[]>> {
    // Esta operación sigue siendo REST si no está disponible en GraphQL
    // Por ahora la dejaremos comentada o implementarla después
    return new Observable();
  }

  getPacientes(page = 0, pageSize = 16) {
    const variables = { page, limit: pageSize };
    return this.query<any>(GET_PACIENTES, variables);
  }

  getPacientesLite(page = 0, pageSize = 16, filter: string = '') {
    const variables: any = { page, limit: pageSize };
    if (filter) variables['search'] = filter;
    return this.query<any>(GET_PACIENTES, variables);
  }

  createPaciente(paciente: IPacienteExterno): Observable<IPacienteExterno> {
    return this.mutation<IPacienteExterno>(CREATE_PACIENTE, { input: paciente });
  }

  updatePaciente(id: number, paciente: Partial<IPacienteExterno>): Observable<IPacienteExterno> {
    return this.mutation<IPacienteExterno>(UPDATE_PACIENTE, { id, input: paciente });
  }

  deletePaciente(id: number) {
    return this.mutation<any>(DELETE_PACIENTE, { id });
  }

  deactivatePaciente(id: number) {
    return this.mutation<any>(DEACTIVATE_PACIENTE, { id });
  }

  activatePaciente(id: number) {
    return this.mutation<any>(ACTIVATE_PACIENTE, { id });
  }
}
