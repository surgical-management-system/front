import { Component, OnInit, ViewChild, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormatEstadoPipe } from '../../core/pipes/format-estado.pipe';
import { ICirugia } from '../../core/models/cirugia';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { CirugiaDialog } from '../cirugia-dialog/cirugia-dialog';
import { EquipoMedicoDialog } from '../equipo-medico-dialog/equipo-medico-dialog';
import { FinalizarCirugiaDialog } from '../finalizar-cirugia-dialog/finalizar-cirugia-dialog';
import { IntervencionesViewDialog } from '../intervenciones-view-dialog/intervenciones-view-dialog';
import { KeycloakService } from '../../core/services/keycloak.service';
import { CirugiaFacade } from '../state/cirugia.facade';

@Component({
  selector: 'app-solicitudes-list',
  templateUrl: './solicitudes-list.html',
  styleUrls: ['./solicitudes-list.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    FormatEstadoPipe,
  ],
})
export class SolicitudesListComponent implements OnInit {
  selectedEstado: string | null = null;
  sortActive = 'fechaInicio';
  sortDirection: SortDirection = 'asc';
  viewMode: 'table' | 'cards' = 'table';
  displayedColumns: string[] = [
    'fechaInicio',
    'pacienteNombre',
    'servicioNombre',
    'estado',
    'tipo',
    'prioridad',
    'quirofanoNombre',
    'acciones',
  ];
  dataSource = new MatTableDataSource<ICirugia>([]);

  private readonly sortFieldMap: Record<string, string> = {
    fechaInicio: 'fechaHoraInicio',
    pacienteNombre: 'paciente',
    servicioNombre: 'servicio',
    estado: 'estado',
    tipo: 'tipo',
    prioridad: 'prioridad',
    quirofanoNombre: 'quirofano',
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private cirugiaFacade = inject(CirugiaFacade);
  private dialog = inject(MatDialog);
  private keycloakService = inject(KeycloakService);
  private destroyRef = inject(DestroyRef);

  // Template-bound properties for compatibility with existing HTML
  isLoading = false;
  totalItems = 0;
  pageSize = 18;
  page = 0;

  // Facade selectors
  cirugias$ = this.cirugiaFacade.cirugias$;
  totalCirugias$ = this.cirugiaFacade.totalCirugias$;
  currentPage$ = this.cirugiaFacade.currentPage$;
  currentPageSize$ = this.cirugiaFacade.currentPageSize$;
  estadoFilter$ = this.cirugiaFacade.estadoFilter$;
  searchFilter$ = this.cirugiaFacade.searchFilter$;
  sortField$ = this.cirugiaFacade.sortField$;
  sortOrder$ = this.cirugiaFacade.sortOrder$;
  isLoading$ = this.cirugiaFacade.isLoading$;

  constructor() {
    // Subscribe to cirugias to update dataSource
    this.cirugias$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cirugias) => {
        this.dataSource.data = cirugias;
      });

    // Subscribe to isLoading
    this.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => {
        this.isLoading = loading;
      });

    // Subscribe to totals and pagination
    this.totalCirugias$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((total) => {
        this.totalItems = total;
      });

    this.currentPageSize$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((size) => {
        this.pageSize = size;
      });

    this.currentPage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => {
        this.page = p;
      });
  }

  ngOnInit(): void {
    this.cirugiaFacade.loadPage(0, 18);
  }

  loadPage(page: number, pageSize: number) {
    this.cirugiaFacade.loadPage(
      page,
      pageSize,
      this.selectedEstado || undefined,
      this.getSearchValue()
    );
  }

  onSortChange(sort: Sort) {
    this.sortActive = sort.active;
    this.sortDirection = sort.direction || 'asc';
    const sortKey = this.getBackendSortKey();
    this.cirugiaFacade.loadPage(
      0,
      18,
      this.selectedEstado || undefined,
      this.getSearchValue(),
      sortKey,
      this.sortDirection
    );
  }

  private getBackendSortKey(): string {
    return this.sortFieldMap[this.sortActive] ?? 'fechaHoraInicio';
  }

  applyFilter(filterValue: string) {
    const normalizedValue = filterValue.trim();
    this.loadPage(0, 18);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'table' ? 'cards' : 'table';
  }

  canCreateCirugia(): boolean {
    return !this.keycloakService.hasRole('personal_medico');
  }

  trackByCirugiaId(index: number, cirugia: ICirugia): number {
    return cirugia.id ?? index;
  }

  filtrarPorEstado(estado: string) {
    if (this.selectedEstado === estado) {
      this.selectedEstado = null;
    } else {
      this.selectedEstado = estado;
    }
    this.loadPage(0, 18);
  }

  private getSearchValue(): string | undefined {
    // This will be implemented via a search input in the template
    return undefined;
  }

  onPage(event: PageEvent) {
    this.loadPage(event.pageIndex, event.pageSize);
  }

  openCirugia(cirugia?: ICirugia) {
    this.dialog
      .open(CirugiaDialog, { data: cirugia })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          // The store effect will automatically refresh the page
        }
      });
  }

  openEquipoMedico(cirugiaId: number) {
    this.dialog.open(EquipoMedicoDialog, { data: { cirugiaId } });
  }

  finalizarCirugia(cirugia: ICirugia) {
    if (!cirugia.id) {
      return;
    }

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Finalizar cirugía',
          message: `¿Estás seguro de que deseas marcar como finalizada la cirugía de ${cirugia.pacienteNombre}?`,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.cirugiaFacade.finalizarCirugia(cirugia.id!);
        }
      });
  }

  gestionarIntervenciones(cirugia: ICirugia) {
    this.dialog.open(FinalizarCirugiaDialog, {
      data: { cirugia },
      width: '600px',
      maxHeight: '90vh',
      panelClass: 'finalizar-cirugia-dialog-panel',
    });
  }

  inicializarCirugia(cirugia: ICirugia) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Iniciar Cirugía',
          message: `¿Estás seguro de que deseas iniciar la cirugía de ${cirugia.pacienteNombre}?`,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed && cirugia.id) {
          this.cirugiaFacade.initializarCirugia(cirugia.id);
        }
      });
  }

  verIntervenciones(cirugia: ICirugia) {
    this.dialog.open(IntervencionesViewDialog, {
      data: { cirugia },
      width: '600px',
      maxHeight: '90vh',
    });
  }

  deleteCirugia(cirugiaId: number) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmar eliminación',
          message: '¿Estás seguro de que deseas eliminar esta cirugía?',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.cirugiaFacade.deleteCirugia(cirugiaId);
        }
      });
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
    const normalizedFecha = this.parseLocalDate(fecha);
    const fechaStr = normalizedFecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const horaStr = hora ? hora.substring(0, 5) : '';
    return horaStr ? `${fechaStr} ${horaStr}hs` : fechaStr;
  }

  private parseLocalDate(value: string | Date): Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value !== 'string') {
      return new Date(value);
    }

    const raw = value.trim();
    const dateOnlyMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const dateTimeMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
    if (dateTimeMatch) {
      const [, year, month, day, hour, minute] = dateTimeMatch;
      return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    }

    return new Date(raw);
  }
}
