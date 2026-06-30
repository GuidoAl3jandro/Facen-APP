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
