import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IPersonal, IPersonalLite } from '../models/personal';
import { IPaginatedResponseES } from '../models/api-response';
import { BaseGraphQLService } from './base-graphql.service';
import { GET_PERSONALES } from '../graphql/queries/personal.queries';
import { CREATE_PERSONAL, UPDATE_PERSONAL, DELETE_PERSONAL } from '../graphql/mutations/personal.mutations';

interface PersonalPageQueryResponse {
  personales: IPaginatedResponseES<IPersonal>;
}

interface PersonalLitePageQueryResponse {
  personales: IPaginatedResponseES<IPersonalLite>;
}

interface PersonalMutationResponse<T> {
  createPersonal?: T;
  updatePersonal?: T;
  deletePersonal?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PersonalService extends BaseGraphQLService {

  updatePersonal(personalData: IPersonal): Observable<IPersonal> {
    return this.mutation<PersonalMutationResponse<IPersonal>>(UPDATE_PERSONAL, {
      id: personalData.id,
      input: personalData
    }).pipe(
      map((response) => response.updatePersonal as IPersonal)
    );
  }

  getPersonal(page = 0, pageSize = 16): Observable<IPaginatedResponseES<IPersonal>> {
    const variables = { page, limit: pageSize };
    return this.query<PersonalPageQueryResponse>(GET_PERSONALES, variables).pipe(
      map((response) => response.personales)
    );
  }

  createPersonal(personalData: IPersonal): Observable<IPersonal> {
    return this.mutation<PersonalMutationResponse<IPersonal>>(CREATE_PERSONAL, {
      input: personalData
    }).pipe(
      map((response) => response.createPersonal as IPersonal)
    );
  }

  deletePersonal(id: number): Observable<void> {
    return this.mutation<PersonalMutationResponse<never>>(DELETE_PERSONAL, { id }).pipe(
      map(() => void 0)
    );
  }

  searchPersonalLite(page = 0, pageSize = 10, q: string, role?: string): Observable<IPaginatedResponseES<IPersonalLite>> {
    const variables: any = {
      page,
      limit: pageSize,
      filter: {
        search: q
      }
    };

    if (role) {
      variables.filter.role = role;
    }

    return this.query<PersonalLitePageQueryResponse>(GET_PERSONALES, variables).pipe(
      map((response) => response.personales)
    );
  }
}
