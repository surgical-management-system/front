import { Injectable } from '@angular/core';
import { BaseGraphQLService } from './base-graphql.service';
import { IQuirofano } from '../models/quirofano';
import { IApiResponse } from '../models/api-response';
import { GET_QUIROFANOS, CREATE_QUIROFANO } from '../graphql/queries/quirofano.queries';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuirofanoService extends BaseGraphQLService {
  
  getQuirofanos() {
    return this.query<any>(GET_QUIROFANOS).pipe(
      map(response => ({
        data: response.quirofanos
      } as IApiResponse<IQuirofano[]>))
    );
  }
  
  createQuirofano(quirofano: IQuirofano) {
    return this.mutation<any>(CREATE_QUIROFANO, { input: quirofano }).pipe(
      map(response => ({
        data: response.createQuirofano
      } as IApiResponse<IQuirofano>))
    );
  }
}
