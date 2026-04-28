import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ICirugia } from '../models/cirugia';
import { IApiResponse, IPaginatedResponse } from '../models/api-response';
import { IMiembroEquipoMedico } from '../models/miembro-equipo';
import { IQuirofano } from '../models/quirofano';
import { IIntervencion, ITipoIntervencion } from '../models/intervencion';

@Injectable({
  providedIn: 'root',
})
export class CirugiaService extends BaseApiService {
  createCirugia(data: ICirugia) {
    return this.post<IApiResponse<ICirugia>>('/cirugias', data);
  }

  updateCirugia(data: ICirugia) {
    return this.put<IApiResponse<ICirugia>>(`/cirugias/${data.id}`, data);
  }

  getCirugias(page = 0, pageSize = 16, estado?: string, search?: string, sort?: string, order?: 'asc' | 'desc') {
    const params: any = { pagina: String(page), tamano: String(pageSize) };
    if (estado) {
      params.estado = estado;
    }
    if (search) {
      params.search = search;
    }
    if (sort) {
      params.sort = sort;
    }
    if (order) {
      params.order = order;
    }
    return this.get<IPaginatedResponse<ICirugia>>('/cirugias', params);
  }

  getCirugiasPorFechas(fechaInicio: string, fechaFin: string, pagina=0, tamano=1000) {
    const params = { fechaInicio, fechaFin, pagina: String(pagina), tamano: String(tamano) };
    return this.get<IApiResponse<ICirugia[]>>('/cirugias', params);
  }   

  deleteCirugia(cirugiaId: number) {
    return this.delete<void>(`/cirugias/${cirugiaId}`);
  }

  getEquipoMedicoByCirugiaId(cirugiaId: number) {
    return this.get<IApiResponse<IMiembroEquipoMedico[]>>(`/cirugias/${cirugiaId}/equipo-medico`);
  }

  saveEquipoMedico(equipo: IMiembroEquipoMedico, cirugiaId: number) {
    return this.post<IApiResponse<IMiembroEquipoMedico[]>>(
      `/cirugias/${cirugiaId}/equipo-medico`,
      equipo
    );
  }

  getTurnosDisponibles(quirofanoId: number, fechaInicio: string, fechaFin: string, pagina: number, tamano: number, servicioId?: number, estado?: string) {
    const params: any = { fechaInicio, fechaFin, pagina, tamano, quirofanoId };
    if (servicioId) {
      params.servicioId = servicioId;
    }
    if (estado) {
      params.estado = estado;
    }
    return this.get<IApiResponse<any>>('/turnos', params);
  }

  getServicios() {
    return this.get<IApiResponse<any>>('/cirugias/servicios');
  }

  // Intervenciones
  getIntervencionesByCirugiaId(cirugiaId: number) {
    return this.get<IApiResponse<IIntervencion[]>>(`/cirugias/${cirugiaId}/intervenciones`);
  }

  createIntervencion(cirugiaId: number, intervencion: IIntervencion) {
    return this.post<IApiResponse<IIntervencion>>(`/cirugias/${cirugiaId}/intervenciones`, intervencion);
  }

  updateIntervencion(cirugiaId: number, intervencion: IIntervencion) {
    return this.put<IApiResponse<IIntervencion>>(`/cirugias/${cirugiaId}/intervenciones/${intervencion.id}`, intervencion);
  }

  deleteIntervencion(cirugiaId: number, intervencionId: number) {
    return this.delete<void>(`/cirugias/${cirugiaId}/intervenciones/${intervencionId}`);
  }

  getTiposIntervencion() {
    return this.get<IApiResponse<ITipoIntervencion[]>>('/tipos-intervenciones');
  }

  finalizarCirugia(cirugiaId: number, intervenciones: IIntervencion[]) {
    return this.put<IApiResponse<ICirugia>>(`/cirugias/${cirugiaId}/finalizar`, { intervenciones });
  }

  inicializarCirugia(cirugiaId: number) {
    return this.put<IApiResponse<ICirugia>>(`/cirugias/${cirugiaId}/inicializar`, {});
  }
}
