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
import { PersonalListDialog } from '../../cirugia/personal-list-dialog/personal-list-dialog';
import { IMiembroEquipoMedico } from '../../core/models/miembro-equipo';

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
  selectedPersonal: IMiembroEquipoMedico | null = null;

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
        this.showError(error, 'Error al crear el usuario, legajo ya registrado.');
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
        this.showError(error, 'Error al actualizar el usuario.');
        this.isLoading = false;
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  private showError(error: any, fallbackMessage: string) {
    let message = fallbackMessage;

    // Log error structure for debugging
    console.error('Error detalles:', error);

    // Check for HTTP error status
    const status = error?.status || error?.statusCode;
    const errorBody = error?.error || error;
    let errorMsg = '';

    // Extract error message from various possible structures
    if (typeof errorBody === 'string') {
      try {
        const parsed = JSON.parse(errorBody);
        errorMsg = parsed.errorMessage || parsed.message || '';
      } catch {
        errorMsg = errorBody;
      }
    } else if (typeof errorBody === 'object') {
      errorMsg = errorBody.errorMessage || errorBody.message || errorBody.description || '';
    }

    // Handle 409 Conflict (User exists with same username)
    if (status === 409) {
      if (errorMsg.includes('User exists') || errorMsg.includes('username')) {
        message = `El legajo "${this.form.get('legajo')?.value}" ya está registrado. Elija otro legajo.`;
      } else if (errorMsg.includes('email')) {
        message = 'El correo electrónico ya está registrado.';
      } else {
        message = 'El usuario ya existe. Intente con otro legajo o correo electrónico.';
      }
    }
    // Handle 400 Bad Request
    else if (status === 400) {
      if (errorMsg.includes('email')) {
        message = 'El correo electrónico ya está en uso.';
      } else if (errorMsg.includes('password')) {
        message = 'La contraseña no cumple con los requisitos mínimos.';
      } else {
        message = 'Datos inválidos. Verifique el formulario.';
      }
    }
    // Handle 401 Unauthorized
    else if (status === 401) {
      message = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
    }
    // Handle 403 Forbidden
    else if (status === 403) {
      message = 'No tiene permisos para realizar esta acción.';
    }
    // Use extracted error message if available
    else if (errorMsg) {
      message = errorMsg;
    }

    this.snackBar.open(message, 'Cerrar', {
      duration: APP_CONSTANTS.TIMEOUTS.TOAST_DURATION,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
