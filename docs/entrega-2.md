# Entrega 2 — Flujo principal

Implementación preparada para pruebas de integración del 4 de noviembre de 2026.
Se conserva la Entrega 1 local, que todavía contiene cambios sin commit. No se
modificaron backend, Azure, workflows, dependencias ni pruebas automatizadas.

## Módulos implementados

| Módulo            | Ruta                                        | Funciones                                                                                                                                      |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Convocatorias     | `/admin/campaigns` y `/admin/campaigns/:id` | Listado paginado, detalle, estado, apertura/cierre manual de ambos periodos, automático, programación, archivo y reapertura con confirmaciones |
| Postulaciones     | `/sponsor`                                  | Convocatoria abierta, búsqueda paginada, candidato, cualidades, justificación, confirmación y nueva postulación                                |
| Preselección      | `/admin/preselections`                      | Filtro por convocatoria, búsqueda, conteo válido, selección y retiro con concurrencia                                                          |
| Opiniones         | `/human-resources`, `/safety`, `/quality`   | Una página y un editor compartidos; candidatos, estado propio, consulta, alta y edición                                                        |
| Revisión integral | `/admin/review`                             | Consulta paginada de preseleccionados con postulaciones válidas, estados por departamento y detalle integral de solo lectura                   |

No se agregan alta manual de convocatorias, opiniones del jefe inmediato,
calificaciones, ranking ni elección de ganadores. Se muestra el orden recibido del
servidor, sin calcular un ranking. Empleados, usuarios e importaciones quedan
fuera de esta entrega.

## Contratos y endpoints

Backend inspeccionado en commit `c0f593c91299b408e98139d7f179df8c76a1d9c1`.
Se consultaron los controladores y los servicios/repositorios que definen los DTO,
las validaciones, los permisos y la serialización:

- [Controladores](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/tree/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Api/Controllers): Campaigns, Nominations, AdminNominations, AdminPreselections, Opinions y AdminCandidates.
- [NominationContracts y NominationAdminContracts](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/tree/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Nominations).
- [PreselectionService](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Preselections/PreselectionService.cs), [OpinionService](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Opinions/OpinionService.cs) y [CandidateReviewService](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Candidates/CandidateReviewService.cs).
- [Enums](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/tree/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Domain/Enums) y [Program.cs](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Api/Program.cs): enums numéricos, sin JsonStringEnumConverter.

| Método | Endpoint                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------- |
| GET    | `/api/campaigns`, `/api/campaigns/{id}`                                                           |
| POST   | `/api/campaigns/{id}/{nominations\|opinions}/{open\|close\|automatic}`                            |
| PUT    | `/api/campaigns/{id}/{nominations\|opinions}/schedule`                                            |
| POST   | `/api/campaigns/{id}/{archive\|reopen}`                                                           |
| GET    | `/api/nominations/active-campaign`, `/api/nominations/candidates`                                 |
| POST   | `/api/nominations`                                                                                |
| GET    | `/api/admin/nominations/candidates`                                                               |
| POST   | `/api/admin/preselections/{campaignId}/{candidateEmployeeId}/{select\|withdraw}`                  |
| GET    | `/api/opinions/candidates`, `/api/opinions/{campaignId}/{candidateEmployeeId}`                    |
| PUT    | `/api/opinions/{campaignId}/{candidateEmployeeId}`                                                |
| GET    | `/api/admin/candidates/review`, `/api/admin/candidates/{campaignId}/{candidateEmployeeId}/review` |

Las listas envían pageNumber y pageSize (20); las búsquedas usan term, máximo 100
caracteres, y se ejecutan al enviar el filtro. No se descargan todos los registros
para filtrar en la interfaz. Los detalles usan el endpoint de detalle existente.

NominationQualities es una máscara de bits: Teamwork=1, ProblemSolving=2,
Commitment=4, Initiative=8. Se envía la combinación numérica, no un array de textos.
El POST de postulación solo incluye candidateEmployeeId, qualities y justification;
el servidor decide convocatoria y patrocinador. No se anticipan duplicados con
información incompleta: se presentan los mensajes reales del backend.

Los periodos usan 0=automático, 1=abierto manual, 2=cerrado manual. La programación
envía openingAt y closingAt en ISO 8601, convirtiendo la hora local del equipo a
UTC con `Z` explícito. Programar no cambia automáticamente el modo del periodo.
Reabrir una convocatoria archivada deja ambos periodos cerrados, según el dominio.

## Concurrencia y formularios

