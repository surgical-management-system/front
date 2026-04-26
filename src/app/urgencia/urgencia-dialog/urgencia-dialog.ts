import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PacienteListLite } from '../../shared/paciente-list-lite/paciente-list-lite';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { IPacienteLite } from '../../core/models/paciente';
import { IQuirofano } from '../../core/models/quirofano';
import { IUrgencia } from '../../core/models/urgencia';
import { QuirofanoService } from '../../core/services/quirofano.service';
import { UrgenciaService } from '../../core/services/urgencia.service';

@Component({
  standalone: true,
  selector: 'app-urgencia-dialog',
  templateUrl: './urgencia-dialog.html',
  styleUrls: ['./urgencia-dialog.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
  ],
})
export class UrgenciaDialog {
  public form: FormGroup;
  public pacienteCtrl = new FormControl<string>('');
  public quirofanos: IQuirofano[] = [];
  public servicios: any[] = [];

  constructor(
    private fb: FormBuilder,
    private urgenciaService: UrgenciaService,
    private quirofanoService: QuirofanoService,
    private dialogRef: MatDialogRef<UrgenciaDialog>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: IUrgencia
  ) {
    this.form = this.fb.group({
      id: [null],
      prioridad: ['ALTA', Validators.required],
      nivelUrgencia: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      fechaHoraInicio: ['', Validators.required],
      estado: ['PENDIENTE', Validators.required],
      anestesia: ['', Validators.required],
      tipo: ['', Validators.required],
      pacienteId: [null, Validators.required],
      pacienteNombre: [''],
      servicioId: [null, Validators.required],
      servicioNombre: [''],
      quirofanoId: [null, Validators.required],
      quirofanoNombre: [''],
      dni: [''],
    });
  }

  ngOnInit() {
    this.loadCatalogs();

    if (this.data) {
      this.form.patchValue(this.data);
      this.pacienteCtrl.setValue(this.formatPacienteDisplay(this.data));
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const urgenciaData = this.form.value as IUrgencia;
    if (urgenciaData.id) {
      this.updateUrgencia(urgenciaData);
    } else {
      this.createUrgencia(urgenciaData);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }

  openPacienteListDialog() {
    const ref = this.dialog.open(PacienteListLite, {
      width: '900px',
      maxHeight: '90vh',
    });

    ref.afterClosed().subscribe((paciente?: IPacienteLite) => {
      if (!paciente) return;
      this.pacienteCtrl.setValue(this.formatPacienteDisplay(paciente));
      this.form.patchValue({
        pacienteId: this.toNumericId(paciente?.id),
        pacienteNombre: this.formatPacienteNombre(paciente),
        dni: paciente?.dni ?? '',
      });
    });
  }

  private loadCatalogs() {
    this.quirofanoService.getQuirofanos().subscribe((resp: any) => {
      const data = resp?.data ?? resp ?? [];
      this.quirofanos = Array.isArray(data) ? data : [];
    });

    this.urgenciaService.getServicios().subscribe((resp: any) => {
      const data = resp?.data ?? resp ?? [];
      this.servicios = Array.isArray(data) ? data : [];
    });
  }

  private createUrgencia(urgenciaData: IUrgencia) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmar creación',
          message: '¿Estás seguro de que deseas crear esta urgencia?',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.urgenciaService.createUrgencia(urgenciaData).subscribe(
          (resp: any) => {
            const payload = resp && resp.data ? resp.data : resp;
            this.dialogRef.close(payload);
          },
          (err) => {
            console.error('Error creating urgency', err);
          }
        );
      });
  }

  private updateUrgencia(urgenciaData: IUrgencia) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmar actualización',
          message: '¿Estás seguro de que deseas actualizar esta urgencia?',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.urgenciaService.updateUrgencia(urgenciaData).subscribe(
          (resp: any) => {
            const payload = resp && resp.data ? resp.data : resp;
            this.dialogRef.close(payload);
          },
          (err) => {
            console.error('Error updating urgency', err);
          }
        );
      });
  }

  private toNumericId(id: string | number | null | undefined): number | null {
    if (id === null || id === undefined || id === '') {
      return null;
    }

    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private formatPacienteDisplay(
    paciente: Partial<
      Omit<IPacienteLite, 'id'> & {
        id?: string | number;
        pacienteNombre?: string;
        nombre?: string;
        apellido?: string;
        dni?: string;
      }
    >
  ): string {
    const fromSingleField = paciente?.pacienteNombre ?? '';
    const nombre = paciente?.nombre ?? fromSingleField;
    const apellido = (paciente as any)?.apellido ?? '';
    const dni = (paciente as any)?.dni ?? '';
    return [nombre, apellido, dni ? `(${dni})` : ''].filter(Boolean).join(' ').trim();
  }

  private formatPacienteNombre(paciente: Partial<IPacienteLite & { apellido?: string }>): string {
    const nombre = paciente?.nombre ?? '';
    const apellido = (paciente as any)?.apellido ?? '';
    return [nombre, apellido].filter(Boolean).join(' ').trim();
  }
}
