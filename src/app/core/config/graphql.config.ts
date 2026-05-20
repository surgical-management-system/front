import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { Injector } from '@angular/core';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../../../environments/environment';
import { KeycloakService } from '../services/keycloak.service';

export function createApolloConfig(httpLink: HttpLink, injector: Injector) {
  const graphqlUrl = environment.backendForFrontendUrl.startsWith('http')
    ? `${environment.backendForFrontendUrl}/graphql`
    : `http://${environment.backendForFrontendUrl}/graphql`;

  const link = httpLink.create({
    uri: graphqlUrl,
    withCredentials: true // Soporte de cookies de sesión para BFF
  });

  const authLink = setContext(async (_, context) => {
    try {
      const token = await injector.get(KeycloakService).getValidToken();

      if (!token) {
        return context;
      }

      return {
        ...context,
        headers: {
          ...context.headers,
          Authorization: `Bearer ${token}`
        }
      };
    } catch (error) {
      return context;
    }
  });

  return {
    link: ApolloLink.from([authLink, link]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            personales: { keyArgs: ['pagina', 'tamano', 'search', 'role'] },
            pacientes: { keyArgs: ['pagina', 'tamano', 'search'] },
            usuarios: { keyArgs: ['pagina', 'tamano', 'search'] },
            cirugias: { keyArgs: ['pagina', 'tamano', 'estado', 'search', 'sort', 'order'] },
            urgencias: { keyArgs: ['pagina', 'tamano', 'estado', 'search', 'sort', 'order', 'fechaInicio', 'fechaFin'] }
          }
        }
      }
    }),
    defaultOptions: {
      watchQuery: { errorPolicy: 'all' },
      query: { errorPolicy: 'all' }
    }
  };
}