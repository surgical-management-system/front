import { Component, inject } from '@angular/core';
import { DatePipe, CommonModule, NgFor, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CirugiaService } from '../../core/services/cirugia.service';
import { UrgenciaService } from '../../core/services/urgencia.service';
import { QuirofanoService } from '../../core/services/quirofano.service';
import { IQuirofano } from '../../core/models/quirofano';
import { CirugiaDialog } from '../../cirugia/cirugia-dialog/cirugia-dialog';
import { UrgenciaDialog } from '../../urgencia/urgencia-dialog/urgencia-dialog';
import { IUrgencia } from '../../core/models/urgencia';

interface TurnoAgenda {
  id: number; // ID de la cirugía
  origen: 'cirugia' | 'urgencia';
  cirugia?: any;
  urgencia?: IUrgencia;
  fecha: string;
  hora: string;
  horaFin: string;
  horaInicioNum: number; // hora inicio en formato numérico (8, 9, 10...)
  minInicio: number; // minutos de inicio (0 o 30)
  horaFinNum: number; // hora fin en formato numérico
  minFin: number; // minutos de fin (0 o 30)
  duracionEnMedias: number; // duración en medias horas (ej: 1.5h = 3)
  descripcion: string;
  paciente: string;
  pacienteId: number;
  servicio: string;
  servicioId: number;
  quirofano: string;
  quirofanoId: number;
  estado: string;
  prioridad: string;
  anestesia: string;
  tipo: string;
  dni: string;
  color: string;
}

