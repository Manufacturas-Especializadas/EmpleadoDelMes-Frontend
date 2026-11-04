# Diagnóstico del entorno de desarrollo

Fecha: 4 de noviembre de 2026. Auditoría sobre las copias locales, sin acceso a Azure ni operaciones de escritura en SQL Server.

## 1. Causa comprobada y alcance

Se encontró un conflicto de servidores Vite: 5173 servía el modo demo (`http://demo.invalid`) y 5174 servía el modo development (`https://localhost:7076`). Al ejecutar otro `npm run dev`, Vite avanzó hasta 5175. La API solo autoriza el origen `http://localhost:5173`.

Se reprodujo la diferencia mediante OPTIONS /api/auth/login: para 5173 devolvió 204 con Access-Control-Allow-Origin; para 5174 devolvió 204 **sin** ese encabezado. El navegador bloquea la petición real cuando falla el preflight, y fetch entrega un error de red que el cliente presenta como imposibilidad de conectar. Esta es una causa concreta verificada del entorno encontrado; no se puede asegurar que explique el intento histórico si aquel navegador estaba realmente en 5173. No se dispuso de su captura de Network ni de automatización de Chrome.

La API ya estaba escuchando en 7076 y 5076. HTTPS, health y ping funcionaron con validación de certificado, sin `-k`. No se encontró un defecto en la URL de desarrollo ni en el ensamblado de la solicitud del cliente.

## 2. Configuración encontrada y seguridad

### Backend

- SDK instalados: 9.0.315 y 10.0.301; proyecto net10.0.
- Perfil `https`: https://localhost:7076 y http://localhost:5076; ASPNETCORE_ENVIRONMENT=Development. El perfil `http` solo expone 5076 y no corresponde a la URL actual del frontend.
- Program.cs utiliza WebApplication.CreateBuilder, sin proveedores personalizados de configuración.
- Prioridad de configuración de aplicación, de mayor a menor: argumentos de línea de comandos, variables de entorno, User Secrets en Development, appsettings.Development.json, appsettings.json. `__` representa `:` en variables. launchSettings configura el entorno y URLs del proceso al usar el perfil. DOTNET_ENVIRONMENT también debe revisarse: en WebApplication puede prevalecer sobre ASPNETCORE_ENVIRONMENT.
- No se encontraron overrides relevantes en las variables Process/User/Machine inspeccionadas. Esto no demuestra qué variables o argumentos heredó un proceso que ya estaba iniciado en otra terminal.
- Los appsettings inspeccionados no aportan DefaultConnection; el destino actual procede de User Secrets: servidor **WIN-PVPAQO25113**, base **EmpleadoDelMesDb**, autenticación SQL, usuario distinto de `sa`, TrustServerCertificate=true. No se muestran usuario, contraseña ni cadena completa.
- El equipo actual es MESINNO04: el servidor SQL no es este equipo. El nombre EmpleadoDelMesDb no basta para certificar que sea exclusivamente desarrollo. Se solicitó confirmación; permanece pendiente al redactar este informe.
- La configuración inspeccionada ya no apunta a EmpleadoDelMesProd. No se modificaron User Secrets. La configuración efectiva del proceso API existente no fue extraída de memoria ni revelada.
- AdminBootstrap:Enabled=false en User Secrets. CampaignAutomation:Enabled=false en appsettings.json. Automatización configurada con America/Monterrey e intervalo 60 minutos; FirstEvaluationMonth vacío solo sería un error si se habilitara.

### Posibles escrituras al iniciar

Program invoca AdminBootstrapStartup antes de app.Run: habilitarlo puede crear roles y una cuenta administrativa. CampaignAutomationWorker, cuando se habilita, consulta y puede crear convocatorias al arrancar y periódicamente. Ambos salen sin resolver persistencia cuando están desactivados. No se identificó una migración automática en el arranque revisado.

DependencyInjection valida la cadena al resolver ApplicationDbContext y usa SQL Server. Registrar el contexto no abre la conexión. Health solo comprueba la aplicación, **no SQL Server**; ping tampoco certifica disponibilidad de la base. El login puede actualizar contadores de intentos/bloqueo, por lo que no se intentó con credenciales inventadas.

