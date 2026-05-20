import { gql } from 'apollo-angular';

export const GET_USUARIOS = gql`
  query getUsuarios($pagina: Int!, $tamano: Int!, $search: String) {
    usuarios(pagina: $pagina, tamano: $tamano, search: $search) {
      content {
        id
        username
        email
        firstName
        lastName
        enabled
      }
      totalElements
      pageNumber
      pageSize
      totalPages
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
  query searchUsuarios($search: String!, $pagina: Int, $tamano: Int) {
    searchUsuarios(search: $search, pagina: $pagina, tamano: $tamano) {
      content {
        id
        username
        email
        firstName
        lastName
        enabled
      }
      totalElements
      pageNumber
      pageSize
      totalPages
    }
  }
`;
