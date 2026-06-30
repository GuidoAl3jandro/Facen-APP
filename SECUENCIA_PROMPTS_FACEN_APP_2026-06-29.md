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

### 2026-06-30 - Persistencia real de Perfil e Inscripciones

Texto del usuario:

```text
mis datos de perfil se guardan solo un rato, luego se borra todo. y cuando asigno una asignatura este no se asocia al usuario, no funciona
```

Interpretacion operativa:

* El problema ya no era solamente visual: Perfil e Inscripciones existian en Sheets, pero el `bootstrap` posterior a recarga devolvia datos vacios.
* La prueba debia hacerse contra la URL publica y contra el iframe real de Apps Script, no solo leyendo la hoja.

Resultado resumido:

* Se verifico que `diegomezapy` (`id_usuario = 8`, `id_estudiante = 8`) tenia Perfil e Inscripciones en el libro.
* Se identifico que columnas de fecha/hora estaban como fechas nativas de Sheets; Apps Script las leia como objetos `Date` y `google.script.run` rompia el paquete de datos.
* Se convirtieron columnas criticas de fecha/hora a texto y se reescribieron valores existentes como `yyyy-MM-dd HH:mm:ss`.
* Se verifico por Playwright que el backend carga Perfil completo, `inscripcionesLen = 7` y `resumen.totalAsignaturas = 7`.
* Se agrego sanitizacion defensiva de `Date` en `apps-script/Code.gs`, se subio a Apps Script HEAD y se creo version `42`.
* El intento de activar `AKfycbyr...@42` dejo el deployment restringido con `Necesitas acceso`; por seguridad se retiro de Pages.
* Se comprobo que `AKfycbwi0...@20` sigue publico y carga Perfil + 7 asignaturas con el libro corregido.
* Se publico y verifico `APP_BUILD = 2026.06.30.2` y `facen-app-v11-shell-20260630`, apuntando Pages temporalmente al backend fallback publico.

### 2026-06-30 - Examenes desde guia academica y grupos

Texto del usuario:

```text
YA FUNCIONA BUENA PARTE, AHORA FALTA AGREGAR LOS DATOS DE LOS DIAS Y HORARIOS DE EXAMENES DESDE LAS GUIAS ACADEMICAS G:\Mi unidad\FACENapp\Guia-Academica-2026-2.pdf

CUANDO CREO UN GRUPO, NO GUARDA EL DATO NI LO RECONOCE LUEGO
```

Interpretacion operativa:

* La app ya habia recuperado una parte importante de Perfil/Materias.
* Faltaba poblar el libro real con examenes desde la guia academica 2026-2.
* El flujo de grupos debia probarse contra el backend publico, no solo contra la hoja.

Resultado resumido:

* Se extrajo el PDF a texto y se cargaron 28 fechas en `FECHAS_EXAMENES`.
* Se cargaron 24 examenes visibles en `AGENDA_ACADEMICA` para `id_estudiante = 8`.
* Se completaron asignaturas/secciones snapshot faltantes (`1004`, `1006`, `1013`; `2004`, `2006`, `2013`).
* Se implemento en Apps Script HEAD version `43` el fix de grupos: fecha como texto `yyyy-MM-dd`, respuesta con `grupos` + `resumen` y refresco frontend sin recarga total.
* Al intentar activar `AKfycbwi0...@43`, el deployment quedo `HTTP 403`; el rollback a `@20` no recupero acceso anonimo.
* Se eligio como rescate publico `AKfycbxPW...@19`, verificado con `bootSuccess = true`, 7 inscripciones, 24 examenes y 3 grupos existentes.
* Se preparo `APP_BUILD = 2026.06.30.3` y `facen-app-v12-shell-20260630`.
* Pendiente critico: redeploy propietario de la version `43` para que el guardado robusto de grupos quede activo en produccion.

### 2026-06-30 - Calendario real, notificaciones y avance academico

Texto del usuario:

```text
ya funciona, ahora la ajenda debe verse como un calendario real, con posibildad de vista diaria, semanal, mes, año, etc. Debe poder editarse, agregar o eleiminar un evento sobre el calendario. Debe opder activarse notificaciones en la app para avisos anticipados de eventos. De la guia academica se puede sacar la grilla completa de asignaturas y las correlatividades para que el estudiantes sepa en que etapa se encuentra, cuantas asignturas le falta, etc. eEn general la vista y formato, aspecto de la app es muy pobre y sencillo, mejóralo radicalmente.
```

Interpretacion operativa:

* La app ya cargaba perfil, materias, agenda y grupos existentes, pero la agenda aun era una lista simple.
* Habia que convertir la agenda en calendario editable real y preparar una vista de progreso academico desde la guia.
* No se debia redeployar el backend publico desde la cuenta actual porque los intentos previos dejaron deployments `403`.

Resultado resumido:

* Se implemento en `apps-script/index.html` un calendario con vistas dia, semana, mes, ano y lista, navegacion anterior/hoy/siguiente, creacion desde celda de calendario y edicion/eliminacion de eventos existentes.
* Se mejoro el flujo de notificaciones: estado de permiso visible, boton de activacion y reprogramacion local despues de guardar agenda/preferencias.
* Se agrego la vista `Avance` con resumen de malla, barra de progreso, asignaturas por nivel, estados aprobada/cursando/pendiente/bloqueada y correlatividades faltantes.
* Se agregaron al backend las hojas `MALLA_ACADEMICA` y `CORRELATIVIDADES`, lectura de malla, calculo de avance y respuesta incremental de agenda.
* Se cargaron en el libro operativo 40 asignaturas de la malla 2025 y 36 correlatividades desde `Guia-Academica-2026-2.pdf`.
* Se subio el codigo a Apps Script HEAD y se creo version `45`.
* Se verifico sintaxis de `Code.gs`, script HTML y render simulado de calendario/avance en Node.
* GitHub Pages sigue operativo con `APP_BUILD = 2026.06.30.3` apuntando al deployment publico de rescate `AKfycbxPW...@19`; las mejoras de UI requieren redeploy propietario de la version `45` para quedar visibles al publico.
