import { gql } from 'apollo-angular';

export const CREATE_USUARIO = gql`
  mutation createUsuario($input: UsuarioInput!) {
    createUsuario(input: $input) {
      id
      username
      email
      firstName
      lastName
      enabled
    }
  }
`;

export const UPDATE_USUARIO = gql`
  mutation updateUsuario($id: String!, $input: UsuarioInput!) {
    updateUsuario(id: $id, input: $input) {
      id
      username
      email
      firstName
      lastName
      enabled
    }
  }
`;

export const DELETE_USUARIO = gql`
  mutation deleteUsuario($id: String!) {
    deleteUsuario(id: $id)
  }
`;

export const TOGGLE_USUARIO_STATUS = gql`
  mutation toggleUsuarioStatus($id: String!, $enabled: Boolean!) {
    toggleUsuarioStatus(id: $id, enabled: $enabled) {
      id
      enabled
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation resetPassword($usuarioId: String!) {
    resetPassword(usuarioId: $usuarioId)
  }
`;
