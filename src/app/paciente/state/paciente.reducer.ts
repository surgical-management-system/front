import { createFeature, createReducer, on } from '@ngrx/store';
import { IPaciente } from '../../core/models/paciente';
import { IPacienteExterno } from '../../core/models/paciente-externo';
import * as PacienteActions from './paciente.actions';

export interface PacienteState {
  items: IPaciente[];
  totalItems: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  hospitalItems: IPacienteExterno[];
  hospitalTotalItems: number;
  hospitalPage: number;
  hospitalPageSize: number;
  isHospitalLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialPacienteState: PacienteState = {
  items: [],
  totalItems: 0,
  page: 0,
  pageSize: 16,
  isLoading: false,
  hospitalItems: [],
  hospitalTotalItems: 0,
  hospitalPage: 0,
  hospitalPageSize: 10,
  isHospitalLoading: false,
  isSaving: false,
  error: null,
};

export const pacienteFeature = createFeature({
  name: 'paciente',
  reducer: createReducer(
    initialPacienteState,
    on(PacienteActions.loadPacientesPage, (state, { page, pageSize }) => ({
      ...state,
      page,
      pageSize,
      isLoading: true,
      error: null,
    })),
    on(PacienteActions.loadPacientesPageSuccess, (state, { items, totalItems, page, pageSize }) => ({
      ...state,
      items,
      totalItems,
      page,
      pageSize,
      isLoading: false,
      error: null,
    })),
    on(PacienteActions.loadPacientesPageFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
    on(PacienteActions.loadHospitalPacientes, (state, { page, pageSize }) => ({
      ...state,
      hospitalPage: page,
      hospitalPageSize: pageSize,
      isHospitalLoading: true,
      error: null,
    })),
    on(PacienteActions.loadHospitalPacientesSuccess, (state, { items, totalItems, page, pageSize }) => ({
      ...state,
      hospitalItems: items,
      hospitalTotalItems: totalItems,
      hospitalPage: page,
      hospitalPageSize: pageSize,
      isHospitalLoading: false,
      error: null,
    })),
    on(PacienteActions.loadHospitalPacientesFailure, (state, { error }) => ({
      ...state,
      isHospitalLoading: false,
      error,
    })),
    on(
      PacienteActions.createPaciente,
      PacienteActions.updatePaciente,
      PacienteActions.deletePaciente,
      PacienteActions.togglePacienteActivo,
      (state) => ({
        ...state,
        isSaving: true,
        error: null,
      })
    ),
    on(
      PacienteActions.createPacienteSuccess,
      PacienteActions.updatePacienteSuccess,
      PacienteActions.deletePacienteSuccess,
      PacienteActions.togglePacienteActivoSuccess,
      (state) => ({
        ...state,
        isSaving: false,
        error: null,
      })
    ),
    on(
      PacienteActions.createPacienteFailure,
      PacienteActions.updatePacienteFailure,
      PacienteActions.deletePacienteFailure,
      PacienteActions.togglePacienteActivoFailure,
      (state, { error }) => ({
        ...state,
        isSaving: false,
        error,
      })
    )
  ),
});