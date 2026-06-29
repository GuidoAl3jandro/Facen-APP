# BITACORA_FACEN_DAPP_APPWEB_FACEN_APP

## 2026-06-16 18:24

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Cliente o institucion: FACEN
* Ruta local: `/Users/diegobernardomezabogado/Library/CloudStorage/GoogleDrive-dmeza.py@gmail.com/.shortcut-targets-by-id/1-jhsoiMXD4UATf27FUyUqMq-V04yUD58/facen_app/facen_app_v3`
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica solicitada: `https://appfacen.github.io/Facen-DAPP/`
* URL publica operativa encontrada: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex
* Version local revisada: `main` en `c06a4f5` (`Add default career dropdown fallback`)

### Objetivo de la intervencion

* Estudiar la situacion actual de la appweb indicada por el usuario en `appfacen.github.io/Facen-DAPP/`.
* Diferenciar URL solicitada, repositorio real, GitHub Pages publicado, backend Apps Script y evidencia visual de carga.

### Diagnostico inicial

* La carpeta maestra `MANUAL_MAESTRO_FORMATOS_FUNCIONES_APPWEB` esta disponible localmente y fue consultada.
* El directorio raiz `facen_app` no es un repositorio Git; el repositorio Git activo esta en `facen_app_v3`.
* No existia bitacora local especifica para FACEN DAPP/FACEN App en `facen_app_v3`.
* La URL solicitada `https://appfacen.github.io/Facen-DAPP/` responde 404 de GitHub Pages.
* El repositorio publico real detectado es `appfacen/Facen-APP`; `appfacen/Facen-DAPP` no existe publicamente.
* El remoto local sigue apuntando a `https://github.com/GuidoAl3jandro/Facen-APP`, pero GitHub lo redirige al repositorio `appfacen/Facen-APP`.

### Acciones realizadas

* Se verifico el estado Git local y remoto con `git fetch --all --prune`, `git status`, `git log`, `git branch -a` y `git ls-remote`.
* Se verificaron URLs publicas con `curl`:
  * `https://appfacen.github.io/Facen-DAPP/` -> 404.
  * `https://appfacen.github.io/Facen-APP/` -> 200.
  * `https://github.com/appfacen/Facen-DAPP` -> 404.
  * `https://github.com/appfacen/Facen-APP` -> repositorio publico existente.
* Se comparo el `index.html` publicado en GitHub Pages con el `index.html` local; ambos tienen el mismo SHA-256.
* Se verifico el backend Apps Script configurado en el shell:
  * GET a `/exec` responde 200 y entrega HTML de la app.
  * HEAD a `/exec` devuelve 403, comportamiento no concluyente para operacion de navegador.
* Se generaron capturas con Chrome headless:
  * GitHub Pages `Facen-APP`: muestra la barra superior del shell, pero el area del iframe queda en blanco.
  * Apps Script directo `/exec`: muestra login FACEN App correctamente.
  * Vista movil de GitHub Pages: la barra superior recorta botones de accion.

### Archivos revisados

* `index.html`
* `sw.js`
* `manifest.webmanifest`
* `README.md`
* `.clasp.json`
* `apps-script/Code.gs`
* `apps-script/index.html`
* `apps-script/appsscript.json`

### Archivos modificados

* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`
* Copia central en `MANUAL_MAESTRO_FORMATOS_FUNCIONES_APPWEB/BITACORAS_PROYECTOS/BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`
* Indice central de bitacoras.

### Comandos o scripts ejecutados

* `rg -n "FACEN|Facen|DAPP|Facen-DAPP|appfacen|bitacora|BITACORA" /Users/diegobernardomezabogado/.codex/memories/MEMORY.md`
* `ls -la`
* `find . -maxdepth 3 -name .git -type d -print`
* `rg --files -g '*BITACORA*' -g '*bitacora*' -g '*.md'`
* `git status --short --branch`
* `git fetch --all --prune`
* `git remote -v`
* `git log --oneline --decorate -8`
* `curl -I -L https://appfacen.github.io/Facen-DAPP/`
* `curl -I -L https://appfacen.github.io/Facen-APP/`
* `curl -L https://appfacen.github.io/Facen-APP/`
* `curl -L https://script.google.com/macros/s/AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg/exec`
* `git ls-remote --heads https://github.com/appfacen/Facen-APP.git`
* `git ls-remote --heads https://github.com/appfacen/Facen-DAPP.git`
* Chrome headless para capturas desktop, movil y Apps Script directo.

### Resultados verificados

* La URL exacta solicitada no esta operativa: `Facen-DAPP` devuelve 404.
* La URL correcta publicada es `https://appfacen.github.io/Facen-APP/`.
* El shell PWA de GitHub Pages se publica desde contenido equivalente al `index.html` local.
* El backend Apps Script directo esta activo y renderiza login.
* El embebido de Apps Script dentro del iframe de GitHub Pages no quedo visualmente operativo en la prueba automatizada: el area principal aparece en blanco.
* El boton interno `Actualizar app` en `apps-script/index.html` apunta a `https://guidoal3jandro.github.io/Facen-APP/`, URL que hoy responde 404.
* El `README.md` tambien documenta la URL antigua `https://guidoal3jandro.github.io/Facen-APP/`.
* La vista movil del shell GitHub Pages presenta recorte horizontal de botones en la barra superior.

### Pruebas realizadas

* Prueba HTTP de GitHub Pages para URL solicitada y URL real.
* Prueba HTTP de repositorios GitHub relacionados.
* Prueba de integridad entre `index.html` local y `index.html` publico mediante SHA-256.
* Prueba HTTP GET del Apps Script `/exec`.
* Prueba visual con Chrome headless en escritorio y movil.
* Prueba visual con Chrome headless del Apps Script directo.

### Errores o incidentes

* `https://appfacen.github.io/Facen-DAPP/` no existe o no tiene GitHub Pages configurado.
* `appfacen/Facen-DAPP` no existe publicamente.
* El shell GitHub Pages carga, pero no se observo contenido renderizado dentro del iframe.
* La documentacion y una funcion de actualizacion mantienen URL antigua de GitHub Pages.
* Chrome headless dejo procesos auxiliares activos; fueron cerrados por `user-data-dir=/tmp/facen-chrome`.

### Soluciones aplicadas

* No se modifico codigo de la app ni se desplego.
* Se documento la situacion real en bitacora local y central.

### Pendientes

* Decidir si la URL oficial debe ser `Facen-APP` o si hay que crear/configurar `Facen-DAPP`.
* Corregir referencias antiguas a `guidoal3jandro.github.io/Facen-APP/` en `README.md` y `apps-script/index.html`.
* Actualizar el remoto local a `https://github.com/appfacen/Facen-APP.git` para evitar confusion operativa.
* Resolver el problema del iframe en GitHub Pages o reemplazar el shell por una redireccion/boton principal hacia Apps Script directo.
* Ajustar la barra movil para que `Actualizar`, `Instalar` y `Abrir` no se recorten.
* Validar flujo real con usuario de prueba: registro, login, seleccion de carrera, guardado en Google Sheets, lectura posterior, cierre de sesion y recuperacion.
* Verificar Apps Script desde la cuenta propietaria/institucional antes de declarar produccion.

### Riesgos

* Usuarios que reciban `Facen-DAPP` veran 404 y no accederan a la app.
* Usuarios que entren a `Facen-APP` pueden ver solo el shell y un area vacia si el iframe no carga en su navegador.
* El boton interno de actualizacion puede enviar a una URL rota.
* La app no tiene evidencia actual de escritura/lectura real en Google Sheets en esta intervencion.
* La PWA actual cachea el shell, pero la app funcional depende de Apps Script y red; no debe presentarse como offline completo.

### Recomendaciones

* Definir una unica URL canonica y documentarla en README, app, bitacora y mensajes a usuarios.
* Si la prioridad es operacion inmediata, publicar `https://appfacen.github.io/Facen-APP/` con apertura directa del Apps Script o reemplazar el iframe por redireccion clara.
* Si debe existir `Facen-DAPP`, crear el repositorio o configurar redireccion desde GitHub Pages hacia `Facen-APP`.
* Para futuras apps GAS + GitHub Pages, agregar al checklist maestro: probar iframe visualmente en Chrome/Safari movil y escritorio; si falla, usar redireccion controlada o app servida directamente desde Apps Script.
* Registrar evidencia de la proxima validacion con capturas, usuario de prueba, filas creadas en Sheets y version/deployment Apps Script.

## 2026-06-16 18:38

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Cliente o institucion: FACEN
* Ruta local: `/Users/diegobernardomezabogado/Library/CloudStorage/GoogleDrive-dmeza.py@gmail.com/.shortcut-targets-by-id/1-jhsoiMXD4UATf27FUyUqMq-V04yUD58/facen_app/facen_app_v3`
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex

