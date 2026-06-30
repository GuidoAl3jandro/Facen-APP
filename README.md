# FACEN App v4

Agenda academica instalable y optimizada para estudiantes de FACEN.

## Que incluye

- Registro e inicio de sesion con token propio por navegador.
- Seleccion de asignaturas y secciones cursadas.
- Vista de horario con aulas asignadas.
- Agenda editable de clases, examenes, entregas y reuniones.
- Salas, edificios y enlaces de mapa por actividad.
- Preferencias de alertas por tipo de actividad.
- Seccion Mis companeros con contacto opt-in y creacion rapida de grupos de estudio.
- Registro de notas personales por inscripcion.
- Apuntes, lecturas, grupos de estudio, recordatorios y enlaces por estudiante.
- Perfil academico editable.
- Boton en Materias para actualizar asignaturas y horarios desde Google Sheets.
- Interfaz responsive para PC y movil, con shell PWA instalable desde GitHub Pages.
- Inicializacion de hojas desde Apps Script.

## Instalacion en Apps Script

1. Crear o abrir el proyecto de Apps Script.
2. Subir los archivos de `apps-script/`: `Code.gs`, `index.html` y `appsscript.json`.
3. El archivo `apps-script/Code.gs` ya apunta al spreadsheet `1bxqwZy6cW1gGdPGtRyWDn52WdmbMpiMKvLjA6X2lFmc`.
4. Ejecutar `setupFacenAppV4()` una vez desde el editor, o abrir la app para que cree automaticamente las hojas faltantes.
5. Publicar como Web App.

El despliegue puede ser anonimo porque la aplicacion maneja sesiones por token propio. Si la institucion requiere cuentas Google, se puede cambiar el modo de acceso y conservar la misma logica de permisos.

## Proyecto desplegado

- Spreadsheet: `https://docs.google.com/spreadsheets/d/1bxqwZy6cW1gGdPGtRyWDn52WdmbMpiMKvLjA6X2lFmc/edit`
- Apps Script: `https://script.google.com/d/1mXbo3LGQwW6S3wKtAcCyMHPBDHkm0KFRXaRpBbAcdNAM-8hr5z9FfLZT/edit`
- Web app deployment actualmente usado por GitHub Pages: `AKfycbxPW313JYFjjRodLkOEPl6xswoDCM1ZkbeUtAALdrhIGBg2rY85YiBnJyzwmZz8F-on9Q`
- Web app moderno pendiente de redeploy propietario: `AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg`
- GitHub Pages: `https://appfacen.github.io/Facen-APP/`

La raiz del repositorio contiene el shell PWA instalable de GitHub Pages (`index.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`). La aplicacion real vive en Apps Script porque usa `google.script.run` para comunicarse con el backend. El catalogo rapido de asignaturas y horarios 2026-2 viaja embebido en `apps-script/catalogo_csv.html` para reducir lecturas iniciales de Google Sheets.

El catalogo operativo usa este orden: snapshot CSV generado desde Google Sheets, CSV embebido en GAS como respaldo rapido y, si faltan ambos, lectura directa de las hojas `ASIGNATURAS`, `SECCIONES`, `HORARIOS_ASIGNATURAS` y `AULAS`. Desde la vista Materias, el boton `Actualizar registros` regenera el snapshot persistente a partir de la hoja de calculo; esto permite actualizaciones anuales sin editar el HTML embebido ni redeplegar codigo solo por cambios de horario.

## Estado operativo verificado 2026-06-30

- `https://appfacen.github.io/Facen-APP/` queda preparado con `APP_BUILD = 2026.06.30.3` y apunta al deployment publico de rescate `AKfycbxPW...@19`, verificado por Playwright con bootstrap OK, 7 inscripciones, 24 examenes en agenda y 3 grupos existentes.
- Se cargaron fechas de examenes desde `Guia-Academica-2026-2.pdf`: 28 filas en `FECHAS_EXAMENES` y 24 eventos visibles para `diegomezapy` en `AGENDA_ACADEMICA`.
- El libro operativo fue corregido para que las columnas de fecha/hora se lean como texto; esto evita que el `bootstrap` pierda Perfil e Inscripciones por objetos `Date` de Google Sheets.
- El codigo defensivo para convertir `Date` a texto fue subido a Apps Script HEAD y versionado como `43`, pero no quedo activo en backend publico.
- El guardado robusto de grupos esta corregido en `apps-script/Code.gs` e `apps-script/index.html`; requiere redeploy publico desde la cuenta propietaria/autorizada para quedar activo en produccion.
- El deployment moderno `AKfycbyr...` quedo restringido despues de intentar redeployarlo desde la cuenta actual; no usarlo en Pages hasta redeploy publico desde la cuenta propietaria/autorizada.
- El deployment historico `AKfycbwi0...@20` tambien quedo restringido despues de intentar actualizarlo desde la cuenta actual; por eso Pages debe usar temporalmente `AKfycbxPW...@19`.
- No redeployar deployments historicos publicos desde una cuenta que no sea propietaria/autorizada, porque las pruebas de 2026-06-29 confirmaron que un deployment historico publico puede quedar restringido al redeployarse desde la cuenta actual.
- Para volver a publicar una version futura, abrir Apps Script con la cuenta propietaria o una cuenta explicitamente autorizada para desplegar Web Apps publicos, publicar con acceso `Anyone`, verificar `/exec` anonimo y recien despues cambiar `APP_URL` en `index.html`.

## Libro operativo reconstruido 2026-06-29

- Spreadsheet productivo reconstruido in-place: `https://docs.google.com/spreadsheets/d/1bxqwZy6cW1gGdPGtRyWDn52WdmbMpiMKvLjA6X2lFmc/edit`
- Respaldo completo previo a reconstruccion: `https://docs.google.com/spreadsheets/d/1j3vn6kjy0tMZU2IdD6qzQUBrhX_7AkZNxe8IPtg78Hw`
- Motivo de la reconstruccion in-place: los deployments publicos del proyecto GAS asociado apuntan al spreadsheet existente. Crear otro spreadsheet sin redeploy de Apps Script no seria visto por la app publica.
- Se reconstruyeron 22 pestanas productivas con encabezados congelados, filtros y formato simple: usuarios, sesiones, perfiles, carreras, asignaturas, secciones, horarios, aulas, inscripciones, notas, apuntes, eventos, lecturas, grupos, agenda, preferencias, logs y pestanas legacy.
- Se limpiaron sesiones para evitar tokens viejos y se preservaron las credenciales existentes de usuarios activos.
- El perfil activo `diegomezapy` quedo asociado a `Licenciatura en Ciencias Mencion Matematica Estadistica` y con inscripciones base compatibles (`MAT201`, `MAT120`).

La especificacion sin credenciales del libro reconstruido queda en `docs/FACEN_APP_LIBRO_OPERATIVO_2026-06-29.md`.

## Correccion de enlace publico 2026-06-30

El 2026-06-30 se corrigio el libro productivo para evitar fechas nativas en el paquete de `bootstrap`. Durante el intento de activar versiones nuevas desde la cuenta actual, `AKfycbyr...` y luego `AKfycbwi0...` quedaron restringidos por permisos; por continuidad operativa GitHub Pages se preparo con `APP_BUILD = 2026.06.30.3` apuntando al backend publico de rescate `AKfycbxPW...@19`.

## Comandos utiles

```bash
PATH="$PWD/.tools/node/bin:$PATH" npx clasp status
PATH="$PWD/.tools/node/bin:$PATH" npx clasp push -f
PATH="$PWD/.tools/node/bin:$PATH" npx clasp deploy --description "FACEN App v4"
```
