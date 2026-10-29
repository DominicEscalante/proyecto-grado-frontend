# AMPAR — Aplicación web

Aplicación web del proyecto académico AMPAR, una plataforma de reporte ciudadano y coordinación de respuestas a emergencias en La Paz, Bolivia. Este repositorio contiene la interfaz para ciudadanos, operadores institucionales y administradores; la API se mantiene en el repositorio del backend.

## Contenido

- [Funciones](#funciones)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [Estructura del código](#estructura-del-código)
- [Compilación y despliegue](#compilación-y-despliegue)
- [Solución de problemas](#solución-de-problemas)

## Funciones

- Registro e inicio de sesión, con verificación de identidad ciudadana.
- Creación y seguimiento de reportes con ubicación geográfica.
- Adjuntar imágenes y videos a un reporte. La carga se procesa en el backend; las credenciales de Supabase no deben estar en esta aplicación.
- Consolas de monitoreo para Policía y Bomberos, con mapa, marcadores, evidencias y concentraciones de reportes recientes.
- Administración de usuarios y operadores.

El mapa usa datos de OpenStreetMap. Cuando la API de operadores no está disponible, la interfaz puede mostrar datos de contingencia; verifica que el backend esté conectado antes de usar esos datos como información real.

## Tecnologías

- React 18, TypeScript y Vite.
- React Router para navegación y protección de rutas por rol.
- Axios para comunicación con la API.
- Leaflet y OpenStreetMap para el mapa.
- Tailwind CSS, Heroicons y Lucide para la interfaz.

## Requisitos

- Node.js 20 o superior.
- npm.
- La API AMPAR en ejecución para usar autenticación, reportes y paneles con datos reales.

## Puesta en marcha

Desde la carpeta de este repositorio:

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env` en la raíz y configura la URL del backend:

   ```env
   VITE_API_URL=http://localhost:3000
   ```

   Si no defines esta variable, la aplicación usa `http://localhost:3000`.

3. Inicia Vite:

   ```bash
   npm run dev
   ```

4. Abre <http://localhost:5173>.

No guardes claves secretas en variables `VITE_*`: Vite las incluye en el código que recibe el navegador. La clave de Supabase pertenece únicamente al entorno del backend.

## Rutas de la aplicación

| Ruta | Acceso | Uso |
| --- | --- | --- |
| `/login` | Público | Inicio de sesión |
| `/registro` | Público | Registro ciudadano |
| `/verificar-identidad` | Ciudadano | Verificación de identidad |
| `/ciudadano/reportes` | Ciudadano | Crear y consultar reportes |
| `/operador/emergencias` | Policía o Bomberos | Monitoreo y atención de incidentes |
| `/admin/usuarios` | Administrador | Gestión de usuarios y operadores |

La ruta raíz redirige a `/login`. Las rutas protegidas requieren una sesión válida y el rol correspondiente.

## Estructura del código

El frontend organiza la lógica por funcionalidades en `src/features/`:

```text
src/
├── app/                 # Router y configuración de la aplicación
├── components/          # Componentes compartidos y elementos de interfaz
├── context/             # Contexto de autenticación
├── lib/                 # Utilidades y configuración compartidas
├── features/
│   ├── admin-users/
│   ├── auth/
│   ├── citizen-reports/
│   └── institution-reports/
├── pages/               # Composición de páginas y dashboards
├── api/                 # Cliente HTTP compartido
└── types/               # Tipos comunes
```

Cada funcionalidad mantiene sus componentes, API, hooks, tipos y utilidades junto a su dominio; su `index.ts` define la API pública para otras funcionalidades.

## Compilación y despliegue

Genera la versión estática de producción:

```bash
npm run build
```

Los archivos quedan en `dist/`. Para revisar localmente la compilación:

```bash
npm run preview
```

Al desplegar:

- Define `VITE_API_URL` con la URL pública de la API antes de compilar.
- Configura `CORS_ORIGIN` en el backend con el origen público de este frontend.
- Configura el hosting para devolver `index.html` en las rutas de React Router, por ejemplo `/operador/emergencias`.
- Sirve frontend y API mediante HTTPS.

## Solución de problemas

- **La aplicación no conecta con la API:** comprueba `VITE_API_URL`, que el backend esté activo y que `CORS_ORIGIN` permita el origen del frontend.
- **El panel muestra información de contingencia:** revisa la conexión y autenticación de la API de operador; la interfaz usa datos de muestra cuando la solicitud falla.
- **Una ruta funciona al navegar, pero falla al recargar:** configura el hosting estático para resolver rutas desconocidas a `index.html`.
- **El mapa no carga:** comprueba la conexión a Internet y el acceso a las teselas de OpenStreetMap.