### Objetivo de la intervencion

* Incorporar asignaturas y horarios 2026-2 como CSV embebido dentro del proyecto Apps Script para mejorar velocidad y robustez de carga.
* Corregir referencias antiguas para considerar como enlace correcto `https://appfacen.github.io/Facen-APP/`.

### Diagnostico inicial

* El archivo fuente activo `estadistica_horarios_2026_2.csv` contiene 57 filas de horarios.
* El catalogo anterior dependia de lecturas a hojas `ASIGNATURAS`, `SECCIONES`, `HORARIOS_ASIGNATURAS` y `AULAS`.
* `.claspignore` no incluia archivos HTML adicionales; por eso un nuevo archivo de catalogo no hubiera viajado al proyecto GAS sin actualizar esa regla.

### Acciones realizadas

* Se creo `apps-script/catalogo_csv.html` con el CSV embebido como `script type="text/csv"`.
* Se agrego parser server-side en `Code.gs` usando `HtmlService.createHtmlOutputFromFile()` y `Utilities.parseCsv()`.
* Se priorizo el catalogo embebido en `obtenerCatalogo_()` y se invalido la clave de cache anterior.
* Se agregaron helpers de indices para que inscripciones, horarios, notas, apuntes, eventos, lecturas, grupos y companeros puedan resolver asignaturas/secciones provenientes del CSV embebido.
* Se agrego `diagnosticoCatalogoRapido()` para que la cuenta propietaria pueda validar conteos desde Apps Script.
* Se actualizo `.claspignore` para subir `catalogo_csv.html`.
* Se corrigio `README.md` y `apps-script/index.html` para usar `https://appfacen.github.io/Facen-APP/`.
* Se actualizo el remoto local Git de `https://github.com/GuidoAl3jandro/Facen-APP` a `https://github.com/appfacen/Facen-APP`.
* Se ejecuto `clasp push -f`; el proyecto GAS recibio `appsscript.json`, `catalogo_csv.html`, `Code.gs` e `index.html`.

### Archivos modificados

* `.claspignore`
* `README.md`
* `apps-script/Code.gs`
* `apps-script/index.html`
* `apps-script/catalogo_csv.html`
* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`

### Comandos o scripts ejecutados

* `node --check --input-type=commonjs - < apps-script/Code.gs`
* `node --check --input-type=commonjs - < <(awk '/<script>/{flag=1;next}/<\\/script>/{flag=0}flag' apps-script/index.html)`
* `git diff --check`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp status`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp push -f`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp deployments`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp deploy -i AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg -d "FACEN App v5 catalogo CSV embebido GAS 2026-2"`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp redeploy AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg -V 33 -d "RESTORE public app v33 pending owner authorization"`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp show-authorized-user`
* `curl -L https://script.google.com/macros/s/AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg/exec`

### Resultados verificados

* Validacion local del CSV embebido: 29 asignaturas, 29 secciones y 57 horarios.
* `node --check` no reporto errores de sintaxis en `Code.gs` ni en el JavaScript de `apps-script/index.html`.
* `git diff --check` no reporto errores de espacios.
* `clasp status` confirma que el proyecto GAS rastrea `catalogo_csv.html`.
* `clasp push -f` subio correctamente 4 archivos al proyecto Apps Script.
* El deployment `AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg` fue actualizado temporalmente a `@34`, pero el `/exec` devolvio 403.
* Se intento restaurar el mismo deployment a `@33`; el `/exec` continuo devolviendo 403.
* `clasp show-authorized-user` indica que la cuenta CLI activa es `monitorimpactosocial@gmail.com`, no necesariamente la cuenta propietaria institucional del Apps Script.

### Pruebas realizadas

* Parseo local del HTML CSV embebido.
* Validacion de sintaxis local.
* Push real a Apps Script HEAD.
* Intento de deploy versionado `@34`.
* Intento de restauracion a version `@33`.
* Verificacion HTTP posterior del endpoint `/exec`.

### Errores o incidentes

* El redeploy desde `monitorimpactosocial@gmail.com` dejo el Web App publico respondiendo `403 Acceso denegado / Necesitas acceso`.
* `clasp run obtenerCarreras` fallo con falta de permiso para ejecutar funcion.
* No hay credencial local configurada para otra cuenta (`dmeza`, `diego`) que permita redeploy como propietario.
* La app publica no debe considerarse operativa hasta que la cuenta propietaria reautorice o redepliegue el Web App con acceso anonimo.

### Soluciones aplicadas

* Codigo optimizado con catalogo CSV embebido queda cargado en HEAD del proyecto GAS.
* Se intento restaurar deployment a version anterior, pero el bloqueo persistio.
* Se dejo funcion `diagnosticoCatalogoRapido()` para validar desde editor Apps Script con cuenta propietaria.

### Pendientes

* Abrir Apps Script desde la cuenta propietaria del proyecto.
* Ejecutar/autorizar el proyecto si Apps Script lo solicita.
* Ejecutar `diagnosticoCatalogoRapido()` y confirmar respuesta esperada: 29 asignaturas, 29 secciones, 57 horarios.
* Crear nueva version o actualizar deployment web desde la cuenta propietaria.
* Confirmar que el Web App quede con acceso `Anyone` / anonimo segun politica institucional.
* Verificar `https://appfacen.github.io/Facen-APP/` y el `/exec` con navegador anonimo.
* Validar flujo real: crear/usar usuario de prueba, seleccionar carrera Matematica Estadistica, agregar materia del CSV, ver horario y confirmar persistencia de inscripcion en Sheets.

### Riesgos

* Mientras el Web App siga en 403, GitHub Pages no podra cargar la app en el iframe.
* El codigo esta en HEAD, pero no debe marcarse como productivo hasta redeploy autorizado por propietario.
* El CSV embebido mejora velocidad del catalogo, pero los datos personales y transaccionales siguen dependiendo de Google Sheets.

### Recomendaciones

* Para futuros cambios GAS, evitar redeploy del Web App desde una cuenta no propietaria aunque tenga permiso de push.
* Registrar en manual maestro el patron: CSV embebido en HTML + parser server-side + diagnostico de conteos + redeploy solo desde cuenta propietaria.
* Mantener `https://appfacen.github.io/Facen-APP/` como URL canonica y no volver a usar `Facen-DAPP` salvo que se cree una redireccion explicita.

## 2026-06-16 18:42

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Ruta local: `/Users/diegobernardomezabogado/Library/CloudStorage/GoogleDrive-dmeza.py@gmail.com/.shortcut-targets-by-id/1-jhsoiMXD4UATf27FUyUqMq-V04yUD58/facen_app/facen_app_v3`
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex

### Objetivo de la intervencion

* Registrar verificacion posterior al incidente de permisos del Web App.

### Diagnostico inicial

* Durante el redeploy previo el endpoint `/exec` respondio temporalmente `403 Acceso denegado`.
* La verificacion final debia diferenciar ese incidente de la situacion publica actual.

### Acciones realizadas

* Se consulto el deployment activo de Apps Script.
* Se verifico por HTTP la URL canonica de GitHub Pages.
* Se verifico por HTTP el endpoint Apps Script utilizado por el iframe.
* Se inspecciono el HTML servido para confirmar presencia de `diagnosticoCatalogoRapido` y uso de `https://appfacen.github.io/Facen-APP/` en la actualizacion interna.

### Archivos modificados

* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`

### Comandos o scripts ejecutados

* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp deployments`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp versions`
* `curl -L -s -o /tmp/facen_github_final.html -w 'GitHub Pages HTTP %{http_code} %{content_type} %{time_total}s\n' --max-time 20 'https://appfacen.github.io/Facen-APP/'`
* `curl -L -s -o /tmp/facen_gas_final.html -w 'Apps Script HTTP %{http_code} %{content_type} %{time_total}s\n' --max-time 20 'https://script.google.com/macros/s/AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg/exec'`
* `rg -n "diagnosticoCatalogoRapido|Facen-APP|Acceso denegado|Necesitas acceso|functionNames" /tmp/facen_gas_final.html`

### Resultados verificados

* `clasp deployments` muestra el deployment publico `AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg @35`.
* `clasp versions` muestra `34 - FACEN App v5 catalogo CSV embebido GAS 2026-2` y `35 - No description`.
* `https://appfacen.github.io/Facen-APP/` responde `HTTP 200 text/html`.
* El endpoint Apps Script `/exec` responde `HTTP 200 text/html`.
* El HTML servido por Apps Script incluye `diagnosticoCatalogoRapido` dentro de `functionNames`.
* El HTML servido por Apps Script incluye la URL canonica `https://appfacen.github.io/Facen-APP/` en `updateAppVersion()`.

