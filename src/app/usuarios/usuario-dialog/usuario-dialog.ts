import { Component, DestroyRef, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IKeycloakUserCreate } from '../../core/services/usuario.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { PersonalListDialog } from '../../cirugia/personal-list-dialog/personal-list-dialog';
import { IMiembroEquipoMedico } from '../../core/models/miembro-equipo';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import {
  createUsuarioFailure,
  createUsuarioSuccess,
  updateUsuarioFailure,
  updateUsuarioSuccess,
} from '../state/usuarios.actions';
import { UsuariosFacade } from '../state/usuarios.facade';

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './usuario-dialog.html',
  styleUrl: './usuario-dialog.css'
})
export class UsuarioDialogComponent {
  private readonly actions$ = inject(Actions);
  form: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  isEditMode = false;
  selectedPersonal: IMiembroEquipoMedico | null = null;

  roles = [
    { value: 'admin', label: 'Administrador', icon: 'admin_panel_settings' },
    { value: 'personal_medico', label: 'Personal Médico', icon: 'medical_services' },
  ];

  constructor(
    private fb: FormBuilder,
    private usuariosFacade: UsuariosFacade,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private destroyRef: DestroyRef
  ) {
    this.isEditMode = !!data?.id;
    
    this.form = this.fb.group({
      legajo: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', this.isEditMode ? [] : Validators.required],
      enabled: [true],
      emailVerified: [false],
      temporaryPassword: [false],
    }, { validators: this.passwordMatchValidator });

    // Si es edición, cargar datos
    if (this.isEditMode && data) {
      this.form.patchValue({
        legajo: data.legajo || data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.roles?.[0] || '',
        enabled: data.enabled,
        emailVerified: data.emailVerified,
      });
      // Deshabilitar legajo en edición
      this.form.get('legajo')?.disable();
    }
  }

  seleccionarPersonal(): void {
    if (this.isEditMode) {
      return;
    }

    const dialogRef = this.dialog.open(PersonalListDialog, {
      width: '860px',
      maxWidth: '95vw',
      data: { q: this.form.get('legajo')?.value ?? '' },
    });

    dialogRef.afterClosed().subscribe((selected: IMiembroEquipoMedico | null) => {
      if (!selected) {
        return;
      }

      this.selectedPersonal = selected;
      
      // If apellido is provided, use it directly. Otherwise, split nombre into firstName and lastName.
      const { firstName, lastName } = this.splitPersonalName(selected.nombre ?? '', selected.apellido ?? '');
      
      this.form.patchValue({
        legajo: selected.legajo ?? '',
        firstName,
        lastName,
        role: selected.rol ?? 'personal_medico',
      });
      this.form.markAsDirty();
    });
  }

  limpiarSeleccionPersonal(): void {
    if (this.isEditMode) {
      return;
    }

    this.selectedPersonal = null;
    this.form.patchValue({
      legajo: '',
      firstName: '',
      lastName: '',
      role: '',
    });
  }

  getSelectedPersonalName(): string {
    const nombre = this.selectedPersonal?.nombre?.trim() ?? '';
    const apellido = this.selectedPersonal?.apellido?.trim() ?? '';
    return [nombre, apellido].filter(Boolean).join(' ') || nombre || 'Personal';
  }

  private splitPersonalName(nombre: string, apellido: string): { firstName: string; lastName: string } {
    // If apellido is already provided and not empty, use it
    if (apellido && apellido.trim()) {
      return {
        firstName: nombre.trim(),
        lastName: apellido.trim(),
      };
    }

    // If apellido is empty, split nombre by spaces
    const parts = nombre.trim().split(/\s+/);
    if (parts.length === 1) {
      // Single word: all goes to firstName
      return {
        firstName: parts[0],
        lastName: '',
      };
    }

    // Multiple words: last word is lastName, rest is firstName
    const lastPart = parts[parts.length - 1];
    const firstParts = parts.slice(0, -1).join(' ');
    return {
      firstName: firstParts,
      lastName: lastPart,
    };
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const accion = this.isEditMode ? 'actualización' : 'creación';
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Confirmar ${accion}`,
        message: `¿Estás seguro de que deseas ${this.isEditMode ? 'actualizar' : 'crear'} este usuario?`,
      },
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.isEditMode) {
          this.actualizarUsuario();
        } else {
          this.crearUsuario();
        }
      }
    });
  }

  private crearUsuario() {
    const formValue = this.form.value;

    const userData: IKeycloakUserCreate = {
      legajo: formValue.legajo,
      username: formValue.legajo,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      enabled: formValue.enabled,
      emailVerified: formValue.emailVerified,
      credentials: [{
        type: 'password',
        value: formValue.password,
        temporary: formValue.temporaryPassword,
      }],
      roles: [formValue.role],
    };

    this.awaitSaveResult('crear');
    this.usuariosFacade.create(userData);
  }

  private actualizarUsuario() {
    const formValue = this.form.getRawValue(); // getRawValue incluye campos disabled

    const userData: Partial<IKeycloakUserCreate> = {
      legajo: formValue.legajo,
      username: formValue.legajo,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      enabled: formValue.enabled,
      emailVerified: formValue.emailVerified,
      roles: [formValue.role],
    };

    // Solo incluir contraseña si se ingresó una nueva
    if (formValue.password) {
      userData.credentials = [{
        type: 'password',
        value: formValue.password,
        temporary: formValue.temporaryPassword,
      }];
    }

    this.awaitSaveResult('actualizar');
    this.usuariosFacade.update(this.data.id, userData);
  }

  private awaitSaveResult(action: 'crear' | 'actualizar') {
    this.isLoading = true;

    this.actions$
      .pipe(
        ofType(createUsuarioSuccess, createUsuarioFailure, updateUsuarioSuccess, updateUsuarioFailure),
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((actionResult) => {
        this.isLoading = false;

        const isCreateFlow = action === 'crear';
        const isCreateSuccess = actionResult.type === createUsuarioSuccess.type;
        const isCreateFailure = actionResult.type === createUsuarioFailure.type;
        const isUpdateSuccess = actionResult.type === updateUsuarioSuccess.type;
        const isUpdateFailure = actionResult.type === updateUsuarioFailure.type;

        if ((isCreateFlow && isCreateSuccess) || (!isCreateFlow && isUpdateSuccess)) {
          this.dialogRef.close(actionResult.user);
          return;
        }

        if ((isCreateFlow && isCreateFailure) || (!isCreateFlow && isUpdateFailure)) {
          return;
        }
      });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
