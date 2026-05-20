import { gql } from 'apollo-angular';

export const GET_URGENCIAS = gql`
  query getUrgencias($pagina: Int!, $tamano: Int!, $estado: String, $search: String, $sort: String, $order: String, $fechaInicio: String, $fechaFin: String) {
    urgencias(pagina: $pagina, tamano: $tamano, estado: $estado, search: $search, sort: $sort, order: $order, fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      content {
        id
        pacienteId
        pacienteNombre
        dni
        estado
        fechaInicio
        horaInicio
        horaFin
      }
      totalElements
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
      totalPages
    }
  }
`;

export const GET_URGENCIA_BY_ID = gql`
  query getUrgenciaById($id: ID!) {
    urgenciaById(id: $id) {
      id
      pacienteId
      pacienteNombre
      dni
      estado
      fechaInicio
      horaInicio
      horaFin
    }
  }
`;

export const GET_EQUIPO_MEDICO_URGENCIA = gql`
  query getEquipoMedicoUrgencia($urgenciaId: ID!) {
    equipoMedicoUrgencia(urgenciaId: $urgenciaId) {
      personalId
      legajo
      nombre
      rol
      urgenciaId
    }
  }
`;

export const GET_INTERVENCIONES_URGENCIA = gql`
  query getIntervencionesUrgencia($urgenciaId: ID!) {
    intervencionesUrgencia(urgenciaId: $urgenciaId) {
      id
      tipoIntervencionId
      tipoIntervencionNombre
      observaciones
    }
  }
`;
