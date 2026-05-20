import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER, LOCALE_ID, importProvidersFrom, isDevMode, Injector } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { KeycloakService } from 'keycloak-angular';
import { keycloakInitOptions } from './core/config/keycloak.config';

// 💡 IMPORTANTE: Nos aseguramos de traer tanto Apollo como HttpLink
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { createApolloConfig } from './core/config/graphql.config';

import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-AR';

import { routes } from './app.routes';

registerLocaleData(localeEs);

function initializeKeycloak(keycloak: KeycloakService) {
  return () => {
    console.log('Inicializando Keycloak...');
    return keycloak.init(keycloakInitOptions)
      .then(() => {
        console.log('✅ Keycloak inicializado correctamente');
        return Promise.resolve();
      })
      .catch((error) => {
        console.error('❌ Error en Keycloak:', error);
        console.warn('⚠️ Continuando sin Keycloak');
        return Promise.resolve();
      });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    
    // 1. 🚀 HTTP DEBE REGISTRARSE ANTES QUE APOLLO
    provideHttpClient(
      withInterceptorsFromDi()
    ),

    // 2. 🔐 INTERCEPTORES REST/HTTP TRADICIONALES
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },

    // 3. 🛰️ PROVEEDORES DE CONFIGURACIÓN DE APOLLO GRAPHQL
    Apollo,   // <-- Faltaba registrar la clase core en el contenedor de Angular
    HttpLink, // <-- Requisito fundamental para que la factoría cree el enlace HTTP
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApolloConfig,
      deps: [HttpLink, Injector] // HttpLink para el transporte y Injector para resolver Keycloak en tiempo de petición
    },

    // 4. OTROS PROVEEDORES (Mantenidos exactamente igual)
    provideStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: isDevMode() ? false : true }),
    importProvidersFrom(MatSnackBarModule),
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};