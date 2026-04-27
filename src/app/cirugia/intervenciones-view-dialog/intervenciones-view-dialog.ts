import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CirugiaService } from '../../core/services/cirugia.service';
import { IIntervencion } from '../../core/models/intervencion';
import { ICirugia } from '../../core/models/cirugia';
import { IMiembroEquipoMedico } from '../../core/models/miembro-equipo';

@Component({
  selector: 'app-intervenciones-view-dialog',
  templateUrl: './intervenciones-view-dialog.html',
  styleUrls: ['./intervenciones-view-dialog.css'],
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
export class IntervencionesViewDialog implements OnInit {
  isLoading = true;
  cirugia: ICirugia;
  intervenciones: IIntervencion[] = [];
  equipoMedico: IMiembroEquipoMedico[] = [];
  displayedColumnsIntervenciones: string[] = ['tipoIntervencionNombre', 'observaciones'];
  displayedColumnsEquipo: string[] = ['personalNombre', 'rolNombre'];

  private dialogRef = inject(MatDialogRef<IntervencionesViewDialog>);
  private cirugiaService = inject(CirugiaService);
  private data = inject(MAT_DIALOG_DATA) as { cirugia: ICirugia };

  constructor() {
    this.cirugia = this.data.cirugia;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.cirugia.id) {
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
      this.cirugiaService.getIntervencionesByCirugiaId(this.cirugia.id!).subscribe({
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
      this.cirugiaService.getEquipoMedicoByCirugiaId(this.cirugia.id!).subscribe({
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
    if (prioridadLower.includes('alta') || prioridadLower.includes('urgente')) return 'chip-alta';
    if (prioridadLower.includes('media')) return 'chip-media';
    if (prioridadLower.includes('baja') || prioridadLower.includes('normal')) return 'chip-baja';
    return '';
  }

  formatFechaHora(fecha: string | Date, hora: string): string {
    if (!fecha) return '-';
    const fechaStr = new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const horaStr = hora ? hora.substring(0, 5) : '';
    return horaStr ? `${fechaStr} ${horaStr}hs` : fechaStr;
  }
}
