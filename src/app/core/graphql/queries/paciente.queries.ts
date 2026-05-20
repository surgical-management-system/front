import { gql } from 'apollo-angular';

export const GET_PACIENTES = gql`
  query getPacientes($pagina: Int!, $tamano: Int!, $search: String) {
    pacientes(pagina: $pagina, tamano: $tamano, search: $search) {
      content {
        id
        nombres
        apellidos
        dni
        email
        telefono
        domicilio
        ciudad
        provincia
        codigoPostal
        activo
      }
      totalElements
      pageNumber
      pageSize
      totalPages
    }
  }
`;

export const GET_PACIENTE_BY_ID = gql`
  query getPacienteById($id: Long!) {
    pacienteById(id: $id) {
      id
      nombres
      apellidos
      dni
      email
      telefono
      domicilio
      ciudad
      provincia
      codigoPostal
      activo
    }
  }
`;

export const SEARCH_PACIENTES = gql`
  query searchPacientes($search: String!) {
    searchPacientes(search: $search) {
      id
      nombres
      apellidos
      dni
      email
    }
  }
`;
