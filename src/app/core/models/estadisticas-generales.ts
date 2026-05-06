import { IQuirofano } from './quirofano';

export interface IEstadisticasGenerales {
  totalPacientes: number;
  cirugiasPendientes: number;
  cirugiasHoy: number;
  cirugiasEstaSemana: number;
  urgenciasHoy?: number;
  urgenciasEstaSemana?: number;
  quirofanosDisponibles: IQuirofano[];
  quirofanosEnUso: IQuirofano[];
}
