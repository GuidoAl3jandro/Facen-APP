# SECUENCIA_PROMPTS_FACEN_APP_2026-06-29

Ultima edicion: 2026-06-29 18:52 America/Asuncion

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