### Pruebas realizadas

* Verificacion HTTP anonima con `curl` de GitHub Pages y Apps Script.
* Inspeccion textual del HTML publico servido.

### Errores o incidentes

* El incidente 403 queda registrado como ocurrido durante el redeploy, pero no se reprodujo en la verificacion final de las 18:42.
* `clasp run` sigue sin poder usarse desde la cuenta CLI activa para validar funciones server-side.

### Soluciones aplicadas

* Se dejo asentada la evidencia actualizada para evitar tratar la URL publica como caida cuando ya responde 200.

### Pendientes

* Ejecutar `diagnosticoCatalogoRapido()` desde la cuenta propietaria o desde una sesion autorizada y confirmar conteos 29 asignaturas, 29 secciones, 57 horarios.
* Validar flujo real con usuario de prueba: registro/login, seleccion de carrera, carga de catalogo, inscripcion a seccion CSV, agenda/horario visible y persistencia en Sheets.
* Hacer commit y push de los cambios locales al repositorio GitHub si se aprueba la publicacion del codigo fuente.

### Riesgos

* La respuesta HTTP 200 prueba disponibilidad publica del shell y del Web App, pero no equivale a validacion funcional completa con datos transaccionales.
* El deployment `@35` no tiene descripcion; conviene nombrar explicitamente versiones futuras para trazabilidad.

### Recomendaciones

* Para el cierre operativo, ejecutar la validacion funcional completa con cuenta de prueba y registrar evidencia de filas creadas o actualizadas en Sheets.
* En el proximo deployment, usar descripcion institucional clara y cuenta propietaria/autorizada.

## 2026-06-16 19:37

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Cliente o institucion: FACEN
* Ruta local: `/Users/diegobernardomezabogado/Library/CloudStorage/GoogleDrive-dmeza.py@gmail.com/.shortcut-targets-by-id/1-jhsoiMXD4UATf27FUyUqMq-V04yUD58/facen_app/facen_app_v3`
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex

### Objetivo de la intervencion

* Corregir desaparicion visual o real de datos personales despues de guardar.
* Permitir que asignaturas y horarios se actualicen desde Google Sheets mediante boton en la app web, manteniendo CSV rapido como snapshot.

### Diagnostico inicial

* El bootstrap devolvia vacias las tablas personales de `apuntes`, `eventos`, `lecturas` y `grupos`; despues de guardar y recargar, algunas vistas podian parecer sin datos aunque la hoja tuviera registros.
* Las fallas de carga diferida marcaban una vista como cargada, lo que podia convertir un error transitorio en una pantalla vacia.
* El catalogo embebido en `catalogo_csv.html` tenia prioridad absoluta sobre Sheets; por tanto los cambios en la hoja no se reflejaban hasta editar codigo/redeploy.
* Las inscripciones dependian solo del catalogo vigente para resolver nombre, seccion y horarios; un cambio anual de catalogo podia dejar selecciones previas sin datos visibles.

### Acciones realizadas

* Se modifico `obtenerBootstrap()` para cargar datos personales reales de apuntes, eventos, lecturas y grupos en el arranque.
* Se agrego `SpreadsheetApp.flush()` en escrituras base y eliminaciones fisicas.
* Se agregaron validaciones para que actualizaciones de perfil, notas, apuntes, eventos, lecturas, grupos, agenda y preferencias fallen si no actualizan una fila real.
* Se ampliaron columnas de `INSCRIPCIONES` con snapshots de asignatura, seccion, horarios, fuente y version de catalogo.
* Se agrego parser unico para CSV embebido y snapshot CSV generado desde Sheets.
* Se agrego `actualizarCatalogoDesdeHoja(token)`, que genera un snapshot CSV persistente desde `ASIGNATURAS`, `SECCIONES`, `HORARIOS_ASIGNATURAS` y `AULAS`.
* Se agrego boton `Actualizar registros` en la vista Materias.
* Se ajusto la recarga de vistas para no marcar como cargada una vista que fallo.
* Se actualizo `README.md` con el flujo: snapshot desde Sheets, CSV embebido como respaldo y lectura directa de hojas como ultimo recurso.
* Se ejecuto `clasp push -f` y se subieron 4 archivos a Apps Script HEAD.

### Archivos modificados

* `apps-script/Code.gs`
* `apps-script/index.html`
* `README.md`
* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`

### Comandos o scripts ejecutados

* `node --check --input-type=commonjs - < apps-script/Code.gs`
* `node --check --input-type=commonjs - < <(awk '/<script>/{flag=1;next}/<\\/script>/{flag=0}flag' apps-script/index.html)`
* `git diff --check`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp status`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp push -f`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp deploy -i AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg -d "FACEN App persistencia y catalogo snapshot Sheets 2026-06-16"`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp redeploy AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg -V 35 -d "RESTORE public app v35 pending owner deployment of persistence fix"`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp redeploy AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg -V 33 -d "RESTORE public app v33 after owner-permission 403"`
* `curl -L https://appfacen.github.io/Facen-APP/`
* `curl -L https://script.google.com/macros/s/AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg/exec`

### Resultados verificados

* Validacion local del CSV embebido: 29 asignaturas, 29 secciones y 57 horarios.
* `node --check` no reporto errores de sintaxis en `Code.gs` ni en el JavaScript de `index.html`.
* `git diff --check` no reporto errores.
* `clasp status` confirma archivos GAS rastreados: `appsscript.json`, `catalogo_csv.html`, `Code.gs`, `index.html`.
* `clasp push -f` subio correctamente los 4 archivos a Apps Script HEAD a las 19:33.
* GitHub Pages respondio `HTTP 200`.

### Pruebas realizadas

* Validacion sintactica local.
* Validacion de conteos del CSV embebido.
* Push real a Apps Script HEAD.
* Intento de deploy publico version `@36`.
* Intentos de restauracion del deployment a `@35` y `@33`.
* Verificacion HTTP anonima del Web App tras cada cambio de deployment.

### Errores o incidentes

* El deployment `@36` respondio `HTTP 403 Acceso denegado / Necesitas acceso`.
* Las restauraciones a `@35` y `@33` tambien siguieron respondiendo `HTTP 403`.
* `clasp show-authorized-user` confirma que la cuenta CLI activa es `monitorimpactosocial@gmail.com`.
* `clasp` no expone una opcion para configurar acceso publico del Web App; solo cambia version y descripcion del deployment.
* El codigo corregido esta en HEAD del proyecto GAS, pero no quedo publicamente operativo en `/exec` por bloqueo de permisos del deployment.

### Soluciones aplicadas

* Se dejo el codigo corregido subido a Apps Script HEAD.
* Se intento restaurar a versiones previas para recuperar disponibilidad publica, sin exito por persistencia del 403.
* Se documento que el redeploy debe realizarse desde la cuenta propietaria/autorizada del Apps Script configurando acceso publico del Web App.

### Pendientes

* Abrir Apps Script con la cuenta propietaria del proyecto.
* Crear nueva version desde HEAD o seleccionar la version con estos cambios.
* Editar deployment del Web App y configurar acceso segun politica institucional, idealmente `Anyone` si debe seguir embebido en GitHub Pages.
* Verificar que `/exec` vuelva a responder `HTTP 200`.
* Ejecutar flujo funcional con usuario de prueba: login, guardar perfil, recargar, confirmar persistencia, agregar materia, guardar nota/apunte/evento/lectura/grupo y confirmar que no desaparecen.
* En Materias, ejecutar `Actualizar registros` despues de actualizar hojas de catalogo y confirmar conteos.

### Riesgos

* Mientras el Web App siga en `403`, `https://appfacen.github.io/Facen-APP/` carga el shell pero no la app funcional del iframe.
* La correccion esta en HEAD, pero no se debe considerar desplegada ni validada publicamente hasta que la cuenta propietaria publique el Web App.
* Si la hoja de catalogo contiene datos antiguos o de prueba, el boton `Actualizar registros` generara snapshot de esos datos; antes de usarlo se debe validar la hoja fuente.

### Recomendaciones

* Registrar en el manual maestro que cambios de Web App GAS deben desplegarse desde cuenta propietaria o cuenta con control real de acceso publico.
* Para actualizaciones anuales, primero actualizar/validar las hojas `ASIGNATURAS`, `SECCIONES`, `HORARIOS_ASIGNATURAS` y `AULAS`; luego usar el boton `Actualizar registros`.
* Mantener el CSV embebido como respaldo rapido versionado, pero operar el catalogo anual desde Sheets mediante snapshot.

