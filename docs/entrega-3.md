# Entrega 3 — Administración completa

## Alcance implementado

El frontend local se inspeccionó antes de editar; estaba limpio. Se conservaron
las Entregas 1 y 2, el login, cliente HTTP, layout, hooks y componentes existentes.

| Módulo                        | Ruta administrativa        | Funciones                                                                                         |
| ----------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------- |
| Empleados                     | `/admin/employees`         | Listado paginado, búsqueda, consulta por nómina exacta, detalle, alta y corrección del nombre     |
| Usuarios                      | `/admin/users`             | Listado, búsqueda, rol, detalle, creación Sponsor/departamento y activación/desactivación Sponsor |
| Importación de empleados      | `/admin/imports/employees` | Archivo, vista previa, resumen, filas y errores, confirmación y resultado                         |
| Importación de patrocinadores | `/admin/imports/sponsors`  | Vista previa por estado, confirmación explícita, cantidades creadas/omitidas                      |
| Postulaciones administrativas | `/admin/nominations`       | Listado paginado, filtros, detalle, corrección y anulación con motivo                             |

Todas las rutas están dentro de `Guard role="Administrator"`. Se añadieron los
cinco enlaces al menú existente y un acceso a postulaciones desde el detalle de
convocatoria. No se creó otro layout.

## Contratos inspeccionados y endpoints

Backend revisado en `c0f593c91299b408e98139d7f179df8c76a1d9c1`:

