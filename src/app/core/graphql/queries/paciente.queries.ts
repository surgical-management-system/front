import { gql } from 'apollo-angular';

export const GET_PACIENTES = gql`
  query getPacientes($page: Int!, $limit: Int!, $filter: PacienteFiltersInput) {
    pacientes(page: $page, limit: $limit, filter: $filter) {
      content {
        id
        nombre
        apellido
        dni
        fechaNacimiento
        direccion
        telefono
        altura
        peso
        active
      }
      totalElements
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
    }
  }
`;

export const GET_PACIENTE_BY_ID = gql`
  query getPacienteById($id: ID!) {
    paciente(id: $id) {
      id
      nombre
      apellido
      dni
      fechaNacimiento
      direccion
      telefono
      altura
      peso
      active
    }
  }
`;

export const SEARCH_PACIENTES = gql`
  query searchPacientes($search: String!) {
    pacientes(page: 0, limit: 16, filter: { search: $search }) {
      content {
      id
      nombre
      apellido
      dni
      fechaNacimiento
      direccion
      telefono
      altura
      peso
      active
      }
    }
  }
`;