Migraciones locales: 20261030132031_InitialCreate y 20261030164604_AddAccountIsActive. No se consultó __EFMigrationsHistory ni se aplicaron migraciones. Git muestra un cambio local en ApplicationDbContextModelSnapshot.cs que esta tarea no modificó; no se debe regenerar ni sobrescribir por este diagnóstico.

### Frontend

- .env.development: VITE_API_BASE_URL=https://localhost:7076.
- .env.demo: destino demo.invalid y VITE_DEMO=true.
- No existen .env.local ni .env.development.local en la inspección. No se encontraron overrides VITE de API/demo en el proceso.
- No se modificó .env.production.
- Prioridad Vite: variables existentes del proceso, archivos específicos del modo (.env.[mode].local y .env.[mode]), archivos generales (.env.local y .env). Reiniciar Vite tras cambiar variables.
- main.tsx solo instala el transporte demo con DEV y la bandera demo habilitada. configureApi conecta la sesión en memoria al cliente; authApi envía userName/password a /api/auth/login y luego consulta /me. No se añadieron almacenamientos persistentes.
- HTTP distingue errores de red (ApiError.status=0) de HTTP 400/401/403/500, conserva errores estructurados y cierra la sesión en 401 autenticado. No se modificó esa lógica.

## 3. Cambios mínimos realizados

- `vite.config.ts`: server.port=5173 y server.strictPort=true. Si el puerto está ocupado, Vite falla explícitamente en lugar de moverse a un origen no autorizado.
- `docs/diagnostico-entorno-desarrollo.md`: este informe.
- Se detuvo la demo iniciada por el asistente en la tarea anterior y la instancia temporal de diagnóstico en 5175. Se inició development en 5173. No se terminó la instancia ajena de 5174 ni la API existente.
- Se conservaron cambios previos del frontend y del backend. No se cambiaron contratos, CORS, autenticación, producción, secretos ni datos.

## 4. Resultados

| Verificación                                        | Resultado                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| dotnet restore EmpleadoDelMes.slnx                  | Correcto                                                                           |
| dotnet build EmpleadoDelMes.slnx --no-restore       | Correcto; 0 errores y 0 advertencias                                               |
| dotnet dev-certs https --check --trust              | Certificado localhost válido y confiable, hasta 21 julio 2027                      |
| GET https://localhost:7076/health                   | 200 Healthy                                                                        |
| GET https://localhost:7076/api/ping con Origin 5173 | 200, JSON correcto y Access-Control-Allow-Origin correcto                          |
| OPTIONS login con Origin 5173                       | 204; autoriza POST y content-type                                                  |
| OPTIONS login con Origin 5174                       | 204 sin autorización CORS; conflicto confirmado                                    |
| GET /api/auth/me sin Bearer                         | 401 y mensaje de sesión; prueba sin credenciales ni consulta SQL                   |
| POST login y respuestas reales 400/403/500          | No ejecutados; pendientes del destino de desarrollo confirmado y datos autorizados |
| npm run lint                                        | Correcto                                                                           |
| npm run build                                       | Correcto; 161 módulos                                                              |
| npm run test                                        | 2/2 pruebas existentes aprobadas; incluye HTTP 500 simulado                        |
| npm run dev                                         | Correcto en 5173 después de retirar demo                                           |
| Módulo env servido por Vite en 5173                 | HTTP 200; MODE=development, API=https://localhost:7076, demo=false                 |
| SQL, existencia de cuentas, migraciones pendientes  | Sin comprobar; requiere confirmación del destino remoto                            |
| Navegación Chrome / login real                      | Pendiente; no hubo automatización de navegador disponible                          |

Las primeras solicitudes curl dentro del sandbox fallaron con Schannel SEC_E_NO_CREDENTIALS. Fuera del sandbox pasaron con validación TLS normal; no se confundió ese fallo del entorno de herramientas con un certificado defectuoso de Chrome. Restore/build se ejecutaron con permiso para escribir artefactos en el repositorio backend, sin ejecutar la API. No se lanzó una segunda API: ya existía un proceso en los puertos requeridos.

## 5. Configurar una base independiente de forma segura

Antes de cualquier arranque nuevo, confirmar con el responsable que **servidor y base** están dedicados a desarrollo. Si el destino fuera EmpleadoDelMesProd o no pudiera verificarse, detener login, bootstrap, automatización y migraciones. No basta cambiar el nombre en una cadena que apunte a un servidor productivo.

