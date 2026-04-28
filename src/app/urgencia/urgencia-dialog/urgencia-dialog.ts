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
import { SeleccionTurnos } from '../../cirugia/seleccion-turnos/seleccion-turnos';

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
  public fechaCtrl = new FormControl<string>('');
  public horaCtrl = new FormControl<string>('');
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
      fechaInicio: [''],
      horaInicio: [''],
      estado: ['PROGRAMADA', Validators.required],
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
      const patchData = this.buildPatch(this.data);
      this.form.patchValue(patchData);
      this.pacienteCtrl.setValue(this.formatPacienteDisplay(this.data));
    }

    this.form.get('servicioId')?.valueChanges.subscribe(() => {
      this.form.patchValue({
        fechaHoraInicio: '',
        fechaInicio: '',
        horaInicio: '',
        quirofanoId: null,
        quirofanoNombre: '',
      });
      this.fechaCtrl.setValue('');
      this.horaCtrl.setValue('');
    });
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

  openSeleccionTurnos() {
    const servicioId = this.form.get('servicioId')?.value;
    if (!servicioId) {
      return;
    }

    const ref = this.dialog.open(SeleccionTurnos, {
      width: '860px',
      maxHeight: '90vh',
      data: {
        days: 7,
        startHour: '08:00',
        endHour: '17:30',
        intervalMinutes: 30,
        servicioId,
        quirofanos: this.quirofanos,
        allowOccupiedTurns: true,
      },
    });

    ref.afterClosed().subscribe((result?: { date: Date; time: string; quirofanoId: number; quirofanoNombre: string }) => {
      if (!result) return;

      const fechaInicio = this.formatDateDisplay(result.date);
      const horaInicio = `${result.time} HS`;

      this.form.patchValue({
        fechaHoraInicio: this.buildDateTimeLocal(result.date, result.time),
        fechaInicio,
        horaInicio,
        quirofanoId: result.quirofanoId,
        quirofanoNombre: result.quirofanoNombre,
      });

      this.fechaCtrl.setValue(fechaInicio);
      this.horaCtrl.setValue(horaInicio);
    });
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

  private buildPatch(data: IUrgencia): any {
    const patch: any = { ...data };
    const parsed = this.parseLocalDateTime(data?.fechaHoraInicio);
    if (parsed) {
      patch.fechaInicio = this.formatDateDisplay(parsed);
      patch.horaInicio = `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')} HS`;
      patch.fechaHoraInicio = this.buildDateTimeLocal(parsed, `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`);
    }

    this.fechaCtrl.setValue(patch.fechaInicio || '');
    this.horaCtrl.setValue(patch.horaInicio || '');
    return patch;
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

  private formatDateDisplay(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private buildDateTimeLocal(date: Date, time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${year}-${month}-${day}T${hh}:${mm}:00`;
  }

  private parseLocalDateTime(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    const raw = String(value).trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
    if (!match) {
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const [, year, month, day, hour = '00', minute = '00'] = match;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
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
