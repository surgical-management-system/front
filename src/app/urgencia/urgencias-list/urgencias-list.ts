import { Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { IUrgencia } from '../../core/models/urgencia';
import { UrgenciaService } from '../../core/services/urgencia.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

import { KeycloakService } from '../../core/services/keycloak.service';
import { UrgenciaDialog } from '../urgencia-dialog/urgencia-dialog';

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
    'prioridad',
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
    prioridad: 'prioridad',
    nivelUrgencia: 'nivelUrgencia',
    quirofanoNombre: 'quirofano',
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private urgenciaService = inject(UrgenciaService);
  private dialog = inject(MatDialog);
  private keycloakService = inject(KeycloakService);

  ngOnInit(): void {
    this.loadPage(this.page, this.pageSize);
  }

  loadPage(
    page: number,
    pageSize: number,
    estado: string | undefined = this.estadoApiParam,
    search: string | undefined = this.searchApiParam
  ) {
    const sortKey = this.getBackendSortKey();
    const orderKey = this.sortDirection || 'asc';
    const cacheKey = `${page}-${pageSize}-${estado || ''}-${search || ''}-${sortKey}-${orderKey}`;

    if (this.pageCache.has(cacheKey)) {
      const cached = this.pageCache.get(cacheKey)!;
      this.dataSource.data = cached.data;
      this.totalItems = cached.total;
      this.page = page;
      this.pageSize = pageSize;

      if (this.paginator) {
        this.paginator.pageIndex = this.page;
        this.paginator.pageSize = this.pageSize;
      }
      return;
    }

    this.isLoading = true;
    this.urgenciaService.getUrgencias(page, pageSize, estado, search, sortKey, orderKey).subscribe({
      next: (resp: any) => {
        const content = resp?.data?.contenido || [];
        const totalItems = resp?.data?.totalElementos || 0;
        const pageNumber = resp?.data?.pagina || page;
        const pageSizeResp = resp?.data?.tamaño || pageSize;

        this.dataSource.data = content;
        this.totalItems = totalItems;
        this.page = pageNumber;
        this.pageSize = pageSizeResp;
        this.isLoading = false;

        this.pageCache.set(cacheKey, {
          data: content,
          total: totalItems,
        });

        if (this.paginator) {
          this.paginator.pageIndex = this.page;
          this.paginator.pageSize = this.pageSize;
        }
      },
      error: (err) => {
        console.error('Error loading urgencias', err);
        this.isLoading = false;
      },
    });
  }

  onSortChange(sort: Sort) {
    this.sortActive = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.pageCache.clear();
    this.loadPage(0, this.pageSize, this.estadoApiParam, this.searchApiParam);
  }

  private getBackendSortKey(): string {
    return this.sortFieldMap[this.sortActive] ?? 'fechaHoraInicio';
  }

  applyFilter(filterValue: string) {
    const normalizedValue = filterValue.trim();
    this.searchApiParam = normalizedValue || undefined;
    this.pageCache.clear();
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
      this.pageCache.clear();
      this.loadPage(0, this.pageSize, undefined, this.searchApiParam);
      return;
    }

    this.selectedEstado = estado;
    this.estadoApiParam = estado;
    this.pageCache.clear();
    this.loadPage(0, this.pageSize, this.estadoApiParam, this.searchApiParam);
  }

  onPage(event: PageEvent) {
    this.loadPage(event.pageIndex, event.pageSize, this.estadoApiParam, this.searchApiParam);
  }

  openUrgencia(urgencia?: IUrgencia) {
    this.dialog
      .open(UrgenciaDialog, { data: urgencia, width: '760px', maxHeight: '90vh' })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.pageCache.clear();
          this.loadPage(this.page, this.pageSize, this.estadoApiParam, this.searchApiParam);
        }
      });
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
          this.urgenciaService.deleteUrgencia(urgenciaId).subscribe(() => {
            this.pageCache.clear();
            this.loadPage(this.page, this.pageSize, this.estadoApiParam, this.searchApiParam);
          });
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
