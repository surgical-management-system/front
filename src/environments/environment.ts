export const environment = {
    production: false,
    keycloak: {
        url:  'http://localhost:8080' ,
        realm: 'dacs',
        clientId: 'dacs-fe',
        redirectUri: 'http://localhost:4200/'
    },
      backendForFrontendUrl: 'http://localhost:9001/bff'
};