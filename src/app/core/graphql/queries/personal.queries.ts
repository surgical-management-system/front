import { gql } from 'apollo-angular';

export const GET_PERSONALES = gql`
  query getPersonales($page: Int!, $limit: Int!, $filter: PersonalFiltersInput) {
    personales(page: $page, limit: $limit, filter: $filter) {
      content {
        id
        nombre
        apellido
        legajo
        dni
        especialidad
        rol
        estado
        telefono
      }
      totalElements
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
    }
  }
`;

export const GET_PERSONAL_BY_ID = gql`
  query getPersonalById($id: ID!) {
    personal(id: $id) {
      id
      nombre
      apellido
      legajo
      dni
      especialidad
      rol
      estado
      telefono
    }
  }
`;