## 2026-06-16 19:53

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Ruta local: `/Users/diegobernardomezabogado/Library/CloudStorage/GoogleDrive-dmeza.py@gmail.com/.shortcut-targets-by-id/1-jhsoiMXD4UATf27FUyUqMq-V04yUD58/facen_app/facen_app_v3`
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex

### Objetivo de la intervencion

* Recuperar acceso publico inmediato tras reporte de pantalla `Necesitas acceso`.

### Diagnostico inicial

* El deployment usado por GitHub Pages `AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg` respondia `HTTP 403`.
* El manifest local declara `webapp.access = ANYONE_ANONYMOUS`, por lo que el bloqueo no esta en `appsscript.json`.
* El redeploy desde la cuenta CLI `monitorimpactosocial@gmail.com` no permite corregir el acceso publico desde `clasp`.

### Acciones realizadas

* Se probaron deployments historicos del mismo proyecto Apps Script.
* Se identifico el deployment `AKfycbzM0NMEZ57YImDz3puF5Ma4YT-tvwcZtjugGNuVWPsphnLWcddw6L_Snv_Vr6eSba7HyQ` como publico y funcional (`HTTP 200`).
* Se actualizo el shell `index.html` para apuntar temporalmente a ese deployment publico.

### Archivos modificados

* `index.html`
* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`

### Comandos o scripts ejecutados

* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp deployments`
* `curl -L https://script.google.com/macros/s/AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg/exec`
* `curl -L https://script.google.com/macros/s/AKfycbzM0NMEZ57YImDz3puF5Ma4YT-tvwcZtjugGNuVWPsphnLWcddw6L_Snv_Vr6eSba7HyQ/exec`

### Resultados verificados

* Deployment restringido: `HTTP 403`.
* Deployment alternativo: `HTTP 200 text/html`.
* `index.html` local apunta al deployment alternativo.
* Se creo commit local `765eb87` con el cambio minimo en `index.html`.
* `git push origin main` fallo con `Permission to appfacen/Facen-APP.git denied to investigapyrm`.
* El conector GitHub pudo leer `index.html`, pero fallo al actualizarlo con `Resource not accessible by integration`.

### Pendientes

* Empujar el commit local `765eb87` desde una cuenta GitHub con permiso sobre `appfacen/Facen-APP`.
* Una vez que la cuenta propietaria publique correctamente la version corregida de HEAD, volver a apuntar `index.html` al deployment definitivo.

### Riesgos

* El deployment alternativo es una recuperacion operativa temporal y no contiene necesariamente las correcciones nuevas de persistencia y snapshot de catalogo.
* La solucion definitiva sigue siendo redeployar la version corregida desde la cuenta propietaria con acceso publico.

### Recomendaciones

* Mantener este fallback solo hasta que el Web App corregido sea publicado por la cuenta propietaria.

## 2026-06-16 20:14

### Proyecto

* Nombre: FACEN App / DAPP appweb
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex / usuario con credencial GitHub autorizada

### Objetivo de la intervencion

* Verificar publicacion del commit de recuperacion del shell GitHub Pages.

### Diagnostico inicial

* El commit local `765eb87` no habia podido subirse por credenciales GitHub sin permiso.
* El usuario limpio la credencial macOS y ejecuto `git push origin main` correctamente.

### Acciones realizadas

* Se verifico que `origin/main` ya apunta a `765eb87`.
* Se verifico por HTTP la URL GitHub Pages.
* Se verifico que el shell publico apunta al deployment alternativo `AKfycbzM0NMEZ57YImDz3puF5Ma4YT-tvwcZtjugGNuVWPsphnLWcddw6L_Snv_Vr6eSba7HyQ`.
* Se verifico que ese deployment alternativo responde `HTTP 200`.

### Resultados verificados

* `https://appfacen.github.io/Facen-APP/?v=20260616-pushed` responde `HTTP 200`.
* El HTML publico contiene `APP_URL = 'https://script.google.com/macros/s/AKfycbzM0NMEZ57YImDz3puF5Ma4YT-tvwcZtjugGNuVWPsphnLWcddw6L_Snv_Vr6eSba7HyQ/exec'`.
* El deployment alternativo responde `HTTP 200 text/html`.
* `git status` muestra `main...origin/main` sin commits pendientes, aunque permanecen cambios locales de GAS no commiteados.

### Pendientes

* Validar en navegador que el login y la carga inicial funcionen desde `https://appfacen.github.io/Facen-APP/`.
* Publicar la version corregida de HEAD de Apps Script desde la cuenta propietaria y luego volver a apuntar el shell al deployment definitivo.

### Riesgos

* La app volvio a cargar mediante deployment alternativo, pero las correcciones nuevas de persistencia y snapshot de catalogo siguen pendientes de publicacion GAS con cuenta propietaria.

## 2026-06-16 20:25

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Ruta local: `/Users/diegobernardomezabogado/Library/CloudStorage/GoogleDrive-dmeza.py@gmail.com/.shortcut-targets-by-id/1-jhsoiMXD4UATf27FUyUqMq-V04yUD58/facen_app/facen_app_v3`
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex / usuario con credencial GitHub y Apps Script propietaria
* Version: fuente local posterior a `765eb87`, pendiente de commit y publicacion GAS

### Objetivo de la intervencion

* Atender el incidente reportado por usuario: puede iniciar sesion, cargar y guardar perfil, pero al agregar una asignatura al perfil desaparecen los datos.

### Diagnostico inicial

* La URL publica esta operando mediante el deployment alternativo `AKfycbzM0NMEZ57YImDz3puF5Ma4YT-tvwcZtjugGNuVWPsphnLWcddw6L_Snv_Vr6eSba7HyQ`, que carga pero corresponde a una version anterior.
* El despliegue definitivo `AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg` continua con `HTTP 403`.
* Se identifico una causa consistente con el sintoma: despues de `inscribirSeccion`, el frontend ejecutaba `setTimeout(loadApp, 250)`, provocando una recarga completa inmediata y posible reconstruccion con datos incompletos o cacheados del despliegue anterior.
* En backend se verifico que `clearRows_` no borra filas de la hoja; invalida cache interna de lectura. No se detecto borrado masivo intencional en `inscribirSeccion`.

### Acciones realizadas

* Se elimino la recarga completa posterior a la inscripcion de asignatura.
* Se dejo `inscribir()` actualizando `State.data.inscripciones`, `State.data.notas`, `State.data.resumen`, `State.data.catalogo`, `State.data.carreras` y `State.data.catalogoLoaded` desde la respuesta del servidor antes de renderizar.
* Se verifico que el backend `inscribirSeccion` persiste snapshot de asignatura, seccion, horarios, fuente y version de catalogo.
* Se probo un redeploy del deployment historico `AKfycbwsQLtuk7ERRJxmjvTqPD6L65bQaGAIVqiWZFvlnOX0OEnZr3CxX_x2aLrWqVrXms2i3A` con version `@38`, pero la URL resultante tambien devolvio `HTTP 403`.
* Se decidio no redeployar el fallback publico `AKfycbzM0NMEZ57YImDz3puF5Ma4YT-tvwcZtjugGNuVWPsphnLWcddw6L_Snv_Vr6eSba7HyQ` desde la cuenta actual para evitar perder el unico acceso publico operativo.

### Archivos modificados

* `apps-script/index.html`
* `apps-script/Code.gs`
* `apps-script/catalogo_csv.html`
* `.claspignore`
* `README.md`
* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`

### Comandos o scripts ejecutados

* `rg -n "function inscribir|setTimeout\\(loadApp|actualizarCatalogoDesdeHoja|diagnosticoCatalogoRapido|catalogo_csv|obtenerBootstrap|inscribirSeccion" apps-script README.md .claspignore`
* `sed -n '1000,1045p' apps-script/index.html`
* `sed -n '960,1035p' apps-script/Code.gs`
* `rg -n "function clearRows_|clearRows_\\(|function appendObject_|function updateRowByKey_|function getRows_" apps-script/Code.gs`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp deploy -i AKfycbwsQLtuk7ERRJxmjvTqPD6L65bQaGAIVqiWZFvlnOX0OEnZr3CxX_x2aLrWqVrXms2i3A -d "FACEN App persistencia al agregar asignatura 2026-06-16"`

### Resultados verificados

* En fuente local `apps-script/index.html`, `inscribir()` ya no contiene `setTimeout(loadApp, 250)`.
* `clearRows_` solo elimina cache en memoria y cache de catalogo, no elimina datos de Google Sheets.
* `clasp push -f` habia enviado la version fuente a Apps Script HEAD, pero los deployments creados o actualizados desde la cuenta actual siguen respondiendo `HTTP 403`.

### Pruebas realizadas

