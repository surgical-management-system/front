# FrontEnd-DACS2025 🏥

Interfaz Angular para la gestión de turnos hospitalarios: funcionalidades esenciales listas; quedan mejoras y optimizaciones por implementar.

## 📝 Descripción
Este proyecto es la capa de presentación del ecosistema. Su arquitectura está diseñada para comunicarse con el backend mediante un patrón **BFF (Backend For Frontend)**, lo que permite centralizar la lógica de seguridad y normalizar los datos provenientes del backend.

## Objetivo

![Texto alternativo](assets/infraestructura.png)


## 🏗️ Arquitectura del Sistema
Este frontend es parte de una arquitectura distribuida. Puedes ver todos los componentes, microservicios y la infraestructura completa en nuestra organización de GitHub:

👉 **[Explorar el ecosistema de Surgical Management System](https://github.com/orgs/surgical-management-system/repositories)**


## 🛠️ Stack Tecnológico
- **Framework:** Angular (v18/19)
- **Lenguaje:** TypeScript
- **Estilos:** CSS3, Angular Material
- **Comunicación:** REST API con integración BFF
- **Seguridad:** Autenticación y Autorización basada en roles (RBAC)
- **Control de versiones:** Git
- **Consumo de APIs:** HTTP REST


## Funcionalidades

- Autenticación y autorización de usuarios mediante Keycloak.
  
	![Login Keycloak](assets/login-keycloack.psd.png)

  
- Visualizacion de cirugías programadas

    ![Calendario](assets/home-calendario.psd.png)


- Visualizacion de metricas

    ![Metricas](assets/home-metricas.psd.png)


- Reportes

    ![Reportes](assets/home-reportes.psd.png)


- Listado y filtrado de cirugías.

    ![Listado cirugias](assets/cirugias.psd.png)

    ![Filtrado cirugias](assets/filtrado-cirugia.psd.png)


- Gestión de cirugías y equipos médicos.

    ![Nueva cirugia](assets/nueva-cirugia.psd.png)

    ![Seleccionar paciente](assets/seleccionar-paciente-para-cirugia.psd.png)

    ![Seleccionar turno disponible](assets/seleccionar-turno-disponible.psd.png)

    ![Agregar equipo medico a una cirugia](assets/seleccion-medicos.psd.png)

    ![Finalizar cirugia cargando intervenciones realizadas](assets/finalizar-cirugia.psd.png)


- Gestión de personal.

    ![Listado de personal](assets/personal-list.psd.png)


- Gestión de pacientes: listado y búsqueda avanzada.

	![Listado de pacientes](assets/pacientes-list.psd.png)


- Alta de pacientes desde API externa.

    ![Seleccionar paciente desde api](assets/seleccionar-paciente-api-externa.psd.png)

    ![Alta de pacientes](assets/agregar-paciente.psd.png)


- Gestión de usuarios/roles mediante uso Keycloack API

    ![Listado de usuarios registrados en sistema](assets/usuarios-list.psd.png)

    ![ABM de usuarios](assets/editar-usuario.psd.png)


- Gestión de cuenta mediante Keycloack

    ![Configuracion de cuenta](assets/configurar-cuenta.psd.png)

    ![Redireccion a Keycloack](assets/keycloack.psd.png)


## Aprendizajes y Experiencia

- Profundización en el desarrollo de aplicaciones SPA con Angular y buenas prácticas de arquitectura.
- Integración de sistemas de autenticación y autorización robustos + Roles (Keycloak).
- Implementación de componentes reutilizables y diseño responsivo.
- Manejo de estados, servicios y comunicación eficiente con APIs REST.
- Mejora en la experiencia de usuario (UX/UI) utilizando Angular Material.
- Implementacion de patron bff.


## Configuracion
[Ver la configuración de infraestructura (PDF)](assets/DACS-configuracion-de-infraestructura.pdf)