1. Usar una instancia de desarrollo independiente y una base como EmpleadoDelMesDb. Su creación, permisos y migraciones requieren autorización aparte; no se ejecutaron aquí.
2. Utilizar identidad Windows autorizada o un usuario SQL exclusivo de desarrollo con los permisos mínimos necesarios, nunca sa como cuenta habitual. Separar permisos de migración de la cuenta de ejecución cuando corresponda.
3. Editar User Secrets mediante “Manage User Secrets” del proyecto API en el editor, sin pegar credenciales en terminales, capturas, tickets ni archivos versionados. La clave es ConnectionStrings:DefaultConnection. User Secrets es almacenamiento local de desarrollo, no una bóveda cifrada.
4. Mantener AdminBootstrap:Enabled y CampaignAutomation:Enabled en false durante el diagnóstico. Estos ajustes no crean cuentas ni completan el esquema.
5. Revisar variables ConnectionStrings__DefaultConnection y argumentos que puedan sobrescribir esos secretos, además del ambiente efectivo. No imprimir listados sin filtrar de secretos o variables.
6. Después de confirmar el destino, comprobar con consultas de solo lectura DB_NAME(), conectividad, existencia del esquema y __EFMigrationsHistory. Comparar con las dos migraciones locales. Comprobar existencia de cuentas sin extraer hashes ni credenciales. No asumir que existen o faltan cuentas hoy.
7. No ejecutar `database update`, seeds o bootstrap sin autorización explícita y una nueva verificación del destino. No se necesita una nueva migración por un problema de conectividad o CORS.

## 6. Inicio definitivo

En una terminal, desde EmpleadoDelMes-Backend, **solo tras confirmar el destino exclusivo de desarrollo** y revisar que bootstrap/automatización continúan desactivados:

```powershell
dotnet run --project src/EmpleadoDelMes.Api --launch-profile https
```

No ejecutarlo mientras otra instancia esté usando 7076/5076. Detener con Ctrl+C la instancia propia desde su terminal; no terminar procesos ajenos automáticamente. No se cambió la confianza TLS; si otro equipo no tiene certificado confiable, comprobar con `dotnet dev-certs https --check --trust` y realizar el procedimiento de confianza de desarrollo allí.

En otra terminal, desde EmpleadoDelMes-Frontend:

```powershell
npm run dev
```

Abrir **http://localhost:5173**. No usar la pestaña anterior en 5174/5175 ni `--mode demo` para probar la API real. Si 5173 está ocupado, cerrar la instancia propia anterior; strictPort impide un cambio silencioso. La demo sigue disponible con `npm run dev -- --mode demo`, de forma alternativa al servidor real, no simultáneamente en 5173.

## 7. Verificación manual en Chrome y pendientes

1. Confirmar primero el destino de desarrollo; reiniciar la API desde una terminal controlada si se necesita demostrar su configuración heredada.
2. Abrir https://localhost:7076/health y /api/ping: esperar 200 sin advertencias TLS. No omitir validaciones del certificado ni desactivar seguridad del navegador.
3. Abrir http://localhost:5173 y recargar. No debe aparecer el aviso ni selector demo.
4. DevTools → Network: conservar el registro, revisar Origin exacto y URL de login. El OPTIONS debe autorizar http://localhost:5173. No compartir payloads con contraseñas ni respuestas con tokens.
5. Solo con una cuenta autorizada de desarrollo, enviar el login y comprobar POST seguido de GET /api/auth/me. Un 401 demuestra respuesta del servidor; no es un fallo de conectividad. 400 indica datos inválidos, 403 acceso restringido y 500 error del servidor. No provocar fallos deliberados ni múltiples intentos que puedan bloquear cuentas.
6. Si todavía falla desde 5173, registrar únicamente código HTTP, código de error de Chrome y encabezados no sensibles. Distinguir ERR_CONNECTION_REFUSED, errores de certificado y CORS. No afirmar que el login real está validado hasta completar estos pasos.

**Estado final:** comunicación técnica HTTPS y CORS 5173 verificada, frontend real listo en el puerto correcto. Quedan bloqueadas por falta de confirmación las comprobaciones de SQL y autenticación real. No se solicitó ni se requiere acceso a producción para resolverlas.
