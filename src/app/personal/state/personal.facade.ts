import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { deletePersonal, loadPersonalPage, savePersonal } from './personal.actions';
import { personalFeature } from './personal.reducer';

@Injectable({
  providedIn: 'root',
})
export class PersonalFacade {
  private readonly store = inject(Store);
  readonly items$ = this.store.select(personalFeature.selectItems);
  readonly totalItems$ = this.store.select(personalFeature.selectTotalItems);
  readonly page$ = this.store.select(personalFeature.selectPage);
  readonly pageSize$ = this.store.select(personalFeature.selectPageSize);
  readonly isLoading$ = this.store.select(personalFeature.selectIsLoading);
  readonly isSaving$ = this.store.select(personalFeature.selectIsSaving);
  readonly error$ = this.store.select(personalFeature.selectError);

  loadPage(page: number, pageSize: number): void {
    this.store.dispatch(loadPersonalPage({ page, pageSize }));
  }

  deleteById(id: number): void {
    this.store.dispatch(deletePersonal({ id }));
  }

  save(personal: import('../../core/models/personal').IPersonal): void {
    this.store.dispatch(savePersonal({ personal }));
  }
}