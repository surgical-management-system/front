import { gql } from 'apollo-angular';

export const CREATE_PERSONAL = gql`
  mutation createPersonal($input: PersonalInput!) {
    createPersonal(input: $input) {
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

export const UPDATE_PERSONAL = gql`
  mutation updatePersonal($id: Long!, $input: PersonalInput!) {
    updatePersonal(id: $id, input: $input) {
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

export const DELETE_PERSONAL = gql`
  mutation deletePersonal($id: Long!) {
    deletePersonal(id: $id)
  }
`;
