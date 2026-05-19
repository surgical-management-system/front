import { createAction, props } from '@ngrx/store';
import { ITestResponse } from '../../core/models/test-response';

export const loadDashboardData = createAction('[Dashboard Page] Load Dashboard Data');

export const loadPingSuccess = createAction(
  '[Dashboard API] Load Ping Success',
  props<{ ping: string }>()
);

export const loadPingFailure = createAction(
  '[Dashboard API] Load Ping Failure',
  props<{ error: string }>()
);

export const loadTestSuccess = createAction(
  '[Dashboard API] Load Test Success',
  props<{ testData: ITestResponse }>()
);

export const loadTestFailure = createAction(
  '[Dashboard API] Load Test Failure',
  props<{ error: string }>()
);

export const refreshDashboard = createAction('[Dashboard Page] Refresh Dashboard');
