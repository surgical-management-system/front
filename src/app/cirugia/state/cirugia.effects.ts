import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { map, catchError, switchMap, exhaustMap, tap, withLatestFrom } from 'rxjs/operators';
import { CirugiaService } from '../../core/services/cirugia.service';
import { CirugiaActions } from './cirugia.actions';
import { cirugiaFeature } from './cirugia.reducer';
import { APP_CONSTANTS } from '../../core/constants/app-constants';

function getErrorMessage(error: unknown, fallbackMessage: string = 'An error occurred'): string {
  if (error instanceof Error) return error.message;
  const errorMsg = (error as any)?.error?.message || (error as any)?.message || fallbackMessage;
  return typeof errorMsg === 'string' ? errorMsg : fallbackMessage;
}

@Injectable()
export class CirugiaEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private cirugiaService = inject(CirugiaService);
  private snackBar = inject(MatSnackBar);

  loadCirugiasPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CirugiaActions.loadCirugiasPage),
      switchMap(({ page, pageSize, estado, search, sort, order }) =>
        this.cirugiaService.getCirugias(page, pageSize, estado, search, sort, order).pipe(
          map((connection) => {
            const items = this.normalizeCirugiaPageResponse(connection);
            const totalItems = (connection as any)?.totalElements ?? (connection as any)?.totalElementos ?? items.length;
            const normalizedPage = (connection as any)?.currentPage ?? (connection as any)?.pagina ?? page;
            const normalizedPageSize = (connection as any)?.pageSize ?? (connection as any)?.tamaño ?? (connection as any)?.tamano ?? pageSize;

            return CirugiaActions.loadCirugiasPageSuccess({
              items,
              totalItems,
              page: normalizedPage,
              pageSize: normalizedPageSize,
            });
          }),
          catchError((error) =>{
            const errorMessage = getErrorMessage(error, 'Unable to load cirugias.');
            return of(CirugiaActions.loadCirugiasPageFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  private normalizeCirugiaPageResponse(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response?.content ?? response?.contenido ?? response?.items ?? [];
  }

  createCirugia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CirugiaActions.createCirugia),
      exhaustMap(({ cirugia }) =>
        this.cirugiaService.createCirugia(cirugia).pipe(
          map((created: any) => CirugiaActions.createCirugiaSuccess({ cirugia: created })),
          catchError((error) => {
            const errorMessage = getErrorMessage(error, 'Unable to create cirugia.');
            return of(CirugiaActions.createCirugiaFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  updateCirugia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CirugiaActions.updateCirugia),
      exhaustMap(({ id, cirugia }) =>
        this.cirugiaService.updateCirugia({ id, ...cirugia } as any).pipe(
          map((updated: any) => CirugiaActions.updateCirugiaSuccess({ cirugia: updated })),
          catchError((error) => {
            const errorMessage = getErrorMessage(error, 'Unable to update cirugia.');
            return of(CirugiaActions.updateCirugiaFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  deleteCirugia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CirugiaActions.deleteCirugia),
      exhaustMap(({ id }) =>
        this.cirugiaService.deleteCirugia(id).pipe(
          map(() => CirugiaActions.deleteCirugiaSuccess({ id })),
          catchError((error) => {
            const errorMessage = getErrorMessage(error, 'Unable to delete cirugia.');
            return of(CirugiaActions.deleteCirugiaFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  initializarCirugia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CirugiaActions.initializarCirugia),
      exhaustMap(({ id }) =>
        this.cirugiaService.inicializarCirugia(id).pipe(
          map((updated: any) => CirugiaActions.initializarCirugiaSuccess({ cirugia: updated })),
          catchError((error) => {
            const errorMessage = getErrorMessage(error, 'Unable to initialize cirugia.');
            return of(CirugiaActions.initializarCirugiaFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  finalizarCirugia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CirugiaActions.finalizarCirugia),
      exhaustMap(({ id }) =>
        this.cirugiaService.getIntervencionesByCirugiaId(id).pipe(
          switchMap((intervenciones: any[]) => this.cirugiaService.finalizarCirugia(id, intervenciones)),
          map((updated: any) => CirugiaActions.finalizarCirugiaSuccess({ cirugia: updated })),
          catchError((error) => {
            const errorMessage = getErrorMessage(error, 'Unable to finalize cirugia.');
            return of(CirugiaActions.finalizarCirugiaFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  refreshPageAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        CirugiaActions.createCirugiaSuccess,
        CirugiaActions.updateCirugiaSuccess,
        CirugiaActions.deleteCirugiaSuccess,
        CirugiaActions.initializarCirugiaSuccess,
        CirugiaActions.finalizarCirugiaSuccess
      ),
      withLatestFrom(
        this.store.select(cirugiaFeature.selectPage),
        this.store.select(cirugiaFeature.selectPageSize),
        this.store.select(cirugiaFeature.selectEstado),
        this.store.select(cirugiaFeature.selectSearch),
        this.store.select(cirugiaFeature.selectSort),
        this.store.select(cirugiaFeature.selectOrder)
      ),
      map(([_, page, pageSize, estado, search, sort, order]) =>
        CirugiaActions.loadCirugiasPage({
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

  notifyCirugiaCreateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CirugiaActions.createCirugiaSuccess),
        tap(() => {
          this.snackBar.open('Cirugía creada correctamente.', 'Cerrar', {
            duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        })
      ),
    { dispatch: false }
  );

  notifyCirugiaUpdateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CirugiaActions.updateCirugiaSuccess),
        tap(() => {
          this.snackBar.open('Cirugía actualizada correctamente.', 'Cerrar', {
            duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        })
      ),
    { dispatch: false }
  );

  notifyCirugiaDeleteSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CirugiaActions.deleteCirugiaSuccess),
        tap(() => {
          this.snackBar.open('Cirugía eliminada correctamente.', 'Cerrar', {
            duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        })
      ),
    { dispatch: false }
  );

  notifyCirugiaInitializeSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CirugiaActions.initializarCirugiaSuccess),
        tap(() => {
          this.snackBar.open('Cirugía iniciada correctamente.', 'Cerrar', {
            duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        })
      ),
    { dispatch: false }
  );

  notifyCirugiaFinalizeSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CirugiaActions.finalizarCirugiaSuccess),
        tap(() => {
          this.snackBar.open('Cirugía finalizada correctamente.', 'Cerrar', {
            duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        })
      ),
    { dispatch: false }
  );

  notifyCirugiaFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          CirugiaActions.loadCirugiasPageFailure,
          CirugiaActions.createCirugiaFailure,
          CirugiaActions.updateCirugiaFailure,
          CirugiaActions.deleteCirugiaFailure,
          CirugiaActions.initializarCirugiaFailure,
          CirugiaActions.finalizarCirugiaFailure
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
