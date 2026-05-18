import { Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { IKeycloakUser } from '../../core/services/usuario.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { UsuarioDialogComponent } from '../usuario-dialog/usuario-dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuariosFacade } from '../state/usuarios.facade';

@Component({
  selector: 'app-usuarios-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
  ],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css'
})
export class UsuariosList implements OnInit {
  totalItems = 0;
  pageSize = 16;
  page = 0;
  searchTerm = '';
  isLoading = false;
  viewMode: 'table' | 'cards' = 'table';

  dataSource = new MatTableDataSource<IKeycloakUser>([]);
  displayedColumns: string[] = [
    'legajo',
    'email',
    'nombre',
    'rol',
    'estado',
    'emailVerified',
    'creado',
    'acciones',
  ];

  constructor(
    private readonly usuariosFacade: UsuariosFacade,
    private readonly dialog: MatDialog,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.usuariosFacade.items$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => {
      this.dataSource.data = items;
    });

    this.usuariosFacade.totalItems$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((totalItems) => {
      this.totalItems = totalItems;
    });

    this.usuariosFacade.page$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => {
      this.page = page;
    });

    this.usuariosFacade.pageSize$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pageSize) => {
      this.pageSize = pageSize;
    });

    this.usuariosFacade.search$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((search) => {
      this.searchTerm = search;
    });

    this.usuariosFacade.isLoading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.loadPage(this.page, this.pageSize, this.searchTerm);
  }

  onPage(event: PageEvent) {
    const nextPage = event.pageIndex ?? 0;
    const nextSize = event.pageSize ?? this.pageSize;

    this.page = nextPage;
    this.pageSize = nextSize;

    this.loadPage(nextPage, nextSize, this.searchTerm);
  }

  loadPage(page: number, pageSize: number, search = '') {
    this.usuariosFacade.loadPage(page, pageSize, search);
  }

  applyFilter(filterValue: string) {
    this.page = 0;
    this.searchTerm = filterValue.trim();
    this.loadPage(this.page, this.pageSize, this.searchTerm);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'table' ? 'cards' : 'table';
  }

  trackByUserId(index: number, user: IKeycloakUser): string | number {
    return user.id ?? index;
  }

  formatDate(timestamp?: number): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getFullName(user: IKeycloakUser): string {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '-';
  }

  getLegajo(user: IKeycloakUser): string {
    return user.legajo || user.username || '-';
  }

  hasRole(user: IKeycloakUser, role: string): boolean {
    return user.roles?.includes(role) ?? false;
  }

  getRolLabel(user: IKeycloakUser): string {
    if (!user.roles || user.roles.length === 0) return 'Sin rol';
    if (user.roles.includes('admin')) return 'Administrador';
    if (user.roles.includes('personal_medico')) return 'Personal Médico';
    return user.roles[0];
  }

  getRolIcon(user: IKeycloakUser): string {
    if (!user.roles || user.roles.length === 0) return 'help_outline';
    if (user.roles.includes('admin')) return 'admin_panel_settings';
    if (user.roles.includes('personal_medico')) return 'medical_services';
    return 'badge';
  }

  abrirDialogoCrear() {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '480px',
      height: 'auto',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      panelClass: 'usuario-dialog-panel',
    });

    dialogRef.afterClosed().subscribe(() => {
      // Refresh is handled by the store success effects.
    });
  }

  editarUsuario(user: IKeycloakUser) {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '480px',
      height: 'auto',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      panelClass: 'usuario-dialog-panel',
      data: user,
    });

    dialogRef.afterClosed().subscribe(() => {
      // Refresh is handled by the store success effects.
    });
  }

  toggleEstado(user: IKeycloakUser) {
    const accion = user.enabled ? 'dar de baja' : 'activar';
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Confirmar ${accion}`,
        message: `¿Estás seguro de que deseas ${accion} al usuario "${this.getLegajo(user)}"?`,
      },
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usuariosFacade.toggleStatus(user.id, !user.enabled);
      }
    });
  }
}