- [Controladores](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/tree/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Api/Controllers): EmployeesController, UsersController, EmployeeImportsController, SponsorImportsController y AdminNominationsController.
- [EmployeeService](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Employees/EmployeeService.cs), [EmployeeImportPreviewService](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Employees/EmployeeImportPreviewService.cs).
- [AccountContracts](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Accounts/AccountContracts.cs) y [SponsorImportService](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Accounts/SponsorImportService.cs).
- [NominationAdminService](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Application/Nominations/NominationAdminService.cs).
- [ClosedXmlEmployeeReader](https://github.com/Manufacturas-Especializadas/EmpleadoDelMes-Backend/blob/c0f593c91299b408e98139d7f179df8c76a1d9c1/src/EmpleadoDelMes.Infrastructure/Employees/ClosedXmlEmployeeReader.cs).

| Método | Endpoint                                          | Datos relevantes                                             |
| ------ | ------------------------------------------------- | ------------------------------------------------------------ |
| GET    | `/api/employees`                                  | term, pageNumber, pageSize                                   |
| GET    | `/api/employees/{id}`                             | Employee con version                                         |
| GET    | `/api/employees/by-payroll/{payrollNumber}`       | Nómina codificada en la ruta                                 |
| POST   | `/api/employees`                                  | payrollNumber, fullName                                      |
| PUT    | `/api/employees/{id}/name`                        | fullName, version                                            |
| GET    | `/api/users`                                      | term, role, pageNumber, pageSize                             |
| GET    | `/api/users/{id}`                                 | AccountInfo, sin secretos                                    |
| POST   | `/api/users/sponsors`                             | employeeId                                                   |
| POST   | `/api/users/departments`                          | role; nombre de usuario determinado por backend              |
| PATCH  | `/api/users/{id}/status`                          | isActive; solo Sponsor                                       |
| POST   | `/api/employees/import/preview` y `/confirm`      | FormData: File                                               |
| POST   | `/api/users/import/sponsors/preview` y `/confirm` | FormData: File; Confirm=true solo al confirmar               |
| GET    | `/api/admin/nominations`                          | campaignId opcional, term, isCancelled, pageNumber, pageSize |
| GET    | `/api/admin/nominations/{id}`                     | nomination, createdByUserId, justification, version          |
| PUT    | `/api/admin/nominations/{id}/correction`          | version, qualities, justification, reason                    |
| POST   | `/api/admin/nominations/{id}/cancel`              | version, reason                                              |

El detalle de cuenta no se confunde con AccountListItem: employeeFullName solo
pertenece al listado. La corrección de postulación consume `{ detail, changed,
message }`; la anulación consume el detalle directamente. No se agregan campos
de versión a endpoints que no los tienen, como el cambio de estado Sponsor.

## Reglas y seguridad

- Nómina como string, obligatoria y máximo 32 caracteres, sin convertir a número. Es de solo lectura al editar. Nombre obligatorio y máximo 200.
- El editor consulta detalle antes de modificar y envía su version. Ante 409 conserva el nombre escrito, bloquea guardar y permite consultar una versión actual sin sobrescribir el borrador.
- Usuarios permite crear departamentos HumanResources, Safety o Quality. Administrator permanece disponible como filtro, no como opción de alta. Cambiar estado solo se ofrece si la cuenta tiene únicamente el rol Sponsor.
- La contraseña temporal individual se mantiene en estado local del diálogo después del éxito. Se descarta al cerrar/desmontar; no se guarda en almacenamiento, URL, consola ni estado global. Copiar requiere acción del usuario y tiene alternativa manual si Clipboard API no está disponible. La interfaz advierte sobre entrega privada y limpieza posterior del portapapeles.
- La importación Sponsor no muestra ni inventa contraseñas individuales ni un archivo de credenciales.
- Corrección/anulación requieren motivo de 1 a 1,000 caracteres. Justificación obligatoria de máximo 500 y cualidades como máscara numérica del catálogo público Sponsor.
- No se modifica una postulación anulada. Se consulta la convocatoria para bloquear operaciones archivadas; durante carga/error también se bloquea la edición. El backend conserva la decisión final ante cambios concurrentes.
- Ante 409 en postulaciones no se reenvía: se mantiene el formulario y se permite consultar la versión actual explícitamente. React no emite eventos de auditoría.
- Sponsor limpia cualidades, justificación y errores al seleccionar un candidato con otro id; volver a seleccionar el mismo no borra lo escrito.

## Importaciones

Solo se valida en navegador extensión .xlsx, archivo no vacío y tamaño de hasta
5 × 1024 × 1024 bytes. La lectura y validación del contenido pertenecen al backend;
no se añadió una biblioteca Excel.

El lector real usa la primera hoja, máximo 1,000 filas de datos y 30 columnas.
Normaliza encabezados quitando acentos y separadores e ignorando mayúsculas:

- Nómina, Número de nómina, Número nómina o PayrollNumber.
- Nombre, Nombre completo o FullName.

No admite fórmulas; las nóminas deben prepararse como texto para conservar ceros
iniciales. Estas reglas y variantes se explican en ambas páginas.

El flujo conserva el mismo objeto File de la vista previa y lo reenvía al
confirmar. Cambiar archivo invalida inmediatamente vista previa y resultado.
El selector se bloquea durante la solicitud. useOperation impide doble envío.
Después de un error al confirmar se exige una nueva vista previa; no hay reintento
automático. El servidor vuelve a validar el archivo y los datos actuales.

Empleados muestra válidas, inválidas, nuevas, existentes y errores de cada fila.
Solo confirma con total positivo y cero inválidas. Sponsor muestra las etiquetas
0=lista, 1=existente omitida, 2=inactiva omitida, 3=empleado no encontrado,
4=nómina duplicada, 5=nombre diferente, 6=conflicto de cuenta, 7=datos inválidos.
Los estados 1 y 2 son omisiones, no errores; nunca se supone reactivación.

Los listados de negocio se paginan en servidor. La vista previa Excel ya viene
completa y acotada por el contrato, sin endpoint paginado; se muestran 50 filas
por página en el navegador para limitar el DOM. No se descargan catálogos completos
para filtrar localmente.

## Reutilización

Se utilizan PageHeader, DataTable, Pagination, SearchInput, ListFilters, Modal,
ConfirmDialog, TextField, StatusBadge, EmptyState (mediante DataTable), LoadingState,
ErrorState, useQuery, useOperation y el cliente HTTP existente sin reconstruirlos.

- EmployeeSearch pertenece a employees y se expone públicamente para el listado y la selección de patrocinadores. Ambos usan el mismo employeesApi.
- ImportWorkflow y PreviewTable pertenecen a imports y resuelven la repetición real entre ambas importaciones, con DTO y servicios separados.
- Las nuevas páginas separan listado, editor y servicios; los tipos permanecen en su feature.
- campaigns publica getCampaign; nominations publica qualities. No hay acceso directo a detalles internos de esos módulos.

## Modo demostración

```powershell
npm run dev -- --mode demo
```

Se mantiene el transporte de `app/demo/server.ts`. La extensión administrativa
está en `app/demo/administration.ts` y recibe el estado compartido en memoria.
Altas/correcciones de empleados aparecen en búsquedas y selección de candidatos;
las cuentas creadas y sus estados aparecen en usuarios. Las anulaciones reducen
los conteos válidos y afectan preselección/opiniones/revisión según los filtros
existentes. Las versiones cambian al modificar y se comparan para devolver 409.
Los nombres de las postulaciones conservan su snapshot histórico al corregir el
catálogo de empleados.

Las importaciones NO analizan el Excel. El banner lo declara y generan dos filas
ficticias estables: IMPORT-DEMO-001 y IMPORT-DEMO-002. Un archivo cuyo nombre
contenga `errores` agrega una fila inválida ficticia para recorrer ese estado.
Se comprueban extensión, tamaño y contenido no vacío, sin lectura XLSX. Primero
importar empleados y después patrocinadores permite completar ambos flujos; la
segunda importación revisa el catálogo simulado y las cuentas existentes. Repetir
la importación omite registros existentes; las cuentas inactivas siguen inactivas.

El login conserva sus perfiles de demostración, no autentica las nuevas cuentas
con contraseñas temporales. La cuenta Sponsor del perfil inicial aparece como
DEMO099; desactivarla bloquea ese perfil hasta reactivarla desde Administrator.
Las cuentas individuales reciben una contraseña ficticia en la respuesta una sola
vez, sin guardarla. Las importaciones solo devuelven cantidades.

Todo sigue limitado a desarrollo mediante importación dinámica y las guardas
existentes. No hay solicitudes externas ni almacenamiento persistente. Cerrar
sesión conserva los datos de la pestaña; recargar la página los reinicia.

## Archivos

Creados:

- `src/features/employees/types.ts`, `employeesApi.ts`, `index.ts`, `pages/EmployeesPage.tsx`, `components/EmployeeSearch.tsx`, `components/EmployeeEditor.tsx`.
- `src/features/users/types.ts`, `usersApi.ts`, `index.ts`, `pages/UsersPage.tsx`, `components/CreateAccount.tsx`, `components/AccountDetail.tsx`.
- `src/features/imports/types.ts`, `importsApi.ts`, `index.ts`, `pages/ImportPages.tsx`, `components/ImportWorkflow.tsx`, `components/PreviewTable.tsx`.
- `src/features/adminNominations/types.ts`, `adminNominationsApi.ts`, `index.ts`, `pages/AdminNominationsPage.tsx`, `components/NominationEditor.tsx`.
- `src/app/demo/administration.ts`, `docs/entrega-3.md`.

Modificados:

- `src/app/App.tsx`, `src/app/AppLayout.tsx`: rutas y menú existentes, aviso explícito de importaciones simuladas.
- `src/app/demo/server.ts`: conexión de handlers administrativos al mismo estado, versiones de empleados y snapshots de postulaciones.
- `src/features/campaigns/index.ts`, `src/features/campaigns/pages/CampaignDetailPage.tsx`: servicio público y enlace a postulaciones.
- `src/features/nominations/index.ts`, `src/features/nominations/pages/NominationsPage.tsx`: catálogo público y limpieza al cambiar candidato.

## Verificaciones

- `npm run lint`: correcto.
- `npm run build`: correcto.
- `git diff --check`: correcto.
- Prettier de archivos creados/modificados: correcto.
- Carga del transporte demo mediante Vite en modo demo: inicialización correcta.
- Build de producción con banderas demo activas: sin fixtures ni handlers de demostración en el artefacto.
- Rutas y enlaces administrativos revisados dentro del guard Administrator.

No se crearon ni modificaron pruebas automatizadas. No se reformatearon archivos
ajenos por CRLF. No se instalaron dependencias ni se hicieron commits, pushes,
despliegues o cambios de backend, Azure, SQL Server o workflows.

## Pendientes y riesgos de integración

La implementación de los módulos solicitados está completa; queda la validación
visual, accesibilidad y ejecución contra el backend real. Compilación e inspección
no prueban transacciones, CORS ni conflictos concurrentes reales.

- Opiniones departamentales conserva el identificador manual: no existe endpoint autorizado para listar convocatorias ni estado anticipado de apertura. Mejorarlo requiere un contrato futuro del backend.
- La entrega privada de contraseñas individuales es un proceso operativo. El portapapeles pertenece al sistema del usuario y no se limpia automáticamente.
- El backend masivo no devuelve credenciales; acordar el mecanismo operativo de entrega/acceso antes de aprovisionar usuarios reales. El frontend no puede recuperarlas ni restablecerlas con los endpoints actuales.
- Cancelar una solicitud al navegar no revierte una transacción que el servidor ya haya aceptado. Ante un resultado incierto, consultar el listado antes de volver a crear/importar.
- La demostración no reproduce SQL, bloqueos reales, auditoría ni análisis de archivos XLSX. No sustituye las pruebas con datos autorizados de integración.

## Validación con backend y SQL Server

El frontend no se conecta directamente a SQL Server; las siguientes acciones usan
el backend de integración configurado por el equipo.

1. Detener demo, desactivar VITE_DEMO y VITE_DEMO_CAMPAIGNS. Configurar VITE_API_BASE_URL con la API de integración autorizada y ejecutar `npm run dev`; no usar producción.
2. Iniciar sesión como Administrator. Comprobar acceso a los cinco enlaces y rechazo desde otros roles.
3. Crear empleado con nómina `000123` (o equivalente autorizado), verificar ceros iniciales, búsqueda, consulta exacta y detalle. Corregir nombre. Probar duplicado, campos vacíos y límites 32/200.
4. Abrir el mismo empleado en dos sesiones. Guardar un cambio en una y usar la versión antigua en la otra: esperar 409, conservar borrador, consultar nueva versión y confirmar manualmente.
5. Crear Sponsor seleccionando ese empleado. Copiar/entregar la contraseña de forma privada, cerrar y comprobar que no reaparece al consultar detalle. Probar duplicado. Activar/desactivar, confirmar el efecto sobre el acceso del usuario.
6. Crear o comprobar cuentas departamentales RH/Seguridad/Calidad; verificar nombres determinados por backend y duplicados. No debe existir opción de alta Administrator ni cambio de estado departamental.
7. Preparar XLSX de empleados con filas nuevas, existentes, duplicadas, encabezados alternativos, fórmulas y filas inválidas. Comprobar vista previa, bloqueo con errores, sustitución de archivo e invalidación, confirmación y cantidades. Probar archivo vacío, extensión incorrecta y más de 5 MB.
8. Preparar XLSX Sponsor que incluya casos de los ocho estados. Los existentes e inactivos deben omitirse; los errores deben impedir confirmar. Comprobar FormData con File y Confirm=true únicamente en confirmación Sponsor. Verificar que no hay contraseñas en el resultado masivo.
9. Registrar postulaciones de prueba con Sponsor, cambiar de candidato y verificar limpieza de campos. Como administrador, filtrar por convocatoria, término y estado; revisar detalle, corregir con motivo y anular con confirmación. Comprobar efectos en los conteos de preselección y revisión.
10. Probar versión obsoleta, convocatoria archivada y postulación ya anulada: sin reenvío automático, sin perder el formulario y sin operación disponible sobre datos bloqueados. La auditoría debe aparecer únicamente por acción del backend.
11. Validar paginación con más de 20 registros, mensajes vacíos/errores, teclado, foco en diálogos, tamaños móviles y 401/403. La carga de Excel y las transacciones requieren un backend conectado a su SQL Server de integración.

Para un recorrido local previo, usar los perfiles demo en la misma pestaña: crear
empleados/cuentas, importar un .xlsx cualquiera válido por nombre/tamaño (filas
simuladas), registrar una postulación como Sponsor y corregir/anular como Administrator.
