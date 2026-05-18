import { Component, DestroyRef, inject } from '@angular/core';
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
import { PersonalDialogComponent } from '../personal-dialog/personal-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPersonal } from '../../core/models/personal';
import { PersonalFacade } from '../state/personal.facade';

@Component({
  selector: 'app-personal-list',
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
  templateUrl: './personal-list.html',
  styleUrls: ['./personal-list.css'],
})
export class PersonalList {
  private readonly personalFacade = inject(PersonalFacade);
  totalItems = 0;
  pageSize = 16;
  page = 0;
  isLoading = false;

  constructor(private readonly dialog: MatDialog, private readonly destroyRef: DestroyRef) {}

  dataSource = new MatTableDataSource<IPersonal>([]);
  displayedColumns: string[] = [
    'legajo',
    'nombreCompleto',
    'dni',
    'especialidad',
    'rol',
    'estado',
    'telefono',
    'acciones',
  ];

  ngOnInit() {
    this.personalFacade.items$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => {
      this.dataSource.data = items;
    });

    this.personalFacade.totalItems$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((totalItems) => {
      this.totalItems = totalItems;
    });

    this.personalFacade.page$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => {
      this.page = page;
    });

    this.personalFacade.pageSize$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pageSize) => {
      this.pageSize = pageSize;
    });

    this.personalFacade.isLoading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.personalFacade.loadPage(this.page, this.pageSize);
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
    this.personalFacade.loadPage(page, pageSize);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getEstadoClass(estado: string): string {
    const estadoLower = estado?.toLowerCase() || '';
    if (estadoLower === 'activo' || estadoLower === 'disponible' || estadoLower === 'alta') return 'estado-activo';
    if (estadoLower === 'inactivo' || estadoLower === 'no disponible' || estadoLower === 'baja') return 'estado-inactivo';
    if (estadoLower === 'licencia' || estadoLower === 'vacaciones') return 'estado-licencia';
    return 'estado-default';
  }

  getRolClass(rol: string): string {
    const rolLower = rol?.toLowerCase() || '';
    if (rolLower.includes('cirujano') || rolLower.includes('medico')) return 'rol-medico';
    if (rolLower.includes('enfermero') || rolLower.includes('enfermera')) return 'rol-enfermero';
    if (rolLower.includes('anestesista') || rolLower.includes('anestesiólogo')) return 'rol-anestesista';
    if (rolLower.includes('instrumentista') || rolLower.includes('instrumentador')) return 'rol-instrumentista';
    return 'rol-default';
  }

  getRolLabel(rol: string): string {
    const rolValue = rol?.toLowerCase() || '';
    if (rolValue === 'personal_medico') return 'Personal Médico';
    if (rolValue === 'admin') return 'Administrador';
    return rol || '-';
  }

  deletePersonal(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '320px',
      data: { title: 'Eliminar personal', message: '¿Confirma eliminar este registro?' },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.personalFacade.deleteById(id);
      }
    });
  }

  openPersonal(IPersonal?: any) {
    // pasar el componente como primer parámetro y los datos en `data`
    const dialogRef = this.dialog.open(PersonalDialogComponent, {
      data: IPersonal || {},
    });
  }
}
