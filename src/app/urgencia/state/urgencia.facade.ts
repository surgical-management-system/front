import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { IUrgencia } from '../../core/models/urgencia';
import { UrgenciaActions } from './urgencia.actions';
import { urgenciaFeature } from './urgencia.reducer';

@Injectable({ providedIn: 'root' })
export class UrgenciaFacade {
  private store = inject(Store);

  urgencias$ = this.store.select(urgenciaFeature.selectItems);
  totalUrgencias$ = this.store.select(urgenciaFeature.selectTotalItems);
  page$ = this.store.select(urgenciaFeature.selectPage);
  pageSize$ = this.store.select(urgenciaFeature.selectPageSize);
  estado$ = this.store.select(urgenciaFeature.selectEstado);
  search$ = this.store.select(urgenciaFeature.selectSearch);
  sort$ = this.store.select(urgenciaFeature.selectSort);
  order$ = this.store.select(urgenciaFeature.selectOrder);
  isLoading$ = this.store.select(urgenciaFeature.selectIsLoading);
  isSaving$ = this.store.select(urgenciaFeature.selectIsSaving);
  error$ = this.store.select(urgenciaFeature.selectError);

  loadPage(
    page: number,
    pageSize: number,
    estado?: string,
    search?: string,
    sort?: string,
    order?: 'asc' | 'desc'
  ): void {
    this.store.dispatch(UrgenciaActions.loadUrgenciasPage({ page, pageSize, estado, search, sort, order }));
  }

  createUrgencia(urgencia: IUrgencia): void {
    this.store.dispatch(UrgenciaActions.createUrgencia({ urgencia }));
  }

  updateUrgencia(id: number, urgencia: Partial<IUrgencia>): void {
    this.store.dispatch(UrgenciaActions.updateUrgencia({ id, urgencia }));
  }

  deleteUrgencia(id: number): void {
    this.store.dispatch(UrgenciaActions.deleteUrgencia({ id }));
  }

  inicializarUrgencia(id: number): void {
    this.store.dispatch(UrgenciaActions.inicializarUrgencia({ id }));
  }

  finalizarUrgencia(id: number): void {
    this.store.dispatch(UrgenciaActions.finalizarUrgencia({ id }));
  }
}
