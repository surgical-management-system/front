import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { KeycloakService } from 'keycloak-angular';
import { keycloakInitOptions } from './core/config/keycloak.config';
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
        return Promise.resolve(); // Siempre resolver, nunca rechazar
      });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    KeycloakService, // ← Mover KeycloakService al principio
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    provideHttpClient(
      withInterceptorsFromDi()
    ),
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
    importProvidersFrom(MatSnackBarModule),
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};