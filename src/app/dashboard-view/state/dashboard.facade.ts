import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { dashboardFeature } from './dashboard.reducer';
import * as DashboardActions from './dashboard.actions';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private store = inject(Store);

  ping$ = this.store.select(dashboardFeature.selectPing);
  testData$ = this.store.select(dashboardFeature.selectTestData);
  isLoading$ = this.store.select(dashboardFeature.selectIsLoading);
  error$ = this.store.select(dashboardFeature.selectError);

  loadDashboard(): void {
    this.store.dispatch(DashboardActions.loadDashboardData());
  }

  refreshDashboard(): void {
    this.store.dispatch(DashboardActions.refreshDashboard());
  }
}
