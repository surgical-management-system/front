import { createFeature, createReducer, on } from '@ngrx/store';
import { ITestResponse } from '../../core/models/test-response';
import * as DashboardActions from './dashboard.actions';

export interface DashboardState {
  ping: string | null;
  testData: ITestResponse | null;
  isLoading: boolean;
  error: string | null;
  pingLoaded: boolean;
  testLoaded: boolean;
}

export const initialState: DashboardState = {
  ping: null,
  testData: null,
  isLoading: false,
  error: null,
  pingLoaded: false,
  testLoaded: false,
};

export const dashboardFeature = createFeature({
  name: 'dashboard',
  reducer: createReducer(
    initialState,
    on(DashboardActions.loadDashboardData, (state) => ({
      ...state,
      isLoading: true,
      error: null,
      pingLoaded: false,
      testLoaded: false,
    })),
    on(DashboardActions.refreshDashboard, (state) => ({
      ...state,
      isLoading: true,
      error: null,
      pingLoaded: false,
      testLoaded: false,
    })),
    on(DashboardActions.loadPingSuccess, (state, { ping }) => ({
      ...state,
      ping,
      pingLoaded: true,
      isLoading: !state.testLoaded,
      error: null,
    })),
    on(DashboardActions.loadPingFailure, (state, { error }) => ({
      ...state,
      ping: null,
      pingLoaded: false,
      error,
      isLoading: false,
    })),
    on(DashboardActions.loadTestSuccess, (state, { testData }) => ({
      ...state,
      testData,
      testLoaded: true,
      isLoading: !state.pingLoaded,
      error: null,
    })),
    on(DashboardActions.loadTestFailure, (state, { error }) => ({
      ...state,
      testData: null,
      testLoaded: false,
      error,
      isLoading: false,
    }))
  ),
});
