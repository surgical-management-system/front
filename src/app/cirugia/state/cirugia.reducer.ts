import { createFeature, createReducer, on } from '@ngrx/store';
import { ICirugia } from '../../core/models/cirugia';
import { CirugiaActions } from './cirugia.actions';

export interface CirugiaState {
  items: ICirugia[];
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

export const initialCirugiaState: CirugiaState = {
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

const cirugiaReducer = createReducer(
  initialCirugiaState,

  // Load page
  on(CirugiaActions.loadCirugiasPage, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(CirugiaActions.loadCirugiasPageSuccess, (state, { items, totalItems, page, pageSize }) => ({
    ...state,
    items,
    totalItems,
    page,
    pageSize,
    isLoading: false,
  })),
  on(CirugiaActions.loadCirugiasPageFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create
  on(CirugiaActions.createCirugia, (state) => ({
    ...state,
    isSaving: true,
    error: null,
  })),
  on(CirugiaActions.createCirugiaSuccess, (state) => ({
    ...state,
    isSaving: false,
  })),
  on(CirugiaActions.createCirugiaFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),

  // Update
  on(CirugiaActions.updateCirugia, (state) => ({
    ...state,
    isSaving: true,
    error: null,
  })),
  on(CirugiaActions.updateCirugiaSuccess, (state) => ({
    ...state,
    isSaving: false,
  })),
  on(CirugiaActions.updateCirugiaFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),

  // Delete
  on(CirugiaActions.deleteCirugia, (state) => ({
    ...state,
    isSaving: true,
    error: null,
  })),
  on(CirugiaActions.deleteCirugiaSuccess, (state) => ({
    ...state,
    isSaving: false,
  })),
  on(CirugiaActions.deleteCirugiaFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),

  // Initialize
  on(CirugiaActions.initializarCirugia, (state) => ({
    ...state,
    isSaving: true,
    error: null,
  })),
  on(CirugiaActions.initializarCirugiaSuccess, (state) => ({
    ...state,
    isSaving: false,
  })),
  on(CirugiaActions.initializarCirugiaFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),

  // Finalize
  on(CirugiaActions.finalizarCirugia, (state) => ({
    ...state,
    isSaving: true,
    error: null,
  })),
  on(CirugiaActions.finalizarCirugiaSuccess, (state) => ({
    ...state,
    isSaving: false,
  })),
  on(CirugiaActions.finalizarCirugiaFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),

  // Update filters
  on(CirugiaActions.updateCirugiaFilters, (state, { estado, search, sort, order }) => ({
    ...state,
    estado: estado !== undefined ? estado : state.estado,
    search: search !== undefined ? search : state.search,
    sort: sort !== undefined ? sort : state.sort,
    order: order !== undefined ? order : state.order,
  }))
);

export const cirugiaFeature = createFeature({
  name: 'cirugia',
  reducer: cirugiaReducer,
});
