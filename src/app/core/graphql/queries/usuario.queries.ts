import { gql } from 'apollo-angular';

export const GET_USUARIOS = gql`
  query getUsuarios($page: Int!, $limit: Int!, $filter: UsuarioFiltersInput) {
    usuarios(page: $page, limit: $limit, filter: $filter) {
      content {
        id
        username
        email
        firstName
        lastName
        enabled
      }
      totalElements
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
    }
  }
`;

export const GET_USUARIO_BY_ID = gql`
  query getUsuarioById($id: String!) {
    usuarioById(id: $id) {
      id
      username
      email
      firstName
      lastName
      enabled
    }
  }
`;

export const SEARCH_USUARIOS = gql`
  query searchUsuarios($search: String!) {
    usuarios(page: 0, limit: 16, filter: { search: $search }) {
      content {
        id
        username
        email
        firstName
        lastName
        enabled
      }
      totalElements
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
    }
  }
`;
