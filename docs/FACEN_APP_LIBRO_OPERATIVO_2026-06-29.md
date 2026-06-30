# FACEN App - libro operativo reconstruido

Fecha de reconstruccion: 2026-06-29 20:55 America/Asuncion

## Decisiones tecnicas

- El libro se reconstruyo in-place para conservar el spreadsheet ID que ya consume el deployment publico funcional.
- Antes de modificar datos se creo una copia completa de respaldo en Drive.
- No se documentan contrasenas, hashes, salts ni tokens.
- Las sesiones se reiniciaron dejando `SESIONES` solo con encabezado para evitar tokens viejos.
- Las horas de clase se escribieron como texto legible `HH:MM`.

## URLs

- Spreadsheet productivo: `https://docs.google.com/spreadsheets/d/1bxqwZy6cW1gGdPGtRyWDn52WdmbMpiMKvLjA6X2lFmc/edit`
- Respaldo previo: `https://docs.google.com/spreadsheets/d/1j3vn6kjy0tMZU2IdD6qzQUBrhX_7AkZNxe8IPtg78Hw`
- GitHub Pages: `https://appfacen.github.io/Facen-APP/`
- Backend publico usado por Pages desde 2026-06-30 05:43: `https://script.google.com/macros/s/AKfycbwi0em5pAGlaVMstzCPxOs7aopGNylBwspSlj9Sx4ZwK_cNMSHiCi5fmPpgP68FoqPHjA/exec`
- Backend moderno pendiente de redeploy propietario: `https://script.google.com/macros/s/AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg/exec`

## Pestanas productivas

| Hoja | Filas de datos iniciales | Proposito |
| --- | ---: | --- |
| USUARIOS | 8 | Cuentas, roles y estado activo |
| SESIONES | 0 | Tokens activos creados al iniciar sesion |
| ESTUDIANTES | 8 | Perfil academico por usuario |
| CARRERAS | 12 | Catalogo de carreras FACEN |
| ASIGNATURAS | 17 | Catalogo de asignaturas activas |
| SECCIONES | 17 | Secciones disponibles por asignatura |
| HORARIOS_ASIGNATURAS | 25 | Horarios y aulas por seccion |
| AULAS | 8 | Catalogo de aulas y edificios |
| INSCRIPCIONES | 10 | Asignaturas base y asignaciones reales por perfiles activos |
| NOTAS | 10 | Registro base de notas por inscripcion |
| APUNTES | 0 | Apuntes del estudiante |
| EVENTOS_PERSONALES | 0 | Eventos personales del estudiante |
| LECTURAS | 0 | Lecturas academicas |
| GRUPOS_ESTUDIO | 0 | Grupos de estudio |
| AGENDA_ACADEMICA | 0 | Agenda academica editable |
| PREFERENCIAS_ESTUDIANTE | 8 | Preferencias de alertas |
| LOGS | 1 | Auditoria tecnica de la reconstruccion |
| DOCENTES | 3 | Catalogo legacy de docentes |
| SECCIONES_DOCENTES | 4 | Relacion legacy docente-seccion |
| PARAMETROS | 2 | Parametros operativos |
| FECHAS_EXAMENES | 3 | Fechas base de examenes |
| REGISTRAR_USUARIO | 0 | Hoja legacy de relacion usuario-asignatura |

## Catalogo base

- Carrera principal validada para el usuario activo: `Licenciatura en Ciencias Mencion Matematica Estadistica`.
- Asignaturas principales de esa carrera: `MAT201`, `MAT120`, `MAT101`, `MAT330`.
- Inscripciones verificadas para el perfil activo: 7 registros asociados a `id_estudiante = 8`.

## Validaciones realizadas

- Metadata final: 22 hojas productivas, sin hojas `REBUILD_*`.
- Rangos verificados despues del intercambio: `USUARIOS`, `ESTUDIANTES`, `ASIGNATURAS`, `HORARIOS_ASIGNATURAS`, `INSCRIPCIONES`, `PREFERENCIAS_ESTUDIANTE`, `LOGS`.
- GitHub Pages se prepara para publicar `APP_BUILD = 2026.06.30.2`.
- Backend Apps Script fallback `AKfycbwi0...@20` respondio `HTTP 200` y cargo Perfil completo + 7 inscripciones para `diegomezapy`.
- Las columnas de fecha/hora criticas quedaron como texto (`TEXT` + `stringValue`) para evitar fallos de serializacion en `google.script.run`.

## Limitaciones pendientes

- No fue posible ejecutar funciones Apps Script con `clasp run` desde la cuenta actual.
- No fue posible limpiar `CacheService` del deployment historico desde consola.
- La publicacion definitiva de la version moderna del backend requiere redeploy anonimo desde la cuenta propietaria/autorizada.
- El deployment moderno `AKfycbyr...` quedo restringido al intentar redeployarlo desde la cuenta actual; no debe usarse en Pages hasta ser republicado y verificado anonimamente.
