import { createAction, props } from '@ngrx/store';
import { IPaciente } from '../../core/models/paciente';
import { IPacienteExterno } from '../../core/models/paciente-externo';

export const loadPacientesPage = createAction(
  '[Paciente Page] Load Pacientes Page',
  props<{ page: number; pageSize: number }>()
);

export const loadPacientesPageSuccess = createAction(
  '[Paciente API] Load Pacientes Page Success',
  props<{ items: IPaciente[]; totalItems: number; page: number; pageSize: number }>()
);

export const loadPacientesPageFailure = createAction(
  '[Paciente API] Load Pacientes Page Failure',
  props<{ error: string }>()
);

export const loadHospitalPacientes = createAction(
  '[Paciente Hospital] Load Hospital Pacientes',
  props<{ page: number; pageSize: number }>()
);

export const loadHospitalPacientesSuccess = createAction(
  '[Paciente API] Load Hospital Pacientes Success',
  props<{ items: IPacienteExterno[]; totalItems: number; page: number; pageSize: number }>()
);

export const loadHospitalPacientesFailure = createAction(
  '[Paciente API] Load Hospital Pacientes Failure',
  props<{ error: string }>()
);

export const createPaciente = createAction(
  '[Paciente Dialog] Create Paciente',
  props<{ paciente: IPacienteExterno }>()
);

export const createPacienteSuccess = createAction(
  '[Paciente API] Create Paciente Success',
  props<{ paciente: IPaciente }>()
);

export const createPacienteFailure = createAction(
  '[Paciente API] Create Paciente Failure',
  props<{ error: string }>()
);

export const updatePaciente = createAction(
  '[Paciente Dialog] Update Paciente',
  props<{ id: number; paciente: Partial<IPacienteExterno> }>()
);

export const updatePacienteSuccess = createAction(
  '[Paciente API] Update Paciente Success',
  props<{ paciente: IPaciente }>()
);

export const updatePacienteFailure = createAction(
  '[Paciente API] Update Paciente Failure',
  props<{ error: string }>()
);

export const deletePaciente = createAction(
  '[Paciente List] Delete Paciente',
  props<{ id: number }>()
);

export const deletePacienteSuccess = createAction(
  '[Paciente API] Delete Paciente Success',
  props<{ id: number }>()
);

export const deletePacienteFailure = createAction(
  '[Paciente API] Delete Paciente Failure',
  props<{ error: string }>()
);

export const togglePacienteActivo = createAction(
  '[Paciente List] Toggle Paciente Activo',
  props<{ id: number; active: boolean }>()
);

export const togglePacienteActivoSuccess = createAction(
  '[Paciente API] Toggle Paciente Activo Success',
  props<{ id: number; active: boolean }>()
);

export const togglePacienteActivoFailure = createAction(
  '[Paciente API] Toggle Paciente Activo Failure',
  props<{ error: string }>()
);