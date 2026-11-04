# Entrega 1: fundamentos

## Arquitectura

```text
src/
  app/                  Rutas, guards, layout y conexión HTTP/sesión
    pages/              Páginas generales existentes
  features/
    auth/               Sesión, authApi, types y pages/AuthPage
    campaigns/          campaignsApi, types, pages/CampaignsPage y demo/
  shared/
    api/                Transporte, ApiError y contratos comunes
    components/         Presentación independiente del negocio
    hooks/              Ciclo de vida del diálogo nativo
    utils/              Formato de fechas es-MX
    config/             Configuración existente
```

Dirección de dependencias: app → features → shared. Los módulos exponen su entrada
en `index.ts`; no importan detalles internos de otro módulo. El layout depende de
autenticación y por ello pertenece a app. El transporte recibe un adaptador desde
app, sin importar auth. Los DTO particulares permanecen junto a su servicio.

## Contratos inspeccionados

Backend revisado en el commit `c0f593c91299b408e98139d7f179df8c76a1d9c1`:

- [CampaignContracts.cs](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Campaigns/CampaignContracts.cs): CampaignDto, periodos y CampaignPage.
- [CampaignsController.cs](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Api/Controllers/CampaignsController.cs): GET `/api/campaigns`, pageNumber=1, pageSize=20; conflictos y duplicados devuelven 409.
- [AuthController.cs](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Api/Controllers/AuthController.cs): login, me, refresh y change-password; se conserva el flujo existente.
- [EmployeeContracts.cs](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Employees/EmployeeContracts.cs) y [AccountContracts.cs](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Accounts/AccountContracts.cs): confirman la misma forma de paginación.

`PaginatedResponse<T>` refleja items, total, pageNumber y pageSize, sin inventar
metadatos. `Identifier` representa GUID como string, sin validación implícita.
La versión de concurrencia permanece en Campaign; no se crea un DTO universal.
No se implementan servicios para módulos futuros.

## Reutilización

- PageHeader, DataTable, Pagination, StatusBadge, EmptyState, LoadingState y ErrorState se usan en convocatorias.
- DataTable recibe columnas `Column<T>`, claves estables y caption; no consulta ni filtra datos. El contenedor admite desplazamiento horizontal por teclado.
- Pagination recibe los metadatos del servidor. Conserva controles incluso si una página queda vacía para permitir regresar.
- TextField reemplaza los campos repetidos del login/cambio de contraseña y asocia etiquetas, ayudas y errores.
- SearchInput es controlado: el consumidor decide cuándo consultar. No se agrega búsqueda a convocatorias porque el endpoint inspeccionado no la admite.
- Modal usa dialog nativo para contener el foco e impedir interacción con el fondo, admite Escape, restaura el foco y bloquea cierre durante una operación.
- ConfirmDialog compone Modal. El consumidor controla busy, error y cierre; un fallo no cierra el diálogo. Ambos quedan disponibles para las siguientes entregas sin añadir operaciones de negocio ahora.
- StatusBadge recibe tono y contenido; la interpretación de estados sigue en campaigns.

Se conserva estado local, paginación en servidor y cancelación con AbortController
al cambiar página/desmontar. No se agregan cachés, estados globales, Redux,
dependencias ni memoización. StrictMode puede iniciar y cancelar una petición
adicional durante el montaje en desarrollo.

## Cliente HTTP

```ts
await request('/api/campaigns', { authenticated: true, signal })
```

`request<T>` conserva su respuesta `{ data, headers }`, GET/POST/PUT/PATCH y token
explícito para el flujo de login. Acepta JSON y FormData; en multipart deja que el
navegador genere Content-Type y boundary. Soporta respuestas vacías, cancelación
durante lectura, errores de red y respuestas JSON inválidas.

ApiError contiene status, message, details y fieldErrors. Lee message, detail y
errors de validación; ofrece mensajes de respaldo en español. Un 401 autenticado
invalida solo el token de la sesión actual, evitando que una respuesta tardía
cierre una sesión nueva. Login fallido sin token no activa esa política.

