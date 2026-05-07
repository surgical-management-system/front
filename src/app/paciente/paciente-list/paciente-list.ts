import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { PacienteHospitalListComponent } from '../paciente-hospital-list/paciente-hospital-list';
import { PacienteService } from '../../core/services/paciente.service';
import { IPaciente } from '../../core/models/paciente';
import { PacienteDialog } from '../paciente-dialog/paciente-dialog';

@Component({
  selector: 'app-paciente-list',
  imports: [
    CommonModule,
    MatIcon,
    MatFormField,
    MatLabel,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './paciente-list.html',
  styleUrls: ['./paciente-list.css'],
})
export class PacienteList {
  totalItems: number = 0;
  pageSize: number = 16;
  page: number = 0;
  isLoading: boolean = false;

  constructor(private pacienteService: PacienteService, private dialog: MatDialog) {}

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'nombreCompleto',
    'dni',
    'fechaNacimiento',
    'datosFisicos',
    'contacto',
    'estado',
    'acciones',
  ];

  ngOnInit() {
    this.loadPage(this.page, this.pageSize);
  }

  // llamado desde (page) del mat-paginator
  onPage(event: PageEvent) {
    const nextPage = event.pageIndex ?? 0;
    const nextSize = event.pageSize ?? this.pageSize;

    // mostrar inmediatamente la elección del usuario en el UI
    this.page = nextPage;
    this.pageSize = nextSize;

    // recargar datos desde el backend con los nuevos parámetros
    this.loadPage(nextPage, nextSize);
  }

  loadPage(page: number, pageSize: number) {
    this.isLoading = true;
    this.pacienteService.getPacientes(page, pageSize).subscribe({
      next: (response: any) => {
        const content = response?.data?.contenido || [];
        const totalItems = response?.data?.totalElementos || 0;
        const pageNumber = response?.data?.pagina || page;
        const pageSizeResp = response?.data?.tamaño || pageSize;

        this.dataSource.data = content;
        this.totalItems = totalItems;
        this.pageSize = pageSizeResp;
        this.page = pageNumber;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  deletePaciente(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '320px',
      data: { title: 'Eliminar paciente', message: '¿Confirma eliminar este registro?' },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.pacienteService.deletePaciente(id).subscribe(() => {
          this.loadPage(this.page, this.pageSize);
        });
      }
    });
  }

  togglePacienteActivo(id: number, active: boolean) {
    const title = active ? 'Dar de baja paciente' : 'Dar de alta paciente';
    const message = active ? '¿Confirma dar de baja este paciente?' : '¿Confirma dar de alta este paciente?';

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '320px',
      data: { title, message },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      const obs = active
        ? this.pacienteService.deactivatePaciente(id)
        : this.pacienteService.activatePaciente(id);

      obs.subscribe(() => {
        this.loadPage(this.page, this.pageSize);
      });
    });
  }

  openPaciente(paciente?: any) {
    const dialogRef = this.dialog.open(PacienteDialog, {
      width: '500px',
      data: paciente || {},
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadPage(this.page, this.pageSize);
      }
    });
  }

  openPersonalHospitalList() {
    const dialogref = this.dialog.open(PacienteHospitalListComponent, {});
    dialogref.afterClosed().subscribe(() => {
      this.loadPage(this.page, this.pageSize);
    });
  }
}
