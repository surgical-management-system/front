import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ICirugia } from '../../core/models/cirugia';
import { CirugiaActions } from './cirugia.actions';
import { cirugiaFeature } from './cirugia.reducer';

@Injectable({
  providedIn: 'root',
})
export class CirugiaFacade {
  private store = inject(Store);

  // Selectors
  cirugias$ = this.store.select(cirugiaFeature.selectItems);
  totalCirugias$ = this.store.select(cirugiaFeature.selectTotalItems);
  currentPage$ = this.store.select(cirugiaFeature.selectPage);
  currentPageSize$ = this.store.select(cirugiaFeature.selectPageSize);
  estadoFilter$ = this.store.select(cirugiaFeature.selectEstado);
  searchFilter$ = this.store.select(cirugiaFeature.selectSearch);
  sortField$ = this.store.select(cirugiaFeature.selectSort);
  sortOrder$ = this.store.select(cirugiaFeature.selectOrder);
  isLoading$ = this.store.select(cirugiaFeature.selectIsLoading);
  isSaving$ = this.store.select(cirugiaFeature.selectIsSaving);
  error$ = this.store.select(cirugiaFeature.selectError);

  loadPage(
    page: number,
    pageSize: number,
    estado?: string,
    search?: string,
    sort?: string,
    order?: 'asc' | 'desc'
  ): void {
    this.store.dispatch(
      CirugiaActions.loadCirugiasPage({ page, pageSize, estado, search, sort, order })
    );
  }

  createCirugia(cirugia: ICirugia): void {
    this.store.dispatch(CirugiaActions.createCirugia({ cirugia }));
  }

  updateCirugia(id: number, cirugia: Partial<ICirugia>): void {
    this.store.dispatch(CirugiaActions.updateCirugia({ id, cirugia }));
  }

  deleteCirugia(id: number): void {
    this.store.dispatch(CirugiaActions.deleteCirugia({ id }));
  }

  initializarCirugia(id: number): void {
    this.store.dispatch(CirugiaActions.initializarCirugia({ id }));
  }

  finalizarCirugia(id: number): void {
    this.store.dispatch(CirugiaActions.finalizarCirugia({ id }));
  }

  updateFilters(
    estado?: string,
    search?: string,
    sort?: string,
    order?: 'asc' | 'desc'
  ): void {
    this.store.dispatch(
      CirugiaActions.updateCirugiaFilters({ estado, search, sort, order })
    );
  }
}
