# FrontEnd-DACS2025 🏥

Angular interface for hospital appointment management: essential features ready; further improvements and optimizations to be implemented.

## Description
This project is the presentation layer of the ecosystem. Its architecture is designed to communicate with the backend using a **BFF (Backend For Frontend)** pattern, which centralizes security logic and normalizes data coming from the backend.

## Objective

![Alternative text](assets/infraestructura.png)

## System Architecture
This frontend is part of a distributed architecture. You can see all components, microservices, and the complete infrastructure in our GitHub organization:

👉 **[Explore the Surgical Management System ecosystem](https://github.com/orgs/surgical-management-system/repositories)**

## Technology Stack
- **Framework:** Angular (v18/19)
- **Language:** TypeScript
- **Styles:** CSS3, Angular Material
- **Communication:** REST API with BFF integration
- **Security:** Role-Based Authentication and Authorization (RBAC)
- **Version control:** Git
- **API consumption:** HTTP REST

## Features

- User authentication and authorization via Keycloak.
  
	![Keycloak Login](assets/login-keycloack.psd.png)

- Visualization of scheduled surgeries

    ![Calendar](assets/home-calendario.psd.png)

- Visualization of metrics

    ![Metrics](assets/home-metricas.psd.png)

- Reports

    ![Reports](assets/home-reportes.psd.png)

- Listing and filtering of surgeries.

    ![Surgery list](assets/cirugias.psd.png)

    ![Surgery filtering](assets/filtrado-cirugia.psd.png)

- Management of surgeries and medical teams.

    ![New surgery](assets/nueva-cirugia.psd.png)

    ![Select patient](assets/seleccionar-paciente-para-cirugia.psd.png)

    ![Select available slot](assets/seleccionar-turno-disponible.psd.png)

    ![Add medical team to a surgery](assets/seleccion-medicos.psd.png)

    ![Finish surgery by recording performed interventions](assets/finalizar-cirugia.psd.png)

- Staff management.

    ![Staff list](assets/personal-list.psd.png)

- Patient management: listing and advanced search.

	![Patient list](assets/pacientes-list.psd.png)

- Patient registration from external API.

    ![Select patient from API](assets/seleccionar-paciente-api-externa.psd.png)

    ![Patient registration](assets/agregar-paciente.psd.png)

- User/role management using Keycloak API

    ![List of users registered in the system](assets/usuarios-list.psd.png)

    ![User CRUD](assets/editar-usuario.psd.png)

- Account management via Keycloak

    ![Account configuration](assets/configurar-cuenta.psd.png)

    ![Redirect to Keycloak](assets/keycloack.psd.png)

## Learnings and Experience

- Deepening in the development of SPA applications with Angular and good architectural practices.
- Integration of robust authentication and authorization systems + Roles (Keycloak).
- Implementation of reusable components and responsive design.
- State management, services, and efficient communication with APIs REST.
- Improved user experience (UX/UI) using Angular Material.
- Implementation of the BFF pattern.

## Configuration
[View the infrastructure configuration (PDF)](assets/DACS-configuracion-de-infraestructura.pdf)
