import { Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { CirugiaService } from '../../core/services/cirugia.service';
import { ICirugia } from '../../core/models/cirugia';
import { IPaginatedResponse } from '../../core/models/api-response';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { CirugiaDialog } from '../cirugia-dialog/cirugia-dialog';
import { EquipoMedicoDialog } from '../equipo-medico-dialog/equipo-medico-dialog';
import { FinalizarCirugiaDialog } from '../finalizar-cirugia-dialog/finalizar-cirugia-dialog';

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
  ],
})
export class SolicitudesListComponent implements OnInit {
  selectedEstado: string | null = null;
  private estadoApiParam: string | undefined;
  private searchApiParam: string | undefined;
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
  page = 0;
  pageSize = 18;
  totalItems = 0;
  isLoading = false;
  private pageCache = new Map<string, { data: ICirugia[]; total: number }>();
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

  private cirugiaService = inject(CirugiaService);
  private dialog = inject(MatDialog);

  constructor() {}

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

    // verificar si la página está en caché
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

    // si no está en caché, llamar al servidor
    this.isLoading = true;
    this.cirugiaService.getCirugias(page, pageSize, estado, search, sortKey, orderKey).subscribe({
      next: (resp: any) => {
        // Adaptar a la estructura real de la respuesta del backend
        const content = resp?.data?.contenido || [];
        const totalItems = resp?.data?.totalElementos || 0;
        const totalPages = resp?.data?.totalPaginas || 1;
        const pageNumber = resp?.data?.pagina || page;
        const pageSizeResp = resp?.data?.tamaño || pageSize;

        this.dataSource.data = content;
        this.totalItems = totalItems;
        this.page = pageNumber;
        this.pageSize = pageSizeResp;
        this.isLoading = false;

        // guardar en caché
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
        console.error('Error loading cirugias', err);
        this.isLoading = false;
      }
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

  trackByCirugiaId(index: number, cirugia: ICirugia): number {
    return cirugia.id ?? index;
  }

  filtrarPorEstado(estado: string) {
    // Si el botón ya está seleccionado, deselecciona y quita el filtro
    if (this.selectedEstado === estado) {
      this.selectedEstado = null;
      this.estadoApiParam = undefined;
      this.pageCache.clear();
      this.loadPage(0, this.pageSize, undefined, this.searchApiParam);
      return;
    }
    this.selectedEstado = estado;
    let estadoParam: string | undefined;
    switch (estado) {
      case 'FINALIZADA':
        estadoParam = 'FINALIZADA';
        break;
      case 'CANCELADA':
        estadoParam = 'CANCELADA';
        break;
      case 'PROGRAMADA':
        estadoParam = 'PROGRAMADA';
        break;
      case 'EN_TRANS':
        estadoParam = 'EN_CURSO';
        break;
      default:
        estadoParam = undefined;
    }
    this.estadoApiParam = estadoParam;
    this.pageCache.clear();
    this.loadPage(0, this.pageSize, estadoParam, this.searchApiParam);
  }

  onPage(event: PageEvent) {
    this.loadPage(event.pageIndex, event.pageSize, this.estadoApiParam, this.searchApiParam);
  }

  openCirugia(cirugia?: ICirugia) {
    this.dialog
      .open(CirugiaDialog, {data: cirugia })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.pageCache.clear(); // limpiar caché cuando se modifica data
          this.loadPage(this.page, this.pageSize, this.estadoApiParam, this.searchApiParam);
        }
      });
  }

  openEquipoMedico(cirugiaId: number) {
    this.dialog.open(EquipoMedicoDialog, { data: { cirugiaId } });
  }

  finalizarCirugia(cirugia: ICirugia) {
    this.dialog
      .open(FinalizarCirugiaDialog, {
        data: { cirugia },
        width: '600px',
        maxHeight: '90vh',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.pageCache.clear();
          this.loadPage(this.page, this.pageSize, this.estadoApiParam, this.searchApiParam);
        }
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
          this.cirugiaService.deleteCirugia(cirugiaId).subscribe(() => {
            this.pageCache.clear(); // limpiar caché cuando se elimina
            this.loadPage(this.page, this.pageSize, this.estadoApiParam, this.searchApiParam);
          });
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
    const fechaStr = new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const horaStr = hora ? hora.substring(0, 5) : '';
    return horaStr ? `${fechaStr} ${horaStr}hs` : fechaStr;
  }
}
