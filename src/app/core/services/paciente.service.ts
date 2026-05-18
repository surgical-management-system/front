import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { HttpParams, HttpSentEvent, HttpStatusCode } from '@angular/common/http';
import { IPaciente, IPacienteLite } from '../models/paciente';
import { IPacienteExterno } from '../models/paciente-externo';
import { IApiResponse, IPaginatedResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class PacienteService extends BaseApiService {
  searchPacientes(q: string) {
    return this.get<IPacienteLite[]>(API_ENDPOINTS.BFF.PACIENTE, { search: q });
  }

  // Se utiliza una api que genera datos de pacientes externos aleatorios
  getPacientesExternos(cantidad: number): Observable<IApiResponse<IPacienteExterno[]>> {
    return this.get<IApiResponse<IPacienteExterno[]>>(API_ENDPOINTS.BFF.PACIENTES_EXTERNOS, { cantidad });
  }

  getPacientes(page = 0, pageSize = 16) {
    const params = { page: String(page), size: String(pageSize) };
    return this.get<IPaginatedResponse<IPaciente>>(API_ENDPOINTS.BFF.PACIENTE, params);
  }

  getPacientesLite(page = 0, pageSize = 16, filter: string = '') {
    const params: any = { page: String(page), size: String(pageSize) };
    if (filter) params['search'] = filter;
    return this.get<any>(API_ENDPOINTS.BFF.PACIENTE_LITE, params);
  }

  createPaciente(paciente: IPacienteExterno): Observable<IPacienteExterno> {
    return this.post<IPacienteExterno>(API_ENDPOINTS.BFF.PACIENTE, paciente);
  }

  updatePaciente(id: number, paciente: Partial<IPacienteExterno>): Observable<IPacienteExterno> {
    return this.put<IPacienteExterno>(`${API_ENDPOINTS.BFF.PACIENTE}/${id}`, paciente);
  }

  deletePaciente(id: number) {
    return this.delete<HttpStatusCode>(`${API_ENDPOINTS.BFF.PACIENTE}/${id}`);
  }

  deactivatePaciente(id: number) {
    // PUT /bff/paciente/{id}/deactivate
    return this.put<any>(`${API_ENDPOINTS.BFF.PACIENTE}/${id}/deactivate`, {});
  }

  activatePaciente(id: number) {
    // PUT /bff/paciente/{id}/activate
    return this.put<any>(`${API_ENDPOINTS.BFF.PACIENTE}/${id}/activate`, {});
  }
}
