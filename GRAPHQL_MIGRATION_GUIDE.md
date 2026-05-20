# Guía de Migración GraphQL

## Resumen de Cambios

Se ha migrado el frontend de llamadas REST HTTP a GraphQL. Todos los servicios ahora usan Apollo Client para comunicarse con el servidor GraphQL en lugar de directamente con REST endpoints.

## Cambios Principales

### 1. Instalación de Dependencias
Se han instalado las siguientes dependencias:
- `@apollo/client` - Cliente GraphQL
- `graphql-ws` - WebSocket para GraphQL (subscriptions)
- `graphql` - Cliente de GraphQL
- `apollo-angular` - Integración de Apollo con Angular

### 2. Configuración de Apollo

Se ha creado un nuevo archivo `src/app/core/config/graphql.config.ts` que configura:
- **HTTP Link**: Conecta con el endpoint GraphQL en `/graphql` de la BFF
- **Auth Link**: Agrega automáticamente el token JWT de Keycloak a las peticiones
- **Cache**: Configuración de Apollo InMemoryCache con políticas específicas para cada query
- **Error Handling**: Configuración de política de errores

### 3. Servicios Actualizados

#### BaseGraphQLService (Nuevo)
Reemplaza a `BaseApiService` y proporciona dos métodos principales:
- `query<T>(gqlQuery, variables)` - Para ejecutar queries GraphQL
- `mutation<T>(gqlMutation, variables)` - Para ejecutar mutations GraphQL

Ambos retornan `Observable<T>`.

#### Servicios Específicos Migrados
- `PersonalService` - Migrante a GraphQL ✅
- `PacienteService` - Migrante a GraphQL ✅
- `CirugiaService` - Migrante a GraphQL ✅
- `UrgenciaService` - Migrante a GraphQL ✅
- `UsuarioService` - Migrante a GraphQL ✅

## Ejemplos de Uso

### Antes (REST HTTP)
```typescript
// En el componente
constructor(private personalService: PersonalService) {}

ngOnInit() {
  this.personalService.getPersonal(0, 16).subscribe(
    (response) => {
      this.personales = response.data.contenido;
      this.totalElements = response.data.totalElementos;
    },
    (error) => console.error('Error:', error)
  );
}
```

### Después (GraphQL)
```typescript
// El uso en componentes sigue siendo igual, internamente usa GraphQL
constructor(private personalService: PersonalService) {}

ngOnInit() {
  this.personalService.getPersonal(0, 16).subscribe(
    (response) => {
      // El servicio ahora retorna directamente el objeto GraphQL
      this.personales = response.personales.content;
      this.totalElements = response.personales.totalElements;
    },
    (error) => console.error('Error:', error)
  );
}
```

## Queries GraphQL

### Personal
```graphql
# Obtener lista de personales con paginación
query getPersonales($pagina: Int!, $tamano: Int!, $search: String, $role: String) {
  personales(pagina: $pagina, tamano: $tamano, search: $search, role: $role) {
    content {
      id
      nombre
      apellido
      legajo
      email
      rol
      activo
    }
    totalElements
    pageNumber
    pageSize
    totalPages
  }
}
```

### Paciente
```graphql
# Obtener lista de pacientes con paginación
query getPacientes($pagina: Int!, $tamano: Int!, $search: String) {
  pacientes(pagina: $pagina, tamano: $tamano, search: $search) {
    content {
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
    totalElements
    pageNumber
    pageSize
    totalPages
  }
}

# Buscar pacientes
query searchPacientes($search: String!) {
  searchPacientes(search: $search) {
    id
    nombres
    apellidos
    dni
    email
  }
}
```

### Cirugia
```graphql
# Obtener lista de cirugías
query getCirugias($pagina: Int!, $tamano: Int!, $estado: String, $search: String) {
  cirugias(pagina: $pagina, tamano: $tamano, estado: $estado, search: $search) {
    content {
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
    totalElements
    pageNumber
    pageSize
    totalPages
  }
}
```

### Urgencia
```graphql
# Obtener lista de urgencias
query getUrgencias($pagina: Int!, $tamano: Int!, $estado: String, $search: String) {
  urgencias(pagina: $pagina, tamano: $tamano, estado: $estado, search: $search) {
    content {
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
    totalElements
    pageNumber
    pageSize
    totalPages
  }
}
```

### Usuario
```graphql
# Obtener lista de usuarios
query getUsuarios($pagina: Int!, $tamano: Int!, $search: String) {
  usuarios(pagina: $pagina, tamano: $tamano, search: $search) {
    content {
      id
      username
      email
      firstName
      lastName
      enabled
    }
    totalElements
    pageNumber
    pageSize
    totalPages
  }
}
```

## Mutations GraphQL

