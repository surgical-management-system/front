import { createFeature, createReducer, on } from '@ngrx/store';
import { IUrgencia } from '../../core/models/urgencia';
import { UrgenciaActions } from './urgencia.actions';

export interface UrgenciaState {
  items: IUrgencia[];
  totalItems: number;
  page: number;
  pageSize: number;
  estado: string | null;
  search: string | null;
  sort: string | null;
  order: 'asc' | 'desc' | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialUrgenciaState: UrgenciaState = {
  items: [],
  totalItems: 0,
  page: 0,
  pageSize: 18,
  estado: null,
  search: null,
  sort: 'fechaHoraInicio',
  order: 'asc',
  isLoading: false,
  isSaving: false,
  error: null,
};

const urgenciaReducer = createReducer(
  initialUrgenciaState,
  on(UrgenciaActions.loadUrgenciasPage, (state, { page, pageSize, estado, search, sort, order }) => ({
    ...state,
    page,
    pageSize,
    estado: estado ?? state.estado,
    search: search ?? state.search,
    sort: sort ?? state.sort,
    order: order ?? state.order,
    isLoading: true,
    error: null,
  })),
  on(UrgenciaActions.loadUrgenciasPageSuccess, (state, { items, totalItems, page, pageSize }) => ({
    ...state,
    items,
    totalItems,
    page,
    pageSize,
    isLoading: false,
    error: null,
  })),
  on(UrgenciaActions.loadUrgenciasPageFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(
    UrgenciaActions.createUrgencia,
    UrgenciaActions.updateUrgencia,
    UrgenciaActions.deleteUrgencia,
    UrgenciaActions.inicializarUrgencia,
    UrgenciaActions.finalizarUrgencia,
    (state) => ({
      ...state,
      isSaving: true,
      error: null,
    })
  ),
  on(
    UrgenciaActions.createUrgenciaSuccess,
    UrgenciaActions.updateUrgenciaSuccess,
    UrgenciaActions.deleteUrgenciaSuccess,
    UrgenciaActions.inicializarUrgenciaSuccess,
    UrgenciaActions.finalizarUrgenciaSuccess,
    (state) => ({
      ...state,
      isSaving: false,
      error: null,
    })
  ),
  on(
    UrgenciaActions.createUrgenciaFailure,
    UrgenciaActions.updateUrgenciaFailure,
    UrgenciaActions.deleteUrgenciaFailure,
    UrgenciaActions.inicializarUrgenciaFailure,
    UrgenciaActions.finalizarUrgenciaFailure,
    (state, { error }) => ({
      ...state,
      isSaving: false,
      error,
    })
  )
);

export const urgenciaFeature = createFeature({
  name: 'urgencia',
  reducer: urgenciaReducer,
});
