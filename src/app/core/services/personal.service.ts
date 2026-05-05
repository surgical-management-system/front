import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { IPersonal, IPersonalLite } from '../models/personal';
import { IResponse } from '../models/iresponse';
import { IApiResponse, IPaginatedResponse } from '../models/api-response';
import { IMiembroEquipoMedico } from '../models/miembro-equipo';

@Injectable({
  providedIn: 'root',
})
export class PersonalService extends BaseApiService {
  updatePersonal(personalData: IPersonal) {
    return this.put<IApiResponse<IPersonal>>(`/personal/${personalData.id}`, personalData);
  }

  getPersonal(page = 0, pageSize = 16) {
    const params = { page: String(page), size: String(pageSize) };
    return this.get<IPaginatedResponse<IPersonal>>('/personal', params);
  }

  createPersonal(personalData: IPersonal) {
    return this.post<IApiResponse<IPersonal>>('/personal', personalData);
  }

  deletePersonal(id: number) {
    return this.delete<IApiResponse>(`/personal/${id}`);
  }

  // searchPersonal(q: string) {          //BORRAR
  //   return this.get<IApiResponse<IPersonal>>('/personal', { search: q });
  // }

  searchPersonalLite(page = 0, pageSize = 10, q: string, role?: string) {
    const params: Record<string, string> = {
      page: String(page),
      size: String(pageSize),
      search: q,
    };

    if (role) {
      params['role'] = role;
    }

    return this.get<IPaginatedResponse<IPersonalLite[]>>('/personal/resumen', params);
  }
}
