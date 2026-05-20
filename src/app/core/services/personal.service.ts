import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BaseGraphQLService } from './base-graphql.service';
import { IPersonal, IPersonalLite } from '../models/personal';
import { IResponse } from '../models/iresponse';
import { IApiResponse, IPaginatedResponse } from '../models/api-response';
import { IMiembroEquipoMedico } from '../models/miembro-equipo';
import { GET_PERSONALES } from '../graphql/queries/personal.queries';
import { CREATE_PERSONAL, UPDATE_PERSONAL, DELETE_PERSONAL } from '../graphql/mutations/personal.mutations';

@Injectable({
  providedIn: 'root',
})
export class PersonalService extends BaseGraphQLService {

  updatePersonal(personalData: IPersonal) {
    return this.mutation<IApiResponse<IPersonal>>(UPDATE_PERSONAL, {
      id: personalData.id,
      input: personalData
    });
  }

  getPersonal(page = 0, pageSize = 16) {
    const variables = { pagina: page, tamano: pageSize };
    return this.query<any>(GET_PERSONALES, variables);
  }

  createPersonal(personalData: IPersonal) {
    return this.mutation<IApiResponse<IPersonal>>(CREATE_PERSONAL, {
      input: personalData
    });
  }

  deletePersonal(id: number) {
    return this.mutation<IApiResponse>(DELETE_PERSONAL, { id });
  }

  searchPersonalLite(page = 0, pageSize = 10, q: string, role?: string) {
    const variables: any = {
      pagina: page,
      tamano: pageSize,
      search: q
    };

    if (role) {
      variables['role'] = role;
    }

    return this.query<any>(GET_PERSONALES, variables);
  }
}
