import { gql } from 'apollo-angular';

export const GET_TURNOS_DISPONIBLES = gql`
  query getTurnosDisponibles($pagina: Int!, $tamano: Int!, $fechaInicio: String!, $fechaFin: String!, $quirofanoId: Int, $estado: String, $duracionMinutos: Int, $servicioId: Long) {
    turnosDisponibles(pagina: $pagina, tamano: $tamano, fechaInicio: $fechaInicio, fechaFin: $fechaFin, quirofanoId: $quirofanoId, estado: $estado, duracionMinutos: $duracionMinutos, servicioId: $servicioId) {
      content {
        id
        quirofanoId
        quirofanoNombre
        fechaInicio
        horaInicio
        horaFin
        duracionMinutos
        disponible
        estado
      }
      totalElements
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
    }
  }
`;
