import { gql } from 'apollo-angular';

export const CREATE_URGENCIA = gql`
  mutation createUrgencia($input: UrgenciaInput!) {
    createUrgencia(input: $input) {
      id
      paciente {
        id
        nombres
        apellidos
      }
      estado
      descripcion
      fechaCreacion
    }
  }
`;

export const UPDATE_URGENCIA = gql`
  mutation updateUrgencia($id: Long!, $input: UrgenciaInput!) {
    updateUrgencia(id: $id, input: $input) {
      id
      paciente {
        id
        nombres
        apellidos
      }
      estado
      descripcion
      fechaCreacion
    }
  }
`;

export const DELETE_URGENCIA = gql`
  mutation deleteUrgencia($id: Long!) {
    deleteUrgencia(id: $id)
  }
`;

export const SAVE_EQUIPO_MEDICO_URGENCIA = gql`
  mutation saveEquipoMedicoUrgencia($urgenciaId: Long!, $input: MiembroEquipoInput!) {
    saveEquipoMedicoUrgencia(urgenciaId: $urgenciaId, input: $input) {
      id
      personal {
        id
        nombre
        apellido
      }
      rol
    }
  }
`;

export const CREATE_INTERVENCION_URGENCIA = gql`
  mutation createIntervencionUrgencia($urgenciaId: Long!, $input: IntervencionInput!) {
    createIntervencionUrgencia(urgenciaId: $urgenciaId, input: $input) {
      id
      tipoIntervencion {
        id
        nombre
      }
      descripcion
      duracionEstimada
    }
  }
`;

export const UPDATE_INTERVENCION_URGENCIA = gql`
  mutation updateIntervencionUrgencia($urgenciaId: Long!, $id: Long!, $input: IntervencionInput!) {
    updateIntervencionUrgencia(urgenciaId: $urgenciaId, id: $id, input: $input) {
      id
      tipoIntervencion {
        id
        nombre
      }
      descripcion
      duracionEstimada
    }
  }
`;

export const DELETE_INTERVENCION_URGENCIA = gql`
  mutation deleteIntervencionUrgencia($urgenciaId: Long!, $id: Long!) {
    deleteIntervencionUrgencia(urgenciaId: $urgenciaId, id: $id)
  }
`;

export const INICIALIZAR_URGENCIA = gql`
  mutation inicializarUrgencia($id: Long!) {
    inicializarUrgencia(id: $id) {
      id
      estado
      fechaCreacion
    }
  }
`;

export const FINALIZAR_URGENCIA = gql`
  mutation finalizarUrgencia($id: Long!, $intervenciones: [IntervencionInput!]!) {
    finalizarUrgencia(id: $id, intervenciones: $intervenciones) {
      id
      estado
    }
  }
`;