@Component({
  selector: 'app-agenda',
  imports: [DatePipe, CommonModule, NgFor, NgClass, MatIconModule, MatButtonModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda {
  today = new Date();
  currentWeekStart: Date;
  weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  weekDates: Date[] = [];
  weekLabel = '';
  turnos: TurnoAgenda[] = [];
  
  // Horas de la jornada (columnas)
  horasJornada: string[] = [];
  horaInicio = 8;
  horaFin = 18;
  
  // Quirófanos
  quirofanos: IQuirofano[] = [];
  selectedQuirofanoId: number | null = null; // null = todos

  private cirugiaService = inject(CirugiaService);
  private urgenciaService = inject(UrgenciaService);
  private quirofanoService = inject(QuirofanoService);
  private dialog = inject(MatDialog);

  constructor() {
    this.currentWeekStart = this.getStartOfWeek(this.today);
    this.generateHorasJornada();
    this.loadQuirofanos();
    this.updateWeek();
  }

  private generateHorasJornada() {
    this.horasJornada = [];
    for (let h = this.horaInicio; h <= this.horaFin; h++) {
      this.horasJornada.push(`${h.toString().padStart(2, '0')}:00`);
    }
  }

  private loadQuirofanos() {
    this.quirofanoService.getQuirofanos().subscribe((resp: any) => {
      const data = resp?.data ?? resp ?? [];
      this.quirofanos = Array.isArray(data) ? data : [];
      // Seleccionar el primer quirófano por defecto
      if (this.quirofanos.length > 0 && this.selectedQuirofanoId === null) {
        this.selectedQuirofanoId = this.quirofanos[0].id;
      }
    });
  }

  selectQuirofano(quirofanoId: number | null) {
    this.selectedQuirofanoId = quirofanoId;
  }

  get filteredTurnos(): TurnoAgenda[] {
    if (this.selectedQuirofanoId === null) {
      return this.turnos;
    }
    return this.turnos.filter(t => t.quirofanoId === this.selectedQuirofanoId);
  }

  updateWeek() {
    this.weekDates = Array.from({ length: 7 }, (_, i) => this.addDays(this.currentWeekStart, i));
    const start = this.weekDates[0];
    const end = this.weekDates[6];
    this.weekLabel = `${this.formatDate(start)} - ${this.formatDate(end)}`;

    forkJoin({
      cirugias: this.cirugiaService
        .getCirugiasPorFechas(this.getDateString(start), this.getDateString(end))
        .pipe(catchError((error) => {
          console.error('Error loading surgeries for agenda', error);
          return of(null);
        })),
      urgencias: this.urgenciaService
        .getUrgencias(0, 1000, undefined, undefined, undefined, undefined, this.getDateString(start), this.getDateString(end))
        .pipe(catchError((error) => {
          console.error('Error loading urgencies for agenda', error);
          return of(null);
        })),
    }).subscribe(({ cirugias, urgencias }) => {
      const turnosCirugia = this.mapCirugiasToTurnos(cirugias);
      const turnosUrgencia = this.mapUrgenciasToTurnos(urgencias);

      this.turnos = [...turnosCirugia, ...turnosUrgencia].sort((a, b) => {
        const dateCompare = a.fecha.localeCompare(b.fecha);
        if (dateCompare !== 0) {
          return dateCompare;
        }

        if (a.horaInicioNum !== b.horaInicioNum) {
          return a.horaInicioNum - b.horaInicioNum;
        }

        return a.minInicio - b.minInicio;
      });
    });
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  getDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  previousWeek() {
    this.currentWeekStart = this.addDays(this.currentWeekStart, -7);
    this.updateWeek();
  }

  nextWeek() {
    this.currentWeekStart = this.addDays(this.currentWeekStart, 7);
    this.updateWeek();
  }

  getTurnosForDayAndHour(date: Date, hora: string): TurnoAgenda[] {
    const dateStr = this.getDateString(date);
    const horaNum = parseInt(hora.substring(0, 2), 10);
    // Solo devolver turnos que INICIAN en esta hora exacta
    return this.filteredTurnos.filter(t => {
      return t.fecha === dateStr && t.horaInicioNum === horaNum;
    });
  }

  // Calcula el offset left del turno (50% si empieza a :30)
  getTurnoLeft(turno: TurnoAgenda): string {
    return turno.minInicio >= 30 ? '50%' : '0';
  }

  // Calcula el ancho del turno basado en su duración en medias horas
  getTurnoWidth(turno: TurnoAgenda): string {
    // Cada media hora = 50% de una columna
    const widthPercent = turno.duracionEnMedias * 50;
    // Ajustar para bordes entre celdas
    const columnsCrossed = Math.ceil(turno.duracionEnMedias / 2);
    return `calc(${widthPercent}% + ${Math.max(0, columnsCrossed - 1)}px)`;
  }

  getTurnosForDay(date: Date): TurnoAgenda[] {
    const dateStr = this.getDateString(date);
    return this.filteredTurnos.filter((t) => t.fecha === dateStr);
  }

  openCirugiaDialog(turno: TurnoAgenda) {
    const dialogRef = turno.origen === 'urgencia'
      ? this.dialog.open(UrgenciaDialog, {
          width: '500px',
          maxHeight: '90vh',
          data: turno.urgencia as IUrgencia,
        })
      : this.dialog.open(CirugiaDialog, {
          width: '500px',
          maxHeight: '90vh',
          data: turno.cirugia,
        });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Si se guardó/actualizó, recargar la agenda
        this.updateWeek();
      }
    });
  }

  private mapCirugiasToTurnos(response: any): TurnoAgenda[] {
    const cirugias = this.extractItems(response);

    return cirugias
      .filter((cirugia: any) => !this.isCancelled(cirugia?.estado))
      .map((cirugia: any) => {
        const horaInicioStr = cirugia.horaInicio || '08:00';
        const horaFinStr = cirugia.horaFin || '09:00';
        const [hhInicio, mmInicio] = horaInicioStr.split(':').map(Number);
        const [hhFin, mmFin] = horaFinStr.split(':').map(Number);
        const inicioEnMedias = hhInicio * 2 + (mmInicio >= 30 ? 1 : 0);
        const finEnMedias = hhFin * 2 + (mmFin >= 30 ? 1 : 0);

        return {
          id: cirugia.id,
          origen: 'cirugia',
          fecha: this.getDateString(new Date(cirugia.fechaInicio)),
          hora: horaInicioStr.substring(0, 5),
          horaFin: horaFinStr.substring(0, 5),
          horaInicioNum: hhInicio,
          minInicio: mmInicio,
          horaFinNum: hhFin,
          minFin: mmFin,
          duracionEnMedias: Math.max(1, finEnMedias - inicioEnMedias),
          descripcion: `${cirugia.pacienteNombre}\n${cirugia.servicioNombre}\n${cirugia.quirofanoNombre}`,
          paciente: cirugia.pacienteNombre || '',
          pacienteId: cirugia.pacienteId,
          servicio: cirugia.servicioNombre || '',
          servicioId: cirugia.servicioId,
          quirofano: cirugia.quirofanoNombre || '',
          quirofanoId: cirugia.quirofanoId || 0,
          estado: cirugia.estado || '',
          prioridad: cirugia.prioridad || '',
          anestesia: cirugia.anestesia || '',
          tipo: cirugia.tipo || '',
          dni: cirugia.dni || '',
          color: 'green',
          cirugia,
        };
      });
  }

  private mapUrgenciasToTurnos(response: any): TurnoAgenda[] {
    const urgencias = this.extractItems(response);

    return urgencias
      .filter((urgencia: any) => !this.isCancelled(urgencia?.estado))
      .map((urgencia: any) => {
        const fechaHoraInicio = new Date(urgencia.fechaHoraInicio);
        const horaInicioNum = fechaHoraInicio.getHours();
        const minInicio = fechaHoraInicio.getMinutes();
        const fecha = this.getDateString(fechaHoraInicio);
        const hora = `${String(horaInicioNum).padStart(2, '0')}:${String(minInicio).padStart(2, '0')}`;
        const finDate = new Date(fechaHoraInicio);
        const duracionMinutos = this.getUrgenciaDurationMinutes(urgencia);
        finDate.setMinutes(finDate.getMinutes() + duracionMinutos);
        const horaFinNum = finDate.getHours();
        const minFin = finDate.getMinutes();
        const horaFin = `${String(horaFinNum).padStart(2, '0')}:${String(minFin).padStart(2, '0')}`;
        const duracionEnMedias = Math.max(1, Math.ceil(duracionMinutos / 30));

        return {
          id: urgencia.id,
          origen: 'urgencia',
          fecha,
          hora,
          horaFin,
          horaInicioNum,
          minInicio,
          horaFinNum,
          minFin,
          duracionEnMedias,
          descripcion: `${urgencia.pacienteNombre}\n${urgencia.servicioNombre}\n${urgencia.quirofanoNombre}`,
          paciente: urgencia.pacienteNombre || '',
          pacienteId: urgencia.pacienteId,
          servicio: urgencia.servicioNombre || '',
          servicioId: urgencia.servicioId,
          quirofano: urgencia.quirofanoNombre || '',
          quirofanoId: urgencia.quirofanoId || 0,
          estado: urgencia.estado || '',
          prioridad: urgencia.prioridad || '',
          anestesia: urgencia.anestesia || '',
          tipo: urgencia.tipo || '',
          dni: urgencia.dni || '',
          color: 'blue',
          urgencia,
        };
      });
  }

  private getUrgenciaDurationMinutes(urgencia: any): number {
    const candidates = [
      urgencia?.duracionMinutos,
      urgencia?.duracion,
      urgencia?.duracionHoras,
      urgencia?.servicio?.duracionMinutos,
      urgencia?.servicio?.duracion,
      urgencia?.servicio?.tiempoEstimadoMinutos,
      urgencia?.servicio?.tiempoEstimado,
      urgencia?.servicio?.duracionHoras,
      urgencia?.servicio?.duracionServicio,
      urgencia?.servicio?.duracionTurno,
    ];

    for (const candidate of candidates) {
      const minutes = this.normalizeDurationToMinutes(candidate);
      if (minutes > 0) {
        return minutes;
      }
    }

    return 60;
  }

  private normalizeDurationToMinutes(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      if (value <= 0) {
        return 0;
      }
      return value <= 12 ? Math.round(value * 60) : Math.round(value);
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return 0;
      }

      if (/^\d+(?:[.,]\d+)?$/.test(trimmed)) {
        const numeric = Number(trimmed.replace(',', '.'));
        if (!Number.isFinite(numeric) || numeric <= 0) {
          return 0;
        }
        return numeric <= 12 ? Math.round(numeric * 60) : Math.round(numeric);
      }

      const hourMinuteMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      if (hourMinuteMatch) {
        const hours = Number(hourMinuteMatch[1]);
        const minutes = Number(hourMinuteMatch[2]);
        return hours * 60 + minutes;
      }
    }

    return 0;
  }

  private extractItems(response: any): any[] {
    const items = response?.data?.contenido || response?.data || [];
    return Array.isArray(items) ? items : [];
  }

  private isCancelled(estado: string): boolean {
    return (estado || '').toUpperCase() === 'CANCELADA';
  }
}
