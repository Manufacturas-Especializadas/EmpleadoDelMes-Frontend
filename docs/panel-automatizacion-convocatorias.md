# Panel de automatización de convocatorias

## Alcance

Ruta `/admin/settings/campaign-automation`, visible en **Configuración → Automatización de convocatorias** y en el inicio administrativo. Se reutiliza la guarda Administrator, incluida la restricción de contraseña temporal. No se modificaron la autenticación, los permisos ni otras reglas de negocio.

Contratos contrastados con `EmpleadoDelMes-Backend/docs/campaign-automation.md`, `AutomationContracts.cs` y el tipo Campaign existente. Se utilizan únicamente GET y PUT `/api/admin/campaign-automation` y POST `/api/admin/campaign-automation/preview`, mediante el cliente HTTP central y AbortSignal.

## Comportamiento

- Cinco secciones: activación general, postulaciones, opiniones compartidas, vista previa e información operativa. Diseño vertical en móvil y columnas cuando existe espacio, con tokens MESA y componentes existentes. Sin dependencias nuevas.
- Calendario inicial vacío si el servidor devuelve `calendar: null`; no se asignan horarios inventados. Días relativos enteros -31..365, horas HH:mm y cierre posterior a apertura. La validación de solapamientos y de horas locales ambiguas/inexistentes corresponde al backend.
- El interruptor edita el borrador. Los estados efectivo, técnico y administrativo guardados permanecen separados del borrador. Azure bloqueado y configuración heredada generan avisos explícitos; el panel no puede modificar Azure.
- Detección de cambios pendientes, aviso al cerrar/recargar el navegador y confirmación para descartar al recargar desde el panel. La navegación interna usa el comportamiento existente; no se agregó una guarda global de salida. El aviso visible recuerda guardar antes de navegar.
- PUT con `version` opaca recibida del GET, confirmación mediante ConfirmDialog/Modal, bloqueo de envíos duplicados y nueva consulta tras guardar. Una falla de la nueva consulta muestra error y permite reintentar aunque el PUT haya tenido éxito.
- Un 409 conserva el borrador y bloquea otro guardado hasta recargar explícitamente la configuración. La recarga solicita confirmar el descarte. Los errores 400, 403 y de servidor conservan el mensaje del backend; 401 utiliza el flujo central existente de renovación/cierre de sesión.
- Preview no guarda cambios, permite elegir de 1 a 24 meses mediante opciones y pagina localmente la respuesta completa en grupos de cuatro. Cambiar el calendario invalida la vista previa anterior. Las solicitudes en curso se cancelan al salir y los resultados abortados no actualizan la pantalla.
- Fechas siempre formateadas con `America/Monterrey`, independientemente de la zona del navegador. Los meses evaluados usan el formato de mes existente sin desplazamiento de día.
- Para convocatorias existentes se muestran sus fechas guardadas y su enlace de detalle; no se presentan los horarios propuestos como si fueran una reprogramación. Se muestran conflictos, archivo y pendientes devueltos por el backend.
- El DTO **no proporciona hora exacta de creación prevista**. El panel explica que cada mes puede crearse desde su primer día, sujeto al límite de recuperación, a ambos permisos y a la ausencia de conflictos. Se indica expresamente que no está informada y que depende de la próxima comprobación habilitada. Para registros existentes se muestra `createdAtUtc` cuando viene en `existingCampaign`.
- El estado operativo solo muestra campos reales. `CurrentInstance` se identifica como telemetría local que se reinicia con el proceso, no como historial global. No se exponen GUID de responsables como información útil al usuario.
- En modo demo el módulo muestra su indisponibilidad y no ejecuta solicitudes ni inventa resultados. Las otras pantallas demo se conservan.

## Archivos

Nuevos:

- `src/features/campaignAutomation/types.ts`: contratos TypeScript.
- `src/features/campaignAutomation/automationApi.ts`: servicio HTTP y protección de modo demo.
- `src/features/campaignAutomation/presentation.ts`: validación básica y formato de fechas.
- `src/features/campaignAutomation/CampaignAutomationPage.tsx`: panel, edición, guardado y estado.
- `src/features/campaignAutomation/PreviewResults.tsx`: resultados y paginación de vista previa.
- `docs/panel-automatizacion-convocatorias.md`: esta documentación.

Modificados:

- `src/app/App.tsx`: ruta bajo la guarda Administrator.
- `src/app/AppLayout.tsx`: grupo Configuración.
- `src/app/navigation.ts`: entrada de navegación.
- `src/app/pages/HomePage.tsx`: acceso desde el inicio administrativo.

## Comprobaciones y pendientes

- `npm run lint`: correcto.
- `npm run build`: correcto (TypeScript y Vite).
- Formato revisado sobre los archivos de esta tarea y `git diff --check` sin errores.
- **No se ejecutaron tests**, por instrucción expresa del usuario.
- No se realizaron comprobaciones de navegador ni llamadas a los endpoints reales. No se afirma integración funcional verificada.

La documentación del backend indica que la migración `20261105155610_AddCampaignAutomationConfiguration` fue generada pero no aplicada durante esa implementación. No se consultó SQL para comprobar su estado actual. Si falta, el panel no podrá cargar ni guardar la configuración y mostrará el error del servicio. La aplicación de la migración queda fuera de esta tarea y requiere un entorno y autorización adecuados.

Pendiente en desarrollo autorizado: validar GET/preview/PUT con versión vigente y obsoleta, los permisos de los cinco perfiles, contraseña temporal, bloqueo técnico/heredado, fallas 400/401/403/409/503, recarga posterior al guardado y horarios desde navegadores en otra zona. Revisar teclado, foco de diálogos y anchos 360/375/390/430/768/1440 px. Las operaciones PUT deben ejecutarse exclusivamente contra una base de desarrollo autorizada.

No se modificaron backend, SQL Server, Azure, secretos ni variables de producción. No se ejecutaron migraciones, commits, pushes, merges ni despliegues.

## Actualización: calendario anticipado

- El rango de entrada y validación es ahora -31..365. El teclado de entrada permite el signo negativo y la ayuda traduce cada valor a días antes/después del primer día del mes siguiente.
- Ejemplo explícitamente ilustrativo, sin completar ni guardar campos: -8 a las 00:00 abre siete días antes del último día evaluado; +7 a las 00:00 cierra el día 8 del mes siguiente. Ambos periodos pueden coincidir; no cambia la elegibilidad de opiniones.
- La vista previa utiliza los datos reales del backend: nueva pendiente (incluido el mes actual), futura planificada o existente sin cambios. Las fechas concretas siguen en Monterrey. Recuperar un mes no recupera postulaciones ni opiniones de periodos transcurridos.
- No se modificaron tipos ni servicio API: el contrato conserva números enteros y los mismos endpoints; cambia el rango permitido y la semántica de pendientes del backend.
- Archivos frontend de esta actualización: CampaignAutomationPage.tsx, PreviewResults.tsx, presentation.ts y este documento.
- Validación de esta actualización: npm run lint y npm run build correctos; formato de los archivos modificados y git diff --check revisados. No se ejecutaron tests ni comprobaciones de integración o navegador.
- Esta actualización no requiere otra migración: los offsets del backend ya son int sin restricciones incompatibles. No se comprobó el esquema real desplegado ni se ejecutaron migraciones.
- Riesgo operativo: el worker nuevo puede crear el mes actual con el calendario ya guardado. Si se requieren -8/+7, coordinar una pausa administrativa y el guardado explícito antes de permitir el primer ciclo. Las convocatorias existentes no se reprogramarán al cambiar la configuración general.
