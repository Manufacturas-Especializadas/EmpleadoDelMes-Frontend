# Renovación y restauración de sesión

## Almacenamiento

El accessToken permanece exclusivamente en memoria. Solo el refreshToken se guarda en `sessionStorage`, bajo `empleadodelmes.refreshToken`. No se guardan contraseñas, usuario, roles, fechas de expiración ni otros datos de sesión. No se utiliza localStorage ni cookies. Los tokens son opacos y no se decodifican.

En el login, el refresh token se persiste únicamente después de consultar `/api/auth/me` y comprobar tanto mustChangePassword como X-Must-Change-Password. Una sesión temporal permanece en memoria. Si el backend exige cambiar la contraseña durante una renovación/restauración, se elimina el refresh token persistido y se conserva la restricción de acceso existente.

Logout y cambio de contraseña exitoso limpian los tokens de memoria y sessionStorage. Iniciar otro login descarta primero la sesión anterior.

## Restauración al recargar

App espera a que termine la inicialización antes de renderizar rutas o guardas. La URL, incluidos parámetros y fragmento, no se modifica durante la espera. Si hay un refresh token guardado, la sesión reutiliza la operación de renovación existente para llamar a POST `/api/auth/refresh`, guarda el access token en memoria, actualiza el refresh token persistido y consulta GET `/api/auth/me`.

Solo tras recuperar el perfil se habilitan las rutas y las comprobaciones de roles existentes. Si no hay token guardado, se continúa sin sesión. Las rutas protegidas llevan al login como antes.

La restauración comparte una promesa a nivel del módulo: React StrictMode y llamadas simultáneas no disparan restauraciones duplicadas. La renovación también comparte una única promesa entre sus consumidores. No se agrega un segundo cliente HTTP ni un endpoint nuevo.

Cada operación captura la generación de sesión. Logout, cancelación de restauración y nuevo login invalidan respuestas anteriores; no pueden volver a guardar tokens ni reactivar la sesión. Cancelar la restauración descarta sus resultados, aunque la petición HTTP ya enviada pueda terminar en segundo plano.

## Errores y reintentos

- Refresh o perfil rechazado con 400/401/403: se limpia la sesión; las guardas llevan al login.
- Error de red, 5xx u otro fallo temporal: se muestra el error, con acciones Reintentar e Ir al inicio de sesión. No hay reintentos automáticos en bucle.
- Si refresh tuvo éxito y /me falló temporalmente, se conserva el refresh token actualizado. Un reintento puede reutilizar el access token que siga vigente en memoria para repetir /me; si expiró se usa la misma renovación compartida. Una sesión identificada como temporal nunca se renueva.
- Durante la carga existe la opción de cancelar e iniciar sesión, por si una solicitud no termina. No se agregaron temporizadores ni reintentos ocultos.

## Renovación durante el uso

Se conserva el comportamiento existente: antes de una solicitud authenticated, si faltan 30 segundos o menos para el vencimiento calculado con expiresIn, se comparte una única renovación. Un 401 protegido permite renovar y repetir una sola vez; un segundo 401 cierra sesión. Un 403 del recurso no provoca refresh. Las llamadas de login, /me con token explícito y cambio de contraseña no participan en ese reintento.

Cada renovación exitosa actualiza el refresh token en sessionStorage. AbortSignal conserva el comportamiento existente del cliente para cancelar la espera de cada consumidor sin cancelar una renovación compartida por otros.

## Límites conocidos

- sessionStorage pertenece al origen y a la sesión de la pestaña. F5 conserva la sesión; no se implementa sincronización ni cierre global entre pestañas. Duplicar/restaurar pestañas puede copiar o recuperar sessionStorage según el navegador; no se garantiza persistencia tras cerrar el navegador.
- Si el navegador impide leer o escribir sessionStorage, el login sigue funcionando en memoria, pero no se garantiza la restauración tras F5. No se intenta persistir en otro medio. Si también impide eliminar el almacenamiento, la aplicación no puede garantizar su borrado físico hasta que el navegador permita acceso o cierre esa sesión de almacenamiento.
- El refresh token almacenado sigue siendo accesible al JavaScript del mismo origen; esta implementación no equivale a una cookie HttpOnly. No se añadieron mecanismos de seguridad ni cambios de backend.
- En demo los tokens siguen solo en memoria: el servidor demo también pierde sus datos al recargar. No se leen ni escriben tokens reales de sessionStorage desde el modo demo.
- Si el servidor rotara e invalidara un refresh token pero la respuesta se perdiera por red, podría ser necesario iniciar sesión nuevamente. No se modifica la política de tokens del servidor.
- La restauración de autenticación no conserva borradores o filtros que otras pantallas mantengan solo en memoria. La autorización real sigue dependiendo del backend.

## Archivos y validación de esta entrega

- `src/features/auth/session.ts`: restauración, inicialización, renovación compartida y limpieza.
- `src/features/auth/refreshTokenStorage.ts`: acceso acotado a sessionStorage con tolerancia a su indisponibilidad.
- `src/app/App.tsx`: espera inicial, carga, error, reintento y cancelación.
- `README.md` y este documento: comportamiento y limitaciones actualizados.

Se revisaron authApi.ts, configureApi.ts y httpClient.ts; no necesitaron cambios ni contratos nuevos.

`npm run lint` y `npm run build`: correctos. **No se crearon archivos de pruebas ni se ejecutaron tests**, por indicación del usuario. No se ejecutaron comprobaciones de navegador ni integración contra API real. Pendientes en un entorno autorizado: F5 en rutas profundas, refresh expirado, fallo temporal de refresh y /me, logout durante restauración y contraseña temporal.
