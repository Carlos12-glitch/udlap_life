1. Introducción

El presente manual describe el proceso de instalación, configuración y ejecución del sistema UdlapLife, una aplicación web desarrollada para la comunidad UDLAP. Su propósito es ofrecer una plataforma moderna, rápida e intuitiva que concentre servicios académicos e informativos en un solo lugar.

2. Requisitos Previos

Antes de instalar el sistema, asegúrese de contar con lo siguiente:

Software requerido
- Node.js versión 18 o superior
- Gestor de paquetes npm (incluido con Node.js)
- Visual Studio Code
- Git
- Navegador web actualizado:
    - Google Chrome
    - Microsoft Edge
    - Mozilla Firefox
Hardware recomendado
- Procesador de doble núcleo o superior
- 4 GB de RAM mínimo
- 500 MB de espacio disponible en disco
- Conexión a internet

3. Obtención del Proyecto
Opción A: Clonar desde GitHub

Abrir una terminal y ejecutar:

git clone <URL_DEL_REPOSITORIO>
cd udlap_life

Opción B: Descargar archivo ZIP
Ingresar al repositorio del proyecto.
Seleccionar Code.
Elegir Download ZIP.
Extraer los archivos en una carpeta local.

4. Instalación de Dependencias

Ubicado en la carpeta principal del proyecto, ejecutar:

npm install

Este comando descargará e instalará todas las librerías necesarias definidas en el archivo package.json.

5. Tecnologías y Dependencias Utilizadas

El sistema utiliza las siguientes herramientas y librerías:

- React
- Vite
- Firebase
- React Router DOM
- Leaflet
- React Leaflet
- jsPDF
- ESLint

6. Configuración del Entorno

El proyecto puede incluir variables de entorno mediante el archivo:

.env

En caso de requerirse configuración adicional, verificar credenciales y parámetros definidos por el equipo de desarrollo.

7. Ejecución del Proyecto

Para iniciar el servidor local de desarrollo, ejecutar:

npm run dev

El sistema mostrará una dirección local similar a:

http://localhost:5173/

Abrir dicha dirección en el navegador para utilizar la aplicación.

8. Compilación para Producción

Para generar una versión optimizada del sistema:

npm run build

Los archivos finales se almacenarán en la carpeta:

dist/

9. Solución de Problemas Comunes
Error: npm no se reconoce

Causa: Node.js no instalado o no agregado al PATH.
Solución: Reinstalar Node.js y reiniciar el equipo.

Error de dependencias

Ejecutar:

npm install
Error en puerto ocupado

Vite puede asignar otro puerto automáticamente. Revisar la terminal.

Error de código fuente

Verificar archivos modificados recientemente y revisar consola del navegador.

10. Desinstalación

Para eliminar el proyecto:

Borrar la carpeta local del sistema.
Opcionalmente desinstalar Node.js, Git o dependencias no requeridas.

11. Contacto de Soporte

Para dudas técnicas o mantenimiento, contactar al equipo desarrollador del proyecto UdlapLife.

12. Equipo de Desarrollo
Gartzen Aldecoa Barroso – Product Owner
Monserrat Lázaro Salinas – Scrum Master
Carlos Iván Valdés Camacho – Developer
Julio César Zacatelco López – Developer
