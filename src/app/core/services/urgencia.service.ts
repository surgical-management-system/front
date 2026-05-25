import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseGraphQLService } from './base-graphql.service';
import { IPaginatedResponseES } from '../models/api-response';
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
    return this.mutation<{ createUrgencia: IUrgencia }>(CREATE_URGENCIA, { input: data }).pipe(
      map((r) => (r as any)?.createUrgencia as IUrgencia)
    );
  }

  updateUrgencia(data: IUrgencia) {
    return this.mutation<{ updateUrgencia: IUrgencia }>(UPDATE_URGENCIA, { id: data.id, input: data }).pipe(
      map((r) => (r as any)?.updateUrgencia as IUrgencia)
    );
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

    return this.query<{ urgencias: IPaginatedResponseES<IUrgencia> }>(GET_URGENCIAS, variables).pipe(
      map((r) => r.urgencias)
    );
  }

  deleteUrgencia(urgenciaId: number): Observable<void> {
    return this.mutation<{ deleteUrgencia: boolean }>(DELETE_URGENCIA, { id: urgenciaId }).pipe(map(() => void 0));
  }

  getServicios() {
    // Esta operación podría no estar disponible en GraphQL aún
    return new Observable();
  }

  // Equipo médico
  getEquipoMedicoByUrgenciaId(urgenciaId: number): Observable<IMiembroEquipoMedico[]> {
    return this.query<{ equipoMedicoByUrgencia: IMiembroEquipoMedico[] }>(GET_EQUIPO_MEDICO_URGENCIA, { urgenciaId }).pipe(
      map((r) => r.equipoMedicoByUrgencia)
    );
  }

  saveEquipoMedico(equipo: IMiembroEquipoMedico, urgenciaId: number): Observable<IMiembroEquipoMedico[]> {
    return this.mutation<{ saveEquipoMedicoUrgencia: IMiembroEquipoMedico[] }>(SAVE_EQUIPO_MEDICO_URGENCIA, {
      urgenciaId,
      input: equipo
    }).pipe(map((r) => (r as any)?.saveEquipoMedicoUrgencia ?? (r as any)?.saveEquipoMedico ?? []));
  }

  // Intervenciones
  getIntervencionesbyUrgenciaId(urgenciaId: number): Observable<IIntervencion[]> {
    return this.query<{ intervencionesByUrgencia: IIntervencion[] }>(GET_INTERVENCIONES_URGENCIA, { urgenciaId }).pipe(
      map((r) => r.intervencionesByUrgencia ?? [])
    );
  }

  createIntervencion(urgenciaId: number, intervencion: IIntervencion): Observable<IIntervencion> {
    return this.mutation<{ createIntervencionUrgencia: IIntervencion }>(CREATE_INTERVENCION_URGENCIA, {
      urgenciaId,
      input: intervencion
    }).pipe(map((r) => (r as any)?.createIntervencionUrgencia ?? (r as any)?.createIntervencion as IIntervencion));
  }

  updateIntervencion(urgenciaId: number, intervencion: IIntervencion): Observable<IIntervencion> {
    return this.mutation<{ updateIntervencionUrgencia: IIntervencion }>(UPDATE_INTERVENCION_URGENCIA, {
      urgenciaId,
      id: intervencion.id,
      input: intervencion
    }).pipe(map((r) => (r as any)?.updateIntervencionUrgencia ?? (r as any)?.updateIntervencion as IIntervencion));
  }

  deleteIntervencion(urgenciaId: number, intervencionId: number): Observable<void> {
    return this.mutation<{ deleteIntervencionUrgencia: boolean }>(DELETE_INTERVENCION_URGENCIA, { urgenciaId, id: intervencionId }).pipe(map(() => void 0));
  }

  finalizarUrgencia(urgenciaId: number, intervenciones: IIntervencion[]): Observable<IUrgencia> {
    return this.mutation<{ finalizarUrgencia: IUrgencia }>(FINALIZAR_URGENCIA, { id: urgenciaId, intervenciones }).pipe(
      map((r) => (r as any)?.finalizarUrgencia as IUrgencia)
    );
  }

  inicializarUrgencia(urgenciaId: number): Observable<IUrgencia> {
    return this.mutation<{ inicializarUrgencia: IUrgencia }>(INICIALIZAR_URGENCIA, { id: urgenciaId }).pipe(
      map((r) => (r as any)?.inicializarUrgencia as IUrgencia)
    );
  }

  getTiposIntervencion() {
    // Esta operación podría not be available yet — keep signature
    return new Observable();
  }
}