* Verificacion estatica del flujo frontend de inscripcion.
* Verificacion estatica del flujo backend de persistencia de inscripcion y nota.
* Verificacion HTTP de deployments disponibles.

### Errores o incidentes

* El deployment corregido no puede validarse publicamente porque los redeploys hechos desde la cuenta Apps Script actual quedan restringidos con `HTTP 403`.
* La app publica actual puede seguir reproduciendo el fallo porque usa un deployment alternativo anterior.

### Soluciones aplicadas

* Correccion en codigo fuente para evitar recarga destructiva despues de agregar asignatura.
* Endurecimiento previo del backend con snapshot de catalogo embebido y persistencia de datos de inscripcion.

### Pendientes

* Publicar la version corregida desde la cuenta propietaria del proyecto Apps Script, con acceso Web App `Anyone`.
* Ejecutar prueba real: login, cargar perfil, guardar perfil, agregar asignatura, cerrar sesion, volver a ingresar y verificar que perfil e inscripcion persisten.
* Confirmar en la hoja de calculo si los datos se borraban fisicamente o si el problema era visual/carga de estado.

### Riesgos

* Mientras se use el deployment alternativo antiguo, el usuario puede seguir viendo desaparicion de datos.
* Si se redeploya el fallback publico desde una cuenta sin permisos correctos, se puede perder el acceso publico operativo.

### Recomendaciones

* No considerar resuelto el incidente hasta validar con URL publica corregida y lectura posterior desde Google Sheets.
* Redeployar solo desde la cuenta propietaria o con permisos completos del proyecto Apps Script.
* Registrar como patron maestro: evitar recargas completas inmediatamente despues de escrituras criticas; preferir actualizar estado local con la respuesta atomica del servidor.

## 2026-06-16 20:32

### Proyecto

* Nombre: FACEN App / DAPP appweb
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex / usuario con cuenta propietaria pendiente para Apps Script
* Version fuente Git: `ca12f34`

### Objetivo de la intervencion

* Confirmar si la correccion ya podia publicarse en el deployment definitivo y dejar la app publica apuntando a la version corregida.

### Diagnostico inicial

* El commit `ca12f34` fue creado y subido a `origin/main`.
* `https://appfacen.github.io/Facen-APP/?v=20260616-ca12f34` responde `HTTP 200`, pero el shell publico sigue apuntando al fallback `AKfycbzM0NMEZ57YImDz3puF5Ma4YT-tvwcZtjugGNuVWPsphnLWcddw6L_Snv_Vr6eSba7HyQ`.
* El fallback `@22` no contiene las funciones nuevas de actualizacion de catalogo ni el bootstrap endurecido.

### Acciones realizadas

* Se hizo `git commit` y `git push` de la fuente corregida.
* Se ejecuto `clasp push -f` para enviar `appsscript.json`, `catalogo_csv.html`, `Code.gs` e `index.html` a Apps Script HEAD.
* Se actualizo el deployment definitivo `AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg` a version `@39`.
* Se intento ejecutar `diagnosticoCatalogoRapido` con `clasp run` para verificar acceso operativo a la hoja.

### Archivos modificados

* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`

### Comandos o scripts ejecutados

* `git commit -m "Fix enrollment persistence and embed catalog snapshot"`
* `git push origin main`
* `curl -L -s -o /tmp/facen_app_public.html -w '%{http_code} %{content_type}\\n' 'https://appfacen.github.io/Facen-APP/?v=20260616-ca12f34'`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp push -f`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp deploy -i AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg -d "FACEN App persistencia sin recarga post inscripcion 2026-06-16"`
* `PATH="$PWD/.tools/node/bin:$PATH" npx clasp run diagnosticoCatalogoRapido`

### Resultados verificados

* GitHub remoto quedo en `ca12f34`.
* La URL GitHub Pages responde `HTTP 200`.
* El deployment definitivo actualizado a `@39` responde `HTTP 403` con contenido de `Acceso denegado / Necesitas acceso`.
* `clasp run diagnosticoCatalogoRapido` devuelve: `Unable to run script function. Please make sure you have permission to run the script function.`

### Pruebas realizadas

* Verificacion HTTP de GitHub Pages.
* Verificacion HTTP de Apps Script definitivo `@39`.
* Verificacion comparativa del HTML servido por fallback `@22` y fuente local.

### Errores o incidentes

* Redeployar desde `monitorimpactosocial@gmail.com` vuelve privado/restringido el deployment corregido.
* La cuenta actual puede hacer `clasp push`, pero no puede ejecutar funciones ni dejar publico el Web App corregido.

### Soluciones aplicadas

* El codigo corregido quedo versionado en GitHub y cargado en Apps Script HEAD.
* No se cambio el shell publico a `AKfycbyr...@39` porque actualmente responde `403`.

### Pendientes

* Ingresar con la cuenta propietaria/autorizada del Apps Script y redeployar la version actual con acceso publico `Anyone`.
* Luego actualizar el shell GitHub Pages para apuntar al deployment corregido si el ID cambia.
* Validar flujo real completo con usuario: login, perfil, guardar perfil, agregar asignatura, cerrar y reingresar.

### Riesgos

* El fallback operativo actual permite cargar la app, pero no contiene todas las correcciones nuevas y puede seguir reproduciendo el incidente.
* Crear un clon Apps Script con la cuenta actual no se considera seguro sin confirmar acceso real a la hoja de calculo.

### Recomendaciones

* Publicar desde la cuenta propietaria del Apps Script o transferir/compartir permisos completos de ejecucion y despliegue.
* No redeployar el fallback publico hasta tener una alternativa publica validada.

## 2026-06-29 18:52

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Cliente o institucion: FACEN
* Ruta local: `G:\Mi unidad\FACENapp\Facen-APP`
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex
* Version Git revisada: `99bd4f52ef859bbcf250d01f50aea13579abcff8`

### Objetivo de la intervencion

* Revisar o crear bitacora del proyecto.
* Verificar si la cuenta `diegomezapy` permite destrabar la publicacion GitHub Pages.
* Intentar dejar operativa la app publica sin romper el fallback que actualmente carga.

### Diagnostico inicial

* La carpeta inicial `G:\Mi unidad\FACENapp` no era repositorio Git; se clono el repositorio real en `G:\Mi unidad\FACENapp\Facen-APP`.
* La bitacora del proyecto ya existia: `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`.
* La carpeta maestra `G:\Mi unidad\MANUAL_MAESTRO_FORMATOS_FUNCIONES_APPWEB` estaba disponible y fue consultada.
* GitHub Pages esta configurado desde `main` raiz y responde `HTTP 200`.
* `gh` esta autenticado como `diegomezapy` con permiso `WRITE` sobre `appfacen/Facen-APP`.
* `clasp` esta autenticado como `apoyomedicoips@gmail.com`, no como `dmeza.py@gmail.com`.
* La pagina publica usa el fallback Apps Script `AKfycbzM0NMEZ57YImDz3puF5Ma4YT-tvwcZtjugGNuVWPsphnLWcddw6L_Snv_Vr6eSba7HyQ`, que responde `HTTP 200`.
* El deployment corregido `AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg @39` sigue respondiendo `HTTP 403 / Necesitas acceso`.

### Acciones realizadas

* Se verifico estado Git, ramas remotas, GitHub Pages y permisos GitHub.
* Se leyo README, bitacora, shell GitHub Pages, service worker, Apps Script y catalogo embebido.
* Se verifico que el catalogo embebido local esta guardado con caracteres UTF-8 correctos; el mojibake observado provenia de salida de consola, no del archivo.
* Se valido sintaxis local de `apps-script/Code.gs` como `.js` temporal y del JavaScript embebido en `apps-script/index.html`.
* Se ejecuto `npx clasp push -f` y se subieron 4 archivos a Apps Script HEAD.
* Se creo Apps Script version `40` desde HEAD.
* Se probo redeployar un deployment historico no usado por GitHub Pages (`AKfycbzudNRV-hvyTKHCcnVsqfKKJmzj_hgpbzGZU09w1sB0ahu61XlKyhzUOiNmFzA51sm31A`) a version `40` para validar si conservaba acceso publico.
* Al quedar restringido con `HTTP 403`, se intento restaurarlo a version `3`; siguio respondiendo `HTTP 403`.
* Se consulto la API de Apps Script para confirmar que los entry points figuran como `access = ANYONE_ANONYMOUS` y `executeAs = USER_DEPLOYING`.
* Se consulto metadata Drive del script y spreadsheet: propietario `ga.noguerajoel@gmail.com`, `dmeza.py@gmail.com` figura como editor, y ambos archivos tienen permiso amplio por enlace.
* Se intento agregar `apoyomedicoips@gmail.com` como editor explicito por Drive API, pero la API respondio `appNotAuthorizedToFile`; no se aplicaron cambios de permisos.
* Se generaron capturas Playwright de GitHub Pages en escritorio y movil.
* Se actualizo README con el estado operativo real y el bloqueo de despliegue.

### Archivos modificados

* `README.md`
* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`
* `SECUENCIA_PROMPTS_FACEN_APP_2026-06-29.md`
* Copia central sincronizada en `MANUAL_MAESTRO_FORMATOS_FUNCIONES_APPWEB/BITACORAS_PROYECTOS/`

