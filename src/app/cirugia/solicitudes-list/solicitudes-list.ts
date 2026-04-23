import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
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
import { Subscription } from 'rxjs';
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
export class SolicitudesListComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedEstado: string | null = null;
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

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private paginatorSub?: Subscription;

  private cirugiaService = inject(CirugiaService);
  private dialog = inject(MatDialog);

  constructor() {}

  ngOnInit(): void {
    this.loadPage(this.page, this.pageSize);
  }

  ngAfterViewInit(): void {
    // configurar sort por fecha + hora
    this.dataSource.sortingDataAccessor = (item: any, prop: string) => {
      if (prop === 'fechaInicio') {
        return new Date(`${item.fechaInicio}T${item.horaInicio ?? '00:00:00'}`);
      }
      if (prop === 'horaInicio') {
        return item.horaInicio;
      }
      return (item as any)[prop];
    };

    this.dataSource.sort = this.sort;

    // default: ordenar por fecha ascendente
    setTimeout(() => {
      this.sort.active = 'fechaInicio';
      this.sort.direction = 'asc';
    });
  }

  ngOnDestroy(): void {
    this.paginatorSub?.unsubscribe();
  }

  loadPage(page: number, pageSize: number, estado?: string) {
    const cacheKey = `${page}-${pageSize}-${estado || ''}`;

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
    this.cirugiaService.getCirugias(page, pageSize, estado).subscribe({
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


  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
      this.pageCache.clear();
      this.loadPage(0, this.pageSize);
      return;
    }
    this.selectedEstado = estado;
    let estadoParam = '';
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
        estadoParam = '';
    }
    this.pageCache.clear();
    this.loadPage(0, this.pageSize, estadoParam);
  }

  onPage(event: PageEvent) {
    this.loadPage(event.pageIndex, event.pageSize);
  }

  openCirugia(cirugia?: ICirugia) {
    this.dialog
      .open(CirugiaDialog, {data: cirugia })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.pageCache.clear(); // limpiar caché cuando se modifica data
          this.loadPage(this.page, this.pageSize);
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
          this.loadPage(this.page, this.pageSize);
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
            this.loadPage(this.page, this.pageSize);
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
