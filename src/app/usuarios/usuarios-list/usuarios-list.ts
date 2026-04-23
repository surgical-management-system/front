import { Component, OnInit } from '@angular/core';
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
import { UsuarioService, IKeycloakUser } from '../../core/services/usuario.service';
import { UsuarioDialogComponent } from '../usuario-dialog/usuario-dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

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
  totalItems: number = 0;
  pageSize: number = 16;
  page: number = 0;
  isLoading: boolean = false;
  viewMode: 'table' | 'cards' = 'table';

  dataSource = new MatTableDataSource<IKeycloakUser>([]);
  displayedColumns: string[] = [
    'username',
    'email',
    'nombre',
    'rol',
    'estado',
    'emailVerified',
    'creado',
    'acciones',
  ];

  constructor(
    private usuarioService: UsuarioService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadPage(this.page, this.pageSize);
  }

  onPage(event: PageEvent) {
    const nextPage = event.pageIndex ?? 0;
    const nextSize = event.pageSize ?? this.pageSize;

    this.page = nextPage;
    this.pageSize = nextSize;

    this.loadPage(nextPage, nextSize);
  }

  loadPage(page: number, pageSize: number) {
    this.isLoading = true;
    this.usuarioService.getUsuarios(page, pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.contenido || [];
        this.totalItems = response.totalElementos || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilter(filterValue: string) {
    if (filterValue.trim()) {
      this.usuarioService.searchUsuarios(0, this.pageSize, filterValue).subscribe({
        next: (response) => {
          this.dataSource.data = response.contenido || [];
          this.totalItems = response.totalElementos || 0;
        },
        error: (error) => {
          console.error('Error al buscar usuarios:', error);
        }
      });
    } else {
      this.loadPage(this.page, this.pageSize);
    }
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Recargar la lista después de crear
        this.loadPage(0, this.pageSize);
        this.page = 0;
      }
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPage(this.page, this.pageSize);
      }
    });
  }

  toggleEstado(user: IKeycloakUser) {
    const accion = user.enabled ? 'dar de baja' : 'activar';
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Confirmar ${accion}`,
        message: `¿Estás seguro de que deseas ${accion} al usuario "${user.username}"?`,
      },
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usuarioService.toggleUsuarioStatus(user.id, !user.enabled).subscribe({
          next: () => {
            this.loadPage(this.page, this.pageSize);
          },
          error: (error) => {
            console.error('Error al cambiar estado del usuario:', error);
          }
        });
      }
    });
  }
}
