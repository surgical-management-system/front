import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { APP_CONSTANTS } from '../../core/constants/app-constants';
import { ApiService } from '../../core/services/api-service';
import * as DashboardActions from './dashboard.actions';

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  const message = (error as any)?.error?.message || (error as any)?.message || fallbackMessage;
  return typeof message === 'string' ? message : fallbackMessage;
}

@Injectable()
export class DashboardEffects {
  private actions$ = inject(Actions);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  loadDashboardPing$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboardData, DashboardActions.refreshDashboard),
      exhaustMap(() =>
        this.apiService.getPing().pipe(
          map((ping) => DashboardActions.loadPingSuccess({ ping })),
          catchError((error) => {
            const errorMessage = getErrorMessage(error, 'Unable to load ping status.');
            return of(DashboardActions.loadPingFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loadDashboardTest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboardData, DashboardActions.refreshDashboard),
      exhaustMap(() =>
        this.apiService.getTest().pipe(
          map((testData) => DashboardActions.loadTestSuccess({ testData })),
          catchError((error) => {
            const errorMessage = getErrorMessage(error, 'Unable to load test data.');
            return of(DashboardActions.loadTestFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  notifyDashboardFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          DashboardActions.loadPingFailure,
          DashboardActions.loadTestFailure
        ),
        tap(({ error }) => {
          this.snackBar.open(error || 'Unable to load dashboard data.', 'Close', {
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
