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
- Backend publico usado por Pages desde 2026-06-30 07:06: `https://script.google.com/macros/s/AKfycbxPW313JYFjjRodLkOEPl6xswoDCM1ZkbeUtAALdrhIGBg2rY85YiBnJyzwmZz8F-on9Q/exec`
- Backend moderno pendiente de redeploy propietario: `https://script.google.com/macros/s/AKfycbyrQW5G1OIiW-WqV-DBB-jgPpOm8A8grwongJJprexnJ8sMWLkXo_H4ZEg-T5uRghcIeg/exec`

## Pestanas productivas

| Hoja | Filas de datos iniciales | Proposito |
| --- | ---: | --- |
| USUARIOS | 8 | Cuentas, roles y estado activo |
| SESIONES | 0 | Tokens activos creados al iniciar sesion |
| ESTUDIANTES | 8 | Perfil academico por usuario |
| CARRERAS | 12 | Catalogo de carreras FACEN |
| ASIGNATURAS | 20 | Catalogo de asignaturas activas |
| SECCIONES | 20 | Secciones disponibles por asignatura |
| HORARIOS_ASIGNATURAS | 25 | Horarios y aulas por seccion |
| AULAS | 8 | Catalogo de aulas y edificios |
| INSCRIPCIONES | 10 | Asignaturas base y asignaciones reales por perfiles activos |
| NOTAS | 10 | Registro base de notas por inscripcion |
| APUNTES | 0 | Apuntes del estudiante |
| EVENTOS_PERSONALES | 0 | Eventos personales del estudiante |
| LECTURAS | 0 | Lecturas academicas |
| GRUPOS_ESTUDIO | 3 | Grupos de estudio |
| AGENDA_ACADEMICA | 24 | Agenda academica editable |
| PREFERENCIAS_ESTUDIANTE | 8 | Preferencias de alertas |
| LOGS | 1 | Auditoria tecnica de la reconstruccion |
| DOCENTES | 3 | Catalogo legacy de docentes |
| SECCIONES_DOCENTES | 4 | Relacion legacy docente-seccion |
| PARAMETROS | 2 | Parametros operativos |
| FECHAS_EXAMENES | 28 | Fechas base de examenes |
| REGISTRAR_USUARIO | 0 | Hoja legacy de relacion usuario-asignatura |

## Catalogo base

- Carrera principal validada para el usuario activo: `Licenciatura en Ciencias Mencion Matematica Estadistica`.
- Asignaturas principales de esa carrera: `MAT201`, `MAT120`, `MAT101`, `MAT330`.
- Inscripciones verificadas para el perfil activo: 7 registros asociados a `id_estudiante = 8`.

## Validaciones realizadas

- Metadata final: 22 hojas productivas, sin hojas `REBUILD_*`.
- Rangos verificados despues del intercambio: `USUARIOS`, `ESTUDIANTES`, `ASIGNATURAS`, `HORARIOS_ASIGNATURAS`, `INSCRIPCIONES`, `PREFERENCIAS_ESTUDIANTE`, `LOGS`.
- GitHub Pages queda preparado con `APP_BUILD = 2026.06.30.3` apuntando al backend publico de rescate `AKfycbxPW...@19`.
- Backend Apps Script `AKfycbxPW...@19` respondio `HTTP 200` y cargo bootstrap OK, 7 inscripciones, 24 examenes de agenda y 3 grupos existentes para `diegomezapy`.
- Las columnas de fecha/hora criticas quedaron como texto (`TEXT` + `stringValue`) para evitar fallos de serializacion en `google.script.run`.
- `FECHAS_EXAMENES` contiene 28 filas tomadas de `Guia-Academica-2026-2.pdf`, carrera Matematica Estadistica, Plan 2025, 2do periodo; todas con hora `17:00`.
- `AGENDA_ACADEMICA` contiene 24 examenes visibles para `id_estudiante = 8`, asociados a sus asignaturas inscritas y con alerta activa 60 minutos antes.

## Limitaciones pendientes

- No fue posible ejecutar funciones Apps Script con `clasp run` desde la cuenta actual.
- No fue posible limpiar `CacheService` del deployment historico desde consola.
- La publicacion definitiva de la version moderna del backend requiere redeploy anonimo desde la cuenta propietaria/autorizada.
- El deployment moderno `AKfycbyr...` y el historico `AKfycbwi0...@20` quedaron restringidos al intentar redeployarlos desde la cuenta actual; no deben usarse en Pages hasta ser republicados y verificados anonimamente desde la cuenta propietaria/autorizada.
- El guardado robusto de grupos esta corregido en Apps Script HEAD version 43, pero no queda activo en el backend publico de rescate hasta redeploy propietario.
