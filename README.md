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
- Web app deployment: `AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg`
- GitHub Pages: `https://appfacen.github.io/Facen-APP/`

La raiz del repositorio contiene el shell PWA instalable de GitHub Pages (`index.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`). La aplicacion real vive en Apps Script porque usa `google.script.run` para comunicarse con el backend. El catalogo rapido de asignaturas y horarios 2026-2 viaja embebido en `apps-script/catalogo_csv.html` para reducir lecturas iniciales de Google Sheets.

El catalogo operativo usa este orden: snapshot CSV generado desde Google Sheets, CSV embebido en GAS como respaldo rapido y, si faltan ambos, lectura directa de las hojas `ASIGNATURAS`, `SECCIONES`, `HORARIOS_ASIGNATURAS` y `AULAS`. Desde la vista Materias, el boton `Actualizar registros` regenera el snapshot persistente a partir de la hoja de calculo; esto permite actualizaciones anuales sin editar el HTML embebido ni redeplegar codigo solo por cambios de horario.

## Comandos utiles

```bash
PATH="$PWD/.tools/node/bin:$PATH" npx clasp status
PATH="$PWD/.tools/node/bin:$PATH" npx clasp push -f
PATH="$PWD/.tools/node/bin:$PATH" npx clasp deploy --description "FACEN App v4"
```