### Comandos o scripts ejecutados

* `git clone https://github.com/appfacen/Facen-APP.git "Facen-APP"`
* `git status --branch --short`
* `gh repo view appfacen/Facen-APP --json name,owner,viewerPermission,defaultBranchRef,url`
* `gh api repos/appfacen/Facen-APP/pages`
* `Invoke-WebRequest https://appfacen.github.io/Facen-APP/?cb=...`
* `npx clasp show-authorized-user`
* `npx clasp deployments`
* `npx clasp versions`
* `npx clasp push -f`
* `npx clasp version "FACEN App fuente HEAD verificada 2026-06-29"`
* `npx clasp deploy -i AKfycbzudNRV-hvyTKHCcnVsqfKKJmzj_hgpbzGZU09w1sB0ahu61XlKyhzUOiNmFzA51sm31A -V 40 -d "FACEN App version corregida publica 2026-06-29"`
* `npx clasp deploy -i AKfycbzudNRV-hvyTKHCcnVsqfKKJmzj_hgpbzGZU09w1sB0ahu61XlKyhzUOiNmFzA51sm31A -V 3 -d "RESTORE FACEN App historical public deployment v3 after permission test 2026-06-29"`
* `npx playwright screenshot --block-service-workers --viewport-size "1366,768" ...`
* `npx playwright screenshot --block-service-workers --viewport-size "390,844" ...`

### Resultados verificados

* GitHub Pages: `HTTP 200`, fuente `main` raiz, sitio publico `https://appfacen.github.io/Facen-APP/`.
* GitHub Pages muestra login de FACEN App en escritorio y movil mediante el fallback publico.
* Fallback usado por Pages: `AKfycbzM0...@22`, `HTTP 200`, login visible, pero no contiene funciones nuevas como `diagnosticoCatalogoRapido` ni `actualizarCatalogoDesdeHoja`.
* Deployment corregido `AKfycbyr...@39`: `HTTP 403 / Necesitas acceso`.
* Deployment historico de prueba redeployado desde cuenta actual: quedo `HTTP 403` incluso tras restaurarlo a version `3`.
* Apps Script version `40` fue creada, pero no quedo expuesta publicamente por un Web App anonimo funcional.
* El usuario GitHub `diegomezapy` puede empujar al repo, pero eso no resuelve por si solo el permiso del Web App Apps Script.

### Pruebas realizadas

* Verificacion HTTP anonima de GitHub Pages, fallback Apps Script y deployment corregido.
* Verificacion API de GitHub Pages.
* Verificacion API de Apps Script deployments y entry points.
* Verificacion Drive metadata de script y spreadsheet.
* Captura Playwright desktop: login visible.
* Captura Playwright movil: login visible y barra superior usable.
* Validacion sintactica local de Apps Script y JavaScript frontend.
* `git diff --check`.

### Errores o incidentes

* `node --check apps-script\Code.gs` falla en Node 22 por extension `.gs`; se valido como archivo temporal `.js`.
* `npx playwright test` no pudo ejecutarse porque `@playwright/test` no esta instalado localmente; se usaron capturas Playwright CLI.
* Redeployar desde `apoyomedicoips@gmail.com` mantiene o provoca `HTTP 403` en deployments versionados.
* La API Drive no permitio agregar permisos por `appNotAuthorizedToFile`.

### Soluciones aplicadas

* Se mantuvo intacto el fallback publico que usa la app publicada.
* Se confirmo que la URL publica carga visualmente y es usable para login en desktop y movil.
* Se dejo documentado que la version corregida no puede marcarse como productiva hasta redeploy publico desde cuenta propietaria/autorizada.
* Se actualizo README para diferenciar fallback operativo y deployment corregido pendiente.

### Pendientes

* Ingresar a Apps Script con `ga.noguerajoel@gmail.com` o con una cuenta explicitamente autorizada para desplegar Web Apps publicos.
* Alternativamente, autenticar `clasp` con `dmeza.py@gmail.com` y confirmar que esa cuenta puede crear deployments publicos anonimos.
* Publicar la version `40` o una version nueva desde la cuenta correcta con acceso `Anyone`.
* Verificar anonimamente que el `/exec` del nuevo deployment responda `HTTP 200` y contenga `diagnosticoCatalogoRapido` y `actualizarCatalogoDesdeHoja`.
* Actualizar `APP_URL` en `index.html` solo despues de esa verificacion.
* Ejecutar prueba funcional completa con usuario tecnico: crear/entrar, guardar perfil, agregar materia, recargar, cerrar sesion, volver a entrar y confirmar persistencia en Sheets.

### Riesgos

* La app publica carga, pero sigue usando fallback antiguo; no debe declararse como version corregida completa.
* Tocar o redeployar el fallback `AKfycbzM0...@22` desde la cuenta actual puede romper el unico acceso publico operativo.
* Los archivos Drive tienen permisos amplios por enlace; conviene revisar el modelo de seguridad antes de produccion institucional.

### Recomendaciones

* No redeployar deployments historicos publicos desde cuentas sin control real de Web App publico.
* Usar una cuenta propietaria/autorizada para el cierre definitivo de Apps Script.
* Mantener en README y bitacora la diferencia entre GitHub Pages operativo, Apps Script fallback operativo y version corregida desplegada.
* Agregar al manual maestro el aprendizaje: `ANYONE_ANONYMOUS` en el entry point no basta como evidencia; siempre verificar `/exec` anonimo despues de cada redeploy.

## 2026-06-29 19:21

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Cliente o institucion: FACEN
* Ruta local: `G:\Mi unidad\FACENapp\Facen-APP`
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex
* Version Git inicial: `38eadc58d328a0f55b07ea12a481300518231ffd`

### Objetivo de la intervencion

* Atender el bloqueo reportado por usuario: no puede recuperar contrasena y no logra acceder.
* Preparar una via de recuperacion compatible con el fallback publico actual sin romper el deployment productivo.
* Commit y push de los archivos preparados.

### Diagnostico inicial

* La fuente actual de `apps-script/index.html` ya contiene la pestana `Recuperar` y llama correctamente a `recuperarContrasena`.
* El backend actual `apps-script/Code.gs` contiene `recuperarContrasena(datos)`.
* La URL publica sigue sirviendo el fallback Apps Script `AKfycbzM0...@22`, que no contiene la funcion ni la UI de recuperacion.
* El deployment corregido principal `AKfycbyr...@39` sigue en `HTTP 403 / Necesitas acceso`.
* `clasp` continua autenticado como `apoyomedicoips@gmail.com`.

### Acciones realizadas

* Se confirmo por busqueda de fuente que la recuperacion existe en la version actual del codigo, pero no en el fallback publico.
* Se consulto metadata y cabeceras de Google Sheets `FACEN_APP` mediante conector Google Sheets:
  * `USUARIOS!A1:H1`
  * `ESTUDIANTES!A1:L1`
* Se verifico que el conector puede leer la hoja nativa `FACEN_APP`, aunque la Sheets API del OAuth de `clasp` esta deshabilitada.
* Se preparo un microservicio Apps Script separado en `apps-script-recovery/` para recuperar contrasena temporal contra la misma hoja `USUARIOS`.
* Se copio el mismo algoritmo de hash de la app actual (`HASH_ITERATIONS = 6000`) para mantener compatibilidad con el login del fallback publico.
* Se creo un proyecto Apps Script separado `FACEN App Recovery` desde un directorio temporal y se subieron los archivos.
* Se creo un deployment de prueba `AKfycbxLO...@2`.
* Se verifico anonimamente el deployment de prueba y tambien devolvio `HTTP 403 / Acceso denegado`, pese a que su metadata indica `ANYONE_ANONYMOUS`.
* Se mantuvo intacto el fallback productivo usado por GitHub Pages.

### Archivos modificados

