# FrontEnd-DACS2025 🏥

Interfaz de usuario moderna desarrollada en **Angular** para la plataforma de gestión hospitalaria.

## 📝 Descripción
Este proyecto es la capa de presentación del ecosistema. Su arquitectura está diseñada para comunicarse con el backend mediante un patrón **BFF (Backend For Frontend)**, lo que permite centralizar la lógica de seguridad y normalizar los datos provenientes del backend.

## 🏗️ Arquitectura del Sistema
Este frontend es parte de una arquitectura distribuida. Puedes ver todos los componentes, microservicios y la infraestructura completa en nuestra organización de GitHub:

👉 **[Explorar el ecosistema de Surgical Management System](https://github.com/orgs/surgical-management-system/repositories)**

## 🛠️ Stack Tecnológico
- **Framework:** Angular (v18/19)
- **Lenguaje:** TypeScript
- **Comunicación:** REST API con integración BFF
- **Seguridad:** Autenticación y Autorización basada en roles (RBAC)

## Stack Tecnológico

- **Framework principal:** Angular
- **Lenguaje:** TypeScript
- **Estilos:** CSS3, Angular Material
- **Gestión de dependencias:** npm
- **Control de versiones:** Git
- **Backend de autenticación:** Keycloak
- **Consumo de APIs:** HTTP REST
- **Testing:** Jasmine, Karma

## Funcionalidades

- Autenticación y autorización de usuarios mediante Keycloak.
  
	![Login Keycloak](assets/login-keycloack.psd.png)
- Gestión de pacientes: listado y búsqueda avanzada.
  
	![Listado de pacientes](assets/pacientes-list.psd.png)

- Agregar paciente desde API externa:
    ![Seleccionar paciente desde api](assets/seleccionar-paciente-api-externa.psd.png)
    ![Alta de pacientes](assets/agregar-paciente.psd.png)

- Visualización y gestión de cirugías y equipos médicos.
  
	![Nueva cirugía / gestión](assets/nueva-cirugia.psd.png)
- Panel de métricas y reportes del sistema en tiempo real.
  
	![Infraestructura / panel](assets/infraestructura.png)
- Navegación por tabs y diseño responsivo.
  
	![Listados y navegación](assets/usuarios-list.psd.png)
- Integración con APIs REST para consumo de datos.
  
	![Selección de médicos / integración](assets/seleccion-medicos.psd.png)
- Confirmaciones y diálogos interactivos para acciones críticas.
  
	![Finalizar cirugía / diálogo](assets/finalizar-cirugia.psd.png)
- Filtros y paginación en tablas de datos.
  
	![Filtrado en cirugías](assets/filtrado-cirugia.psd.png)
- Notificaciones y mensajes de error amigables.
  
	![Agregar paciente / notificaciones](assets/agregar-paciente.psd.png)
- Soporte para roles y permisos diferenciados.
  
	![Configurar cuenta / permisos](assets/configurar-cuenta.psd.png)

## Aprendizajes y Experiencia

- Profundización en el desarrollo de aplicaciones SPA con Angular y buenas prácticas de arquitectura.
- Integración de sistemas de autenticación y autorización robustos (Keycloak).
- Implementación de componentes reutilizables y diseño responsivo.
- Manejo de estados, servicios y comunicación eficiente con APIs REST.
- Mejora en la experiencia de usuario (UX/UI) utilizando Angular Material.
- Automatización de pruebas y despliegue.

## Objetivo
![Texto alternativo](assets/infraestructura.png)

## Configuracion
[Ver la configuración de infraestructura (PDF)](assets/DACS-configuracion-de-infraestructura.pdf)
