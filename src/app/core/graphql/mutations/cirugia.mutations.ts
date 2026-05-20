import { gql } from 'apollo-angular';

export const CREATE_CIRUGIA = gql`
  mutation createCirugia($input: CirugiaInput!) {
    createCirugia(input: $input) {
      id
      paciente {
        id
        nombres
        apellidos
      }
      quirofano {
        id
        nombre
      }
      fechaInicio
      fechaFin
      estado
    }
  }
`;

export const UPDATE_CIRUGIA = gql`
  mutation updateCirugia($id: Long!, $input: CirugiaInput!) {
    updateCirugia(id: $id, input: $input) {
      id
      paciente {
        id
        nombres
        apellidos
      }
      quirofano {
        id
        nombre
      }
      fechaInicio
      fechaFin
      estado
    }
  }
`;

export const DELETE_CIRUGIA = gql`
  mutation deleteCirugia($id: Long!) {
    deleteCirugia(id: $id)
  }
`;

export const SAVE_EQUIPO_MEDICO = gql`
  mutation saveEquipoMedico($cirugiaId: Long!, $input: MiembroEquipoInput!) {
    saveEquipoMedico(cirugiaId: $cirugiaId, input: $input) {
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

export const CREATE_INTERVENCION = gql`
  mutation createIntervencion($cirugiaId: Long!, $input: IntervencionInput!) {
    createIntervencionUrgencia(cirugiaId: $cirugiaId, input: $input) {
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

export const UPDATE_INTERVENCION = gql`
  mutation updateIntervencion($cirugiaId: Long!, $id: Long!, $input: IntervencionInput!) {
    updateIntervencion(cirugiaId: $cirugiaId, id: $id, input: $input) {
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

export const DELETE_INTERVENCION = gql`
  mutation deleteIntervencion($cirugiaId: Long!, $id: Long!) {
    deleteIntervencion(cirugiaId: $cirugiaId, id: $id)
  }
`;

export const INICIALIZAR_CIRUGIA = gql`
  mutation inicializarCirugia($id: Long!) {
    inicializarCirugia(id: $id) {
      id
      estado
      fechaInicio
    }
  }
`;

export const FINALIZAR_CIRUGIA = gql`
  mutation finalizarCirugia($id: Long!, $intervenciones: [IntervencionInput!]!) {
    finalizarCirugia(id: $id, intervenciones: $intervenciones) {
      id
      estado
      fechaFin
    }
  }
`;
