import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormatEstadoPipe } from '../../core/pipes/format-estado.pipe';
import { IUrgencia } from '../../core/models/urgencia';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { UrgenciaInfoDialog } from '../urgencia-info-dialog/urgencia-info-dialog';
import { FinalizarUrgenciaDialog } from '../finalizar-urgencia-dialog/finalizar-urgencia-dialog';

import { EquipoMedicoUrgenciaDialog } from '../urgencia-equipo-medico-dialog/urgencia-equipo-medico-dialog';

import { KeycloakService } from '../../core/services/keycloak.service';
import { UrgenciaDialog } from '../urgencia-dialog/urgencia-dialog';
import { UrgenciaFacade } from '../state/urgencia.facade';

@Component({
  selector: 'app-urgencias-list',
  templateUrl: './urgencias-list.html',
  styleUrls: ['./urgencias-list.css'],
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
export class UrgenciasListComponent implements OnInit {
  selectedEstado: string | null = null;
  private estadoApiParam: string | undefined;
  private searchApiParam: string | undefined;
  sortActive = 'fechaHoraInicio';
  sortDirection: SortDirection = 'asc';
  viewMode: 'table' | 'cards' = 'table';
  displayedColumns: string[] = [
    'fechaHoraInicio',
    'pacienteNombre',
    'servicioNombre',
    'estado',
    'tipo',
    'nivelUrgencia',
    'quirofanoNombre',
    'acciones',
  ];
  dataSource = new MatTableDataSource<IUrgencia>([]);
  page = 0;
  pageSize = 18;
  totalItems = 0;
  isLoading = false;
  private pageCache = new Map<string, { data: IUrgencia[]; total: number }>();
  private readonly sortFieldMap: Record<string, string> = {
    fechaHoraInicio: 'fechaHoraInicio',
    pacienteNombre: 'paciente',
    servicioNombre: 'servicio',
    estado: 'estado',
    tipo: 'tipo',
    nivelUrgencia: 'nivelUrgencia',
    quirofanoNombre: 'quirofano',
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private urgenciaFacade = inject(UrgenciaFacade);
  private dialog = inject(MatDialog);
  private keycloakService = inject(KeycloakService);
  private destroyRef = inject(DestroyRef);

  urgencias$ = this.urgenciaFacade.urgencias$;
  totalUrgencias$ = this.urgenciaFacade.totalUrgencias$;
  page$ = this.urgenciaFacade.page$;
  pageSize$ = this.urgenciaFacade.pageSize$;
  isLoading$ = this.urgenciaFacade.isLoading$;

  constructor() {
    this.urgencias$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => {
      this.dataSource.data = items;
    });

    this.totalUrgencias$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((total) => {
      this.totalItems = total;
    });

    this.page$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => {
      this.page = page;
    });

    this.pageSize$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pageSize) => {
      this.pageSize = pageSize;
    });

    this.isLoading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  ngOnInit(): void {
    this.urgenciaFacade.loadPage(this.page, this.pageSize);
  }

  loadPage(
    page: number,
    pageSize: number,
    estado: string | undefined = this.estadoApiParam,
    search: string | undefined = this.searchApiParam
  ) {
    const sortKey = this.getBackendSortKey();
    this.urgenciaFacade.loadPage(page, pageSize, estado, search, sortKey, this.sortDirection || 'asc');
  }

  onSortChange(sort: Sort) {
    this.sortActive = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.loadPage(0, this.pageSize, this.estadoApiParam, this.searchApiParam);
  }

  private getBackendSortKey(): string {
    return this.sortFieldMap[this.sortActive] ?? 'fechaHoraInicio';
  }

  applyFilter(filterValue: string) {
    const normalizedValue = filterValue.trim();
    this.searchApiParam = normalizedValue || undefined;
    this.loadPage(0, this.pageSize, this.estadoApiParam, this.searchApiParam);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'table' ? 'cards' : 'table';
  }

  canCreateUrgencia(): boolean {
    return !this.keycloakService.hasRole('personal_medico');
  }

  trackByUrgenciaId(index: number, urgencia: IUrgencia): number {
    return urgencia.id ?? index;
  }

  filtrarPorEstado(estado: string) {
    if (this.selectedEstado === estado) {
      this.selectedEstado = null;
      this.estadoApiParam = undefined;
      this.loadPage(0, this.pageSize, undefined, this.searchApiParam);
      return;
    }

    this.selectedEstado = estado;
    this.estadoApiParam = estado;
    this.loadPage(0, this.pageSize, this.estadoApiParam, this.searchApiParam);
  }

  onPage(event: PageEvent) {
    this.loadPage(event.pageIndex, event.pageSize, this.estadoApiParam, this.searchApiParam);
  }

  openUrgencia(urgencia?: IUrgencia) {
    this.dialog
      .open(UrgenciaDialog, { data: urgencia, width: '520px', maxHeight: '90vh' })
      .afterClosed()
      .subscribe();
  }

  inicializarUrgencia(urgencia: IUrgencia) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Iniciar Urgencia',
          message: `¿Estás seguro de que deseas iniciar la urgencia de ${urgencia.pacienteNombre}?`,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed && urgencia.id) {
          this.urgenciaFacade.inicializarUrgencia(urgencia.id);
        }
      });
  }

  verInfo(urgencia: IUrgencia) {
    this.dialog.open(UrgenciaInfoDialog, {
      data: { urgencia },
      width: '600px',
      maxHeight: '90vh',
    });
  }

  finalizarUrgencia(urgencia: IUrgencia) {
    if (!urgencia.id) {
      return;
    }

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Finalizar urgencia',
          message: `¿Estás seguro de que deseas marcar como finalizada la urgencia de ${urgencia.pacienteNombre}?`,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.urgenciaFacade.finalizarUrgencia(urgencia.id!);
      });
  }

  gestionarIntervenciones(urgencia: IUrgencia) {
    this.dialog.open(FinalizarUrgenciaDialog, {
      data: { urgencia },
      width: '600px',
      maxHeight: '90vh',
      panelClass: 'finalizar-urgencia-dialog-panel',
    });
  }

  openEquipoMedico(urgenciaId: number) {
    this.dialog.open(EquipoMedicoUrgenciaDialog, { data: { urgenciaId } });
  }

  deleteUrgencia(urgenciaId: number) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmar eliminación',
          message: '¿Estás seguro de que deseas eliminar esta urgencia?',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.urgenciaFacade.deleteUrgencia(urgenciaId);
        }
      });
  }

  getEstadoClass(estado: string): string {
    const estadoUpper = (estado || '').toUpperCase();
    if (estadoUpper === 'PROGRAMADA') return 'chip-programada';
    if (estadoUpper === 'EN_CURSO' || estadoUpper === 'PENDIENTE') return 'chip-pendiente';
    if (estadoUpper === 'FINALIZADA') return 'chip-realizada';
    if (estadoUpper === 'CANCELADA') return 'chip-cancelada';
    return '';
  }

  getNivelUrgenciaClass(nivel: number | null | undefined): string {
    if (nivel === 1) return 'urgencia-nivel-1';
    if (nivel === 2) return 'urgencia-nivel-2';
    if (nivel === 3) return 'urgencia-nivel-3';
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

  formatTipo(tipo: string | null | undefined): string {
    if (!tipo) return '-';
    const trimmed = tipo.trim();
    if (!trimmed) return '-';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }
}
