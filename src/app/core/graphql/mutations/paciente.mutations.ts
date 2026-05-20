import { gql } from 'apollo-angular';

export const CREATE_PACIENTE = gql`
  mutation createPaciente($input: PacienteInput!) {
    createPaciente(input: $input) {
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

export const UPDATE_PACIENTE = gql`
  mutation updatePaciente($id: Long!, $input: PacienteInput!) {
    updatePaciente(id: $id, input: $input) {
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

export const DELETE_PACIENTE = gql`
  mutation deletePaciente($id: Long!) {
    deletePaciente(id: $id)
  }
`;

export const ACTIVATE_PACIENTE = gql`
  mutation activatePaciente($id: Long!) {
    activatePaciente(id: $id) {
      id
      activo
    }
  }
`;

export const DEACTIVATE_PACIENTE = gql`
  mutation deactivatePaciente($id: Long!) {
    deactivatePaciente(id: $id) {
      id
      activo
    }
  }
`;
