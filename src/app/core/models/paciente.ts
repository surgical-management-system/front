export interface IPacienteLite {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
}

export interface IPaciente{
  id: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  edad: number;
  fecha_nacimiento: Date; // ISO yyyy-MM-dd
  direccion: string;
  telefono: string;
  peso?: number;
  altura?: number;
  activo?: boolean; // indicates if the paciente is active (true) or deactivated (false)
  active?: boolean; // some backends return `active` in English
}