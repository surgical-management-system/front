import { IPersonal, IPersonalLite } from "./personal";



export interface IMiembroEquipoMedico {
  personalId: number;
  cirugiaId?: number;
  legajo: string;
  nombre: string;
  apellido?: string;
  rol: string;
  personalNombre?: string; // Mapped from 'nombre'
  rolNombre?: string;      // Mapped from 'rol'
  urgenciaId?: number;
}