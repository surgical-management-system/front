import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, withLatestFrom } from 'rxjs';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { IPaginatedResponseES } from '../../core/models/api-response';
import { IPersonal } from '../../core/models/personal';
import { PersonalService } from '../../core/services/personal.service';
import * as PersonalActions from './personal.actions';
import { personalFeature } from './personal.reducer';

interface PersonalPageResponse {
  items: IPersonal[];
  totalItems: number;
  page: number;
  pageSize: number;
}

function normalizePersonalPageResponse(
  response: IPaginatedResponseES<IPersonal> | any,
  fallbackPage: number,
  fallbackPageSize: number
): PersonalPageResponse {
  const data = response?.personales ?? response?.data?.personales ?? response?.data ?? response ?? {};
  const items = data?.content ?? data?.contenido ?? data?.items ?? [];
  const totalItems = data?.totalElements ?? data?.totalElementos ?? data?.pagination?.totalItems ?? items.length ?? 0;
  const page = data?.currentPage ?? data?.pagina ?? data?.pagination?.page ?? fallbackPage;
  const pageSize = data?.pageSize ?? data?.tamaño ?? data?.pagination?.pageSize ?? fallbackPageSize;

  return {
    items,
    totalItems,
    page,
    pageSize,
  };
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'errorDescription' in error) {
    const apiError = error as { errorDescription?: string };
    return apiError.errorDescription || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

@Injectable()
export class PersonalEffects {
  private readonly actions$ = inject(Actions);
  private readonly personalService = inject(PersonalService);
  private readonly store = inject(Store);

  loadPersonalPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PersonalActions.loadPersonalPage),
      switchMap(({ page, pageSize }) =>
        this.personalService.getPersonal(page, pageSize).pipe(
          map((response) => {
            const normalizedResponse = normalizePersonalPageResponse(response, page, pageSize);

            return PersonalActions.loadPersonalPageSuccess(normalizedResponse);
          }),
          catchError((error) =>
            of(
              PersonalActions.loadPersonalPageFailure({
                error: getErrorMessage(error, 'Unable to load personal data.'),
              })
            )
          )
        )
      )
    )
  );

  deletePersonal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PersonalActions.deletePersonal),
      exhaustMap(({ id }) =>
        this.personalService.deletePersonal(id).pipe(
          map(() => PersonalActions.deletePersonalSuccess({ id })),
          catchError((error) =>
            of(
              PersonalActions.deletePersonalFailure({
                error: getErrorMessage(error, 'Unable to delete personal.'),
              })
            )
          )
        )
      )
    )
  );

  savePersonal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PersonalActions.savePersonal),
      exhaustMap(({ personal }) => {
        const request$ = personal.id
          ? this.personalService.updatePersonal(personal)
          : this.personalService.createPersonal(personal);

        return request$.pipe(
          map((response: any) => {
            const savedPersonal = response?.createPersonal ?? response?.updatePersonal ?? response?.data?.createPersonal ?? response?.data?.updatePersonal ?? response?.data ?? personal;

            return PersonalActions.savePersonalSuccess({ personal: savedPersonal });
          }),
          catchError((error) =>
            of(
              PersonalActions.savePersonalFailure({
                error: getErrorMessage(error, 'Unable to save personal.'),
              })
            )
          )
        );
      })
    )
  );

  refreshPageAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PersonalActions.savePersonalSuccess, PersonalActions.deletePersonalSuccess),
      withLatestFrom(
        this.store.select(personalFeature.selectPage),
        this.store.select(personalFeature.selectPageSize)
      ),
      map(([_, page, pageSize]) => PersonalActions.loadPersonalPage({ page, pageSize }))
    )
  );
}