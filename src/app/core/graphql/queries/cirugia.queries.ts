import { gql } from 'apollo-angular';

export const GET_CIRUGIAS = gql`
  query getCirugias($pagina: Int!, $tamano: Int!, $estado: String, $search: String, $sort: String, $order: String) {
    cirugias(pagina: $pagina, tamano: $tamano, estado: $estado, search: $search, sort: $sort, order: $order) {
      content {
        id
        pacienteId
        pacienteNombre
        dni
        servicioId
        servicioNombre
        prioridad
        tipo
        horaInicio
        quirofanoId
        quirofanoNombre
        fechaInicio
        horaFin
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

export const GET_CIRUGIA_BY_ID = gql`
  query getCirugiaById($id: ID!) {
    cirugiaById(id: $id) {
      id
      pacienteId
      pacienteNombre
      dni
      servicioId
      servicioNombre
      prioridad
      tipo
      horaInicio
      quirofanoId
      quirofanoNombre
      fechaInicio
      horaFin
      estado
    }
  }
`;

export const GET_EQUIPO_MEDICO_BY_CIRUGIA = gql`
  query getEquipoMedicoByCirugia($cirugiaId: ID!) {
    equipoMedicoByCirugia(cirugiaId: $cirugiaId) {
      personalId
      legajo
      nombre
      rol
      cirugiaId
    }
  }
`;

export const GET_INTERVENCIONES_BY_CIRUGIA = gql`
  query getIntervencionesByCirugia($cirugiaId: ID!) {
    intervencionesByCirugia(cirugiaId: $cirugiaId) {
      id
      tipoIntervencionId
      tipoIntervencionNombre
      observaciones
      duracionEstimada
    }
  }
`;

export const GET_TIPOS_INTERVENCION = gql`
  query getTiposIntervencion {
    tiposIntervencion {
      id
      nombre
      descripcion
    }
  }
`;
