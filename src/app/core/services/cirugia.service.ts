import { Injectable } from '@angular/core';
import { BaseGraphQLService } from './base-graphql.service';
import { Observable } from 'rxjs';
import { ICirugia } from '../models/cirugia';
import { IApiResponse } from '../models/api-response';
import { IMiembroEquipoMedico } from '../models/miembro-equipo';
import { IIntervencion, ITipoIntervencion } from '../models/intervencion';
import {
  GET_CIRUGIAS,
  GET_EQUIPO_MEDICO_BY_CIRUGIA,
  GET_INTERVENCIONES_BY_CIRUGIA,
  GET_TIPOS_INTERVENCION
} from '../graphql/queries/cirugia.queries';
import { GET_TURNOS_DISPONIBLES } from '../graphql/queries/turno.queries';
import {
  CREATE_CIRUGIA,
  UPDATE_CIRUGIA,
  DELETE_CIRUGIA,
  SAVE_EQUIPO_MEDICO,
  CREATE_INTERVENCION,
  UPDATE_INTERVENCION,
  DELETE_INTERVENCION,
  INICIALIZAR_CIRUGIA,
  FINALIZAR_CIRUGIA
} from '../graphql/mutations/cirugia.mutations';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CirugiaService extends BaseGraphQLService {
  // CONFIGURACIÓN MODERNA: ¡Sin constructor ni super(apollo)!

  createCirugia(data: ICirugia) {
    return this.mutation<IApiResponse<ICirugia>>(CREATE_CIRUGIA, { input: data });
  }

  updateCirugia(data: ICirugia) {
    return this.mutation<IApiResponse<ICirugia>>(UPDATE_CIRUGIA, { id: data.id, input: data });
  }

  getCirugias(page = 0, pageSize = 16, estado?: string, search?: string, sort?: string, order?: 'asc' | 'desc') {
    const variables: any = { pagina: page, tamano: pageSize };
    if (estado) variables['estado'] = estado;
    if (search) variables['search'] = search;
    if (sort) variables['sort'] = sort;
    if (order) variables['order'] = order;

    return this.query<any>(GET_CIRUGIAS, variables);
  }

  getCirugiasPorFechas(fechaInicio: string, fechaFin: string, pagina = 0, tamano = 1000) {
    const variables = { pagina: pagina, tamano: tamano, fechaInicio, fechaFin };
    return this.query<IApiResponse<ICirugia[]>>(GET_CIRUGIAS, variables);
  }

  deleteCirugia(cirugiaId: number) {
    return this.mutation<void>(DELETE_CIRUGIA, { id: cirugiaId });
  }

  getEquipoMedicoByCirugiaId(cirugiaId: number) {
    return this.query<IApiResponse<IMiembroEquipoMedico[]>>(GET_EQUIPO_MEDICO_BY_CIRUGIA, { cirugiaId });
  }

  saveEquipoMedico(equipo: IMiembroEquipoMedico, cirugiaId: number) {
    return this.mutation<IApiResponse<IMiembroEquipoMedico[]>>(SAVE_EQUIPO_MEDICO, {
      cirugiaId,
      input: equipo
    });
  }

  getTurnosDisponibles(quirofanoId: number, fechaInicio: string, fechaFin: string, pagina: number, tamano: number, servicioId?: number, estado?: string) {
    const variables: any = {
      pagina,
      tamano,
      fechaInicio,
      fechaFin,
      quirofanoId: quirofanoId || undefined,
      estado: estado || undefined,
      servicioId: servicioId || undefined
    };
    return this.query<any>(GET_TURNOS_DISPONIBLES, variables).pipe(
      map(response => ({
        data: response.turnosDisponibles
      }))
    );
  }

  getServicios() {
    // Esta operación podría no estar disponible en GraphQL aún
    return new Observable();
  }

  // Intervenciones
  getIntervencionesByCirugiaId(cirugiaId: number) {
    return this.query<IApiResponse<IIntervencion[]>>(GET_INTERVENCIONES_BY_CIRUGIA, { cirugiaId });
  }

  createIntervencion(cirugiaId: number, intervencion: IIntervencion) {
    return this.mutation<IApiResponse<IIntervencion>>(CREATE_INTERVENCION, {
      cirugiaId,
      input: intervencion
    });
  }

  updateIntervencion(cirugiaId: number, intervencion: IIntervencion) {
    return this.mutation<IApiResponse<IIntervencion>>(UPDATE_INTERVENCION, {
      cirugiaId,
      id: intervencion.id,
      input: intervencion
    });
  }

  deleteIntervencion(cirugiaId: number, intervencionId: number) {
    return this.mutation<void>(DELETE_INTERVENCION, { cirugiaId, id: intervencionId });
  }

  getTiposIntervencion() {
    return this.query<IApiResponse<ITipoIntervencion[]>>(GET_TIPOS_INTERVENCION);
  }

  finalizarCirugia(cirugiaId: number, intervenciones: IIntervencion[]) {
    return this.mutation<IApiResponse<ICirugia>>(FINALIZAR_CIRUGIA, { id: cirugiaId, intervenciones });
  }

  inicializarCirugia(cirugiaId: number) {
    return this.mutation<IApiResponse<ICirugia>>(INICIALIZAR_CIRUGIA, { id: cirugiaId });
  }
}