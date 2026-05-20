import { gql } from 'apollo-angular';

export const GET_QUIROFANOS = gql`
  query getQuirofanos {
    quirofanos {
      id
      nombre
      numero
      piso
      estado
      capacidad
    }
  }
`;

export const CREATE_QUIROFANO = gql`
  mutation createQuirofano($input: QuirofanoInput!) {
    createQuirofano(input: $input) {
      id
      nombre
      numero
      piso
      estado
      capacidad
    }
  }
`;