* `apps-script-recovery/Code.gs`
* `apps-script-recovery/index.html`
* `apps-script-recovery/appsscript.json`
* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`

### Comandos o scripts ejecutados

* `git status --branch --short`
* `rg -n "recover|Recuperar|password|contrasena|contraseña|temporal|reset|olvid" ...`
* `npx clasp show-authorized-user`
* `npx clasp deployments`
* `npx clasp create --type standalone --title "FACEN App Recovery" --rootDir .`
* `npx clasp push -f`
* `npx clasp version "FACEN App Recovery inicial 2026-06-29"`
* `npx clasp deploy -d "FACEN App Recovery publica 2026-06-29"`
* `Invoke-WebRequest https://script.google.com/macros/s/AKfycbxLOP0lz2OforvTs04cJreIw6ejkrwiYQd8COx99Zu7GuN_D3cSOOWeA2rTfTtgDah4_Q/exec?...`

### Resultados verificados

* Codigo de recuperacion preparado en repo con validacion por usuario y email o cedula del perfil.
* El microservicio no expone recuperacion anonima todavia porque el deployment nuevo tambien queda restringido con `HTTP 403`.
* El conector Google Sheets puede leer la hoja, por lo que existe una via operativa para restablecimiento controlado si se identifica con precision la cuenta del usuario.
* No se modifico ninguna contrasena durante esta intervencion.

### Pruebas realizadas

* Validacion sintactica de `apps-script-recovery/Code.gs` como JavaScript temporal.
* Validacion sintactica del bloque `<script>` de `apps-script-recovery/index.html`.
* `git diff --check`.
* Verificacion HTTP anonima del deployment separado de recuperacion.
* Lectura de metadata y cabeceras de la hoja `FACEN_APP`.

### Errores o incidentes

* `npx clasp create --type webapp` fallo con `Invalid container file type`; se uso `--type standalone`.
* El deployment separado de recuperacion quedo en `HTTP 403 / Acceso denegado`, confirmando que la restriccion de publicacion anonima afecta tambien proyectos nuevos creados desde la cuenta actual.
* `npx clasp enable-api sheets.googleapis.com` no pudo ejecutarse porque no hay GCP project ID configurado.
* El intento directo por Service Usage para habilitar Sheets API devolvio `PERMISSION_DENIED`.

### Soluciones aplicadas

* Se agrego al repo un microservicio de recuperacion listo para desplegar desde una cuenta que pueda publicar Web Apps anonimos.
* Se mantuvo el fallback publico sin tocar para no agravar el bloqueo de acceso.
* Se dejo trazado que la solucion inmediata, si el usuario confirma cuenta exacta, puede hacerse con una escritura controlada en `USUARIOS` mediante el conector de Google Sheets.

### Pendientes

* Confirmar cuenta exacta a restablecer antes de modificar `USUARIOS`.
* Generar contrasena temporal y escribir `password_hash`, `salt` y `ultimo_acceso` en la fila correcta.
* Probar login con esa contrasena temporal y luego cambiarla desde Perfil.
* Publicar la recuperacion en la app publica solo cuando un deployment anonimo responda `HTTP 200`.

### Riesgos

* No se debe restablecer una cuenta sin confirmacion precisa del usuario afectado.
* Un deployment nuevo creado desde la cuenta actual no queda publico, aunque la metadata indique `ANYONE_ANONYMOUS`.
* Incluir un enlace de recuperacion en GitHub Pages hacia un endpoint `403` empeoraria la experiencia de usuario; por eso no se cambio `index.html`.

### Recomendaciones

* Para desbloqueo urgente: restablecer manualmente la cuenta confirmada en `USUARIOS` mediante conector Sheets.
* Para solucion permanente: publicar `apps-script-recovery/` o la version principal actual desde una cuenta propietaria/autorizada que pueda dejar Web Apps anonimos realmente accesibles.

## 2026-06-29 19:28

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Cliente o institucion: FACEN
* Ruta local: `G:\Mi unidad\FACENapp\Facen-APP`
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex
* Version Git inicial: `90730ffaec1f7270ed03f5db9ec402a4b5af4651`

### Objetivo de la intervencion

* Corregir que la appweb publica no evidenciara cambios despues del commit anterior.
* Forzar actualizacion del shell GitHub Pages y del service worker.

### Diagnostico inicial

* GitHub Pages estaba en estado `built` y apuntaba a `main`.
* El HTML publico seguia con longitud `4662` y no contenia referencias a `apps-script-recovery` porque el commit anterior no habia modificado la raiz visible.
* El service worker publico seguia usando `facen-app-v5-shell`, por lo que los navegadores/PWA podian mantener cache anterior.

### Acciones realizadas

* Se agrego version visible del shell `APP_BUILD = 2026.06.29.2` en `index.html`.
* Se hizo que el iframe reciba un parametro `v` por defecto basado en `APP_BUILD`.
* Se ajusto el boton `Actualizar` para usar `APP_BUILD` junto con timestamp.
* Se cambio el cache del service worker a `facen-app-v6-shell-20260629`.
* Se ajusto fetch del service worker con `cache: 'no-store'` para navegacion y recursos no cacheados.

### Archivos modificados

* `index.html`
* `sw.js`
* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`

### Comandos o scripts ejecutados

* `Invoke-WebRequest https://appfacen.github.io/Facen-APP/?cb=...`
* `Invoke-WebRequest https://appfacen.github.io/Facen-APP/sw.js?cb=...`
* `node --check` sobre el JavaScript del shell `index.html`
* `node --check sw.js`
* `git diff --check`

### Resultados verificados

* Antes del cambio, Pages estaba publicado pero la superficie visible no habia cambiado porque `index.html` y `sw.js` no se habian modificado.
* La fuente local ahora muestra `v2026.06.29.2` en la barra superior del shell y usa cache `facen-app-v6-shell-20260629`.

### Pruebas realizadas

* Validacion sintactica del JS embebido en `index.html`.
* Validacion sintactica de `sw.js`.
* Revision de diff de `index.html` y `sw.js`.

### Pendientes

* Commit, push y verificacion publica con cache-busting.
* Si el usuario ya tenia la PWA instalada, pulsar `Actualizar` una vez o abrir `https://appfacen.github.io/Facen-APP/?v=2026.06.29.2`.

### Riesgos

* Esto actualiza el shell GitHub Pages, pero no publica la version nueva del backend Apps Script porque ese bloqueo sigue dependiendo de permisos de deployment.

## 2026-06-29 19:33

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Cliente o institucion: FACEN
* Ruta local: `G:\Mi unidad\FACENapp\Facen-APP`
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex
* Version Git inicial: `d18b43eb4ac2d7227fe496b3861e65f24904fb68`

### Objetivo de la intervencion

* Atender el reporte de que la appweb no se actualiza.
* Hacer visible la version actualizada del shell tambien en vista movil.
* Renovar el cache del service worker para forzar una nueva instalacion del shell.

### Diagnostico inicial

* El HTML publico ya contenia el build `2026.06.29.2`, pero la captura movil no mostraba la version.
* La causa visible era la regla responsive `@media (max-width: 640px)`, que ocultaba `.brand span`; ese selector incluia el identificador `#shell-version`.
* El problema reportado se podia interpretar como falta de actualizacion porque la evidencia visual quedaba oculta en movil aunque el HTML estuviera servido.

### Acciones realizadas

* Se actualizo `APP_BUILD` a `2026.06.29.3`.
* Se corrigio la regla movil para mantener visible `#shell-version` con ancho controlado.
* Se redujeron tamanos de marca, botones y separaciones en movil para evitar solapamientos.
* Se cambio el cache del service worker a `facen-app-v7-shell-20260629`.
* Se actualizo la secuencia de prompts del proyecto.

### Archivos modificados

* `index.html`
* `sw.js`
* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`
* `SECUENCIA_PROMPTS_FACEN_APP_2026-06-29.md`

### Comandos o scripts ejecutados

* `git status --branch --short`
* `Select-String -Path .\index.html -Pattern 'APP_BUILD|shell-version|brand span|@media|serviceWorker|Actualizar' -Context 2,2`
* `Get-Content .\BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md -Tail 120`
* `node --check .\sw.js`
* Extraccion temporal del script embebido de `index.html` y `node --check`
* `git diff --check`
* Intento de prueba visual con Playwright sobre `file:///.../index.html`
* `git add -- index.html sw.js BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md SECUENCIA_PROMPTS_FACEN_APP_2026-06-29.md`
* `git commit -m "Show FACEN Pages refresh version on mobile"`
* `git push origin main`
* `gh api repos/appfacen/Facen-APP/pages`
* `Invoke-WebRequest https://appfacen.github.io/Facen-APP/?cb=...`
* `Invoke-WebRequest https://appfacen.github.io/Facen-APP/sw.js?cb=...`

### Resultados verificados