### Personal
```graphql
# Crear personal
mutation createPersonal($input: PersonalInput!) {
  createPersonal(input: $input) {
    id
    nombre
    apellido
    legajo
    email
    rol
    activo
  }
}

# Actualizar personal
mutation updatePersonal($id: Long!, $input: PersonalInput!) {
  updatePersonal(id: $id, input: $input) {
    id
    nombre
    apellido
    email
    rol
    activo
  }
}

# Eliminar personal
mutation deletePersonal($id: Long!) {
  deletePersonal(id: $id)
}
```

### Paciente
```graphql
# Crear paciente
mutation createPaciente($input: PacienteInput!) {
  createPaciente(input: $input) {
    id
    nombres
    apellidos
    dni
    email
    telefono
    activo
  }
}

# Activar paciente
mutation activatePaciente($id: Long!) {
  activatePaciente(id: $id) {
    id
    activo
  }
}

# Desactivar paciente
mutation deactivatePaciente($id: Long!) {
  deactivatePaciente(id: $id) {
    id
    activo
  }
}
```

### Cirugia
```graphql
# Crear cirugía
mutation createCirugia($input: CirugiaInput!) {
  createCirugia(input: $input) {
    id
    paciente {
      id
      nombres
    }
    quirofano {
      id
      nombre
    }
    fechaInicio
    estado
  }
}

# Agregar equipo médico a cirugia
mutation saveEquipoMedico($cirugiaId: Long!, $input: MiembroEquipoInput!) {
  saveEquipoMedico(cirugiaId: $cirugiaId, input: $input) {
    id
    personal {
      id
      nombre
    }
    rol
  }
}
```

### Usuario
```graphql
# Crear usuario
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

# Cambiar estado de usuario
mutation toggleUsuarioStatus($id: String!, $enabled: Boolean!) {
  toggleUsuarioStatus(id: $id, enabled: $enabled) {
    id
    enabled
  }
}

# Reiniciar contraseña
mutation resetPassword($usuarioId: String!) {
  resetPassword(usuarioId: $usuarioId)
}
```

## Ubicación de Archivos

### GraphQL Queries
- `src/app/core/graphql/queries/personal.queries.ts`
- `src/app/core/graphql/queries/paciente.queries.ts`
- `src/app/core/graphql/queries/cirugia.queries.ts`
- `src/app/core/graphql/queries/urgencia.queries.ts`
- `src/app/core/graphql/queries/usuario.queries.ts`

### GraphQL Mutations
- `src/app/core/graphql/mutations/personal.mutations.ts`
- `src/app/core/graphql/mutations/paciente.mutations.ts`
- `src/app/core/graphql/mutations/cirugia.mutations.ts`
- `src/app/core/graphql/mutations/urgencia.mutations.ts`
- `src/app/core/graphql/mutations/usuario.mutations.ts`

### Servicios Actualizados
- `src/app/core/services/base-graphql.service.ts` (nuevo)
- `src/app/core/services/personal.service.ts`
- `src/app/core/services/paciente.service.ts`
- `src/app/core/services/cirugia.service.ts`
- `src/app/core/services/urgencia.service.ts`
- `src/app/core/services/usuario.service.ts`

### Configuración
- `src/app/core/config/graphql.config.ts` (nuevo)
- `src/app/app.config.ts` (actualizado)

## Consideraciones Importantes

### 1. Autenticación JWT
El archivo `graphql.config.ts` configura automáticamente el envío del token JWT. Si hay un token disponible en Keycloak, se agregará automáticamente como `Authorization: Bearer <token>`.

### 2. Estructura de Respuesta
GraphQL retorna una estructura diferente a REST:
- **REST**: `{ data: { contenido: [...], totalElementos: 10 } }`
- **GraphQL**: `{ personales: { content: [...], totalElements: 10 } }`

Los servicios ya han sido adaptados para retornar la estructura correcta.

### 3. Manejo de Errores
Los errores de GraphQL se propagan como Observables con error. Los componentes pueden manejardos igual que antes:
```typescript
this.service.method().subscribe(
  (response) => { /* success */ },
  (error) => { /* error */ }
);
```

### 4. Caching
Apollo InMemoryCache se encarga automáticamente del caching basado en las políticas configuradas. Las queries que retornan listas pueden estar cacheadas según sus parámetros.

## Próximos Pasos

1. **Testing**: Ejecutar pruebas en componentes para asegurar que funciona correctamente
2. **Optimización**: Ajustar las políticas de cache según necesidades
3. **Subscriptions**: Si se requiere, implementar WebSocket subscriptions para live updates
4. **Error Handling**: Mejorar manejo de errores GraphQL con mensajes específicos

## Troubleshooting

### Error: "apollo-angular not found"
Asegúrate de haber ejecutado `npm install apollo-angular`.

### Error: "Query not found in backend"
Verifica que el endpoint GraphQL del BFF esté correctamente configurado en `environment.ts`.

### JWT no se envía automáticamente
Asegúrate de que Keycloak está correctamente inicializado antes de realizar las peticiones GraphQL. El token se obtiene automáticamente del SecurityContext.

## Red de Contacto

Para resolución de problemas o preguntas sobre la implementación de GraphQL, contactar al equipo de desarrollo.
