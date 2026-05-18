import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, exhaustMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { APP_CONSTANTS } from '../../core/constants/app-constants';
import { IPaginatedResponseES } from '../../core/models/api-response';
import { IPaciente } from '../../core/models/paciente';
import { PacienteService } from '../../core/services/paciente.service';
import * as PacienteActions from './paciente.actions';
import { pacienteFeature } from './paciente.reducer';

interface PacientePageResponse {
  items: IPaciente[];
  totalItems: number;
  page: number;
  pageSize: number;
}

function normalizePacientePageResponse(
  response: IPaginatedResponseES<IPaciente> | any,
  fallbackPage: number,
  fallbackPageSize: number
): PacientePageResponse {
  const data = response?.data ?? response ?? {};
  const items = data?.contenido ?? data?.content ?? data?.items ?? [];
  const totalItems = data?.totalElementos ?? data?.pagination?.totalItems ?? items.length ?? 0;
  const page = data?.pagina ?? data?.pagination?.page ?? fallbackPage;
  const pageSize = data?.tamaño ?? data?.pageSize ?? data?.pagination?.pageSize ?? fallbackPageSize;

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
export class PacienteEffects {
  loadPacientesPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PacienteActions.loadPacientesPage),
      switchMap(({ page, pageSize }) =>
        this.pacienteService.getPacientes(page, pageSize).pipe(
          map((response) => {
            const normalized = normalizePacientePageResponse(response, page, pageSize);

            return PacienteActions.loadPacientesPageSuccess(normalized);
          }),
          catchError((error) =>
            of(
              PacienteActions.loadPacientesPageFailure({
                error: getErrorMessage(error, 'Unable to load pacientes.'),
              })
            )
          )
        )
      )
    )
  );

  loadHospitalPacientes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PacienteActions.loadHospitalPacientes),
      switchMap(({ page, pageSize }) =>
        this.pacienteService.getPacientesExternos(pageSize).pipe(
          map((response) =>
            PacienteActions.loadHospitalPacientesSuccess({
              items: response?.data ?? [],
              totalItems: response?.data?.length ?? 0,
              page,
              pageSize,
            })
          ),
          catchError((error) =>
            of(
              PacienteActions.loadHospitalPacientesFailure({
                error: getErrorMessage(error, 'Unable to load hospital pacientes.'),
              })
            )
          )
        )
      )
    )
  );

  createPaciente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PacienteActions.createPaciente),
      exhaustMap(({ paciente }) =>
        this.pacienteService.createPaciente(paciente).pipe(
          map((created) => PacienteActions.createPacienteSuccess({ paciente: created as unknown as IPaciente })),
          catchError((error) =>
            of(
              PacienteActions.createPacienteFailure({
                error: getErrorMessage(error, 'Unable to create paciente.'),
              })
            )
          )
        )
      )
    )
  );

  updatePaciente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PacienteActions.updatePaciente),
      exhaustMap(({ id, paciente }) =>
        this.pacienteService.updatePaciente(id, paciente).pipe(
          map((updated) => PacienteActions.updatePacienteSuccess({ paciente: updated as unknown as IPaciente })),
          catchError((error) =>
            of(
              PacienteActions.updatePacienteFailure({
                error: getErrorMessage(error, 'Unable to update paciente.'),
              })
            )
          )
        )
      )
    )
  );

  deletePaciente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PacienteActions.deletePaciente),
      exhaustMap(({ id }) =>
        this.pacienteService.deletePaciente(id).pipe(
          map(() => PacienteActions.deletePacienteSuccess({ id })),
          catchError((error) =>
            of(
              PacienteActions.deletePacienteFailure({
                error: getErrorMessage(error, 'Unable to delete paciente.'),
              })
            )
          )
        )
      )
    )
  );

  togglePacienteActivo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PacienteActions.togglePacienteActivo),
      exhaustMap(({ id, active }) => {
        const request$ = active
          ? this.pacienteService.deactivatePaciente(id)
          : this.pacienteService.activatePaciente(id);

        return request$.pipe(
          map(() => PacienteActions.togglePacienteActivoSuccess({ id, active: !active })),
          catchError((error) =>
            of(
              PacienteActions.togglePacienteActivoFailure({
                error: getErrorMessage(error, 'Unable to update paciente status.'),
              })
            )
          )
        );
      })
    )
  );

  refreshPacientesAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PacienteActions.createPacienteSuccess,
        PacienteActions.updatePacienteSuccess,
        PacienteActions.deletePacienteSuccess,
        PacienteActions.togglePacienteActivoSuccess
      ),
      withLatestFrom(
        this.store.select(pacienteFeature.selectPage),
        this.store.select(pacienteFeature.selectPageSize)
      ),
      map(([_, page, pageSize]) => PacienteActions.loadPacientesPage({ page, pageSize }))
    )
  );

  notifyPacienteMutationSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PacienteActions.createPacienteSuccess,
          PacienteActions.updatePacienteSuccess,
          PacienteActions.deletePacienteSuccess,
          PacienteActions.togglePacienteActivoSuccess
        ),
        tap((action) => {
          let message = 'Operación completada correctamente.';
          
          if (action.type === '[Paciente API] Create Paciente Success') {
            message = 'Paciente creado correctamente.';
          } else if (action.type === '[Paciente API] Update Paciente Success') {
            message = 'Paciente actualizado correctamente.';
          } else if (action.type === '[Paciente API] Delete Paciente Success') {
            message = 'Paciente eliminado correctamente.';
          } else if (action.type === '[Paciente API] Toggle Paciente Activo Success') {
            message = 'Estado del paciente actualizado correctamente.';
          }

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

  notifyPacienteFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PacienteActions.loadPacientesPageFailure,
          PacienteActions.loadHospitalPacientesFailure,
          PacienteActions.createPacienteFailure,
          PacienteActions.updatePacienteFailure,
          PacienteActions.deletePacienteFailure,
          PacienteActions.togglePacienteActivoFailure
        ),
        tap(({ error }) => {
          this.snackBar.open(error || 'No se pudo completar la operación de pacientes.', 'Cerrar', {
            duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly pacienteService: PacienteService,
    private readonly store: Store,
    private readonly snackBar: MatSnackBar
  ) {}
}