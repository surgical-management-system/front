import { createAction, props } from '@ngrx/store';
import { IUrgencia } from '../../core/models/urgencia';

export const UrgenciaActions = {
  loadUrgenciasPage: createAction(
    '[Urgencia API] Load Urgencias Page',
    props<{
      page: number;
      pageSize: number;
      estado?: string;
      search?: string;
      sort?: string;
      order?: 'asc' | 'desc';
    }>()
  ),
  loadUrgenciasPageSuccess: createAction(
    '[Urgencia API] Load Urgencias Page Success',
    props<{
      items: IUrgencia[];
      totalItems: number;
      page: number;
      pageSize: number;
    }>()
  ),
  loadUrgenciasPageFailure: createAction(
    '[Urgencia API] Load Urgencias Page Failure',
    props<{ error: string }>()
  ),

  createUrgencia: createAction(
    '[Urgencia API] Create Urgencia',
    props<{ urgencia: IUrgencia }>()
  ),
  createUrgenciaSuccess: createAction(
    '[Urgencia API] Create Urgencia Success',
    props<{ urgencia: IUrgencia }>()
  ),
  createUrgenciaFailure: createAction(
    '[Urgencia API] Create Urgencia Failure',
    props<{ error: string }>()
  ),

  updateUrgencia: createAction(
    '[Urgencia API] Update Urgencia',
    props<{ id: number; urgencia: Partial<IUrgencia> }>()
  ),
  updateUrgenciaSuccess: createAction(
    '[Urgencia API] Update Urgencia Success',
    props<{ urgencia: IUrgencia }>()
  ),
  updateUrgenciaFailure: createAction(
    '[Urgencia API] Update Urgencia Failure',
    props<{ error: string }>()
  ),

  deleteUrgencia: createAction(
    '[Urgencia API] Delete Urgencia',
    props<{ id: number }>()
  ),
  deleteUrgenciaSuccess: createAction(
    '[Urgencia API] Delete Urgencia Success',
    props<{ id: number }>()
  ),
  deleteUrgenciaFailure: createAction(
    '[Urgencia API] Delete Urgencia Failure',
    props<{ error: string }>()
  ),

  inicializarUrgencia: createAction(
    '[Urgencia API] Initialize Urgencia',
    props<{ id: number }>()
  ),
  inicializarUrgenciaSuccess: createAction(
    '[Urgencia API] Initialize Urgencia Success',
    props<{ urgencia: IUrgencia }>()
  ),
  inicializarUrgenciaFailure: createAction(
    '[Urgencia API] Initialize Urgencia Failure',
    props<{ error: string }>()
  ),

  finalizarUrgencia: createAction(
    '[Urgencia API] Finalize Urgencia',
    props<{ id: number }>()
  ),
  finalizarUrgenciaSuccess: createAction(
    '[Urgencia API] Finalize Urgencia Success',
    props<{ urgencia: IUrgencia }>()
  ),
  finalizarUrgenciaFailure: createAction(
    '[Urgencia API] Finalize Urgencia Failure',
    props<{ error: string }>()
  ),
};