- Convocatorias envía version; después de éxito consulta de nuevo el detalle. Ante 409 recarga y requiere una acción manual nueva. Las fechas escritas se conservan.
- Preselección envía exactamente preselectionVersion, incluido null cuando no existe registro. Después de retirar una selección la versión sigue siendo la del registro existente. Éxito/409 actualizan la lista; no hay reenvíos automáticos.
- Opiniones GET devuelve `{ hasOpinion, opinion, message }`; PUT devuelve Opinion directamente. Alta con version null, edición con opinion.version. Nunca se envía departamento o rol en el cuerpo.
- Un 409 en opiniones conserva el borrador, consulta la versión registrada y bloquea el envío hasta una revisión explícita del usuario. Si falla esa consulta se conserva el texto y se informa el error.
- Las justificaciones y opiniones requieren texto no vacío y máximo 500 caracteres.
- Las cargas cancelan al desmontar o cambiar filtro; las operaciones tienen exclusión de doble envío y AbortController. Cancelar el cliente no revierte una operación ya aceptada por el servidor.

## Reutilización y arquitectura

Los servicios y DTO viven en cada feature. `app` mantiene composición y rutas por
rol. Las nuevas features exponen entradas públicas; revisión reutiliza el formateo
de cualidades mediante la entrada pública de nominations.

Se reutilizan PageHeader, DataTable, Pagination, SearchInput, Modal, ConfirmDialog,
StatusBadge, EmptyState (a través de DataTable), LoadingState, ErrorState y TextField.
No se reconstruyen componentes, login ni transporte HTTP.

Las únicas piezas compartidas nuevas responden a repetición real:

- `ListFilters`: búsqueda enviada explícitamente, con identificador opcional de convocatoria; usado por cuatro pantallas.
- `useQuery`: carga local con clave, reconsulta explícita, cancelación y descarte de respuestas obsoletas. No es caché ni gestor global.
- `useOperation`: evita doble envío y cancela al desmontar, manteniendo carga/error locales.
- `queryString`: codifica los parámetros de paginación y filtros comunes.

## Demostración

```powershell
npm run dev -- --mode demo
```

`.env.demo` usa `VITE_DEMO=true` y una dirección ficticia. También se acepta la
bandera anterior VITE_DEMO_CAMPAIGNS para compatibilidad, ahora como demostración
completa de esta entrega. No mezclar estas banderas con una sesión contra API real.

En el arranque, solo si `import.meta.env.DEV`, se importa dinámicamente
`app/demo/server.ts`. El cliente HTTP permite inyectar ese transporte únicamente
en desarrollo. Los servicios, DTO, errores, guards y componentes siguen siendo
los mismos. Ninguna solicitud del modo demo se reenvía a una API externa.

El login ofrece cinco perfiles sin credenciales. Las sesiones y los registros
permanecen en memoria: cerrar sesión permite cambiar de perfil sin perder el flujo;
recargar la pestaña reinicia todo. No se guardan tokens en almacenamiento persistente.

Datos iniciales: una convocatoria de noviembre de 2026 con ambos periodos abiertos
manualmente, tres candidatos ficticios y un patrocinador. No hay postulaciones,
preselecciones ni opiniones iniciales. Las operaciones actualizan el mismo estado;
incluye duplicados, periodos, archivado, versiones y opiniones por departamento.
La demostración usa una sola convocatoria, por lo que no reproduce conflictos
entre convocatorias, SQL, automatización mensual ni todas las condiciones de producción.

## Inventario de esta entrega

Creados:

- `.env.demo`, `docs/entrega-2.md`, `src/app/demo/server.ts`.
- `src/features/campaigns/pages/CampaignDetailPage.tsx`.
- `src/features/nominations/{index.ts,types.ts,qualities.ts,nominationsApi.ts,pages/NominationsPage.tsx}`.
- `src/features/preselections/{index.ts,types.ts,preselectionsApi.ts,pages/PreselectionsPage.tsx}`.
- `src/features/opinions/{index.ts,types.ts,opinionsApi.ts,pages/OpinionsPage.tsx,components/OpinionEditor.tsx}`.
- `src/features/review/{index.ts,types.ts,reviewApi.ts,pages/ReviewPage.tsx,components/ReviewDetail.tsx}`.
- `src/shared/components/ListFilters.tsx`, `src/shared/hooks/useQuery.ts`, `src/shared/hooks/useOperation.ts`, `src/shared/utils/queryString.ts`.

Modificados respecto al estado local de Entrega 1:

- `src/app/App.tsx`, `src/app/AppLayout.tsx`, `src/app/pages/HomePage.tsx`: rutas, navegación y accesos administrativos.
- `src/features/campaigns/{campaignsApi.ts,index.ts,pages/CampaignsPage.tsx}`: detalle y operaciones.
- `src/features/auth/pages/AuthPage.tsx`: acceso demo condicionado a desarrollo; formulario real conservado.
- `src/shared/api/httpClient.ts`: punto mínimo de inyección del transporte de desarrollo.
- `src/main.tsx`, `src/vite-env.d.ts`, `README.md`: arranque/configuración y guía.

