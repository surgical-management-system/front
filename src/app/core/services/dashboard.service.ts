import { Injectable } from '@angular/core';
import { BaseGraphQLService } from './base-graphql.service';
import { IEstadisticasGenerales } from '../models/estadisticas-generales';
import { IApiResponse } from '../models/api-response';
import { GET_ESTADISTICAS_GENERALES } from '../graphql/queries/dashboard.queries';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseGraphQLService {
  getEstadisticasGenerales() {
    return this.query<any>(GET_ESTADISTICAS_GENERALES).pipe(
      map(response => ({
        data: response.estadisticasGenerales
      } as IApiResponse<IEstadisticasGenerales>))
    );
  }
}