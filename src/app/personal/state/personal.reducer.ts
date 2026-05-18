import { createFeature, createReducer, on } from '@ngrx/store';
import { IPersonal } from '../../core/models/personal';
import * as PersonalActions from './personal.actions';

export interface PersonalState {
  items: IPersonal[];
  totalItems: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialPersonalState: PersonalState = {
  items: [],
  totalItems: 0,
  page: 0,
  pageSize: 16,
  isLoading: false,
  isSaving: false,
  error: null,
};

export const personalFeature = createFeature({
  name: 'personal',
  reducer: createReducer(
    initialPersonalState,
    on(PersonalActions.loadPersonalPage, (state, { page, pageSize }) => ({
      ...state,
      isLoading: true,
      error: null,
      page,
      pageSize,
    })),
    on(PersonalActions.loadPersonalPageSuccess, (state, { items, totalItems, page, pageSize }) => ({
      ...state,
      items,
      totalItems,
      page,
      pageSize,
      isLoading: false,
      error: null,
    })),
    on(PersonalActions.loadPersonalPageFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
    on(PersonalActions.savePersonal, (state) => ({
      ...state,
      isSaving: true,
      error: null,
    })),
    on(PersonalActions.savePersonalSuccess, (state) => ({
      ...state,
      isSaving: false,
      error: null,
    })),
    on(PersonalActions.savePersonalFailure, (state, { error }) => ({
      ...state,
      isSaving: false,
      error,
    })),
    on(PersonalActions.deletePersonal, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(PersonalActions.deletePersonalSuccess, (state) => ({
      ...state,
      isLoading: false,
      error: null,
    })),
    on(PersonalActions.deletePersonalFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    }))
  ),
});