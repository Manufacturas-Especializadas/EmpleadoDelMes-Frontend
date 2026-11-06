# EmpleadoDelMes — Frontend

Aplicación web desarrollada con React, TypeScript, Vite y
Tailwind CSS.

## Estado

En desarrollo. La estructura técnica está preparada.
Las funcionalidades de negocio se definirán posteriormente.

## Tecnologías

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- React Router
- ESLint y Prettier
- Vitest

## Requisitos

- Node.js 24 LTS
- npm
- Git

## Instalación

```powershell
npm ci
```

## Desarrollo local

```powershell
npm run dev
```

## Variables de entorno

El archivo .env.development contiene la dirección local de la API.

Variables:

- VITE_APP_NAME
- VITE_API_BASE_URL

No almacenar secretos en variables VITE_*.

## Verificaciones

```powershell
npm run format:check
npm run lint
npm run build
npm run test
```

## Arquitectura

- src/app: configuración global.
- src/app/pages: páginas generales; las páginas de negocio viven en su funcionalidad.
- src/features: funcionalidades.
- src/shared: código reutilizable.
- src/assets: recursos estáticos.

## Despliegue

Pendiente de configuración.

Destino previsto: Azure Static Web Apps.
CI/CD: GitHub Actions.

## Licencia

Proyecto interno. Permisos de distribución pendientes
de definición por la organización.

## Autenticación — Tarea 8A

La sesión mantiene el accessToken solo en memoria y conserva únicamente el refreshToken en sessionStorage para restaurar la sesión de esta pestaña al recargar, sin decodificar tokens. No usa localStorage ni persiste sesiones con contraseña temporal. Durante la restauración consulta refresh y /me antes de habilitar rutas; los errores temporales permiten reintentar o volver al login. Consulta [renovación y restauración de sesión](docs/renovacion-sesion.md). El login consulta /api/auth/me antes de habilitar las rutas y combina mustChangePassword con X-Must-Change-Password. displayName puede ser nulo: se muestra userName como alternativa.

El servicio tipado incluye login, me, change-password y refresh. La renovación automática usa expiresIn y comparte una única solicitud; un 401 protegido permite renovar y repetir la petición una sola vez. Un segundo 401 o un refresh rechazado limpia la sesión. Un 403 del recurso muestra el mensaje de acceso restringido sin renovar tokens. La restauración al iniciar reutiliza esta misma renovación; no hay ciclos infinitos.

Las contraseñas permanecen únicamente en los campos del formulario durante su envío. El cambio exitoso elimina ambos tokens y solicita nuevo ingreso. El cierre de sesión es local, no revoca tokens en el servidor. Los guards verifican cada rol explícitamente, sin privilegio implícito de Administrator para otras áreas. Para usuarios con varios roles se elige el primero en este orden: Administrator, Sponsor, HumanResources, Safety, Quality; la navegación muestra sus áreas autorizadas.

El cliente HTTP central admite GET, POST, PUT, PATCH, JSON, FormData, Bearer opcional, AbortSignal y errores estructurados. Las operaciones protegidas usan `authenticated: true`; `src/app/configureApi.ts` conecta el token en memoria y la política central de 401. Los guards son controles de experiencia de usuario: la autorización real corresponde al backend.

## Entrega 1

Consulta [la arquitectura, contratos e inventario de archivos](docs/entrega-1.md).

## Entrega 2

Consulta [los módulos, contratos, límites y pasos de integración](docs/entrega-2.md).

Para recorrer el flujo sin API ni credenciales reales:

```powershell
npm run dev -- --mode demo
```

Elige un perfil en el login. Cierra sesión y cambia de perfil en la misma pestaña;
una recarga reinicia los datos ficticios. La demostración solo existe en desarrollo.
Para la API real, usa `npm run dev` y asegúrate de que `VITE_DEMO` y
`VITE_DEMO_CAMPAIGNS` estén desactivadas en tus archivos locales y entorno.

No se agregaron pruebas automatizadas. La integración con usuarios reales y la revisión visual en navegador quedan pendientes; no se modificó el backend ni se conectó SQL Server.
