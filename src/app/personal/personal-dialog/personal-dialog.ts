import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AbstractControl, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonalService } from '../../core/services/personal.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { IPersonal } from '../../core/models/personal';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

const ALLOWED_ROLES = [
  { value: 'admin', label: 'Administrador', icon: 'admin_panel_settings' },
  { value: 'personal_medico', label: 'Personal Médico', icon: 'medical_services' },
];

const ALLOWED_STATES = [
  { value: 'alta', label: 'Alta', icon: 'check_circle' },
  { value: 'baja', label: 'Baja', icon: 'cancel' },
];

@Component({
  standalone: true,
  selector: 'app-personal-dialog',
  templateUrl: './personal-dialog.html',
  styleUrls: ['./personal-dialog.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule, // required for formControlName
    MatFormFieldModule, // provides mat-form-field
    MatInputModule, // provides matInput
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
  ],
  providers: [PersonalService],
})
export class PersonalDialogComponent {
  public form: FormGroup;
  public roles = ALLOWED_ROLES;
  public states = ALLOWED_STATES;

  constructor(
    private fb: FormBuilder,
    @Inject(PersonalService) private personalService: PersonalService,
    private dialogRef: MatDialogRef<PersonalDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: IPersonal
  ) {
    this.form = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', Validators.required],
      legajo: ['', Validators.required],
      especialidad: ['', Validators.required],
      rol: ['', [Validators.required, this.allowedRoleValidator]],
      estado: ['', [Validators.required, this.allowedStateValidator]],
      telefono: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  get selectedRole() {
    return this.roles.find((role) => role.value === this.form.get('rol')?.value);
  }

  get selectedState() {
    return this.states.find((state) => state.value === this.form.get('estado')?.value);
  }

  private allowedRoleValidator(control: AbstractControl) {
    if (!control.value) {
      return null;
    }

    return ALLOWED_ROLES.some((role) => role.value === control.value)
      ? null
      : { invalidRole: { allowed: ALLOWED_ROLES.map((role) => role.value) } };
  }

  private allowedStateValidator(control: AbstractControl) {
    if (!control.value) {
      return null;
    }

    return ALLOWED_STATES.some((state) => state.value === control.value)
      ? null
      : { invalidState: { allowed: ALLOWED_STATES.map((state) => state.value) } };
  }

  guardar() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const personalData = this.form.value;
    if (personalData.id) {
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmar actualización',
          message: '¿Estás seguro de que deseas actualizar este personal?',
        },
      });

      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.personalService.updatePersonal(personalData).subscribe((response) => {
            this.dialogRef.close(response);
          });
        }
      });
    } else {
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmar creación',
          message: '¿Estás seguro de que deseas crear este personal?',
        },
      });

      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.personalService.createPersonal(personalData).subscribe((response) => {
            this.dialogRef.close(response);
          });
        }
      });
    }
  }
  cancelar() {
    this.dialogRef.close();
  }
}