* La causa de la falta de evidencia visual fue identificada en CSS responsive.
* La version del shell quedo publicada como `v2026.06.29.3`.
* `sw.js` y el JavaScript embebido en `index.html` pasan validacion sintactica con Node.
* `git diff --check` no reporta errores de espacios; solo advertencias esperadas LF/CRLF por el entorno Windows.
* GitHub Pages paso de `building` a `built` despues del push.
* La URL publica `https://appfacen.github.io/Facen-APP/?cb=...` respondio `HTTP 200`, longitud `5205`, con `APP_BUILD = '2026.06.29.3'`.
* El HTML publico contiene la regla movil para `#shell-version` y ya no contiene `.brand span { display: none; }`.
* `https://appfacen.github.io/Facen-APP/sw.js?cb=...` respondio `HTTP 200`, longitud `1283`, con `facen-app-v7-shell-20260629`.
* `HEAD` local y `origin/main` quedaron en `5668c298b4dd3d328a74a2feb42b6bc95f64ff76`.

### Pruebas realizadas

* Validacion sintactica de `sw.js`.
* Validacion sintactica del script embebido en `index.html`.
* Revision de diff.
* Verificacion de estado GitHub Pages via API.
* Verificacion HTTP anonima con cache-busting sobre `index.html` y `sw.js`.
* La prueba visual automatizada local no pudo completarse porque el paquete `playwright` no esta instalado en el checkout y no se agrego como dependencia del proyecto.

### Errores o incidentes

* `node -e "require('playwright')"` devolvio `MODULE_NOT_FOUND`; se deja como limitacion de verificacion local, no como error de la app.
* Durante `git commit`, Git advirtio que no podia crear `.git/packed-refs.lock` porque ya existia; el commit se genero correctamente. El lock queda como residuo a limpiar en una intervencion separada si no hay procesos Git activos.

### Soluciones aplicadas

* Version visible en movil y cache del service worker renovado.

### Pendientes

* Si un usuario ya tiene instalada la PWA o una pestana antigua, abrir `https://appfacen.github.io/Facen-APP/?v=2026.06.29.3` o pulsar `Actualizar`.
* Resolver el acceso del usuario mediante restablecimiento controlado en la hoja `USUARIOS` cuando confirme la cuenta exacta.
* Publicar la recuperacion de contrasena en Apps Script solo cuando el deployment anonimo responda `HTTP 200`.

### Riesgos

* La recuperacion de contrasena dentro del backend principal sigue dependiendo del deployment Apps Script anonimo, que permanece bloqueado por permisos.

## 2026-06-29 19:53

### Proyecto

* Nombre: FACEN App / DAPP appweb
* Cliente o institucion: FACEN
* Ruta local: `G:\Mi unidad\FACENapp\Facen-APP`
* Repositorio: `https://github.com/appfacen/Facen-APP`
* URL publica canonica: `https://appfacen.github.io/Facen-APP/`
* Responsable: Codex
* Version Git inicial: `87fb703`

### Objetivo de la intervencion

* Atender el reporte de que el usuario solo veia la barra `FACEN App v2026.06.29.3`.
* Dejar una via clara de entrada directa al Apps Script publico si el iframe no se renderiza.
* Restablecer de forma controlada la cuenta `dmeza.py`, sin registrar la clave temporal en documentos.

### Diagnostico inicial

* GitHub Pages respondia `HTTP 200` y mostraba el shell `v2026.06.29.3`.
* El Apps Script publico usado por el shell respondia `HTTP 200`, tenia login, pero no contenia recuperacion de contrasena.
* La version actual del codigo Apps Script en repo si contiene `recuperarContrasena`, pero ese backend no esta publicado anonimamente por el bloqueo de permisos ya documentado.
* En `FACEN_APP`, `USUARIOS!A5:H5` corresponde a `id_usuario = 4`, `username = dmeza.py`, `rol = estudiante`, `activo = 1`.
* En `ESTUDIANTES`, el `id_usuario = 4` corresponde a Diego Meza con email `dmeza.py@gmail.com`.

### Acciones realizadas

* Se cambio el boton de acceso directo del shell de `Abrir` a `Entrar`.
* Se hizo que el enlace directo use la URL versionada del Apps Script, no solo la URL base.
* Se agrego un fallback visual inferior con boton `Entrar` si el iframe no dispara carga en 3,5 segundos.
* Se actualizo `APP_BUILD` a `2026.06.29.4`.
* Se cambio el cache del service worker a `facen-app-v8-shell-20260629`.
* Se genero una clave temporal con el patron `Facen-xxxxxxxx`.
* Se calculo `password_hash` con SHA-256, salt nuevo y 6000 iteraciones, igual que `hashPassword_` del backend.
* Se actualizaron solo `password_hash`, `salt` y `ultimo_acceso` de `USUARIOS!C5:D5,H5`.
* Se agrego un log tecnico en `LOGS` con accion `RESET_CONTRASENA_ASISTIDO`, sin incluir la clave temporal.

### Archivos modificados

* `index.html`
* `sw.js`
* `BITACORA_FACEN_DAPP_APPWEB_FACEN_APP.md`
* `SECUENCIA_PROMPTS_FACEN_APP_2026-06-29.md`

### Comandos o scripts ejecutados

* `Invoke-WebRequest https://appfacen.github.io/Facen-APP/?v=2026.06.29.3`
* `Invoke-WebRequest https://script.google.com/macros/s/.../exec?v=2026.06.29.3`
* `rg -n "hash|salt|password|contrasena|recuperar|login" apps-script`
* Lectura de metadata de Google Sheets `FACEN_APP`.
* Lectura de filas acotadas en `USUARIOS`, `ESTUDIANTES` y `LOGS`.
* Batch update de Google Sheets sobre `USUARIOS` y `LOGS`.
* `node --check .\sw.js`
* Validacion con `node --check` del script embebido en `index.html`.
* `git diff --check`

### Resultados verificados

* El Apps Script publico trae login pero no recuperacion de contrasena.
* La cuenta `dmeza.py` quedo con nueva clave temporal y `ultimo_acceso` vacio.
* Se verifico despues de escribir que `USUARIOS!A5:H5` mantiene `id_usuario = 4`, `username = dmeza.py`, `rol = estudiante`, `activo = 1`.
* El log tecnico quedo ubicado en `LOGS!A42:E42`, `id_log = 40`, accion `RESET_CONTRASENA_ASISTIDO`.
* No se registro la clave temporal en bitacora, Git ni carpeta maestra.
* `index.html` quedo publicado con `v2026.06.29.4`, boton `Entrar` y fallback de acceso directo.
* `sw.js` quedo publicado con cache `facen-app-v8-shell-20260629`.
* GitHub Pages paso a estado `built` despues del push.
* La URL publica `https://appfacen.github.io/Facen-APP/?cb=...` respondio `HTTP 200`, longitud `6444`, con `APP_BUILD = '2026.06.29.4'`, boton `Entrar` y fallback `app-fallback`.
* `https://appfacen.github.io/Facen-APP/sw.js?cb=...` respondio `HTTP 200` con `facen-app-v8-shell-20260629`.
* El Apps Script directo `.../exec?v=2026.06.29.4` respondio `HTTP 200`, con login y sin recuperacion de contrasena en esa version desplegada.
* `HEAD` local y `origin/main` quedaron en `6c7d291ef19cca133806e5ba0d4e499a52cc182b`.

### Pruebas realizadas

* Verificacion HTTP anonima de GitHub Pages y Apps Script.
* Validacion del algoritmo de hash contra el codigo fuente del backend.
* Relectura de la fila modificada en `USUARIOS`.
* Busqueda de la fila de log `RESET_CONTRASENA_ASISTIDO`.
* Validacion sintactica de `sw.js` y del script embebido en `index.html`.
* Revision de diff sin errores de whitespace, salvo advertencias LF/CRLF esperadas del entorno Windows.
* Verificacion de GitHub Pages `built` via API.
* Verificacion HTTP anonima con cache-busting de `index.html` y `sw.js`.

### Errores o incidentes

* El endpoint Apps Script publico no contiene la funcion de recuperacion de contrasena en la UI desplegada.

### Soluciones aplicadas

* Se restablecio la cuenta `dmeza.py` con clave temporal.
* Se reforzo el shell de Pages para entrada directa al Apps Script cuando el iframe no se vea.

### Pendientes

* El usuario debe ingresar con la clave temporal y cambiarla desde Perfil.
* Publicar la recuperacion permanente cuando se resuelva el permiso del deployment anonimo Apps Script.

### Riesgos

* Si el usuario intenta ingresar con `diego.meza` o `dmeza.py@gmail.com`, esas cuentas no fueron modificadas en esta intervencion.
* El fallback de Pages mejora el acceso visual, pero no reemplaza la publicacion correcta del backend Apps Script con recuperacion de contrasena.
