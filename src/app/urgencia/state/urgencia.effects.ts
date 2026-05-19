import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { APP_CONSTANTS } from '../../core/constants/app-constants';
import { IUrgencia } from '../../core/models/urgencia';
import { UrgenciaService } from '../../core/services/urgencia.service';
import { UrgenciaActions } from './urgencia.actions';
import { urgenciaFeature } from './urgencia.reducer';

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  const message = (error as any)?.error?.message || (error as any)?.message || fallbackMessage;
  return typeof message === 'string' ? message : fallbackMessage;
}

function normalizeUrgenciaPageResponse(response: any): any[] {
  return response?.data?.contenido || response?.data || response?.contenido || response || [];
}

@Injectable()
export class UrgenciaEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private urgenciaService = inject(UrgenciaService);
  private snackBar = inject(MatSnackBar);

  loadUrgenciasPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UrgenciaActions.loadUrgenciasPage),
      switchMap(({ page, pageSize, estado, search, sort, order }) =>
        this.urgenciaService.getUrgencias(page, pageSize, estado, search, sort, order).pipe(
          map((response: any) => {
            const items = normalizeUrgenciaPageResponse(response);
            const totalItems = response?.data?.totalElementos ?? response?.totalElementos ?? items.length;
            const normalizedPage = response?.data?.pagina ?? page;
            const normalizedPageSize = response?.data?.tamaño ?? response?.data?.tamano ?? pageSize;

            return UrgenciaActions.loadUrgenciasPageSuccess({
              items,
              totalItems,
              page: normalizedPage,
              pageSize: normalizedPageSize,
            });
          }),
          catchError((error) => of(UrgenciaActions.loadUrgenciasPageFailure({ error: getErrorMessage(error, 'Unable to load urgencias.') })))
        )
      )
    )
  );

  createUrgencia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UrgenciaActions.createUrgencia),
      exhaustMap(({ urgencia }) =>
        this.urgenciaService.createUrgencia(urgencia).pipe(
          map((response: any) => UrgenciaActions.createUrgenciaSuccess({ urgencia: response?.data ?? response })),
          catchError((error) => of(UrgenciaActions.createUrgenciaFailure({ error: getErrorMessage(error, 'Unable to create urgencia.') })))
        )
      )
    )
  );

  updateUrgencia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UrgenciaActions.updateUrgencia),
      exhaustMap(({ id, urgencia }) =>
        this.urgenciaService.updateUrgencia({ id, ...(urgencia as IUrgencia) } as any).pipe(
          map((response: any) => UrgenciaActions.updateUrgenciaSuccess({ urgencia: response?.data ?? response })),
          catchError((error) => of(UrgenciaActions.updateUrgenciaFailure({ error: getErrorMessage(error, 'Unable to update urgencia.') })))
        )
      )
    )
  );

  deleteUrgencia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UrgenciaActions.deleteUrgencia),
      exhaustMap(({ id }) =>
        this.urgenciaService.deleteUrgencia(id).pipe(
          map(() => UrgenciaActions.deleteUrgenciaSuccess({ id })),
          catchError((error) => of(UrgenciaActions.deleteUrgenciaFailure({ error: getErrorMessage(error, 'Unable to delete urgencia.') })))
        )
      )
    )
  );

  inicializarUrgencia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UrgenciaActions.inicializarUrgencia),
      exhaustMap(({ id }) =>
        this.urgenciaService.inicializarUrgencia(id).pipe(
          map((response: any) => UrgenciaActions.inicializarUrgenciaSuccess({ urgencia: response?.data ?? response })),
          catchError((error) => of(UrgenciaActions.inicializarUrgenciaFailure({ error: getErrorMessage(error, 'Unable to initialize urgencia.') })))
        )
      )
    )
  );

  finalizarUrgencia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UrgenciaActions.finalizarUrgencia),
      exhaustMap(({ id }) =>
        this.urgenciaService.getIntervencionesbyUrgenciaId(id).pipe(
          switchMap((response: any) => {
            const intervenciones = Array.isArray(response?.data ?? response) ? (response?.data ?? response) : [];
            return this.urgenciaService.finalizarUrgencia(id, intervenciones);
          }),
          map((response: any) => UrgenciaActions.finalizarUrgenciaSuccess({ urgencia: response?.data ?? response })),
          catchError((error) => of(UrgenciaActions.finalizarUrgenciaFailure({ error: getErrorMessage(error, 'Unable to finalize urgencia.') })))
        )
      )
    )
  );

  refreshPageAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UrgenciaActions.createUrgenciaSuccess,
        UrgenciaActions.updateUrgenciaSuccess,
        UrgenciaActions.deleteUrgenciaSuccess,
        UrgenciaActions.inicializarUrgenciaSuccess,
        UrgenciaActions.finalizarUrgenciaSuccess
      ),
      withLatestFrom(
        this.store.select(urgenciaFeature.selectPage),
        this.store.select(urgenciaFeature.selectPageSize),
        this.store.select(urgenciaFeature.selectEstado),
        this.store.select(urgenciaFeature.selectSearch),
        this.store.select(urgenciaFeature.selectSort),
        this.store.select(urgenciaFeature.selectOrder)
      ),
      map(([_, page, pageSize, estado, search, sort, order]) =>
        UrgenciaActions.loadUrgenciasPage({
          page: page as number,
          pageSize: pageSize as number,
          estado: estado as string | undefined,
          search: search as string | undefined,
          sort: sort as string | undefined,
          order: order as 'asc' | 'desc' | undefined,
        })
      )
    )
  );

  notifyUrgenciaSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          UrgenciaActions.createUrgenciaSuccess,
          UrgenciaActions.updateUrgenciaSuccess,
          UrgenciaActions.deleteUrgenciaSuccess,
          UrgenciaActions.inicializarUrgenciaSuccess,
          UrgenciaActions.finalizarUrgenciaSuccess
        ),
        tap((action) => {
          const message =
            action.type === UrgenciaActions.createUrgenciaSuccess.type
              ? 'Urgencia creada correctamente.'
              : action.type === UrgenciaActions.updateUrgenciaSuccess.type
                ? 'Urgencia actualizada correctamente.'
                : action.type === UrgenciaActions.deleteUrgenciaSuccess.type
                  ? 'Urgencia eliminada correctamente.'
                  : action.type === UrgenciaActions.inicializarUrgenciaSuccess.type
                    ? 'Urgencia iniciada correctamente.'
                    : 'Urgencia finalizada correctamente.';

          this.snackBar.open(message, 'Cerrar', {
            duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        })
      ),
    { dispatch: false }
  );

  notifyUrgenciaFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          UrgenciaActions.loadUrgenciasPageFailure,
          UrgenciaActions.createUrgenciaFailure,
          UrgenciaActions.updateUrgenciaFailure,
          UrgenciaActions.deleteUrgenciaFailure,
          UrgenciaActions.inicializarUrgenciaFailure,
          UrgenciaActions.finalizarUrgenciaFailure
        ),
        tap(({ error }) => {
          this.snackBar.open(error, 'Cerrar', {
            duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        })
      ),
    { dispatch: false }
  );
}
