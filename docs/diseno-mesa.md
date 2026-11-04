# Rediseño visual MESA — Empleado del Mes

## Alcance

Rediseño de presentación sobre la rama `cambios`, inicialmente sin cambios pendientes. Se conserva la aplicación funcional: rutas, permisos, parámetros URL, filtros, peticiones, mutaciones, validaciones y confirmaciones. No se modificaron backend, SQL Server, Azure, secretos ni variables de producción. No se hicieron commits, push, merge ni despliegues.

## Sistema visual

`src/index.css` centraliza tokens con Tailwind CSS 4:

- Identidad: azul MESA `#00A4E4`, celeste `#DFF4FF`, fondo `#F6FAFD` y superficies blancas.
- Acciones y foco: `#086B9B`, más oscuro que el azul de marca para mejorar contraste con blanco. Texto principal `#192B3C`; secundario `#586D80`.
- Bordes suaves `#E1EBF2`; bordes de controles `#7E95A8` para distinguir entradas sobre blanco.
- Éxito, advertencia, peligro e información mantienen tonos semánticos independientes y etiquetas de texto.
- Tipografía de sistema, sin fuentes descargadas; jerarquía de títulos, etiquetas y descripciones.
- Radios de control y panel, sombras de superficie/elevación/diálogo, unidad de espaciado y duraciones centralizadas.

Los contrastes calculados antes de detener las verificaciones fueron: acción/blanco 5.85:1, texto secundario/blanco 5.37:1, texto principal/blanco 14.46:1 y borde de control/blanco 3.11:1. No representan una auditoría WCAG completa.

Se conserva sin alteraciones el logo original `public/branding/logomesa-1.png` mediante `BrandLogo`, con proporciones, texto alternativo y fallback existentes. No se añadieron imágenes ni fuentes externas.

## Componentes nuevos

- `Icon.tsx`: iconografía SVG lineal propia, compacta y decorativa; las etiquetas de los controles siguen proporcionando el nombre accesible.
- `Skeleton.tsx`: estructuras estáticas para tabla, tarjetas, encabezado y detalle, ocultas a lectores de pantalla.
- `SuccessMessage.tsx`: feedback de éxito con icono y región de estado.

**Dependencias añadidas: ninguna.** No se incorporó biblioteca de iconos, animaciones ni componentes. La selección de iconos de navegación reside en `src/app/navigation.ts`.

## Presentación por área

- Layout: encabezado con identidad y usuario, menú agrupado con iconos, acento activo, apertura móvil, Escape y retorno de foco conservados.
- Inicio: bienvenida y tarjetas de módulos con iconos, descripciones y enlaces existentes. Sin métricas inventadas.
- Autenticación: composición institucional en escritorio y formulario compacto en móvil; mensajes y estados de carga claros. Sin cambios de sesión o credenciales.
- Convocatorias: tabla y tarjetas de periodos, acciones secundarias y navegación entre módulos conservadas.
- Postulaciones: formulario de cualidades con controles táctiles, confirmación existente y feedback visual de éxito.
- Administración de postulaciones: filtros y tabla comunes; acción destructiva visualmente diferenciada, con confirmación intacta.
- Preselección, opiniones y revisión: selector por mes, estados, skeletons de listado y detalles coherentes; períodos cerrados y separación por roles intactos.
- Empleados y usuarios: filtros con superficie propia, tablas y formularios emergentes comunes; se conserva la visibilidad limitada de contraseñas temporales.
- Importaciones: instrucciones y selección de archivo con mejor jerarquía, progreso indeterminado real de la operación, vista previa y resultado sin porcentajes ficticios.
- Estados de error y vacío: icono, mensaje y acción de reintento únicamente cuando ya existe.

## Movimiento y accesibilidad

- Hover de tarjetas con elevación de 3 px y sombra moderada.
- Pulsación de botones con escala 0.98, sin afectar controles deshabilitados.
- Entrada de contenido, encabezados y modales con opacidad y desplazamiento de 4 px.
- Transiciones de borde/foco y apertura/cierre del menú móvil.
- Duraciones habituales de 160–220 ms; curva compartida.
- Spinner solo durante cargas reales; skeletons sin pulsos decorativos.
- `prefers-reduced-motion: reduce` elimina animaciones, transiciones y transformaciones interactivas.
- Diálogos nativos, etiquetas, regiones accesibles, foco visible y controles táctiles conservados.

