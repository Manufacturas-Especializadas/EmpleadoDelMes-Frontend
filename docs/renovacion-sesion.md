# Renovación de sesión

Los tokens opacos permanecen en memoria. Antes de una solicitud authenticated, si faltan 30 segundos o menos para el vencimiento calculado con expiresIn, se comparte una única renovación. No hay temporizador durante la inactividad. Un 401 protegido permite renovar y repetir una sola vez; un segundo 401 cierra sesión y las guardas existentes llevan al login. No se renueva ante 403 del recurso, login, me con token explícito ni cambio de contraseña. MustChangePassword impide renovación.

Cada operación captura la generación de sesión. Logout y nuevo login invalidan operaciones anteriores: no pueden reemplazar tokens ni reintentar bajo otra cuenta. AbortSignal cancela la espera de cada consumidor y evita su reintento, sin cancelar el refresh que otros consumidores comparten. Los errores definitivos 400/401/403 del refresh limpian la sesión; errores de red/5xx se propagan sin destruirla y sin reintento automático en bucle.

El demo implementa renovación en memoria conservando el perfil. No se modifica el backend ni se interpretan tokens como JWT. Recargar por completo pierde ambos tokens y requiere iniciar sesión. No se probó contra API real ni producción. La autorización sigue correspondiendo al servidor; un 401 no permite distinguir localmente expiración de otras invalidaciones, por eso solo se intenta recuperar una vez.

Validación: lint y build correctos; 11 pruebas aprobadas (9 nuevas). Casos nuevos: renovación anticipada, refresh expirado, concurrencia, logout durante refresh, segundo 401, 403, contraseña temporal, cancelación de espera y nuevo login durante refresh. Las peticiones de las pruebas son simuladas.