Un 409 se propaga intacto: no hay reintentos, reset, recarga ni redirección.
Los formularios deben conservar valores al capturarlo y limpiar/cerrar solo tras
éxito. El formulario actual cumple esta regla. No hay renovación automática ni
persistencia de tokens en localStorage.

## Simulación opcional

`VITE_DEMO_CAMPAIGNS=true` en `.env.development.local` activa únicamente una página
vacía tipada en `features/campaigns/demo/campaigns.ts`. Sigue requiriendo login
real. Los componentes no conocen el modo. La importación dinámica está protegida
por `import.meta.env.DEV` y desaparece en producción, incluso con la variable activa.

## Inventario

Archivos creados:

- `src/app/configureApi.ts`.
- `src/features/auth/index.ts`, `src/features/auth/types.ts`.
- `src/features/campaigns/index.ts`, `src/features/campaigns/types.ts`, `src/features/campaigns/demo/campaigns.ts`.
- `src/shared/api/ApiError.ts`, `src/shared/api/types.ts`.
- `src/shared/components/{PageHeader,DataTable,Pagination,SearchInput,Modal,ConfirmDialog,StatusBadge,EmptyState,LoadingState,ErrorState,TextField}.tsx`.
- `src/shared/hooks/useModal.ts`, `src/shared/utils/formatDate.ts`.
- `docs/entrega-1.md`.

Archivos reubicados (las rutas anteriores se eliminan):

- `src/pages/AuthPage.tsx` → `src/features/auth/pages/AuthPage.tsx`, con campos compartidos.
- `src/pages/CampaignsPage.tsx` → `src/features/campaigns/pages/CampaignsPage.tsx`, con presentación compartida.
- `src/shared/components/AppLayout.tsx` → `src/app/AppLayout.tsx`, con ajuste de ancho responsive.
- `src/pages/{HomePage,NotFoundPage,NavigationTestPage}.tsx` → `src/app/pages/`, conservando contenido.

Archivos modificados:

- `src/app/App.tsx`, `src/main.tsx`: imports y composición.
- `src/features/auth/authApi.ts`, `src/features/auth/session.ts`: separación de tipos y eliminación del manejo duplicado de 401.
- `src/features/campaigns/campaignsApi.ts`: autenticación desacoplada y simulación opcional.
- `src/shared/api/httpClient.ts`: transporte y errores.
- `src/vite-env.d.ts`, `README.md`: configuración y documentación.

## Límites y revisión pendiente

Verificaciones de la entrega:

- `npm run lint`: correcto.
- `npm run build`: correcto. El artefacto no contiene el módulo de simulación.
- `git diff --check`: correcto.
- `npm run format:check`: detecta 13 archivos ajenos al cambio por finales CRLF del checkout local. Sus contenidos coinciden con HEAD al normalizar CRLF a LF; HEAD pasa Prettier. Los archivos creados, modificados y reubicados pasan el formato.

Los pendientes de formato son `.prettierrc.json`, `eslint.config.js`, `index.html`,
`package.json`, `public/staticwebapp.config.json`, `src/index.css`,
`src/shared/api/httpClient.test.ts`, `src/shared/api/pingApi.ts`,
`src/shared/config/env.ts`, `tsconfig.app.json`, `tsconfig.json`,
`tsconfig.node.json` y `vite.config.ts`. Se conservan sin cambios para limitar
esta entrega; no se modifica la prueba existente.

No se crean ni actualizan pruebas automatizadas. Se deben validar en navegador
con usuarios reales el login, roles, contraseña obligatoria, expiración, teclado
y tamaños móviles. La integración real no se ejercita contra producción.
Los tests existentes del cliente reflejan expectativas anteriores a esta entrega
(por ejemplo, ignoran cache y esperan otro mensaje de error); no se actualizan.
Los contratos se tipan estáticamente, sin incorporar validadores en runtime.
No se modifica backend, SQL Server, Azure, workflows, dependencias ni lockfile;
no se despliega ni se crean commits o pushes.