## Archivos de presentación modificados

- `src/index.css`.
- `src/app/App.tsx`, `AppLayout.tsx`, `navigation.ts` y `pages/HomePage.tsx`, `pages/NavigationTestPage.tsx`, `pages/NotFoundPage.tsx`.
- `src/shared/components/CampaignSelector.tsx`, `ConfirmDialog.tsx`, `DataTable.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `ListFilters.tsx`, `LoadingState.tsx`, `Modal.tsx`, `PageHeader.tsx`, `Pagination.tsx`, `StatusBadge.tsx`, `TextField.tsx`.
- `src/features/auth/pages/AuthPage.tsx`.
- `src/features/campaigns/pages/CampaignsPage.tsx`, `CampaignDetailPage.tsx`.
- `src/features/nominations/pages/NominationsPage.tsx`.
- `src/features/adminNominations/pages/AdminNominationsPage.tsx` y `components/NominationEditor.tsx`.
- `src/features/preselections/pages/PreselectionsPage.tsx`.
- `src/features/opinions/pages/OpinionsPage.tsx` y `components/OpinionEditor.tsx`.
- `src/features/review/pages/ReviewPage.tsx` y `components/ReviewDetail.tsx`.
- `src/features/employees/pages/EmployeesPage.tsx` y `components/EmployeeSearch.tsx`.
- `src/features/users/pages/UsersPage.tsx` y `components/CreateAccount.tsx`.
- `src/features/imports/components/ImportWorkflow.tsx`.
- Los tres componentes nuevos indicados anteriormente y este documento.

Se aplicó formato antes de la instrucción de detener pruebas. README y `docs/entrega-1.md`, `entrega-2.md`, `entrega-3.md` recibieron únicamente formato. Otros archivos pueden aparecer en Git por normalización de finales de línea; no se cambiaron contratos ni lógica.

## Verificaciones realizadas ANTES de la instrucción «sin pruebas»

- `npm run lint`: correcto.
- `npm run build`: correcto; último artefacto medido JS 333.35 kB (101.41 kB gzip), CSS 40.46 kB (7.54 kB gzip).
- `npm run test`: 25 pruebas aprobadas en 5 archivos; no se eliminaron ni alteraron pruebas existentes.
- `npm run format:check`: detectó formato en cuatro documentos existentes. Se aplicó Prettier a esos documentos; no se volvió a ejecutar el check después.

Chrome headless se utilizó con un perfil temporal y la demo en `http://localhost:5180`, sin consumir la API real:

- Inspección visual de login, dashboard, convocatorias, detalle, importación, opiniones y modal de creación de cuenta.
- Recorrido de ocho rutas administrativas a 1440, 768 y 375 px. No se detectó overflow horizontal global; las tablas conservan scroll interno.
- Entrada con Administrator, Sponsor, HumanResources, Safety y Quality. Los cuatro perfiles no administrativos mostraron cero enlaces `/admin`.
- Menú móvil: apertura, Escape y retorno de foco al botón.
- Modal: apertura, cierre con Escape y retorno de foco al control que lo abrió.
- Confirmación de archivar abierta y cancelada, sin confirmar la mutación.
- Vista previa de importación simulada y disponibilidad de confirmar, sin guardar la importación. El demo no analiza Excel real.
- Búsqueda sin resultados en empleados; campos de cambio de contraseña y login en móvil.
- Movimiento reducido: estilo de animación observado como `none`.

Las capturas y scripts auxiliares se guardaron temporalmente fuera del repositorio. Se cerraron la demo y Chrome de esta revisión.

## Estado final y limitaciones

A petición del usuario se detuvieron todas las pruebas y revisiones en navegador. **No se ejecutaron nuevas pruebas, lint, build ni format:check después de esa indicación.** Los últimos ajustes visuales y esta documentación no cuentan con una verificación posterior; los resultados anteriores no se presentan como certificación del estado final.

No se realizaron pruebas con backend real, datos productivos, importación Excel real, todas las combinaciones de formularios, validación completa de lector de pantalla ni auditoría de accesibilidad integral. Los escenarios de demo no sustituyen pruebas de integración. Los servicios HTTP, contratos, autenticación, renovación de sesión, roles y reglas de negocio se conservaron.
