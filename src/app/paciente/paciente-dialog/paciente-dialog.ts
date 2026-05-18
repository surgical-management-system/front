import { Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { IPacienteExterno } from '../../core/models/paciente-externo';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import {
  createPacienteFailure,
  createPacienteSuccess,
  updatePacienteFailure,
  updatePacienteSuccess,
} from '../state/paciente.actions';
import { PacienteFacade } from '../state/paciente.facade';

@Component({
  selector: 'app-paciente-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './paciente-dialog.html',
  styleUrls: ['./paciente-dialog.css'],
})
export class PacienteDialog implements OnInit {
  private readonly actions$ = inject(Actions);
  form!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PacienteDialog>,
    private pacienteFacade: PacienteFacade,
    @Inject(MAT_DIALOG_DATA) public data: IPacienteExterno | null,
    private destroyRef: DestroyRef
  ) {
    this.form = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      peso: [''],
      altura: [''],
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  guardar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.actions$
        .pipe(
          ofType(createPacienteSuccess, createPacienteFailure, updatePacienteSuccess, updatePacienteFailure),
          take(1),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((action) => {
          this.isLoading = false;

          if (action.type === createPacienteSuccess.type || action.type === updatePacienteSuccess.type) {
            this.dialogRef.close(action.paciente);
            return;
          }
        });

      const payload = this.form.getRawValue() as IPacienteExterno;
      if (this.data?.id) {
        this.pacienteFacade.updatePaciente(this.data.id, payload);
      } else {
        this.pacienteFacade.createPaciente(payload);
      }
    }
  }
}
