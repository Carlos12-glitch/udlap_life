# UDLAPLife

Aplicación móvil para estudiantes de la Universidad de las Américas Puebla (UDLAP) que centraliza los servicios académicos y del campus en un solo lugar.

## 🚀 Demo en vivo

**[https://udlap-life.vercel.app/login](https://udlap-life.vercel.app/login)**

## Características

- **Autenticación** — Inicio de sesión con Firebase Auth, reconocimiento facial biométrico y recuperación de contraseña por correo
- **Horario** — Visualización semanal de clases en vista lista o calendario, con exportación a `.ics` para agregar al calendario del dispositivo
- **Calificaciones** — Historial por periodo (Primavera 2025, Otoño 2025, Primavera 2026) con detalle por materia
- **Transcript** — Historial académico completo con desglose por carrera y periodo
- **Escolar** — Centro académico con progreso de créditos, tutor asignado y orientación académica
- **Pagos** — Estado de cuenta, bancos disponibles para pago, información de facturación y descarga de estado de cuenta en PDF
- **Avisos** — Noticias y comunicados del campus filtrados por categoría
- **Eventos** — Actividades universitarias filtradas por categoría y fecha
- **Alimentos** — Menú semanal del Comedor Américas
- **Transporte** — Rutas de autobús universitario con horarios y puntos de venta
- **Mapa** — Mapa interactivo del campus con ubicaciones de edificios y lugares de interés
- **Perfil** — Información personal y académica del estudiante
- **Configuración** — Modo oscuro, tamaño de letra, notificaciones push y autenticación biométrica

## Tecnologías

| Tecnología | Uso |
|---|---|
| React + Vite | Frontend |
| Firebase Auth | Autenticación de usuarios |
| Firebase Firestore | Base de datos en tiempo real |
| React Router | Navegación entre pantallas |
| React Leaflet | Mapa interactivo del campus |
| jsPDF | Generación de PDF del estado de cuenta |
| Cypress | Pruebas E2E automatizadas |

## Instalación

```bash
git clone https://github.com/Carlos12-glitch/udlap_life.git
cd udlap_life
npm install
npm run dev
```

> Requiere un archivo `.env` con las variables de entorno de Firebase. Solicítalo al equipo de desarrollo.

## Pruebas E2E

```bash
npm run cypress:open
```

Las pruebas cubren los flujos de: Login, Home, Escolar, Alimentos, Pagos y Mapa.

## Equipo

Proyecto desarrollado por estudiantes de la Universidad de las Américas Puebla.
