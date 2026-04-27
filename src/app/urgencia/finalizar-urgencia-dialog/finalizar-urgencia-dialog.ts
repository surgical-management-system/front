import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { IIntervencion, ITipoIntervencion } from '../../core/models/intervencion';
import { IUrgencia } from '../../core/models/urgencia';
import { UrgenciaService } from '../../core/services/urgencia.service';

export interface FinalizarUrgenciaDialogData {
  urgencia: IUrgencia;
}

@Component({
  standalone: true,
  selector: 'app-finalizar-urgencia-dialog',
  templateUrl: './finalizar-urgencia-dialog.html',
  styleUrls: ['./finalizar-urgencia-dialog.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
  ],
})
export class FinalizarUrgenciaDialog implements OnInit {
  form: FormGroup;
  tiposIntervencion: ITipoIntervencion[] = [];
  intervenciones: IIntervencion[] = [];
  isLoading = false;
  isLoadingTipos = false;
  editingIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FinalizarUrgenciaDialog>,
    private urgenciaService: UrgenciaService,
    @Inject(MAT_DIALOG_DATA) public data: FinalizarUrgenciaDialogData
  ) {
    this.form = this.fb.group({
      tipoIntervencionId: [null, Validators.required],
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    this.loadTiposIntervencion();
    this.loadIntervenciones();
  }

  loadTiposIntervencion(): void {
    this.isLoadingTipos = true;
    this.urgenciaService.getTiposIntervencion().subscribe({
      next: (resp: any) => {
        const data = resp?.data ?? resp ?? [];
        this.tiposIntervencion = Array.isArray(data) ? data : [];
        this.isLoadingTipos = false;
      },
      error: (err) => {
        console.error('Error loading intervention types', err);
        this.isLoadingTipos = false;
      }
    });
  }

  loadIntervenciones(): void {
    this.urgenciaService.getIntervencionesbyUrgenciaId(this.data.urgencia.id!).subscribe({
      next: (resp: any) => {
        const data = resp?.data ?? resp ?? [];
        this.intervenciones = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error loading interventions', err);
      }
    });
  }

  getTipoNombre(tipoId: number): string {
    const tipo = this.tiposIntervencion.find(t => t.id === tipoId);
    return tipo?.nombre || '';
  }

  agregarIntervencion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const tipoId = this.form.get('tipoIntervencionId')?.value;
    const nuevaIntervencion: IIntervencion = {
      cirugiaId: this.data.urgencia.id!,
      tipoIntervencionId: tipoId,
      tipoIntervencionNombre: this.getTipoNombre(tipoId),
      observaciones: this.form.get('observaciones')?.value || '',
    };

    this.isLoading = true;

    if (this.editingIndex !== null) {
      nuevaIntervencion.id = this.intervenciones[this.editingIndex].id;
      this.urgenciaService.updateIntervencion(this.data.urgencia.id!, nuevaIntervencion).subscribe({
        next: (resp: any) => {
          const data = resp?.data ?? resp;
          this.intervenciones[this.editingIndex!] = data;
          this.editingIndex = null;
          this.form.reset();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error actualizando intervención de urgencia', err);
          this.isLoading = false;
        },
      });
    } else {
      this.urgenciaService.createIntervencion(this.data.urgencia.id!, nuevaIntervencion).subscribe({
        next: (resp: any) => {
          const data = resp?.data ?? resp;
          this.intervenciones.push(data);
          this.form.reset();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creando intervención de urgencia', err);
          this.isLoading = false;
        },
      });
    }
  }

  editarIntervencion(index: number): void {
    const intervencion = this.intervenciones[index];
    this.form.patchValue({
      tipoIntervencionId: intervencion.tipoIntervencionId,
      observaciones: intervencion.observaciones,
    });
    this.editingIndex = index;
  }

  cancelarEdicion(): void {
    this.editingIndex = null;
    this.form.reset();
  }

  removerIntervencion(index: number): void {
    const intervencion = this.intervenciones[index];

    if (intervencion.id) {
      this.isLoading = true;
      this.urgenciaService.deleteIntervencion(this.data.urgencia.id!, intervencion.id).subscribe({
        next: () => {
          this.intervenciones.splice(index, 1);
          if (this.editingIndex === index) {
            this.editingIndex = null;
            this.form.reset();
          } else if (this.editingIndex !== null && this.editingIndex > index) {
            this.editingIndex--;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error eliminando intervención de urgencia', err);
          this.isLoading = false;
        },
      });
      return;
    }

    this.intervenciones.splice(index, 1);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.form.reset();
    } else if (this.editingIndex !== null && this.editingIndex > index) {
      this.editingIndex--;
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}

