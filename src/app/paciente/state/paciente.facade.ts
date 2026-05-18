import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { IPacienteExterno } from '../../core/models/paciente-externo';
import {
  createPaciente,
  deletePaciente,
  loadHospitalPacientes,
  loadPacientesPage,
  togglePacienteActivo,
  updatePaciente,
} from './paciente.actions';
import { pacienteFeature } from './paciente.reducer';

@Injectable({
  providedIn: 'root',
})
export class PacienteFacade {
  private readonly store = inject(Store);

  readonly items$ = this.store.select(pacienteFeature.selectItems);
  readonly totalItems$ = this.store.select(pacienteFeature.selectTotalItems);
  readonly page$ = this.store.select(pacienteFeature.selectPage);
  readonly pageSize$ = this.store.select(pacienteFeature.selectPageSize);
  readonly isLoading$ = this.store.select(pacienteFeature.selectIsLoading);
  readonly isSaving$ = this.store.select(pacienteFeature.selectIsSaving);
  readonly hospitalItems$ = this.store.select(pacienteFeature.selectHospitalItems);
  readonly hospitalTotalItems$ = this.store.select(pacienteFeature.selectHospitalTotalItems);
  readonly hospitalPage$ = this.store.select(pacienteFeature.selectHospitalPage);
  readonly hospitalPageSize$ = this.store.select(pacienteFeature.selectHospitalPageSize);
  readonly isHospitalLoading$ = this.store.select(pacienteFeature.selectIsHospitalLoading);
  readonly error$ = this.store.select(pacienteFeature.selectError);

  loadPage(page: number, pageSize: number): void {
    this.store.dispatch(loadPacientesPage({ page, pageSize }));
  }

  loadHospitalPage(page: number, pageSize: number): void {
    this.store.dispatch(loadHospitalPacientes({ page, pageSize }));
  }

  createPaciente(paciente: IPacienteExterno): void {
    this.store.dispatch(createPaciente({ paciente }));
  }

  updatePaciente(id: number, paciente: Partial<IPacienteExterno>): void {
    this.store.dispatch(updatePaciente({ id, paciente }));
  }

  deletePaciente(id: number): void {
    this.store.dispatch(deletePaciente({ id }));
  }

  toggleActivo(id: number, active: boolean): void {
    this.store.dispatch(togglePacienteActivo({ id, active }));
  }
}