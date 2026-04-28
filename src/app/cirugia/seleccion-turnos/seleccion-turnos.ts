import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CirugiaService } from '../../core/services/cirugia.service';

type Slot = { label: string; time: string; date: Date; disponible: boolean; turnoId?: number; estado?: string };
type DayColumn = { date: Date; title: string; slots: Slot[] };

@Component({
  selector: 'app-seleccion-turnos',
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './seleccion-turnos.html',
  styleUrl: './seleccion-turnos.css',
})
export class SeleccionTurnos {
  columns: DayColumn[] = [];
  selectedIndex = 0;
  servicioId = 0;
  allowOccupiedTurns = false;
  fechaHoy: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  selectedDays = 7;
  quirofanos: any[] = [];
  selectedQuirofanoId: number | null = null;
  readonly daysOptions = [7, 14, 30, 60];

  constructor(
    private dialogRef: MatDialogRef<SeleccionTurnos>,
    private cirugiaService: CirugiaService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      days?: number;
      startHour?: string;
      endHour?: string;
      intervalMinutes?: number;
      servicioId?: number;
      quirofanos?: any[];
      allowOccupiedTurns?: boolean;
    } | null,
  ) {
    const days = data?.days ?? 7;
    const startHour = data?.startHour ?? '08:00';
    const endHour = data?.endHour ?? '17:30';
    const interval = data?.intervalMinutes ?? 30;
    this.servicioId = data?.servicioId ?? 0;
    this.allowOccupiedTurns = data?.allowOccupiedTurns ?? false;
    // Prebuild a local skeleton while the backend responde
    this.columns = this.buildColumns(days, startHour, endHour, interval);
    this.quirofanos = data?.quirofanos ?? [];
    if (this.quirofanos.length > 0) {
      this.selectedQuirofanoId = this.quirofanos[0].id;
    }
  }

  ngOnInit(): void {
    this.loadTurnos(this.selectedDays);
  }

  changeDays(days: number): void {
    if (days === this.selectedDays) return;
    this.loadTurnos(days);
  }

  changeQuirofano(quirofanoId: number): void {
    if (quirofanoId === this.selectedQuirofanoId) return;
    this.selectedQuirofanoId = quirofanoId;
    this.loadTurnos(this.selectedDays);
  }

  private loadTurnos(days: number): void {
    this.selectedDays = days;
    this.selectedIndex = 0;
    const now = new Date();
    this.fechaHoy.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
    );
    const fechaLimite = new Date(this.fechaHoy);
    fechaLimite.setDate(fechaLimite.getDate() + days);
    const quirofanoId = this.selectedQuirofanoId ?? 0;
    this.cirugiaService
      .getTurnosDisponibles(
        quirofanoId,
        this.getDateString(this.fechaHoy),
        this.getDateString(fechaLimite),
        0,
        300,
        this.servicioId,
      )
      .subscribe({
        next: (resp: any) => {
          const contenido = this.extractTurnos(resp);
          if (Array.isArray(contenido) && contenido.length > 0) {
            this.buildColumnsFromBackend(contenido);
          } else {
            console.warn('No turnos available or invalid response format');
            this.columns = [];
          }
        },
        error: (err) => {
          console.error('Error al cargar turnos disponibles:', err);
        },
      });
  }

  private buildColumnsFromBackend(turnos: any[]): void {
    if (!Array.isArray(turnos) || turnos.length === 0) {
      console.warn('No hay turnos disponibles o formato inválido');
      return;
    }

    const columnMap = new Map<string, DayColumn>();

    turnos.forEach((turno: any) => {
      const fecha = new Date(turno.fechaHoraInicio);
      if (Number.isNaN(fecha.getTime())) {
        return;
      }

      const yyyy = fecha.getFullYear();
      const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const dd = fecha.getDate().toString().padStart(2, '0');
      const fechaKey = `${yyyy}-${mm}-${dd}`;

      if (!columnMap.has(fechaKey)) {
        const title = this.formatDayTitle(fecha);
        columnMap.set(fechaKey, { date: fecha, title, slots: [] });
      }

      const hh = fecha.getHours().toString().padStart(2, '0');
      const min = fecha.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hh}:${min}`;

      const slot: Slot = {
        label: timeStr,
        time: timeStr,
        date: fecha,
        disponible: this.isDisponible(turno.disponible),
        turnoId: turno.id,
        estado: turno.estado,
      };

      columnMap.get(fechaKey)!.slots.push(slot);
    });

    this.columns = Array.from(columnMap.values()).map((column) => ({
      ...column,
      slots: column.slots.sort((a, b) => a.time.localeCompare(b.time)),
    }));
  }

  private extractTurnos(resp: any): any[] {
    const contenido = resp?.data?.contenido ?? resp?.contenido ?? resp?.data ?? [];
    return Array.isArray(contenido) ? contenido : [];
  }

  private isDisponible(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value.toLowerCase() === 'disponible';
    }

    return Boolean(value);
  }

  private buildColumns(
    days: number,
    startHour: string,
    endHour: string,
    interval: number,
  ): DayColumn[] {
    const out: DayColumn[] = [];
    for (let i = 0; i < days; i++) {
      const date = this.addDays(new Date(), i);
      const title = this.formatDayTitle(date);
      const slots = this.generateSlotsForDate(date, startHour, endHour, interval);
      out.push({ date, title, slots });
    }
    return out;
  }

  private generateSlotsForDate(
    date: Date,
    startHour: string,
    endHour: string,
    interval: number,
  ): Slot[] {
    const [sh, sm] = startHour.split(':').map(Number);
    const [eh, em] = endHour.split(':').map(Number);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sh, sm, 0, 0);
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), eh, em, 0, 0);
    const slots: Slot[] = [];
    for (let t = new Date(start); t <= end; t = new Date(t.getTime() + interval * 60000)) {
      const hh = t.getHours().toString().padStart(2, '0');
      const mm = t.getMinutes().toString().padStart(2, '0');
      slots.push({ label: `${hh}:${mm}`, time: `${hh}:${mm}`, date: new Date(t), disponible: true });
    }
    return slots;
  }

  select(slot: Slot) {
    if (!slot.disponible && !this.allowOccupiedTurns) {
      return;
    }

    const quirofano = this.quirofanos.find((q) => q.id === this.selectedQuirofanoId);
    this.dialogRef.close({
      date: slot.date,
      time: slot.time,
      quirofanoId: this.selectedQuirofanoId,
      quirofanoNombre: quirofano?.nombre ?? '',
    });
  }

  selectDay(index: number) {
    this.selectedIndex = index;
  }

  private addDays(d: Date, days: number): Date {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  }

  private formatDayTitle(d: Date): string {
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private getDateString(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
  }
}
