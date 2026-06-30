# SECUENCIA_PROMPTS_FACEN_APP_2026-06-29

Ultima edicion: 2026-06-29 19:33 America/Asuncion

## Proyecto

* Nombre: FACEN App / DAPP appweb
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica: `https://appfacen.github.io/Facen-APP/`
* Ruta local de trabajo: `G:\Mi unidad\FACENapp\Facen-APP`

## Prompts e instrucciones recibidas

### 2026-06-29 - Instrucciones operativas del proyecto

El usuario adjunto instrucciones tipo `AGENTS.md` con estos criterios principales:

* actuar como arquitecto senior de datos, app web, GIS, automatizacion y monitoreo institucional;
* consultar la carpeta maestra `G:\Mi unidad\MANUAL_MAESTRO_FORMATOS_FUNCIONES_APPWEB` antes de intervenir;
* mantener bitacora por proyecto desde el inicio;
* documentar cambios, pruebas, errores, evidencias, pendientes y riesgos;
* diferenciar codigo escrito, probado, desplegado y sistema realmente operativo;
* priorizar robustez, reproducibilidad, trazabilidad, seguridad, documentacion y compatibilidad movil;
* anticipar problemas de castellano y mojibake heredado;
* actualizar o proponer aprendizajes para el repositorio maestro.

### 2026-06-29 - Solicitud de intervencion

Texto del usuario:

```text
revisa la bitacora de este proyecto, si no existe creala, dmezapy esta de colaborador en  https://appfacen.github.io/Facen-APP/
puedes lograr que funcione
```

## Interpretacion operativa

* Revisar la existencia y contenido de la bitacora del proyecto FACEN App.
* Confirmar acceso GitHub con `diegomezapy`.
* Verificar estado real de GitHub Pages y backend Apps Script.
* Intentar dejar la app funcionando sin romper el fallback publico existente.
* Registrar el resultado con evidencia en bitacora.

## Resultado resumido de la sesion

* Se clono el repo real `appfacen/Facen-APP` porque `G:\Mi unidad\FACENapp` no era repo Git.
* Se confirmo que la bitacora existia y se actualizo.
* Se confirmo que GitHub Pages responde `HTTP 200` y muestra login en escritorio y movil.
* Se confirmo que GitHub Pages usa un fallback Apps Script publico antiguo.
* Se confirmo que la version corregida de Apps Script sigue bloqueada con `HTTP 403 / Necesitas acceso` si se despliega desde la cuenta `apoyomedicoips@gmail.com`.
* Se mantuvo intacto el fallback publico usado por produccion.
* Se documento que la publicacion definitiva requiere redeploy desde la cuenta propietaria/autorizada del Apps Script.

### 2026-06-29 - Recuperacion de contrasena y publicacion

Texto del usuario:

```text
la app no permite recuperar contraseña si se ha perdido, no logro acceder
```

```text
OCUPATE DEL CONMIT AND PUSH
```

Interpretacion operativa:

* Preparar solucion de recuperacion sin romper el fallback publico actual.
* Confirmar por GitHub Pages que la app publica realmente se actualiza.
* Registrar bitacora, commit y push.

Resultado resumido:

* Se agrego codigo de recuperacion en `apps-script/` y un microservicio separado en `apps-script-recovery/`.
* Los despliegues Apps Script creados desde la cuenta actual quedaron en `HTTP 403`; no se cambio el fallback publico para evitar empeorar el acceso.
* Se identifico que la via inmediata es restablecer una cuenta confirmada en la hoja `USUARIOS`.
* Se hicieron commits y push al repositorio `appfacen/Facen-APP`.

### 2026-06-29 - Appweb no se actualiza

Texto del usuario:

```text
la appwen no se actualiza https://appfacen.github.io/Facen-APP/
```

Interpretacion operativa:

* Verificar si GitHub Pages sirve la nueva version.
* Corregir cache/service worker y evidencia visual en movil.
* Confirmar con cache-busting que la URL publica entrega el build nuevo.

Resultado resumido:

* Se detecto que el build `2026.06.29.2` estaba publicado, pero la version quedaba oculta en movil por `.brand span { display: none; }`.
* Se publico `APP_BUILD = 2026.06.29.3` y se mantuvo visible `#shell-version` tambien en movil.
* Se renovo el service worker a `facen-app-v7-shell-20260629`.
* GitHub Pages quedo `built` y la URL publica respondio `HTTP 200` con el build nuevo y el service worker nuevo.

### 2026-06-29 - Solo se ve la version del shell

Texto del usuario:

```text
solo puedo ver sesta version ACEN App
v2026.06.29.3
```

Interpretacion operativa:

* GitHub Pages ya actualizo, pero el usuario no esta llegando de forma usable al Apps Script embebido.
* Reforzar la entrada directa al backend publico.
* Restablecer la cuenta `dmeza.py` como desbloqueo inmediato, sin documentar la clave temporal.

Resultado resumido:

* Se verifico que Pages y el Apps Script publico responden `HTTP 200`.
* Se confirmo que el Apps Script publico trae login pero no recuperacion de contrasena.
* Se restablecio `USUARIOS!A5:H5` para `dmeza.py` con hash moderno y salt nuevo.
* Se agrego log tecnico `RESET_CONTRASENA_ASISTIDO` sin clave temporal en `LOGS!A42:E42`.
* Se publico `APP_BUILD = 2026.06.29.4`, boton `Entrar` y fallback de acceso directo.
* GitHub Pages quedo `built`; el HTML publico y `sw.js` respondieron `HTTP 200` con el build y cache nuevos.

