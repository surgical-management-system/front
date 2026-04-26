export type EstadoUrgencia =
  | 'PENDIENTE'
  | 'PROGRAMADA'
  | 'EN_CURSO'
  | 'FINALIZADA'
  | 'CANCELADA';

export interface IUrgencia {
  id?: number;
  prioridad: string;
  nivelUrgencia: number | null;
  fechaHoraInicio: string;
  estado: EstadoUrgencia | string;
  anestesia: string;
  tipo: string;
  pacienteId: number | null;
  pacienteNombre: string;
  dni: string;
  servicioId: number | null;
  servicioNombre: string;
  quirofanoId: number | null;
  quirofanoNombre: string;
}
