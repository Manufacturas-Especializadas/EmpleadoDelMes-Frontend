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

La sesión guarda accessToken y refreshToken exclusivamente en memoria, sin decodificarlos. Una recarga completa requiere iniciar sesión nuevamente. El login consulta /api/auth/me antes de habilitar las rutas y combina mustChangePassword con X-Must-Change-Password. displayName puede ser nulo: se muestra userName como alternativa.

El servicio tipado incluye login, me, change-password y refresh. La renovación automática queda pendiente deliberadamente: un 401 en una operación autenticada limpia la sesión y requiere nuevo login; no existen reintentos ni ciclos de renovación. expiresIn se recibe como parte del contrato; la expiración se valida por el servidor al solicitar operaciones. Un 403 muestra el mensaje de acceso restringido sin renovar tokens.

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