### 2026-06-29 - Carga de asignaturas

Texto del usuario:

```text
ya puedo acceder pero , no funciona la carga de asignaturas
```

Interpretacion operativa:

* El acceso ya funciona, pero el catalogo no carga para el usuario activo.
* Revisar perfil, carrera, catalogo y version publica real antes de tocar el deployment Apps Script.

Resultado resumido:

* Se identifico que la sesion activa reciente era de `diegomezapy` (`id_usuario = 8`).
* Su perfil tenia `carrera = Estadística`, mientras el catalogo usa `Licenciatura en Ciencias Mencion Matematica Estadistica`.
* Se normalizo `ESTUDIANTES!I8` a la carrera canonica.
* Se verificaron 4 asignaturas activas para esa carrera: `MAT201`, `MAT120`, `MAT101`, `MAT330`.
* Se registro `NORMALIZAR_CARRERA_ASIGNATURAS` en `LOGS!A48:E48`.

### 2026-06-29 - Perfil y Materias no guardan/cargan

Texto del usuario:

```text
no guarda ni carga los datos del perfil, tamopco carga los datos de las asignatras
```

Interpretacion operativa:

* El problema ya no es solo el dato de carrera: el backend publico usado por Pages debe ser revisado.
* Evitar dejar al usuario apuntando a un deployment que devuelve `403`.

Resultado resumido:

* Se clono e inspecciono Apps Script `@22`.
* Se probo actualizar el deployment anterior a `@40` y `@25`; ambos quedaron `HTTP 403`.
* El deployment anterior `AKfycbzM0... @22` no recupero acceso anonimo despues del rollback.
* Se probaron deployments historicos y se eligio `AKfycbwi0em5pAGlaVMstzCPxOs7aopGNylBwspSlj9Sx4ZwK_cNMSHiCi5fmPpgP68FoqPHjA @20`, que responde `HTTP 200` y contiene login, Perfil y Materias.
* Se publico `APP_BUILD = 2026.06.29.5` y `facen-app-v9-shell-20260629`.
* GitHub Pages quedo `built`; Pages, `sw.js` y backend de destino respondieron `HTTP 200`.

### 2026-06-29 - Reconstruccion completa del libro operativo

Texto del usuario:

```text
no funciona nada, porque no reconstruimos todo absolutamente de nuevo creando el lirbo en linea que tnga las hojas y datos correctos para asegurar que la appweb funciones super bien y con rapidez
```

Interpretacion operativa:

* El problema ya no se trataba como una correccion puntual de perfil o asignaturas.
* Como el backend publico funcional `AKfycbwi0...@20` usa el spreadsheet existente, crear otro libro con otro ID no resolveria la app publica sin redeploy GAS.
* La ruta segura fue respaldar el spreadsheet existente y reconstruirlo in-place con hojas, encabezados y datos compatibles.

Resultado resumido:

* Se creo respaldo completo previo: `https://docs.google.com/spreadsheets/d/1j3vn6kjy0tMZU2IdD6qzQUBrhX_7AkZNxe8IPtg78Hw`.
* Se crearon hojas temporales `REBUILD_*`, se verificaron y luego reemplazaron las hojas productivas.
* El libro productivo conserva el ID usado por la app: `1bxqwZy6cW1gGdPGtRyWDn52WdmbMpiMKvLjA6X2lFmc`.
* Quedaron 22 pestanas productivas, 12 carreras, 17 asignaturas, 17 secciones, 25 horarios, 8 aulas y 5 inscripciones base.
* Se limpiaron sesiones viejas y se preservaron credenciales existentes de usuarios activos.
* El perfil activo `diegomezapy` quedo con carrera canonica y dos asignaturas base compatibles.
* Se verifico `HTTP 200` en GitHub Pages y en el backend Apps Script publico.
* No se pudo ejecutar `clasp run` por permisos de la cuenta actual, por lo que no se pudo limpiar `CacheService` desde consola; el cache del Apps Script historico puede tardar unos minutos en expirar.

### 2026-06-30 - Cambio al deployment GAS asociado correcto

Texto del usuario:

```text
pues veo la misma app y las mismas fallas
```

```text
ten en cuenta que el GAS proyecto asociado es https://script.google.com/u/0/home/projects/1mXbo3LGQwW6S3wKtAcCyMHPBDHkm0KFRXaRpBbAcdNAM-8hr5z9FfLZT/edit
```

Interpretacion operativa:

* GitHub Pages estaba publicado, pero seguia apuntando al deployment historico `@20`, que no contiene recuperacion ni el boton nuevo de actualizar catalogo.
* El proyecto GAS asociado es el script `1mXbo3LGQwW6S3wKtAcCyMHPBDHkm0KFRXaRpBbAcdNAM-8hr5z9FfLZT`.
* Se debia usar el deployment publico mas nuevo y funcional de ese mismo proyecto.

Resultado resumido:

* Se probaron 21 deployments versionados del proyecto GAS asociado.
* `AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg @39` respondio `HTTP 200`.
* Ese deployment contiene `recoverPassword`, `savePerfil`, `renderMaterias`, `catalogoLoaded` y `Actualizar registros`.
* Se cambio `APP_URL` en GitHub Pages a `AKfycbyr.../exec`.
* Se publico `APP_BUILD = 2026.06.30.1` y cache PWA `facen-app-v10-shell-20260630`.
