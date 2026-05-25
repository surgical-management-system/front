import { Injectable } from '@angular/core';
import { BaseGraphQLService } from './base-graphql.service';
import { IEstadisticasGenerales } from '../models/estadisticas-generales';
import { IApiResponse } from '../models/api-response';
import { GET_ESTADISTICAS_GENERALES } from '../graphql/queries/dashboard.queries';
import { Observable, map } from 'rxjs';

interface DashboardQueryResponse {
  estadisticasGenerales: IEstadisticasGenerales;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseGraphQLService {
  getEstadisticasGenerales(): Observable<IApiResponse<IEstadisticasGenerales>> {
    return this.query<DashboardQueryResponse>(GET_ESTADISTICAS_GENERALES).pipe(
      map((response) => ({
        success: true,
        data: response.estadisticasGenerales,
        timestamp: new Date().toISOString(),
      } as IApiResponse<IEstadisticasGenerales>))
    );
  }
}