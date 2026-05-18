import { createAction, props } from '@ngrx/store';
import { ICirugia } from '../../core/models/cirugia';

export const CirugiaActions = {
  // Load cirugias paginated with filtering and sorting
  loadCirugiasPage: createAction(
    '[Cirugia API] Load Cirugias Page',
    props<{
      page: number;
      pageSize: number;
      estado?: string;
      search?: string;
      sort?: string;
      order?: 'asc' | 'desc';
    }>()
  ),
  loadCirugiasPageSuccess: createAction(
    '[Cirugia API] Load Cirugias Page Success',
    props<{
      items: ICirugia[];
      totalItems: number;
      page: number;
      pageSize: number;
    }>()
  ),
  loadCirugiasPageFailure: createAction(
    '[Cirugia API] Load Cirugias Page Failure',
    props<{ error: string }>()
  ),

  // Create cirugia
  createCirugia: createAction(
    '[Cirugia API] Create Cirugia',
    props<{ cirugia: ICirugia }>()
  ),
  createCirugiaSuccess: createAction(
    '[Cirugia API] Create Cirugia Success',
    props<{ cirugia: ICirugia }>()
  ),
  createCirugiaFailure: createAction(
    '[Cirugia API] Create Cirugia Failure',
    props<{ error: string }>()
  ),

  // Update cirugia
  updateCirugia: createAction(
    '[Cirugia API] Update Cirugia',
    props<{ id: number; cirugia: Partial<ICirugia> }>()
  ),
  updateCirugiaSuccess: createAction(
    '[Cirugia API] Update Cirugia Success',
    props<{ cirugia: ICirugia }>()
  ),
  updateCirugiaFailure: createAction(
    '[Cirugia API] Update Cirugia Failure',
    props<{ error: string }>()
  ),

  // Delete cirugia
  deleteCirugia: createAction(
    '[Cirugia API] Delete Cirugia',
    props<{ id: number }>()
  ),
  deleteCirugiaSuccess: createAction(
    '[Cirugia API] Delete Cirugia Success',
    props<{ id: number }>()
  ),
  deleteCirugiaFailure: createAction(
    '[Cirugia API] Delete Cirugia Failure',
    props<{ error: string }>()
  ),

  // Initialize cirugia (start surgery)
  initializarCirugia: createAction(
    '[Cirugia API] Initialize Cirugia',
    props<{ id: number }>()
  ),
  initializarCirugiaSuccess: createAction(
    '[Cirugia API] Initialize Cirugia Success',
    props<{ cirugia: ICirugia }>()
  ),
  initializarCirugiaFailure: createAction(
    '[Cirugia API] Initialize Cirugia Failure',
    props<{ error: string }>()
  ),

  // Finalize cirugia (mark as completed)
  finalizarCirugia: createAction(
    '[Cirugia API] Finalize Cirugia',
    props<{ id: number }>()
  ),
  finalizarCirugiaSuccess: createAction(
    '[Cirugia API] Finalize Cirugia Success',
    props<{ cirugia: ICirugia }>()
  ),
  finalizarCirugiaFailure: createAction(
    '[Cirugia API] Finalize Cirugia Failure',
    props<{ error: string }>()
  ),

  // Update filter/search/sort without changing page
  updateCirugiaFilters: createAction(
    '[Cirugia API] Update Filters',
    props<{
      estado?: string;
      search?: string;
      sort?: string;
      order?: 'asc' | 'desc';
    }>()
  ),
};
