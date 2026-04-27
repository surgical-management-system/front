import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UrgenciaService } from '../../core/services/urgencia.service';
import { IIntervencion } from '../../core/models/intervencion';
import { IUrgencia } from '../../core/models/urgencia';
import { IMiembroEquipoMedico } from '../../core/models/miembro-equipo';

@Component({
  selector: 'app-urgencia-info-dialog',
  templateUrl: './urgencia-info-dialog.html',
  styleUrls: ['./urgencia-info-dialog.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
})
export class UrgenciaInfoDialog implements OnInit {
  isLoading = true;
  urgencia: IUrgencia;
  intervenciones: IIntervencion[] = [];
  equipoMedico: IMiembroEquipoMedico[] = [];
  displayedColumnsIntervenciones: string[] = ['tipoIntervencionNombre', 'observaciones'];
  displayedColumnsEquipo: string[] = ['personalNombre', 'rolNombre'];

  private dialogRef = inject(MatDialogRef<UrgenciaInfoDialog>);
  private urgenciaService = inject(UrgenciaService);
  private data = inject(MAT_DIALOG_DATA) as { urgencia: IUrgencia };

  constructor() {
    this.urgencia = this.data.urgencia;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.urgencia.id) {
      Promise.all([
        this.loadIntervenciones(),
        this.loadEquipoMedico(),
      ]).then(() => {
        this.isLoading = false;
      });
    }
  }

  private loadIntervenciones(): Promise<void> {
    return new Promise((resolve) => {
      this.urgenciaService.getIntervencionesbyUrgenciaId(this.urgencia.id!).subscribe({
        next: (response) => {
          this.intervenciones = response?.data || [];
          resolve();
        },
        error: (err) => {
          console.error('Error loading interventions', err);
          resolve();
        }
      });
    });
  }

  private loadEquipoMedico(): Promise<void> {
    return new Promise((resolve) => {
      this.urgenciaService.getEquipoMedicoByUrgenciaId(this.urgencia.id!).subscribe({
        next: (response) => {
          this.equipoMedico = response?.data || [];
          resolve();
        },
        error: (err) => {
          console.error('Error loading medical team', err);
          resolve();
        }
      });
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getEstadoClass(estado: string): string {
    const estadoUpper = (estado || '').toUpperCase();
    if (estadoUpper === 'PROGRAMADA') return 'chip-programada';
    if (estadoUpper === 'EN_CURSO' || estadoUpper === 'PENDIENTE') return 'chip-pendiente';
    if (estadoUpper === 'FINALIZADA' || estadoUpper === 'REALIZADA' || estadoUpper === 'COMPLETADA') return 'chip-realizada';
    if (estadoUpper === 'CANCELADA') return 'chip-cancelada';
    return '';
  }

  getPrioridadClass(prioridad: string): string {
    const prioridadLower = prioridad?.toLowerCase() || '';
    if (prioridadLower.includes('alta') || prioridadLower.includes('urgente') || prioridadLower.includes('critica')) {
      return 'chip-alta';
    }
    if (prioridadLower.includes('media') || prioridadLower.includes('moderada')) return 'chip-media';
    if (prioridadLower.includes('baja') || prioridadLower.includes('normal')) return 'chip-baja';
    return '';
  }

  formatFechaHora(fechaHoraInicio: string): string {
    if (!fechaHoraInicio) return '-';
    const date = new Date(fechaHoraInicio);
    if (Number.isNaN(date.getTime())) {
      return fechaHoraInicio;
    }

    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}
