import { Injectable } from '@angular/core';
import { BaseGraphQLService } from './base-graphql.service';
import { Observable, map } from 'rxjs';
import { ICirugia } from '../models/cirugia';
import { IMiembroEquipoMedico } from '../models/miembro-equipo';
import { IIntervencion, ITipoIntervencion } from '../models/intervencion';
import { IPaginatedResponseES } from '../models/api-response';
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


@Injectable({
  providedIn: 'root',
})
export class CirugiaService extends BaseGraphQLService {
  // CONFIGURACIÓN MODERNA: ¡Sin constructor ni super(apollo)!
  createCirugia(data: ICirugia): Observable<ICirugia> {
    return this.mutation<{ createCirugia: ICirugia }>(CREATE_CIRUGIA, { input: data }).pipe(
      map((r) => (r as any)?.createCirugia as ICirugia)
    );
  }

  updateCirugia(data: ICirugia): Observable<ICirugia> {
    return this.mutation<{ updateCirugia: ICirugia }>(UPDATE_CIRUGIA, { id: data.id, input: data }).pipe(
      map((r) => (r as any)?.updateCirugia as ICirugia)
    );
  }

  getCirugias(page = 0, pageSize = 16, estado?: string, search?: string, sort?: string, order?: 'asc' | 'desc') : Observable<IPaginatedResponseES<ICirugia>>{
    const variables: any = { pagina: page, tamano: pageSize };
    if (estado) variables['estado'] = estado;
    if (search) variables['search'] = search;
    if (sort) variables['sort'] = sort;
    if (order) variables['order'] = order;
    return this.query<{ cirugias: IPaginatedResponseES<ICirugia> }>(GET_CIRUGIAS, variables).pipe(
      map((r) => r.cirugias)
    );
  }

  getCirugiasPorFechas(fechaInicio: string, fechaFin: string, pagina = 0, tamano = 1000) {
    const variables = { pagina: pagina, tamano: tamano, fechaInicio, fechaFin };
    return this.query<{ cirugias: IPaginatedResponseES<ICirugia> }>(GET_CIRUGIAS, variables).pipe(
      map((r) => r.cirugias)
    );
  }

  deleteCirugia(cirugiaId: number): Observable<void> {
    return this.mutation<{ deleteCirugia: boolean }>(DELETE_CIRUGIA, { id: cirugiaId }).pipe(map(() => void 0));
  }

  getEquipoMedicoByCirugiaId(cirugiaId: number): Observable<IMiembroEquipoMedico[]> {
    return this.query<{ equipoMedicoByCirugia: IMiembroEquipoMedico[] }>(GET_EQUIPO_MEDICO_BY_CIRUGIA, { cirugiaId }).pipe(
      map((r) => r.equipoMedicoByCirugia)
    );
  }

  saveEquipoMedico(equipo: IMiembroEquipoMedico, cirugiaId: number): Observable<IMiembroEquipoMedico[]> {
    return this.mutation<{ saveEquipoMedico: IMiembroEquipoMedico[] }>(SAVE_EQUIPO_MEDICO, {
      cirugiaId,
      input: equipo
    }).pipe(map((r) => (r as any)?.saveEquipoMedico as IMiembroEquipoMedico[]));
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
    return this.query<{ turnosDisponibles: any }>(GET_TURNOS_DISPONIBLES, variables).pipe(
      map((r) => r.turnosDisponibles)
    );
  }

  getServicios() {
    // Esta operación podría no estar disponible en GraphQL aún
    return new Observable();
  }

  // Intervenciones
  getIntervencionesByCirugiaId(cirugiaId: number): Observable<IIntervencion[]> {
    return this.query<{ intervencionesByCirugia: IIntervencion[] }>(GET_INTERVENCIONES_BY_CIRUGIA, { cirugiaId }).pipe(
      map((r) => r.intervencionesByCirugia ?? [])
    );
  }

  createIntervencion(cirugiaId: number, intervencion: IIntervencion): Observable<IIntervencion> {
    return this.mutation<{ createIntervencion: IIntervencion }>(CREATE_INTERVENCION, {
      cirugiaId,
      input: intervencion
    }).pipe(map((r) => (r as any)?.createIntervencion as IIntervencion));
  }

  updateIntervencion(cirugiaId: number, intervencion: IIntervencion): Observable<IIntervencion> {
    return this.mutation<{ updateIntervencion: IIntervencion }>(UPDATE_INTERVENCION, {
      cirugiaId,
      id: intervencion.id,
      input: intervencion
    }).pipe(map((r) => (r as any)?.updateIntervencion as IIntervencion));
  }

  deleteIntervencion(cirugiaId: number, intervencionId: number): Observable<void> {
    return this.mutation<{ deleteIntervencion: boolean }>(DELETE_INTERVENCION, { cirugiaId, id: intervencionId }).pipe(map(() => void 0));
  }

  getTiposIntervencion(): Observable<ITipoIntervencion[]> {
    return this.query<{ tiposIntervencion: ITipoIntervencion[] }>(GET_TIPOS_INTERVENCION).pipe(map((r) => r.tiposIntervencion ?? []));
  }

  finalizarCirugia(cirugiaId: number, intervenciones: IIntervencion[]): Observable<ICirugia> {
    return this.mutation<{ finalizarCirugia: ICirugia }>(FINALIZAR_CIRUGIA, { id: cirugiaId, intervenciones }).pipe(
      map((r) => (r as any)?.finalizarCirugia as ICirugia)
    );
  }

  inicializarCirugia(cirugiaId: number): Observable<ICirugia> {
    return this.mutation<{ inicializarCirugia: ICirugia }>(INICIALIZAR_CIRUGIA, { id: cirugiaId }).pipe(
      map((r) => (r as any)?.inicializarCirugia as ICirugia)
    );
  }
}