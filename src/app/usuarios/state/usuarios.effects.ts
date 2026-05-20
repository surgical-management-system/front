import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, withLatestFrom } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPaginatedResponseES } from '../../core/models/api-response';
import { IKeycloakUser } from '../../core/services/usuario.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { APP_CONSTANTS } from '../../core/constants/app-constants';
import * as UsuariosActions from './usuarios.actions';
import { usuariosFeature } from './usuarios.reducer';

interface UsuariosPageResponse {
  items: IKeycloakUser[];
  totalItems: number;
  page: number;
  pageSize: number;
}

function normalizeUsuariosPageResponse(
  response: IPaginatedResponseES<IKeycloakUser> | any,
  fallbackPage: number,
  fallbackPageSize: number
): UsuariosPageResponse {
  const data = response?.data ?? response ?? {};
  const items = data?.contenido ?? data?.content ?? data?.items ?? [];
  const totalItems = data?.totalElementos ?? data?.pagination?.totalItems ?? items.length ?? 0;
  const page = data?.pagina ?? data?.pagination?.page ?? fallbackPage;
  const pageSize = data?.tamaño ?? data?.pagination?.pageSize ?? fallbackPageSize;

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
export class UsuariosEffects {
  private readonly actions$ = inject(Actions);
  private readonly usuarioService = inject(UsuarioService);
  private readonly store = inject(Store);
  private readonly snackBar = inject(MatSnackBar);
  loadUsuariosPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsuariosActions.loadUsuariosPage),
      switchMap(({ page, pageSize, search }) => {
        const searchTerm = (search ?? '').trim();
        const request$ = searchTerm
          ? this.usuarioService.searchUsuarios(page, pageSize, searchTerm)
          : this.usuarioService.getUsuarios(page, pageSize);

        return request$.pipe(
          map((response) => {
            const normalized = normalizeUsuariosPageResponse(response, page, pageSize);

            return UsuariosActions.loadUsuariosPageSuccess({
              ...normalized,
              search: searchTerm,
            });
          }),
          catchError((error) =>
            of(
              UsuariosActions.loadUsuariosPageFailure({
                error: getErrorMessage(error, 'Unable to load usuarios.'),
              })
            )
          )
        );
      })
    )
  );

  createUsuario$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsuariosActions.createUsuario),
      exhaustMap(({ userData }) =>
        this.usuarioService.createUsuario(userData).pipe(
          map((response: any) => UsuariosActions.createUsuarioSuccess({ user: response?.data ?? userData })),
          catchError((error) =>
            of(
              UsuariosActions.createUsuarioFailure({
                error: getErrorMessage(error, 'Unable to create usuario.'),
              })
            )
          )
        )
      )
    )
  );

  updateUsuario$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsuariosActions.updateUsuario),
      exhaustMap(({ id, userData }) =>
        this.usuarioService.updateUsuario(id, userData).pipe(
          map((response: any) => UsuariosActions.updateUsuarioSuccess({ user: response?.data ?? { id, ...userData } })),
          catchError((error) =>
            of(
              UsuariosActions.updateUsuarioFailure({
                error: getErrorMessage(error, 'Unable to update usuario.'),
              })
            )
          )
        )
      )
    )
  );

  toggleUsuarioStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsuariosActions.toggleUsuarioStatus),
      exhaustMap(({ id, enabled }) =>
        this.usuarioService.toggleUsuarioStatus(id, enabled).pipe(
          map((response: any) =>
            UsuariosActions.toggleUsuarioStatusSuccess({
              user: response?.data ?? { id, enabled },
            })
          ),
          catchError((error) =>
            of(
              UsuariosActions.toggleUsuarioStatusFailure({
                error: getErrorMessage(error, 'Unable to update usuario status.'),
              })
            )
          )
        )
      )
    )
  );

  refreshPageAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UsuariosActions.createUsuarioSuccess,
        UsuariosActions.updateUsuarioSuccess,
        UsuariosActions.toggleUsuarioStatusSuccess
      ),
      withLatestFrom(
        this.store.select(usuariosFeature.selectPage),
        this.store.select(usuariosFeature.selectPageSize),
        this.store.select(usuariosFeature.selectSearch)
      ),
      map(([_, page, pageSize, search]) =>
        UsuariosActions.loadUsuariosPage({
          page,
          pageSize,
          search,
        })
      )
    )
  );

  notifyUsuariosLoadFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UsuariosActions.loadUsuariosPageFailure),
        tap(({ error }) => {
          this.snackBar.open(error || 'No se pudieron cargar los usuarios.', 'Cerrar', {
            duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        })
      ),
    { dispatch: false }
  );

  notifyUsuariosMutationSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          UsuariosActions.createUsuarioSuccess,
          UsuariosActions.updateUsuarioSuccess,
          UsuariosActions.toggleUsuarioStatusSuccess
        ),
        tap((action) => {
          const message =
            action.type === UsuariosActions.createUsuarioSuccess.type
              ? 'Usuario creado correctamente.'
              : action.type === UsuariosActions.updateUsuarioSuccess.type
                ? 'Usuario actualizado correctamente.'
                : 'Estado de usuario actualizado correctamente.';

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

  notifyUsuariosMutationFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          UsuariosActions.createUsuarioFailure,
          UsuariosActions.updateUsuarioFailure,
          UsuariosActions.toggleUsuarioStatusFailure
        ),
        tap((action) => {
          const fallbackMessage =
            action.type === UsuariosActions.createUsuarioFailure.type
              ? 'Error al crear el usuario.'
              : action.type === UsuariosActions.updateUsuarioFailure.type
                ? 'Error al actualizar el usuario.'
                : 'Error al cambiar el estado del usuario.';

          this.snackBar.open(action.error || fallbackMessage, 'Cerrar', {
            duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        })
      ),
    { dispatch: false }
  );

  // constructor removed: using in-class `inject(...)` to ensure injections
  // are available during effect initialization.
}