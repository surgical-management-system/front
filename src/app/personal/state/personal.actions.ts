import { createAction, props } from '@ngrx/store';
import { IPersonal } from '../../core/models/personal';

export const loadPersonalPage = createAction(
  '[Personal Page] Load Personal Page',
  props<{ page: number; pageSize: number }>()
);

export const loadPersonalPageSuccess = createAction(
  '[Personal API] Load Personal Page Success',
  props<{ items: IPersonal[]; totalItems: number; page: number; pageSize: number }>()
);

export const loadPersonalPageFailure = createAction(
  '[Personal API] Load Personal Page Failure',
  props<{ error: string }>()
);

export const deletePersonal = createAction(
  '[Personal Page] Delete Personal',
  props<{ id: number }>()
);

export const deletePersonalSuccess = createAction(
  '[Personal API] Delete Personal Success',
  props<{ id: number }>()
);

export const deletePersonalFailure = createAction(
  '[Personal API] Delete Personal Failure',
  props<{ error: string }>()
);

export const savePersonal = createAction(
  '[Personal Dialog] Save Personal',
  props<{ personal: IPersonal }>()
);

export const savePersonalSuccess = createAction(
  '[Personal API] Save Personal Success',
  props<{ personal: IPersonal }>()
);

export const savePersonalFailure = createAction(
  '[Personal API] Save Personal Failure',
  props<{ error: string }>()
);