import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { IApiResponse, IPaginatedResponse } from '../models/api-response';
import { IUrgencia } from '../models/urgencia';
import { IMiembroEquipoMedico } from '../models/miembro-equipo';
import { IIntervencion } from '../models/intervencion';

@Injectable({
  providedIn: 'root',
})
export class UrgenciaService extends BaseApiService {
  createUrgencia(data: IUrgencia) {
    return this.post<IApiResponse<IUrgencia>>('/urgencia', this.toPayload(data));
  }

  updateUrgencia(data: IUrgencia) {
    return this.put<IApiResponse<IUrgencia>>(`/urgencia/${data.id}`, this.toPayload(data));
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
    if (fechaInicio) {
      params.fechaInicio = fechaInicio;
    }
    if (fechaFin) {
      params.fechaFin = fechaFin;
    }

    return this.get<IPaginatedResponse<IUrgencia>>('/urgencia', params).pipe(
      map((resp: any) => {
        const contenido = resp?.data?.contenido ?? resp?.contenido ?? resp?.data ?? [];
        const mapped = Array.isArray(contenido) ? contenido.map((item) => this.fromResponse(item)) : [];

        const pagina = resp?.data?.pagina ?? resp?.pagina ?? page;
        const tamano = resp?.data?.tamaño ?? resp?.data?.tamano ?? resp?.tamaño ?? resp?.tamano ?? pageSize;
        const totalElementos =
          resp?.data?.totalElementos ?? resp?.totalElementos ?? mapped.length;
        const totalPaginas = resp?.data?.totalPaginas ?? resp?.totalPaginas ?? 1;

        return {
          ...resp,
          data: {
            ...(resp?.data ?? {}),
            pagina,
            tamaño: tamano,
            totalElementos,
            totalPaginas,
            contenido: mapped,
          },
        } as IPaginatedResponse<IUrgencia>;
      })
    );
  }

  deleteUrgencia(urgenciaId: number) {
    return this.delete<void>(`/urgencia/${urgenciaId}`);
  }

  getServicios() {
    return this.get<IApiResponse<any>>('/cirugias/servicios');
  }

  // Equipo médico
  getEquipoMedicoByUrgenciaId(urgenciaId: number) {
    return this.get<IApiResponse<IMiembroEquipoMedico[]>>(`/urgencia/${urgenciaId}/equipo-medico`);
  }

  saveEquipoMedico(equipo: IMiembroEquipoMedico, urgenciaId: number) {
    return this.post<IApiResponse<IMiembroEquipoMedico[]>>(
      `/urgencia/${urgenciaId}/equipo-medico`,
      equipo
    );
  }

  // Intervenciones
  getIntervencionesbyUrgenciaId(urgenciaId: number) {
    return this.get<IApiResponse<IIntervencion[]>>(`/urgencia/${urgenciaId}/intervenciones`);
  }

  createIntervencion(urgenciaId: number, intervencion: IIntervencion) {
    return this.post<IApiResponse<IIntervencion>>(`/urgencia/${urgenciaId}/intervenciones`, intervencion);
  }

  updateIntervencion(urgenciaId: number, intervencion: IIntervencion) {
    return this.put<IApiResponse<IIntervencion>>(`/urgencia/${urgenciaId}/intervenciones/${intervencion.id}`, intervencion);
  }

  deleteIntervencion(urgenciaId: number, intervencionId: number) {
    return this.delete<void>(`/urgencia/${urgenciaId}/intervenciones/${intervencionId}`);
  }

  finalizarUrgencia(urgenciaId: number, intervenciones: IIntervencion[]) {
    return this.put<IApiResponse<IUrgencia>>(`/urgencia/${urgenciaId}/finalizar`, { intervenciones });
  }

  inicializarUrgencia(urgenciaId: number) {
    return this.put<IApiResponse<IUrgencia>>(`/urgencia/${urgenciaId}/inicializar`, {});
  }

  private fromResponse(item: any): IUrgencia {
    const paciente = item?.paciente ?? {};
    const servicio = item?.servicio ?? {};
    const quirofano = item?.quirofano ?? {};

    return {
      id: item?.id,
      prioridad: this.readText(item?.prioridad) || this.readText(item?.nivelPrioridad) || '',
      nivelUrgencia: item?.nivelUrgencia ?? item?.nivel ?? null,
      fechaHoraInicio: this.toDateTimeLocalInput(item?.fechaHoraInicio ?? item?.fechaInicio ?? item?.fechaHora),
      estado: item?.estado ?? 'PENDIENTE',
      anestesia: this.readText(item?.anestesia) || '',
      tipo: this.readText(item?.tipo) || this.readText(item?.tipoUrgencia) || '',
      pacienteId: paciente?.id ?? item?.pacienteId ?? null,
      pacienteNombre:
        this.readText(item?.pacienteNombre) ||
        this.readText(item?.paciente) ||
        this.buildPacienteNombre(paciente),
      dni: this.readText(item?.dni) || this.readText(paciente?.dni) || '',
      servicioId: servicio?.id ?? item?.servicioId ?? null,
      servicioNombre:
        this.readText(item?.servicioNombre) ||
        this.readText(item?.servicio) ||
        this.readText(servicio?.nombre) ||
        this.readText(servicio?.descripcion) ||
        '',
      quirofanoId: quirofano?.id ?? item?.quirofanoId ?? null,
      quirofanoNombre:
        this.readText(item?.quirofanoNombre) ||
        this.readText(item?.quirofano) ||
        this.readText(quirofano?.nombre) ||
        this.readText(quirofano?.descripcion) ||
        '',
    };
  }

  private buildPacienteNombre(paciente: any): string {
    if (!paciente) {
      return '';
    }
    const nombre = paciente?.nombre ?? '';
    const apellido = paciente?.apellido ?? '';
    return [nombre, apellido].filter(Boolean).join(' ').trim();
  }

  private toDateTimeLocalInput(value: any): string {
    if (!value) {
      return '';
    }

    // Jackson can serialize LocalDateTime as [yyyy, mm, dd, hh, min, ss].
    if (Array.isArray(value) && value.length >= 5) {
      const [year, month, day, hour, minute] = value;
      return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    if (typeof value === 'object') {
      const y = value?.year;
      const m = value?.monthValue ?? value?.month;
      const d = value?.dayOfMonth ?? value?.day;
      const h = value?.hour;
      const min = value?.minute;
      if ([y, m, d, h, min].every((part) => part !== undefined && part !== null)) {
        return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      }
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    const raw = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) {
      return raw.slice(0, 16);
    }

    return '';
  }

  private readText(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  }

  private toPayload(data: IUrgencia): any {
    const payload: any = {
      id: data.id,
      prioridad: data.prioridad,
      nivelUrgencia: data.nivelUrgencia,
      fechaHoraInicio: this.withSeconds(data.fechaHoraInicio),
      estado: data.estado,
      anestesia: data.anestesia,
      tipo: data.tipo,
      pacienteId: data.pacienteId,
      servicioId: data.servicioId,
      quirofanoId: data.quirofanoId,
    };

    if (!payload.id) {
      delete payload.id;
    }

    return payload;
  }

  private withSeconds(value: string): string {
    if (!value) {
      return value;
    }
    return value.length === 16 ? `${value}:00` : value;
  }

  getTiposIntervencion() {
    return this.get<IApiResponse<any>>('/tipos-intervenciones');
  }
}
