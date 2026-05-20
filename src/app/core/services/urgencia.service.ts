import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { BaseGraphQLService } from './base-graphql.service';
import { IApiResponse, IPaginatedResponse } from '../models/api-response';
import { IUrgencia } from '../models/urgencia';
import { IMiembroEquipoMedico } from '../models/miembro-equipo';
import { IIntervencion } from '../models/intervencion';
import {
  GET_URGENCIAS,
  GET_URGENCIA_BY_ID,
  GET_EQUIPO_MEDICO_URGENCIA,
  GET_INTERVENCIONES_URGENCIA
} from '../graphql/queries/urgencia.queries';
import {
  CREATE_URGENCIA,
  UPDATE_URGENCIA,
  DELETE_URGENCIA,
  SAVE_EQUIPO_MEDICO_URGENCIA,
  CREATE_INTERVENCION_URGENCIA,
  UPDATE_INTERVENCION_URGENCIA,
  DELETE_INTERVENCION_URGENCIA,
  INICIALIZAR_URGENCIA,
  FINALIZAR_URGENCIA
} from '../graphql/mutations/urgencia.mutations';

@Injectable({
  providedIn: 'root',
})
export class UrgenciaService extends BaseGraphQLService {

  createUrgencia(data: IUrgencia) {
    return this.mutation<IApiResponse<IUrgencia>>(CREATE_URGENCIA, { input: data });
  }

  updateUrgencia(data: IUrgencia) {
    return this.mutation<IApiResponse<IUrgencia>>(UPDATE_URGENCIA, { id: data.id, input: data });
  }

  getUrgencias(
    page = 0,
    pageSize = 18,
    estado?: string,
    search?: string,
    sort?: string,
    order?: 'asc' | 'desc',
    fechaInicio?: string,
    fechaFin?: string
  ) {
    const variables: any = { pagina: page, tamano: pageSize };
    if (estado) variables['estado'] = estado;
    if (search) variables['search'] = search;
    if (sort) variables['sort'] = sort;
    if (order) variables['order'] = order;
    if (fechaInicio) variables['fechaInicio'] = fechaInicio;
    if (fechaFin) variables['fechaFin'] = fechaFin;

    return this.query<any>(GET_URGENCIAS, variables);
  }

  deleteUrgencia(urgenciaId: number) {
    return this.mutation<void>(DELETE_URGENCIA, { id: urgenciaId });
  }

  getServicios() {
    // Esta operación podría no estar disponible en GraphQL aún
    return new Observable();
  }

  // Equipo médico
  getEquipoMedicoByUrgenciaId(urgenciaId: number) {
    return this.query<IApiResponse<IMiembroEquipoMedico[]>>(GET_EQUIPO_MEDICO_URGENCIA, { urgenciaId });
  }

  saveEquipoMedico(equipo: IMiembroEquipoMedico, urgenciaId: number) {
    return this.mutation<IApiResponse<IMiembroEquipoMedico[]>>(SAVE_EQUIPO_MEDICO_URGENCIA, {
      urgenciaId,
      input: equipo
    });
  }

  // Intervenciones
  getIntervencionesbyUrgenciaId(urgenciaId: number) {
    return this.query<IApiResponse<IIntervencion[]>>(GET_INTERVENCIONES_URGENCIA, { urgenciaId });
  }

  createIntervencion(urgenciaId: number, intervencion: IIntervencion) {
    return this.mutation<IApiResponse<IIntervencion>>(CREATE_INTERVENCION_URGENCIA, {
      urgenciaId,
      input: intervencion
    });
  }

  updateIntervencion(urgenciaId: number, intervencion: IIntervencion) {
    return this.mutation<IApiResponse<IIntervencion>>(UPDATE_INTERVENCION_URGENCIA, {
      urgenciaId,
      id: intervencion.id,
      input: intervencion
    });
  }

  deleteIntervencion(urgenciaId: number, intervencionId: number) {
    return this.mutation<void>(DELETE_INTERVENCION_URGENCIA, { urgenciaId, id: intervencionId });
  }

  finalizarUrgencia(urgenciaId: number, intervenciones: IIntervencion[]) {
    return this.mutation<IApiResponse<IUrgencia>>(FINALIZAR_URGENCIA, { id: urgenciaId, intervenciones });
  }

  inicializarUrgencia(urgenciaId: number) {
    return this.mutation<IApiResponse<IUrgencia>>(INICIALIZAR_URGENCIA, { id: urgenciaId });
  }

  getTiposIntervencion() {
    // Esta operación podría no estar disponible en GraphQL aún
    return new Observable();
  }
}
