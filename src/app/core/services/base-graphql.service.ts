import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map, catchError, throwError } from 'rxjs';

/**
 * Servicio base para operaciones GraphQL
 * Le agregamos Injectable para que Angular entienda el contexto de inyección
 */
@Injectable({
  providedIn: 'root'
})
export abstract class BaseGraphQLService {
  
  // Solución definitiva al NG0200: La base obtiene Apollo directamente del inyector
  protected apollo = inject(Apollo);

  // Eliminamos el constructor por completo para liberar a los servicios hijos

  /**
   * Ejecuta una query GraphQL
   */
  protected query<T>(gqlQuery: any, variables?: any): Observable<T> {
    return this.apollo.watchQuery<T>({
      query: gqlQuery,
      variables,
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map((result: any) => {
        if (result.errors && result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }
        // Tip: Recordá que GraphQL devuelve { data: { tuQuery: ... } }.
        // Si tu servicio hijo espera la data limpia, podés tiparlo como <any> o mapearlo acá.
        return result.data as T;
      }),
      catchError(error => {
        console.error('GraphQL Query Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Ejecuta una mutation GraphQL
   */
  /**
   * Ejecuta una mutation GraphQL
   */
  protected mutation<T>(gqlMutation: any, variables?: any): Observable<T> {
    return this.apollo.mutate<T>({
      mutation: gqlMutation,
      variables,
      errorPolicy: 'all'
    }).pipe(
      map(result => {
        // Volvemos a 'error' (en singular) que es el tipo nativo de MutateResult
        if (result.error) {
          throw new Error(result.error.message);
        }
        return result.data as T;
      }),
      catchError(error => {
        console.error('GraphQL Mutation Error:', error);
        return throwError(() => error);
      })
    );
  }
}