Eliminado `src/features/campaigns/demo/campaigns.ts`: la respuesta vacía aislada fue
sustituida por el estado coordinado de la demostración. No se eliminan cambios
pendientes de la Entrega 1.

## Verificaciones ejecutadas

- `npm run lint`: correcto.
- `npm run build`: correcto.
- Build de producción con ambas banderas demo activas: correcto, sin marcadores de datos ficticios, sesiones demo ni módulo demo en el artefacto.
- Inicio de Vite con `--mode demo` en localhost; documento, main.tsx y módulo demo responden HTTP 200.
- `git diff --check`: correcto.
- Prettier sobre archivos modificados/creados de esta entrega: correcto.

No se crean ni actualizan pruebas automatizadas. No se han ejercitado usuarios
reales ni el flujo visual completo en navegador. Las comprobaciones de compilación
y arranque no sustituyen las pruebas de integración del día 4.

## Límites y pendientes explícitos

1. **Disponibilidad de opiniones:** el backend no devuelve canAcceptOpinions en los DTO departamentales y `/api/campaigns` exige Administrator. No se puede mostrar un estado abierto/cerrado fiable antes de guardar. El editor explica la condición; respeta el 409, conserva el borrador y bloquea reenvíos automáticos. Mostrar el estado anticipadamente requeriría ampliar un contrato del backend, fuera del alcance autorizado.
2. **Selector departamental de convocatorias:** no existe un endpoint autorizado para enumerarlas. Se introduce el GUID compartido por administración. Las pantallas administrativas también permiten este filtro y tienen accesos directos desde el detalle de convocatoria. No se inventaron consultas ni permisos.
3. Opiniones exige una cuenta con exactamente un rol departamental y sin Administrator/Sponsor; el servidor rechaza combinaciones ambiguas con 403 y la interfaz muestra su mensaje.
4. Pendiente validar accesibilidad/teclado, móvil, concurrencia entre sesiones, CORS y autorización con backend de integración. Los 13 archivos CRLF ajenos al alcance permanecen intactos.

## Recorrido para mañana

### En casa, sin API

1. Ejecutar `npm run dev -- --mode demo` y abrir la URL indicada por Vite.
2. Entrar con Sponsor. Buscar `DEMO`, seleccionar un candidato, marcar cualidades, escribir justificación y confirmar. Repetir el mismo candidato para comprobar el mensaje de duplicado sin perder el texto; después usar otro candidato.
3. Cerrar sesión desde la aplicación, sin recargar la pestaña. Entrar con Administrator; abrir Convocatorias → Administrar. Copiar el identificador `10000000-0000-4000-8000-000000000001`.
4. Ir al enlace Preselección del detalle. Ver el conteo, preseleccionar, retirar y volver a seleccionar. Comprobar que el registro retirado conserva su versión.
5. Cerrar sesión y entrar con HumanResources. Introducir el identificador anterior, buscar, registrar una opinión, volver a abrirla y editarla.
6. Repetir con Safety y Quality, cada perfil registra su propia opinión sin sobrescribir las otras.
7. Volver con Administrator → detalle → Revisión integral. Comprobar los tres estados, patrocinador, cualidades, justificación y textos registrados.
8. Desde el detalle, cerrar postulaciones y comprobar que Sponsor queda bloqueado. Reabrirlas manualmente. Programar apertura/cierre, confirmar y habilitar modo automático; verificar el estado correspondiente al reloj del equipo.
9. Cerrar opiniones, entrar a un departamento e intentar guardar: debe mostrarse 409 y conservar el borrador. No se reintenta automáticamente.
10. Archivar y reabrir; comprobar que ambos periodos quedan cerrados. Abrirlos manualmente si se desea continuar. Recargar la pestaña para reiniciar la demostración.

### Con backend de integración

1. Detener el modo demo. Configurar `VITE_API_BASE_URL` en `.env.development.local` con el backend autorizado de integración; desactivar ambas banderas demo. Ejecutar `npm run dev`. No usar producción.
2. Usar las cuentas reales de cada rol, completar contraseña obligatoria si procede. Verificar que las rutas de otros roles están protegidas.
3. Elegir una convocatoria existente (la API no tiene alta manual). Repetir el flujo anterior con datos autorizados de prueba y respetar periodos de captura.
4. Abrir dos sesiones administrativas, consultar la misma versión, cambiarla en una y guardar desde la otra. Debe recibir 409, recargar y no reenviar la modificación. Repetir para preselección y edición departamental.
5. Revisar en la red del navegador que programación envía openingAt/closingAt con Z, cualidades es un número y nuevas preselecciones/opiniones envían version null. Validar el límite de 500 caracteres y conservación del borrador ante errores.
6. Comprobar paginación con más de 20 registros de prueba, filtros, respuestas vacías, 401/403 y errores de red. Verificar navegación con teclado y tamaños móviles.
