import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PersonalService } from '../../core/services/personal.service';
import { IMiembroEquipoMedico } from '../../core/models/miembro-equipo';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-personal-list-dialog',
  templateUrl: './personal-list-dialog.html',
  styleUrls: ['./personal-list-dialog.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
})
export class PersonalListDialog implements OnInit {
  displayedColumns: string[] = ['nombre', 'legajo', 'rol', 'accionAgregar'];
  dataSource = new MatTableDataSource<IMiembroEquipoMedico>([]);
  totalItems = 0;
  pageSize = 16;
  page = 0;
  searchControl = new FormControl('');
  roleFilter = 'personal_medico';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private personalService: PersonalService,
    private dialogRef: MatDialogRef<PersonalListDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { q?: string }
  ) {
    if (data?.q) {
      this.searchControl.setValue(data.q);
    }
  }

  ngOnInit(): void {
    this.loadPage(this.page, this.pageSize, this.searchControl.value ?? '');
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => {
        // Reset to page 0 when search changes
        this.page = 0;
        return this.personalService.searchPersonalLite(0, this.pageSize, (q ?? '').trim(), this.roleFilter).pipe(
          catchError(() => of({ contenido: [], totalElementos: 0, pagina: 0, tamaño: this.pageSize, totalPaginas: 0 }))
        );
      })
    ).subscribe((resp: any) => {
      const content = Array.isArray(resp?.contenido) ? resp.contenido : (Array.isArray(resp?.content) ? resp.content : []);
      const totalItems = typeof resp?.totalElementos === 'number' ? resp.totalElementos : (typeof resp?.totalElements === 'number' ? resp.totalElements : content.length);
      this.dataSource.data = content;
      this.totalItems = totalItems;
      if (this.paginator) {
        this.paginator.pageIndex = 0;
        this.paginator.pageSize = this.pageSize;
      }
    });
  }

  loadPage(page: number, pageSize: number, q: string) {
    this.personalService.searchPersonalLite(page, pageSize, q ?? '', this.roleFilter).subscribe((resp: any) => {
      // Adaptar a la estructura paginada del backend (contenido, totalElementos, pagina, tamaño)
      const content = Array.isArray(resp?.contenido) ? resp.contenido : (Array.isArray(resp?.content) ? resp.content : []);
      const totalItems = typeof resp?.totalElementos === 'number' ? resp.totalElementos : (typeof resp?.totalElements === 'number' ? resp.totalElements : content.length);
      this.dataSource.data = content;
      this.totalItems = totalItems;
    });
  }

  onPage(event: PageEvent) {
    // When pageSize changes, reset to page 0
    this.page = event.pageIndex ?? 0;
    this.pageSize = event.pageSize ?? this.pageSize;
    this.loadPage(this.page, this.pageSize, this.searchControl.value ?? '');
  }

  accept(p: IMiembroEquipoMedico) {
    this.dialogRef.close(p);
  }

  cancel() {
    this.dialogRef.close(null);
  }

  getPersonalName(personal: IMiembroEquipoMedico): string {
    const nombre = personal?.nombre?.trim() ?? '';
    const apellido = personal?.apellido?.trim() ?? '';
    return [nombre, apellido].filter(Boolean).join(' ') || nombre || '-';
  }
}
