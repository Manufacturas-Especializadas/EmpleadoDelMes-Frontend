# Convocatorias: ajustes móviles

## Cambios

- `CampaignDetailPage.tsx`: periodos independientes, accesos rápidos táctiles, administración separada y solo Archivar o Reabrir según el estado real. Mantiene confirmaciones, version y actualización mediante consulta posterior al éxito. En 409 cierra confirmaciones/programación y recupera el estado actual.
- `pages/PeriodSettings.tsx`: tarjeta de periodo con estado efectivo del servidor, modo, fechas, switch exclusivamente manual y controles específicos de automático. Las convocatorias archivadas bloquean edición. Activar automático requiere fechas configuradas, conforme al dominio local inspeccionado en lectura.
- `ToggleSwitch.tsx`: botón nativo con role=switch, aria-checked, etiqueta asociada, disabled y loading; sin estado optimista. El click solicita confirmación externa.
- `schedulePresentation.ts`: conversión de fechas existentes a entradas locales y validación de cierre posterior a apertura. El payload conserva instantes ISO UTC y version. Guardar fechas conserva el modo actual; si ya es automático, las nuevas fechas afectan su estado efectivo. El modal lo explica y muestra la zona horaria del equipo.
- `index.css`: controles táctiles y transición del indicador de 180 ms, compatible con movimiento reducido existente.
- `index.html`: título Empleado del Mes | MESA y retirada del favicon genérico.
- `periodSettings.test.tsx`: pruebas de modos, bloqueos, accesibilidad de carga y validación de fechas.

## Favicon pendiente

No existen `public/branding/favicon-mesa.ico` ni `public/branding/apple-touch-icon.png`. Existe `public/branding/favicon.ico` como archivo local sin seguimiento; no se modificó ni se asumió su identidad. Cuando se confirme o proporcione el icono corporativo, agregar el enlace `rel="icon" type="image/x-icon" href="/branding/favicon-mesa.ico"` (o confirmar expresamente el archivo alternativo). Para iOS, agregar `rel="apple-touch-icon" href="/branding/apple-touch-icon.png"` cuando esté disponible. El logo principal permanece intacto.

## Verificaciones

- npm run lint: correcto.
- npm run build: correcto.
- npm run test: 29 pruebas aprobadas en 6 archivos.
- Chrome headless, solo demo local: 360, 375, 390, 430, 768 y 1440 px sin overflow horizontal global.
- Switch con Espacio: abre confirmación. Cancelación, cierre y apertura manual comprobados.
- Programación de fechas y activación automática comprobadas como acciones distintas.
- Archivo, bloqueo de controles archivados y reapertura comprobados.
- 409 simulado mediante transporte temporal en el navegador: mensaje y recarga correctos, sin cambio optimista.
- Movimiento reducido: transición calculada 0s.

La revisión ligera de controles compartidos no requirió otro rediseño: se mantienen tablas con scroll interno, controles táctiles y modales nativos. No se realizó auditoría completa de accesibilidad ni integración con API real. Las pruebas de cambios de estado fueron exclusivamente en la demo en memoria, que no sustituye la validación con backend de desarrollo. No se modificaron backend, SQL, Azure, autenticación, roles ni contratos; no se hicieron commits, push o despliegues.
