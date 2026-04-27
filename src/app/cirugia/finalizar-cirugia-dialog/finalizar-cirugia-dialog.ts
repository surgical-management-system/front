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
import { IIntervencion, ITipoIntervencion } from '../../core/models/intervencion';
import { ICirugia } from '../../core/models/cirugia';
import { CirugiaService } from '../../core/services/cirugia.service';

export interface FinalizarCirugiaDialogData {
  cirugia: ICirugia;
}

@Component({
  standalone: true,
  selector: 'app-finalizar-cirugia-dialog',
  templateUrl: './finalizar-cirugia-dialog.html',
  styleUrls: ['./finalizar-cirugia-dialog.css'],
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
  ],
})
export class FinalizarCirugiaDialog implements OnInit {
  form: FormGroup;
  tiposIntervencion: ITipoIntervencion[] = [];
  intervenciones: IIntervencion[] = [];
  isLoading = false;
  isLoadingTipos = false;
  editingIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FinalizarCirugiaDialog>,
    private cirugiaService: CirugiaService,
    @Inject(MAT_DIALOG_DATA) public data: FinalizarCirugiaDialogData
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
    this.cirugiaService.getTiposIntervencion().subscribe({
      next: (resp: any) => {
        const data = resp?.data ?? resp ?? [];
        this.tiposIntervencion = Array.isArray(data) ? data : [];
        this.isLoadingTipos = false;
      },
      error: (err) => {
        console.error('Error cargando tipos de intervención', err);
        this.isLoadingTipos = false;
      }
    });
  }

  loadIntervenciones(): void {
    this.cirugiaService.getIntervencionesByCirugiaId(this.data.cirugia.id!).subscribe({
      next: (resp: any) => {
        const data = resp?.data ?? resp ?? [];
        this.intervenciones = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error cargando intervenciones', err);
      }
    });
  }

  getTipoNombre(tipoId: number): string {
    const tipo = this.tiposIntervencion.find(t => t.id === tipoId);
    return tipo?.nombre || '';
  }

  agregarIntervencion(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const tipoId = this.form.value.tipoIntervencionId;
    const intervencion: IIntervencion = {
      cirugiaId: this.data.cirugia.id!,
      tipoIntervencionId: tipoId,
      tipoIntervencionNombre: this.getTipoNombre(tipoId),
      observaciones: this.form.value.observaciones || '',
    };

    this.isLoading = true;

    if (this.editingIndex !== null) {
      // Actualizar intervención existente
      intervencion.id = this.intervenciones[this.editingIndex].id;
      this.cirugiaService.updateIntervencion(this.data.cirugia.id!, intervencion).subscribe({
        next: (resp: any) => {
          const data = resp?.data ?? resp;
          this.intervenciones[this.editingIndex!] = data;
          this.editingIndex = null;
          this.form.reset();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error actualizando intervención', err);
          this.isLoading = false;
        }
      });
    } else {
      // Agregar nueva
      this.cirugiaService.createIntervencion(this.data.cirugia.id!, intervencion).subscribe({
        next: (resp: any) => {
          const data = resp?.data ?? resp;
          this.intervenciones.push(data);
          this.form.reset();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creando intervención', err);
          this.isLoading = false;
        }
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
    
    // Si tiene id, eliminar del backend
    if (intervencion.id) {
      this.isLoading = true;
      this.cirugiaService.deleteIntervencion(this.data.cirugia.id!, intervencion.id).subscribe({
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
          console.error('Error eliminando intervención', err);
          this.isLoading = false;
        }
      });
    } else {
      // Si no tiene id, solo eliminar localmente
      this.intervenciones.splice(index, 1);
      if (this.editingIndex === index) {
        this.editingIndex = null;
        this.form.reset();
      } else if (this.editingIndex !== null && this.editingIndex > index) {
        this.editingIndex--;
      }
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
