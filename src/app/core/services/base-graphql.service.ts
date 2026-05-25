import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseGraphQLService {
  protected apollo = inject(Apollo);
  protected query<T>(gqlQuery: any, variables?: any): Observable<T> {
    return this.apollo.query<T>({
      query: gqlQuery,
      variables,
      errorPolicy: 'all'
    }).pipe(
      map((result: any) => {
        if (result.errors?.length) {
          throw new Error(result.errors[0].message);
        }

        return result.data as T;
      }),
      catchError((error) => {
        console.error('GraphQL Query Error:', error);
        return throwError(() => error);
      })
    );
  }

  protected mutation<T>(gqlMutation: any, variables?: any): Observable<T> {
    return this.apollo.mutate<T>({
      mutation: gqlMutation,
      variables,
      errorPolicy: 'all'
    }).pipe(
      map((result: any) => {
        if (result.errors?.length) {
          throw new Error(result.errors[0].message);
        }

        return result.data as T;
      }),
      catchError((error) => {
        console.error('GraphQL Mutation Error:', error);
        return throwError(() => error);
      })
    );
  }
}
