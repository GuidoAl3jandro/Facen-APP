# FACEN App v3

Nueva version de la agenda academica para estudiantes de FACEN.

## Que incluye

- Registro e inicio de sesion con token propio por navegador.
- Seleccion de asignaturas y secciones cursadas.
- Vista de horario con aulas asignadas.
- Registro de notas personales por inscripcion.
- Apuntes, recordatorios y enlaces por estudiante.
- Perfil academico editable.
- Interfaz responsive para PC y movil.
- Inicializacion de hojas desde Apps Script.

## Instalacion en Apps Script

1. Crear o abrir el proyecto de Apps Script.
2. Subir `Code.gs`, `index.html` y `appsscript.json`.
3. El archivo `Code.gs` ya apunta al spreadsheet `1bxqwZy6cW1gGdPGtRyWDn52WdmbMpiMKvLjA6X2lFmc`.
4. Ejecutar `setupFacenAppV3()` una vez desde el editor.
5. Publicar como Web App.

El despliegue puede ser anonimo porque la aplicacion maneja sesiones por token propio. Si la institucion requiere cuentas Google, se puede cambiar el modo de acceso y conservar la misma logica de permisos.
