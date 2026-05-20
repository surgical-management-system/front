import { gql } from 'apollo-angular';

export const GET_PERSONALES = gql`
  query getPersonales($pagina: Int!, $tamano: Int!, $search: String, $role: String) {
    personales(pagina: $pagina, tamano: $tamano, search: $search, role: $role) {
      content {
        id
        nombre
        apellido
        legajo
        email
        rol
        activo
      }
      totalElements
      pageNumber
      pageSize
      totalPages
    }
  }
`;

export const GET_PERSONAL_BY_ID = gql`
  query getPersonalById($id: Long!) {
    personalById(id: $id) {
      id
      nombre
      apellido
      legajo
      email
      rol
      activo
    }
  }
`;
