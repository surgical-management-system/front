import { gql } from 'apollo-angular';

export const GET_ESTADISTICAS_GENERALES = gql`
  query getEstadisticasGenerales {
    estadisticasGenerales {
      totalCirugias
      totalUrgencias
      cirugiasHoy
      urgenciasHoy
      quirofanosDisponibles
      personalDisponible
      pacientesEnEspera
    }
  }
`;
