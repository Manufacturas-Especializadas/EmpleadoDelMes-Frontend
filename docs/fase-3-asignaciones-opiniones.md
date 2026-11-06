# Fase 3 — Asignaciones y opiniones del jefe inmediato

## Implementación

- `/admin/sponsor-assignments`, bajo la guarda Administrator: selección y búsqueda paginada de patrocinadores, colaboradores vigentes, disponibles y pendientes. El catálogo general permite localizar empleados asignados a patrocinadores que ya no aparecen entre los activos.
- Asignación individual repetible sin salir de la pantalla; reasignación y retiro con confirmación. Se consulta `current` antes de operar, se utiliza su versión y se bloquean envíos duplicados. Un error de escritura exige recargar antes de continuar. No se autoasigna ni se elimina físicamente.
- `/sponsor/my-employees`, bajo la guarda Sponsor, junto a Mis postulaciones: selector paginado de convocatorias, búsqueda y filtro `hasOpinion`, paginación de candidatos, consulta y guardado con versión y contador de 500 caracteres. Cambiar convocatoria reinicia filtros, paginación y detalle. El backend determina candidatos y evaluador.
- El editor departamental se reutiliza mediante dependencias opcionales get/save y etiqueta, conservando sus valores predeterminados y reglas para RH, Seguridad y Calidad.
- Revisión integral con cuarta opinión, estado del vínculo histórico y datos del evaluador consultados mediante el catálogo administrativo. La vinculación pendiente requiere confirmación; no se ejecuta desde GET, no acepta un evaluador elegido arbitrariamente y no sustituye un vínculo existente.
- Los módulos nuevos no simulan integración en demo. El transporte demo existente conserva sus datos y declara sus tipos parciales sin inventar campos nuevos. La cuarta opinión se marca como no disponible en demo.

## Contratos inspeccionados

Se priorizaron los archivos locales del backend: docs/sponsor-assignments.md, docs/supervisor-opinions.md, SponsorAssignmentsController, SupervisorOpinionsController (incluye EvaluatorLinksController), AdminPreselectionsController, AssignmentService, SupervisorService, CandidateReviewService y OpinionRepository/SupervisorRepository. No se modificó el backend.

Endpoints integrados:

| Método    | Ruta                                                                       |
| --------- | -------------------------------------------------------------------------- |
| GET       | /api/admin/sponsor-assignments/sponsors                                    |
| GET       | /api/admin/sponsor-assignments/sponsors/{sponsorId}/employees              |
| GET       | /api/admin/sponsor-assignments/employees/available                         |
| GET       | /api/admin/sponsor-assignments/employees/pending                           |
| GET       | /api/admin/sponsor-assignments/employees/{employeeId}/current              |
| POST      | /api/admin/sponsor-assignments/employees/{employeeId}/assign               |
| PUT       | /api/admin/sponsor-assignments/employees/{employeeId}/reassign             |
| POST      | /api/admin/sponsor-assignments/employees/{employeeId}/withdraw             |
| GET       | /api/supervisor-opinions/campaigns                                         |
| GET       | /api/supervisor-opinions/candidates                                        |
| GET / PUT | /api/supervisor-opinions/{campaignId}/{candidateEmployeeId}                |
| POST      | /api/admin/preselections/{campaignId}/{candidateEmployeeId}/evaluator-link |

Se reutilizan GET /api/employees, /api/employees/{id}, /api/campaigns/{id} y los endpoints existentes de revisión integral exclusivamente desde Administración. Se mantienen el cliente HTTP y sus manejos de 401/403, sin cambios de sesión. Errores 400/404/409/503 se presentan con el mensaje del backend.

## Limitación de contrato pendiente

**No puede cumplirse todavía el bloqueo anticipado de edición de toda convocatoria cerrada.** SupervisorCampaign solo contiene Id, EvaluationMonth e IsArchived. OpinionStatus contiene HasOpinion, Opinion y Message, sin permiso de escritura ni fechas del periodo. El GET de opinión tampoco devuelve ese estado.

Se bloquean archivadas y se permite consultar. Para convocatorias no archivadas el formulario explica que el servidor verifica apertura y elegibilidad al guardar. El PUT rechaza periodos cerrados con 409; el editor conserva el texto, consulta la versión actual y bloquea otro envío hasta revisión manual. No se afirma que una convocatoria esté abierta ni se intenta deducirlo de la existencia de candidatos. No se consultan endpoints Administrator/departamentales desde Sponsor ni se realiza una escritura de prueba para averiguar el estado.

Pendiente real de backend: exponer a Sponsor el estado de escritura del periodo (por ejemplo un indicador contractual acordado). Después podrá deshabilitarse el formulario previamente al PUT. No se agregó ninguna propiedad supuesta ni se modificó un contrato.

## Archivos creados

- src/features/sponsorAssignments/api.ts
- src/features/sponsorAssignments/EmployeeList.tsx
- src/features/sponsorAssignments/SponsorAssignmentsPage.tsx
- src/features/supervisorOpinions/api.ts
- src/features/supervisorOpinions/SupervisorOpinionsPage.tsx
- src/features/review/components/EvaluatorLink.tsx
- docs/fase-3-asignaciones-opiniones.md

## Archivos modificados

- src/app/App.tsx
- src/app/AppLayout.tsx
- src/app/navigation.ts
- src/app/demo/server.ts (solo compatibilidad de tipos; sin nuevos datos simulados)
- src/features/opinions/components/OpinionEditor.tsx
- src/features/review/types.ts
- src/features/review/pages/ReviewPage.tsx
- src/features/review/components/ReviewDetail.tsx

## Verificación

Revisión estática de contratos, rutas, filtros, paginación, versiones y guardas. Una ejecución final de npm run lint: correcta. Una ejecución final de npm run build: correcta. No se crearon ni ejecutaron tests, Vitest ni cobertura. Sin dependencias nuevas.

No se realizaron llamadas a API real ni comprobaciones de navegador o SQL. La compilación no valida consultas, permisos reales, concurrencia o migraciones. La aplicación de migraciones de desarrollo fue informada por el usuario; no se consultó su estado. Pendiente validar visualmente móvil/escritorio y funcionalmente en desarrollo autorizado los cinco roles, duplicados/ciclos, cambios concurrentes, reasignaciones históricas, periodos cerrados y vínculos pendientes.

No se modificaron autenticación, renovación, roles, postulaciones, automatización, reglas de preselección, backend o bases de datos. Sin commits, push ni despliegues realizados por el asistente.
