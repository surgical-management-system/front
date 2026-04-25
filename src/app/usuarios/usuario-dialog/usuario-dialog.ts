import { Component, Inject } from '@angular/core';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuarioService, IKeycloakUserCreate } from '../../core/services/usuario.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { APP_CONSTANTS } from '../../core/constants/app-constants';

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
    MatSnackBarModule,
  ],
  templateUrl: './usuario-dialog.html',
  styleUrl: './usuario-dialog.css'
})
export class UsuarioDialogComponent {
  form: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  isEditMode = false;

  roles = [
    { value: 'admin', label: 'Administrador', icon: 'admin_panel_settings' },
    { value: 'personal_medico', label: 'Personal Médico', icon: 'medical_services' },
  ];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
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
    this.isLoading = true;
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

    this.usuarioService.createUsuario(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        this.showError(error, 'Unable to create user.');
        this.isLoading = false;
      }
    });
  }

  private actualizarUsuario() {
    this.isLoading = true;
    const formValue = this.form.getRawValue(); // getRawValue incluye campos disabled

    const userData: any = {
      id: this.data.id,
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

    this.usuarioService.updateUsuario(this.data.id, userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        this.showError(error, 'Unable to update user.');
        this.isLoading = false;
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  private showError(error: any, fallbackMessage: string) {
    const message =
      error?.errorDescription ||
      error?.description ||
      error?.error?.description ||
      error?.error?.message ||
      fallbackMessage;

    this.snackBar.open(message, 'Close', {
      duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
