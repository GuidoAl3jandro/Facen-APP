/**
 * FACEN App v3 - Backend Apps Script
 * Agenda academica para estudiantes.
 */

var CONFIG = {
  SPREADSHEET_ID: '1bxqwZy6cW1gGdPGtRyWDn52WdmbMpiMKvLjA6X2lFmc',
  SESSION_HOURS: 12,
  HASH_ITERATIONS: 6000,
  SHEETS: {
    USUARIOS: 'USUARIOS',
    SESIONES: 'SESIONES',
    ESTUDIANTES: 'ESTUDIANTES',
    ASIGNATURAS: 'ASIGNATURAS',
    SECCIONES: 'SECCIONES',
    HORARIOS: 'HORARIOS_ASIGNATURAS',
    AULAS: 'AULAS',
    INSCRIPCIONES: 'INSCRIPCIONES',
    NOTAS: 'NOTAS',
    APUNTES: 'APUNTES',
    EVENTOS: 'EVENTOS_PERSONALES',
    LECTURAS: 'LECTURAS',
    GRUPOS: 'GRUPOS_ESTUDIO',
    AGENDA: 'AGENDA_ACADEMICA',
    PREFERENCIAS: 'PREFERENCIAS_ESTUDIANTE',
    LOGS: 'LOGS'
  },
  ROLES: {
    ESTUDIANTE: 'estudiante',
    ADMIN: 'admin'
  }
};

var SCHEMA = {
  USUARIOS: ['id_usuario', 'username', 'password_hash', 'salt', 'rol', 'activo', 'fecha_creacion', 'ultimo_acceso'],
  SESIONES: ['token_hash', 'id_usuario', 'rol', 'creado_en', 'expira_en', 'activo'],
  ESTUDIANTES: ['id_estudiante', 'id_usuario', 'nombres', 'apellidos', 'cedula', 'email', 'telefono', 'comparte_contacto', 'carrera', 'semestre', 'turno', 'observaciones'],
  ASIGNATURAS: ['id_asignatura', 'codigo', 'nombre_asignatura', 'carrera', 'semestre', 'creditos', 'activo'],
  SECCIONES: ['id_seccion', 'id_asignatura', 'codigo_seccion', 'cupo', 'activo'],
  HORARIOS_ASIGNATURAS: ['id_horario', 'id_seccion', 'dia', 'hora_ini', 'hora_fin', 'id_aula'],
  AULAS: ['id_aula', 'nombre_aula', 'edificio', 'capacidad'],
  INSCRIPCIONES: ['id_inscripcion', 'id_estudiante', 'id_seccion', 'periodo', 'fecha_inscripcion', 'activo'],
  NOTAS: ['id_nota', 'id_inscripcion', 'parcial1', 'parcial2', 'trabajos', 'final', 'promedio', 'estado', 'observaciones', 'fecha_modificacion'],
  APUNTES: ['id_apunte', 'id_estudiante', 'id_asignatura', 'tipo', 'titulo', 'contenido', 'fecha_creacion', 'fecha_modificacion'],
  EVENTOS_PERSONALES: ['id_evento', 'id_estudiante', 'id_asignatura', 'titulo', 'descripcion', 'fecha', 'hora', 'tipo', 'completado'],
  LECTURAS: ['id_lectura', 'id_estudiante', 'id_asignatura', 'titulo', 'fuente', 'url', 'estado', 'prioridad', 'fecha_objetivo', 'notas', 'fecha_creacion', 'fecha_modificacion'],
  GRUPOS_ESTUDIO: ['id_grupo', 'id_estudiante', 'id_asignatura', 'nombre', 'integrantes', 'canal', 'lugar', 'proxima_fecha', 'proxima_hora', 'objetivo', 'estado', 'fecha_creacion', 'fecha_modificacion'],
  AGENDA_ACADEMICA: ['id_agenda', 'id_estudiante', 'id_asignatura', 'tipo', 'titulo', 'dia', 'fecha', 'hora_ini', 'hora_fin', 'sala', 'edificio', 'mapa_url', 'notas', 'alerta_activa', 'minutos_antes', 'activo', 'fecha_creacion', 'fecha_modificacion'],
  PREFERENCIAS_ESTUDIANTE: ['id_preferencia', 'id_estudiante', 'alertas_clases', 'alertas_examenes', 'alertas_reuniones', 'alertas_entregas', 'minutos_clases', 'minutos_examenes', 'minutos_reuniones', 'minutos_entregas', 'instalacion_pwa', 'fecha_modificacion'],
  LOGS: ['id_log', 'fecha', 'id_usuario', 'accion', 'detalle']
};

var ROW_CACHE_ = {};
var SHEET_CACHE_ = {};
var HEADER_CACHE_ = {};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('FACEN App')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function setupFacenAppV3() {
  var ss = getSpreadsheet_();
  Object.keys(SCHEMA).forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, SCHEMA[sheetName].length).setValues([SCHEMA[sheetName]]);
      styleHeader_(sheet, SCHEMA[sheetName].length);
    } else {
      ensureHeaders_(sheet, SCHEMA[sheetName]);
    }
  });
  seedCatalog_();
  return { success: true, message: 'FACEN App v3 inicializada.' };
}

function setupFacenAppV4() {
  var result = setupFacenAppV3();
  clearCatalogCache_();
  result.message = 'FACEN App v4 inicializada con lecturas, grupos y cache.';
  return result;
}

function registrarEstudiante(datos) {
  try {
    datos = normalizePayload_(datos);
    var username = cleanUsername_(datos.username);
    if (!username || !datos.password || !datos.nombres || !datos.apellidos) {
      return fail_('Completa usuario, contrasena, nombres y apellidos.');
    }
    if (String(datos.password).length < 8) return fail_('La contrasena debe tener al menos 8 caracteres.');
    if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(datos.email))) return fail_('Email invalido.');

    return withLock_(function() {
      var usuarios = getRows_(CONFIG.SHEETS.USUARIOS);
      if (usuarios.some(function(u) { return cleanUsername_(u.username) === username; })) {
        return fail_('Ese usuario ya existe.');
      }
      var userId = nextId_(CONFIG.SHEETS.USUARIOS);
      var salt = makeSalt_();
      appendObject_(CONFIG.SHEETS.USUARIOS, {
        id_usuario: userId,
        username: username,
        password_hash: hashPassword_(datos.password, salt),
        salt: salt,
        rol: CONFIG.ROLES.ESTUDIANTE,
        activo: 1,
        fecha_creacion: now_(),
        ultimo_acceso: ''
      });
      appendObject_(CONFIG.SHEETS.ESTUDIANTES, {
        id_estudiante: nextId_(CONFIG.SHEETS.ESTUDIANTES),
        id_usuario: userId,
        nombres: trim_(datos.nombres),
        apellidos: trim_(datos.apellidos),
        cedula: trim_(datos.cedula),
        email: trim_(datos.email),
        telefono: trim_(datos.telefono),
        comparte_contacto: datos.comparte_contacto ? 1 : 0,
        carrera: trim_(datos.carrera),
        semestre: trim_(datos.semestre),
        turno: trim_(datos.turno),
        observaciones: ''
      });
      log_(userId, 'REGISTRO', username);
      return iniciarSesion(username, datos.password);
    });
  } catch (e) {
    return fail_('No se pudo registrar. ' + e.message);
  }
}

function iniciarSesion(username, password) {
  try {
    username = cleanUsername_(username);
    var usuarios = getRows_(CONFIG.SHEETS.USUARIOS);
    var user = usuarios.find(function(u) { return cleanUsername_(u.username) === username; });
    if (!user || user.activo == 0) return fail_('Usuario no encontrado o inactivo.');
    var currentHash = hashPassword_(password, user.salt);
    var legacyHash = legacyHashPassword_(password, user.salt);
    if (currentHash !== user.password_hash && legacyHash !== user.password_hash) {
      return fail_('Contrasena incorrecta.');
    }
    if (legacyHash === user.password_hash) {
      updateRowById_(CONFIG.SHEETS.USUARIOS, 'id_usuario', user.id_usuario, {
        password_hash: currentHash
      });
    }

    var token = Utilities.getUuid() + '-' + Utilities.getUuid();
    var expires = new Date(Date.now() + CONFIG.SESSION_HOURS * 60 * 60 * 1000);
    appendObject_(CONFIG.SHEETS.SESIONES, {
      token_hash: tokenHash_(token),
      id_usuario: user.id_usuario,
      rol: user.rol,
      creado_en: now_(),
      expira_en: expires,
      activo: 1
    });
    updateRowById_(CONFIG.SHEETS.USUARIOS, 'id_usuario', user.id_usuario, { ultimo_acceso: now_() });
    log_(user.id_usuario, 'LOGIN', username);
    return { success: true, token: token, user: publicUser_(user.id_usuario, user.rol, user.username) };
  } catch (e) {
    return fail_('No se pudo iniciar sesion.');
  }
}

function cerrarSesion(token) {
  if (findSession_(token)) updateRowByKey_(CONFIG.SHEETS.SESIONES, 'token_hash', tokenHash_(token), { activo: 0 });
  return { success: true };
}

function verificarSesion(token) {
  var session = requireSession_(token, true);
  if (!session) return { valid: false };
  return { valid: true, user: publicUser_(session.id_usuario, session.rol) };
}

function obtenerBootstrap(token) {
  try {
    var session = requireSession_(token);
    var perfil = getOrCreatePerfil_(session.id_usuario);
    var catalogo = safeCall_(function() { return obtenerCatalogoParaPerfil_(perfil, false); }, defaultCatalogo_());
    var inscripciones = safeCall_(function() { return obtenerMisInscripciones_(perfil.id_estudiante); }, []);
    var notas = safeCall_(function() { return obtenerMisNotas_(perfil.id_estudiante, inscripciones); }, []);
    var agenda = safeCall_(function() { return obtenerMiAgenda_(perfil.id_estudiante); }, []);
    var preferencias = safeCall_(function() { return obtenerPreferencias_(perfil.id_estudiante); }, obtenerPreferenciasDefault_());
    var response = bootstrapResponse_(session, perfil, inscripciones, notas, agenda, preferencias, '');
    response.catalogo = catalogo;
    response.catalogoLoaded = true;
    return response;
  } catch (e) {
    return {
      success: false,
      message: 'No se pudo cargar el inicio: ' + e.message
    };
  }
}

function obtenerDatosVista(token, vista) {
  try {
    var session = requireSession_(token);
    var perfil = getOrCreatePerfil_(session.id_usuario);
    vista = String(vista || '');
    if (vista === 'catalogo') return { success: true, catalogo: obtenerCatalogoParaPerfil_(perfil, false) };
    if (vista === 'apuntes') return { success: true, apuntes: obtenerMisApuntes_(perfil.id_estudiante) };
    if (vista === 'eventos') return { success: true, eventos: obtenerMisEventos_(perfil.id_estudiante) };
    if (vista === 'lecturas') return { success: true, lecturas: obtenerMisLecturas_(perfil.id_estudiante) };
    if (vista === 'grupos') return { success: true, grupos: obtenerMisGrupos_(perfil.id_estudiante) };
    return { success: true };
  } catch (e) {
    return fail_('No se pudo cargar esta vista: ' + e.message);
  }
}

function obtenerCompaneros(token) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  return {
    success: true,
    companeros: obtenerMisCompaneros_(perfil.id_estudiante)
  };
}

function obtenerCatalogo(token) {
  var session = requireSession_(token);
  var perfil = getOrCreatePerfil_(session.id_usuario);
  return { success: true, catalogo: obtenerCatalogoParaPerfil_(perfil, false) };
}

function obtenerCatalogo_(useCache) {
  var cacheKey = catalogCacheKey_();
  if (useCache !== false) {
    try {
      var cached = CacheService.getScriptCache().get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
  }
  ensureCatalogSeeded_();
  var aulas = indexBy_(getRows_(CONFIG.SHEETS.AULAS), 'id_aula');
  var horarios = getRows_(CONFIG.SHEETS.HORARIOS);
  var secciones = getRows_(CONFIG.SHEETS.SECCIONES).filter(function(s) { return isActive_(s.activo); });
  var seccionesByAsig = {};
  secciones.forEach(function(s) {
    s.horarios = horarios.filter(function(h) { return h.id_seccion == s.id_seccion; }).map(function(h) {
      var aula = aulas[h.id_aula] || {};
      return { dia: h.dia, hora_ini: h.hora_ini, hora_fin: h.hora_fin, aula: aula.nombre_aula || 'Sin aula', edificio: aula.edificio || '' };
    });
    s.codigo_seccion = s.codigo_seccion || 'A';
    s.cupo = s.cupo || '';
    if (!seccionesByAsig[s.id_asignatura]) seccionesByAsig[s.id_asignatura] = [];
    seccionesByAsig[s.id_asignatura].push(s);
  });
  var asignaturas = getRows_(CONFIG.SHEETS.ASIGNATURAS).filter(function(a) { return isActive_(a.activo); }).map(function(a) {
    a.codigo = a.codigo || ('ASIG-' + a.id_asignatura);
    a.nombre_asignatura = a.nombre_asignatura || a.nombre || 'Asignatura sin nombre';
    a.carrera = a.carrera || 'FACEN';
    a.semestre = a.semestre || '';
    a.creditos = a.creditos || '';
    a.secciones = seccionesByAsig[a.id_asignatura] || [];
    return a;
  });
  if (!asignaturas.length) asignaturas = defaultCatalogo_();
  try {
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(asignaturas), 600);
  } catch (e) {}
  return asignaturas;
}

function obtenerCatalogoParaPerfil_(perfil, useCache) {
  var catalogo = obtenerCatalogo_(useCache);
  var carrera = normalize_(perfil && perfil.carrera);
  if (!carrera) return catalogo;
  var filtrado = catalogo.filter(function(a) { return normalize_(a.carrera) === carrera; });
  return filtrado.length ? filtrado : catalogo;
}

function ensureCatalogSeeded_() {
  if (getRows_(CONFIG.SHEETS.ASIGNATURAS).length && getRows_(CONFIG.SHEETS.SECCIONES).length) return;
  seedCatalog_();
}

function defaultCatalogo_() {
  var aulas = {
    1: { nombre_aula: 'Aula 101', edificio: 'Bloque A' },
    2: { nombre_aula: 'Laboratorio Bio 2', edificio: 'Bloque B' },
    3: { nombre_aula: 'Aula Magna', edificio: 'Central' },
    4: { nombre_aula: 'Laboratorio Computacion', edificio: 'Bloque C' }
  };
  var horarios = [
    [1, 1, 'Lunes', '07:30', '09:00', 1], [2, 1, 'Miercoles', '07:30', '09:00', 1],
    [3, 2, 'Martes', '18:00', '19:30', 3], [4, 2, 'Jueves', '18:00', '19:30', 3],
    [5, 3, 'Lunes', '09:15', '10:45', 3], [6, 3, 'Viernes', '09:15', '10:45', 3],
    [7, 4, 'Martes', '10:00', '12:00', 2], [8, 5, 'Miercoles', '13:00', '15:00', 3],
    [9, 6, 'Jueves', '15:00', '17:00', 4]
  ];
  var secciones = [
    [1, 1, 'A', 45], [2, 1, 'B', 45], [3, 2, 'A', 40], [4, 3, 'A', 28], [5, 4, 'A', 40], [6, 5, 'A', 32]
  ].map(function(s) {
    return {
      id_seccion: s[0],
      id_asignatura: s[1],
      codigo_seccion: s[2],
      cupo: s[3],
      activo: 1,
      horarios: horarios.filter(function(h) { return h[1] === s[0]; }).map(function(h) {
        var aula = aulas[h[5]] || {};
        return { dia: h[2], hora_ini: h[3], hora_fin: h[4], aula: aula.nombre_aula || 'Sin aula', edificio: aula.edificio || '' };
      })
    };
  });
  return [
    [1, 'MAT101', 'Calculo I', 'Licenciatura en Ciencias Mencion Matematica', 1, 6],
    [2, 'FIS101', 'Fisica General I', 'Licenciatura en Ciencias Mencion Fisica', 1, 5],
    [3, 'BIO120', 'Biologia Celular', 'Licenciatura en Biotecnologia', 2, 5],
    [4, 'QUI110', 'Quimica General', 'Licenciatura en Ciencias Mencion Quimica', 1, 5],
    [5, 'INF140', 'Programacion I', 'Licenciatura en Tecnologia de Produccion', 1, 4]
  ].map(function(a) {
    return {
      id_asignatura: a[0],
      codigo: a[1],
      nombre_asignatura: a[2],
      carrera: a[3],
      semestre: a[4],
      creditos: a[5],
      activo: 1,
      secciones: secciones.filter(function(s) { return s.id_asignatura === a[0]; })
    };
  });
}

function guardarPerfil(token, datos) {
  var session = requireSession_(token);
  var perfil = getOrCreatePerfil_(session.id_usuario);
  datos = normalizePayload_(datos);
  var values = {
    nombres: trim_(datos.nombres),
    apellidos: trim_(datos.apellidos),
    cedula: trim_(datos.cedula),
    email: trim_(datos.email),
    telefono: trim_(datos.telefono),
    comparte_contacto: datos.comparte_contacto ? 1 : 0,
    carrera: trim_(datos.carrera),
    semestre: trim_(datos.semestre),
    turno: trim_(datos.turno),
    observaciones: trim_(datos.observaciones)
  };
  updateProfilesByUser_(session.id_usuario, values);
  perfil = getPerfilByUser_(session.id_usuario);
  log_(session.id_usuario, 'PERFIL', 'Actualizado');
  return {
    success: true,
    message: 'Perfil guardado.',
    perfil: perfil,
    user: publicUserFromPerfil_(session.id_usuario, session.rol, '', perfil),
    catalogo: obtenerCatalogoParaPerfil_(perfil, false),
    catalogoLoaded: true
  };
}

function inscribirSeccion(token, idSeccion) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  ensureCatalogSeeded_();
  var seccion = getRows_(CONFIG.SHEETS.SECCIONES).find(function(s) { return s.id_seccion == idSeccion && isActive_(s.activo); });
  if (!seccion) return fail_('La seccion no existe.');
  return withLock_(function() {
    var secciones = indexBy_(getRows_(CONFIG.SHEETS.SECCIONES), 'id_seccion');
    var existentes = getRows_(CONFIG.SHEETS.INSCRIPCIONES).filter(function(i) {
      return i.id_estudiante == perfil.id_estudiante && isActive_(i.activo);
    });
    if (existentes.some(function(i) { return i.id_seccion == idSeccion; })) return fail_('Ya estas inscripto en esa seccion.');
    if (existentes.some(function(i) {
      var sec = secciones[i.id_seccion];
      return sec && sec.id_asignatura == seccion.id_asignatura;
    })) return fail_('Ya tenes una seccion de esa asignatura.');

    var idInscripcion = nextId_(CONFIG.SHEETS.INSCRIPCIONES);
    appendObject_(CONFIG.SHEETS.INSCRIPCIONES, {
      id_inscripcion: idInscripcion,
      id_estudiante: perfil.id_estudiante,
      id_seccion: Number(idSeccion),
      periodo: periodoActual_(),
      fecha_inscripcion: now_(),
      activo: 1
    });
    appendObject_(CONFIG.SHEETS.NOTAS, {
      id_nota: nextId_(CONFIG.SHEETS.NOTAS),
      id_inscripcion: idInscripcion,
      parcial1: '',
      parcial2: '',
      trabajos: '',
      final: '',
      promedio: '',
      estado: 'En curso',
      observaciones: '',
      fecha_modificacion: now_()
    });
    log_(session.id_usuario, 'INSCRIPCION', String(idSeccion));
    var inscripciones = obtenerMisInscripciones_(perfil.id_estudiante);
    return {
      success: true,
      message: 'Asignatura agregada.',
      inscripciones: inscripciones,
      notas: obtenerMisNotas_(perfil.id_estudiante, inscripciones),
      catalogo: obtenerCatalogoParaPerfil_(perfil, false),
      catalogoLoaded: true
    };
  });
}

function quitarInscripcion(token, idInscripcion) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  if (!getOwnedInscripcion_(perfil.id_estudiante, idInscripcion)) return fail_('Inscripcion no encontrada.');
  updateRowById_(CONFIG.SHEETS.INSCRIPCIONES, 'id_inscripcion', idInscripcion, { activo: 0 });
  log_(session.id_usuario, 'DESINSCRIPCION', String(idInscripcion));
  return { success: true, message: 'Asignatura quitada.' };
}

function guardarNota(token, idInscripcion, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  if (!getOwnedInscripcion_(perfil.id_estudiante, idInscripcion)) return fail_('No podes editar esta nota.');
  var nota = getRows_(CONFIG.SHEETS.NOTAS).find(function(n) { return n.id_inscripcion == idInscripcion; });
  if (!nota) return fail_('Nota no encontrada.');
  var values = {
    parcial1: score_(datos.parcial1),
    parcial2: score_(datos.parcial2),
    trabajos: score_(datos.trabajos),
    final: score_(datos.final),
    observaciones: trim_(datos.observaciones),
    fecha_modificacion: now_()
  };
  values.promedio = promedio_([values.parcial1, values.parcial2, values.trabajos, values.final]);
  values.estado = values.final !== '' && values.promedio !== '' ? (Number(values.promedio) >= 3 ? 'Aprobada' : 'Reprobada') : 'En curso';
  updateRowById_(CONFIG.SHEETS.NOTAS, 'id_nota', nota.id_nota, values);
  log_(session.id_usuario, 'NOTA', String(idInscripcion));
  return { success: true, message: 'Nota guardada.' };
}

function guardarApunte(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  if (!datos.titulo) return fail_('Agrega un titulo.');
  var idAsignatura = datos.id_asignatura ? Number(datos.id_asignatura) : '';
  if (idAsignatura && !estudianteCursaAsignatura_(perfil.id_estudiante, idAsignatura)) return fail_('Solo podes asociar apuntes a tus asignaturas.');
  if (datos.id_apunte) {
    var apunte = getRows_(CONFIG.SHEETS.APUNTES).find(function(a) {
      return a.id_apunte == datos.id_apunte && a.id_estudiante == perfil.id_estudiante;
    });
    if (!apunte) return fail_('Apunte no encontrado.');
    updateRowById_(CONFIG.SHEETS.APUNTES, 'id_apunte', datos.id_apunte, {
      id_asignatura: idAsignatura,
      tipo: trim_(datos.tipo || 'apunte'),
      titulo: trim_(datos.titulo),
      contenido: trim_(datos.contenido),
      fecha_modificacion: now_()
    });
  } else {
    appendObject_(CONFIG.SHEETS.APUNTES, {
      id_apunte: nextId_(CONFIG.SHEETS.APUNTES),
      id_estudiante: perfil.id_estudiante,
      id_asignatura: idAsignatura,
      tipo: trim_(datos.tipo || 'apunte'),
      titulo: trim_(datos.titulo),
      contenido: trim_(datos.contenido),
      fecha_creacion: now_(),
      fecha_modificacion: now_()
    });
  }
  log_(session.id_usuario, 'APUNTE', trim_(datos.titulo));
  return { success: true, message: 'Guardado.' };
}

function eliminarApunte(token, idApunte) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  var row = findRow_(CONFIG.SHEETS.APUNTES, function(a) { return a.id_apunte == idApunte && a.id_estudiante == perfil.id_estudiante; });
  if (row < 0) return fail_('Apunte no encontrado.');
  getSheet_(CONFIG.SHEETS.APUNTES).deleteRow(row);
  clearRows_(CONFIG.SHEETS.APUNTES);
  log_(session.id_usuario, 'APUNTE_DELETE', String(idApunte));
  return { success: true };
}

function guardarEvento(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  if (!datos.titulo || !datos.fecha) return fail_('Agrega titulo y fecha.');
  var idAsignatura = datos.id_asignatura ? Number(datos.id_asignatura) : '';
  if (idAsignatura && !estudianteCursaAsignatura_(perfil.id_estudiante, idAsignatura)) return fail_('Evento fuera de tus asignaturas.');
  if (datos.id_evento) {
    var row = findRow_(CONFIG.SHEETS.EVENTOS, function(e) { return e.id_evento == datos.id_evento && e.id_estudiante == perfil.id_estudiante; });
    if (row < 0) return fail_('Evento no encontrado.');
    updateRowById_(CONFIG.SHEETS.EVENTOS, 'id_evento', datos.id_evento, {
      id_asignatura: idAsignatura,
      titulo: trim_(datos.titulo),
      descripcion: trim_(datos.descripcion),
      fecha: new Date(datos.fecha),
      hora: trim_(datos.hora),
      tipo: trim_(datos.tipo || 'recordatorio'),
      completado: datos.completado ? 1 : 0
    });
  } else {
    appendObject_(CONFIG.SHEETS.EVENTOS, {
      id_evento: nextId_(CONFIG.SHEETS.EVENTOS),
      id_estudiante: perfil.id_estudiante,
      id_asignatura: idAsignatura,
      titulo: trim_(datos.titulo),
      descripcion: trim_(datos.descripcion),
      fecha: new Date(datos.fecha),
      hora: trim_(datos.hora),
      tipo: trim_(datos.tipo || 'recordatorio'),
      completado: 0
    });
  }
  log_(session.id_usuario, 'EVENTO', trim_(datos.titulo));
  return { success: true, message: 'Recordatorio guardado.' };
}

function eliminarEvento(token, idEvento) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  var row = findRow_(CONFIG.SHEETS.EVENTOS, function(e) { return e.id_evento == idEvento && e.id_estudiante == perfil.id_estudiante; });
  if (row < 0) return fail_('Evento no encontrado.');
  getSheet_(CONFIG.SHEETS.EVENTOS).deleteRow(row);
  clearRows_(CONFIG.SHEETS.EVENTOS);
  log_(session.id_usuario, 'EVENTO_DELETE', String(idEvento));
  return { success: true };
}

function guardarLectura(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  if (!datos.titulo) return fail_('Agrega un titulo para la lectura.');
  var idAsignatura = datos.id_asignatura ? Number(datos.id_asignatura) : '';
  if (idAsignatura && !estudianteCursaAsignatura_(perfil.id_estudiante, idAsignatura)) return fail_('Solo podes asociar lecturas a tus asignaturas.');
  var values = {
    id_asignatura: idAsignatura,
    titulo: trim_(datos.titulo),
    fuente: trim_(datos.fuente),
    url: trim_(datos.url),
    estado: trim_(datos.estado || 'Pendiente'),
    prioridad: trim_(datos.prioridad || 'Media'),
    fecha_objetivo: datos.fecha_objetivo ? new Date(datos.fecha_objetivo) : '',
    notas: trim_(datos.notas),
    fecha_modificacion: now_()
  };
  if (datos.id_lectura) {
    var row = findRow_(CONFIG.SHEETS.LECTURAS, function(l) { return l.id_lectura == datos.id_lectura && l.id_estudiante == perfil.id_estudiante; });
    if (row < 0) return fail_('Lectura no encontrada.');
    updateRowById_(CONFIG.SHEETS.LECTURAS, 'id_lectura', datos.id_lectura, values);
  } else {
    values.id_lectura = nextId_(CONFIG.SHEETS.LECTURAS);
    values.id_estudiante = perfil.id_estudiante;
    values.fecha_creacion = now_();
    appendObject_(CONFIG.SHEETS.LECTURAS, values);
  }
  log_(session.id_usuario, 'LECTURA', values.titulo);
  return { success: true, message: 'Lectura guardada.' };
}

function eliminarLectura(token, idLectura) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  var row = findRow_(CONFIG.SHEETS.LECTURAS, function(l) { return l.id_lectura == idLectura && l.id_estudiante == perfil.id_estudiante; });
  if (row < 0) return fail_('Lectura no encontrada.');
  getSheet_(CONFIG.SHEETS.LECTURAS).deleteRow(row);
  clearRows_(CONFIG.SHEETS.LECTURAS);
  log_(session.id_usuario, 'LECTURA_DELETE', String(idLectura));
  return { success: true };
}

function guardarGrupo(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  if (!datos.nombre) return fail_('Agrega un nombre para el grupo.');
  var idAsignatura = datos.id_asignatura ? Number(datos.id_asignatura) : '';
  if (idAsignatura && !estudianteCursaAsignatura_(perfil.id_estudiante, idAsignatura)) return fail_('Solo podes asociar grupos a tus asignaturas.');
  var values = {
    id_asignatura: idAsignatura,
    nombre: trim_(datos.nombre),
    integrantes: trim_(datos.integrantes),
    canal: trim_(datos.canal),
    lugar: trim_(datos.lugar),
    proxima_fecha: datos.proxima_fecha ? new Date(datos.proxima_fecha) : '',
    proxima_hora: trim_(datos.proxima_hora),
    objetivo: trim_(datos.objetivo),
    estado: trim_(datos.estado || 'Activo'),
    fecha_modificacion: now_()
  };
  if (datos.id_grupo) {
    var row = findRow_(CONFIG.SHEETS.GRUPOS, function(g) { return g.id_grupo == datos.id_grupo && g.id_estudiante == perfil.id_estudiante; });
    if (row < 0) return fail_('Grupo no encontrado.');
    updateRowById_(CONFIG.SHEETS.GRUPOS, 'id_grupo', datos.id_grupo, values);
  } else {
    values.id_grupo = nextId_(CONFIG.SHEETS.GRUPOS);
    values.id_estudiante = perfil.id_estudiante;
    values.fecha_creacion = now_();
    appendObject_(CONFIG.SHEETS.GRUPOS, values);
  }
  log_(session.id_usuario, 'GRUPO', values.nombre);
  return { success: true, message: 'Grupo guardado.' };
}

function eliminarGrupo(token, idGrupo) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  var row = findRow_(CONFIG.SHEETS.GRUPOS, function(g) { return g.id_grupo == idGrupo && g.id_estudiante == perfil.id_estudiante; });
  if (row < 0) return fail_('Grupo no encontrado.');
  getSheet_(CONFIG.SHEETS.GRUPOS).deleteRow(row);
  clearRows_(CONFIG.SHEETS.GRUPOS);
  log_(session.id_usuario, 'GRUPO_DELETE', String(idGrupo));
  return { success: true };
}

function guardarAgenda(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  if (!datos.titulo || !datos.tipo) return fail_('Agrega tipo y titulo.');
  if (!datos.dia && !datos.fecha) return fail_('Agrega un dia recurrente o una fecha.');
  var idAsignatura = datos.id_asignatura ? Number(datos.id_asignatura) : '';
  if (idAsignatura && !estudianteCursaAsignatura_(perfil.id_estudiante, idAsignatura)) return fail_('Solo podes asociar agenda a tus asignaturas.');
  var values = {
    id_asignatura: idAsignatura,
    tipo: trim_(datos.tipo || 'clase'),
    titulo: trim_(datos.titulo),
    dia: trim_(datos.dia),
    fecha: datos.fecha ? new Date(datos.fecha) : '',
    hora_ini: trim_(datos.hora_ini),
    hora_fin: trim_(datos.hora_fin),
    sala: trim_(datos.sala),
    edificio: trim_(datos.edificio),
    mapa_url: trim_(datos.mapa_url),
    notas: trim_(datos.notas),
    alerta_activa: datos.alerta_activa ? 1 : 0,
    minutos_antes: numberOr_(datos.minutos_antes, 15),
    activo: 1,
    fecha_modificacion: now_()
  };
  if (datos.id_agenda) {
    var row = findRow_(CONFIG.SHEETS.AGENDA, function(a) { return a.id_agenda == datos.id_agenda && a.id_estudiante == perfil.id_estudiante && a.activo != 0; });
    if (row < 0) return fail_('Entrada de agenda no encontrada.');
    updateRowById_(CONFIG.SHEETS.AGENDA, 'id_agenda', datos.id_agenda, values);
  } else {
    values.id_agenda = nextId_(CONFIG.SHEETS.AGENDA);
    values.id_estudiante = perfil.id_estudiante;
    values.fecha_creacion = now_();
    appendObject_(CONFIG.SHEETS.AGENDA, values);
  }
  log_(session.id_usuario, 'AGENDA', values.tipo + ': ' + values.titulo);
  return { success: true, message: 'Agenda guardada.' };
}

function eliminarAgenda(token, idAgenda) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  var row = findRow_(CONFIG.SHEETS.AGENDA, function(a) { return a.id_agenda == idAgenda && a.id_estudiante == perfil.id_estudiante && a.activo != 0; });
  if (row < 0) return fail_('Entrada no encontrada.');
  updateRowById_(CONFIG.SHEETS.AGENDA, 'id_agenda', idAgenda, { activo: 0, fecha_modificacion: now_() });
  log_(session.id_usuario, 'AGENDA_DELETE', String(idAgenda));
  return { success: true };
}

function guardarPreferencias(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  var values = {
    alertas_clases: datos.alertas_clases ? 1 : 0,
    alertas_examenes: datos.alertas_examenes ? 1 : 0,
    alertas_reuniones: datos.alertas_reuniones ? 1 : 0,
    alertas_entregas: datos.alertas_entregas ? 1 : 0,
    minutos_clases: numberOr_(datos.minutos_clases, 15),
    minutos_examenes: numberOr_(datos.minutos_examenes, 60),
    minutos_reuniones: numberOr_(datos.minutos_reuniones, 20),
    minutos_entregas: numberOr_(datos.minutos_entregas, 120),
    instalacion_pwa: datos.instalacion_pwa ? 1 : 0,
    fecha_modificacion: now_()
  };
  var pref = getRows_(CONFIG.SHEETS.PREFERENCIAS).find(function(p) { return p.id_estudiante == perfil.id_estudiante; });
  if (pref) {
    updateRowById_(CONFIG.SHEETS.PREFERENCIAS, 'id_preferencia', pref.id_preferencia, values);
  } else {
    values.id_preferencia = nextId_(CONFIG.SHEETS.PREFERENCIAS);
    values.id_estudiante = perfil.id_estudiante;
    appendObject_(CONFIG.SHEETS.PREFERENCIAS, values);
  }
  log_(session.id_usuario, 'PREFERENCIAS', 'Alertas actualizadas');
  return { success: true, message: 'Preferencias guardadas.' };
}

function obtenerMisInscripciones_(idEstudiante) {
  var secciones = indexBy_(getRows_(CONFIG.SHEETS.SECCIONES), 'id_seccion');
  var asignaturas = indexBy_(getRows_(CONFIG.SHEETS.ASIGNATURAS), 'id_asignatura');
  var aulas = indexBy_(getRows_(CONFIG.SHEETS.AULAS), 'id_aula');
  var horarios = getRows_(CONFIG.SHEETS.HORARIOS);
  return getRows_(CONFIG.SHEETS.INSCRIPCIONES).filter(function(i) {
    return i.id_estudiante == idEstudiante && isActive_(i.activo);
  }).map(function(i) {
    var sec = secciones[i.id_seccion] || {};
    var asig = asignaturas[sec.id_asignatura] || {};
    i.id_asignatura = sec.id_asignatura || '';
    i.codigo_seccion = sec.codigo_seccion || '';
    i.nombre_asignatura = asig.nombre_asignatura || '';
    i.codigo = asig.codigo || '';
    i.carrera = asig.carrera || '';
    i.horarios = horarios.filter(function(h) { return h.id_seccion == i.id_seccion; }).map(function(h) {
      var aula = aulas[h.id_aula] || {};
      return { dia: h.dia, hora_ini: h.hora_ini, hora_fin: h.hora_fin, aula: aula.nombre_aula || 'Sin aula', edificio: aula.edificio || '' };
    });
    return i;
  });
}

function obtenerMisNotas_(idEstudiante, inscripciones) {
  inscripciones = inscripciones || obtenerMisInscripciones_(idEstudiante);
  var inscById = indexBy_(inscripciones, 'id_inscripcion');
  return getRows_(CONFIG.SHEETS.NOTAS).filter(function(n) {
    return !!inscById[n.id_inscripcion];
  }).map(function(n) {
    var i = inscById[n.id_inscripcion];
    n.nombre_asignatura = i.nombre_asignatura;
    n.codigo_seccion = i.codigo_seccion;
    n.id_asignatura = i.id_asignatura;
    return n;
  });
}

function obtenerMisLecturas_(idEstudiante) {
  var asignaturas = indexBy_(getRows_(CONFIG.SHEETS.ASIGNATURAS), 'id_asignatura');
  return getRows_(CONFIG.SHEETS.LECTURAS).filter(function(l) {
    return l.id_estudiante == idEstudiante;
  }).map(function(l) {
    l.nombre_asignatura = l.id_asignatura ? ((asignaturas[l.id_asignatura] || {}).nombre_asignatura || '') : '';
    l.fecha_objetivo_iso = isoDate_(l.fecha_objetivo);
    return l;
  }).sort(function(a, b) {
    var pa = priorityRank_(a.prioridad);
    var pb = priorityRank_(b.prioridad);
    return pa - pb || new Date(a.fecha_objetivo || '2999-12-31') - new Date(b.fecha_objetivo || '2999-12-31');
  });
}

function obtenerMisGrupos_(idEstudiante) {
  var asignaturas = indexBy_(getRows_(CONFIG.SHEETS.ASIGNATURAS), 'id_asignatura');
  return getRows_(CONFIG.SHEETS.GRUPOS).filter(function(g) {
    return g.id_estudiante == idEstudiante;
  }).map(function(g) {
    g.nombre_asignatura = g.id_asignatura ? ((asignaturas[g.id_asignatura] || {}).nombre_asignatura || '') : '';
    g.proxima_fecha_iso = isoDate_(g.proxima_fecha);
    return g;
  }).sort(function(a, b) {
    return new Date(a.proxima_fecha || '2999-12-31') - new Date(b.proxima_fecha || '2999-12-31');
  });
}

function obtenerMiAgenda_(idEstudiante) {
  var asignaturas = indexBy_(getRows_(CONFIG.SHEETS.ASIGNATURAS), 'id_asignatura');
  return getRows_(CONFIG.SHEETS.AGENDA).filter(function(a) {
    return a.id_estudiante == idEstudiante && a.activo != 0;
  }).map(function(a) {
    a.nombre_asignatura = a.id_asignatura ? ((asignaturas[a.id_asignatura] || {}).nombre_asignatura || '') : '';
    a.fecha_iso = isoDate_(a.fecha);
    return a;
  }).sort(function(a, b) {
    return agendaRank_(a) - agendaRank_(b) || String(a.hora_ini || '').localeCompare(String(b.hora_ini || ''));
  });
}

function obtenerPreferencias_(idEstudiante) {
  var pref = getRows_(CONFIG.SHEETS.PREFERENCIAS).find(function(p) { return p.id_estudiante == idEstudiante; });
  if (pref) return pref;
  return obtenerPreferenciasDefault_();
}

function obtenerPreferenciasDefault_() {
  return {
    alertas_clases: 1,
    alertas_examenes: 1,
    alertas_reuniones: 1,
    alertas_entregas: 1,
    minutos_clases: 15,
    minutos_examenes: 60,
    minutos_reuniones: 20,
    minutos_entregas: 120,
    instalacion_pwa: 0
  };
}

function bootstrapResponse_(session, perfil, inscripciones, notas, agenda, preferencias, warning) {
  perfil = perfil || {};
  return {
    success: true,
    warning: warning || '',
    user: publicUserFromPerfil_(session.id_usuario, session.rol, '', perfil),
    perfil: perfil,
    catalogo: [],
    catalogoLoaded: false,
    inscripciones: inscripciones || [],
    notas: notas || [],
    apuntes: [],
    apuntesLoaded: false,
    eventos: [],
    eventosLoaded: false,
    lecturas: [],
    lecturasLoaded: false,
    grupos: [],
    gruposLoaded: false,
    agenda: agenda || [],
    preferencias: preferencias || obtenerPreferenciasDefault_(),
    companeros: [],
    companerosLoaded: false,
    resumen: resumen_(perfil.id_estudiante, inscripciones || [], notas || [], [], [], [], [], agenda || [])
  };
}

function safeCall_(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    return fallback;
  }
}

function obtenerMisCompaneros_(idEstudiante, inscripciones) {
  inscripciones = inscripciones || obtenerMisInscripciones_(idEstudiante);
  var misSecciones = {};
  var misAsignaturas = {};
  inscripciones.forEach(function(i) {
    misSecciones[String(i.id_seccion)] = i;
    misAsignaturas[String(i.id_asignatura)] = i;
  });
  var estudiantes = indexBy_(getRows_(CONFIG.SHEETS.ESTUDIANTES), 'id_estudiante');
  var secciones = indexBy_(getRows_(CONFIG.SHEETS.SECCIONES), 'id_seccion');
  var asignaturas = indexBy_(getRows_(CONFIG.SHEETS.ASIGNATURAS), 'id_asignatura');
  var map = {};
  getRows_(CONFIG.SHEETS.INSCRIPCIONES).forEach(function(i) {
    if (i.activo == 0 || i.id_estudiante == idEstudiante) return;
    var sec = secciones[i.id_seccion] || {};
    var own = misSecciones[String(i.id_seccion)] || misAsignaturas[String(sec.id_asignatura)];
    if (!own) return;
    var estudiante = estudiantes[i.id_estudiante];
    if (!estudiante) return;
    if (!map[i.id_estudiante]) {
      map[i.id_estudiante] = {
        id_estudiante: i.id_estudiante,
        nombre: [estudiante.nombres, estudiante.apellidos].filter(Boolean).join(' '),
        carrera: estudiante.carrera || '',
        semestre: estudiante.semestre || '',
        comparte_contacto: estudiante.comparte_contacto == 1,
        telefono: estudiante.comparte_contacto == 1 ? estudiante.telefono : '',
        email: estudiante.comparte_contacto == 1 ? estudiante.email : '',
        coincidencias: []
      };
    }
    var asig = asignaturas[sec.id_asignatura] || {};
    map[i.id_estudiante].coincidencias.push({
      id_asignatura: sec.id_asignatura,
      nombre_asignatura: asig.nombre_asignatura || own.nombre_asignatura || '',
      codigo_seccion: sec.codigo_seccion || ''
    });
  });
  return Object.keys(map).map(function(k) { return map[k]; }).sort(function(a, b) {
    return String(a.nombre).localeCompare(String(b.nombre));
  });
}

function obtenerMisApuntes_(idEstudiante) {
  var asignaturas = indexBy_(getRows_(CONFIG.SHEETS.ASIGNATURAS), 'id_asignatura');
  return getRows_(CONFIG.SHEETS.APUNTES).filter(function(a) {
    return a.id_estudiante == idEstudiante;
  }).map(function(a) {
    a.nombre_asignatura = a.id_asignatura ? ((asignaturas[a.id_asignatura] || {}).nombre_asignatura || '') : '';
    return a;
  }).sort(function(a, b) {
    return new Date(b.fecha_modificacion || b.fecha_creacion) - new Date(a.fecha_modificacion || a.fecha_creacion);
  });
}

function obtenerMisEventos_(idEstudiante) {
  var asignaturas = indexBy_(getRows_(CONFIG.SHEETS.ASIGNATURAS), 'id_asignatura');
  return getRows_(CONFIG.SHEETS.EVENTOS).filter(function(e) {
    return e.id_estudiante == idEstudiante;
  }).map(function(e) {
    e.nombre_asignatura = e.id_asignatura ? ((asignaturas[e.id_asignatura] || {}).nombre_asignatura || '') : '';
    e.fecha_iso = isoDate_(e.fecha);
    return e;
  }).sort(function(a, b) {
    return new Date(a.fecha) - new Date(b.fecha);
  });
}

function resumen_(idEstudiante, inscripciones, notas, apuntes, eventos, lecturas, grupos, agenda) {
  inscripciones = inscripciones || obtenerMisInscripciones_(idEstudiante);
  notas = notas || obtenerMisNotas_(idEstudiante, inscripciones);
  apuntes = apuntes || obtenerMisApuntes_(idEstudiante);
  eventos = eventos || obtenerMisEventos_(idEstudiante);
  lecturas = lecturas || obtenerMisLecturas_(idEstudiante);
  grupos = grupos || obtenerMisGrupos_(idEstudiante);
  agenda = agenda || obtenerMiAgenda_(idEstudiante);
  var hoy = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][new Date().getDay()];
  var clasesHoy = [];
  inscripciones.forEach(function(i) {
    (i.horarios || []).forEach(function(h) {
      if (normalize_(h.dia) === normalize_(hoy)) clasesHoy.push({ asignatura: i.nombre_asignatura, seccion: i.codigo_seccion, horario: h });
    });
  });
  var promedios = notas.map(function(n) { return n.promedio; }).filter(function(v) { return v !== '' && !isNaN(v); }).map(Number);
  return {
    totalAsignaturas: inscripciones.length,
    promedio: promedio_(promedios) || 0,
    aprobadas: notas.filter(function(n) { return n.estado === 'Aprobada'; }).length,
    clasesHoy: clasesHoy,
    pendientes: eventos.filter(function(e) { return !e.completado; }).length,
    lecturasPendientes: lecturas.filter(function(l) { return String(l.estado || '').toLowerCase() !== 'completada'; }).length,
    gruposActivos: grupos.filter(function(g) { return String(g.estado || '').toLowerCase() !== 'cerrado'; }).length,
    agendaActiva: agenda.length,
    apuntes: apuntes.length
  };
}

function getOwnedInscripcion_(idEstudiante, idInscripcion) {
  return getRows_(CONFIG.SHEETS.INSCRIPCIONES).find(function(i) {
    return i.id_inscripcion == idInscripcion && i.id_estudiante == idEstudiante && i.activo != 0;
  });
}

function estudianteCursaAsignatura_(idEstudiante, idAsignatura) {
  return obtenerMisInscripciones_(idEstudiante).some(function(i) { return i.id_asignatura == idAsignatura; });
}

function requireSession_(token, soft) {
  var session = findSession_(token);
  if (!session) {
    if (soft) return null;
    throw new Error('Sesion no valida.');
  }
  return session;
}

function findSession_(token) {
  if (!token) return null;
  var hash = tokenHash_(token);
  var sheet = getSheet_(CONFIG.SHEETS.SESIONES);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var tokenCol = headers.indexOf('token_hash') + 1;
  if (tokenCol < 1) return null;
  var matches = sheet.getRange(2, tokenCol, lastRow - 1, 1).createTextFinder(hash).matchEntireCell(true).findAll();
  for (var i = matches.length - 1; i >= 0; i--) {
    var row = matches[i].getRow();
    var values = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
    var obj = {};
    headers.forEach(function(h, c) { obj[h] = values[c]; });
    if (obj.activo != 0 && new Date(obj.expira_en).getTime() > Date.now()) return obj;
  }
  return null;
}

function publicUser_(idUsuario, rol, username) {
  var perfil = getPerfilByUser_(idUsuario);
  return publicUserFromPerfil_(idUsuario, rol, username, perfil);
}

function publicUserFromPerfil_(idUsuario, rol, username, perfil) {
  username = username || getUsername_(idUsuario);
  return {
    id: Number(idUsuario),
    username: username,
    rol: rol || CONFIG.ROLES.ESTUDIANTE,
    nombre: perfil ? (perfil.nombres + ' ' + perfil.apellidos).trim() : username
  };
}

function getPerfilByUser_(idUsuario) {
  var perfiles = getRows_(CONFIG.SHEETS.ESTUDIANTES).filter(function(e) { return e.id_usuario == idUsuario; });
  if (!perfiles.length) return null;
  if (perfiles.length === 1) return perfiles[0];
  perfiles.sort(function(a, b) { return perfilRank_(b) - perfilRank_(a); });
  var primary = perfiles[0];
  var merged = mergeProfiles_(primary, perfiles);
  perfiles.slice(1).forEach(function(p) {
    if (p.id_estudiante != primary.id_estudiante) reassignStudentData_(p.id_estudiante, primary.id_estudiante);
  });
  updateRowById_(CONFIG.SHEETS.ESTUDIANTES, 'id_estudiante', primary.id_estudiante, merged);
  return getRows_(CONFIG.SHEETS.ESTUDIANTES).filter(function(e) { return e.id_estudiante == primary.id_estudiante; })[0] || merged;
}

function perfilScore_(perfil) {
  return ['nombres', 'apellidos', 'cedula', 'email', 'telefono', 'carrera', 'semestre', 'turno', 'observaciones'].reduce(function(score, key) {
    return score + (trim_(perfil[key]) ? 1 : 0);
  }, 0);
}

function perfilRank_(perfil) {
  return studentDataCount_(perfil.id_estudiante) * 1000 + perfilScore_(perfil) * 10 + Number(perfil.id_estudiante || 0);
}

function studentDataCount_(idEstudiante) {
  return getRows_(CONFIG.SHEETS.INSCRIPCIONES).filter(function(i) { return i.id_estudiante == idEstudiante && isActive_(i.activo); }).length +
    getRows_(CONFIG.SHEETS.APUNTES).filter(function(i) { return i.id_estudiante == idEstudiante; }).length +
    getRows_(CONFIG.SHEETS.EVENTOS).filter(function(i) { return i.id_estudiante == idEstudiante; }).length +
    getRows_(CONFIG.SHEETS.LECTURAS).filter(function(i) { return i.id_estudiante == idEstudiante; }).length +
    getRows_(CONFIG.SHEETS.GRUPOS).filter(function(i) { return i.id_estudiante == idEstudiante; }).length +
    getRows_(CONFIG.SHEETS.AGENDA).filter(function(i) { return i.id_estudiante == idEstudiante && isActive_(i.activo); }).length;
}

function mergeProfiles_(primary, perfiles) {
  var merged = {};
  Object.keys(primary).forEach(function(k) { merged[k] = primary[k]; });
  perfiles.slice().sort(function(a, b) { return perfilScore_(b) - perfilScore_(a); }).forEach(function(p) {
    ['nombres', 'apellidos', 'cedula', 'email', 'telefono', 'comparte_contacto', 'carrera', 'semestre', 'turno', 'observaciones'].forEach(function(k) {
      if (!trim_(merged[k]) && trim_(p[k])) merged[k] = p[k];
    });
  });
  merged.id_usuario = primary.id_usuario;
  return merged;
}

function updateProfilesByUser_(idUsuario, values) {
  var perfiles = getRows_(CONFIG.SHEETS.ESTUDIANTES).filter(function(e) { return e.id_usuario == idUsuario; });
  if (!perfiles.length) return false;
  perfiles.forEach(function(p) {
    updateRowById_(CONFIG.SHEETS.ESTUDIANTES, 'id_estudiante', p.id_estudiante, values);
  });
  return true;
}

function reassignStudentData_(fromId, toId) {
  [
    CONFIG.SHEETS.INSCRIPCIONES,
    CONFIG.SHEETS.APUNTES,
    CONFIG.SHEETS.EVENTOS,
    CONFIG.SHEETS.LECTURAS,
    CONFIG.SHEETS.GRUPOS,
    CONFIG.SHEETS.AGENDA,
    CONFIG.SHEETS.PREFERENCIAS
  ].forEach(function(sheetName) {
    replaceStudentId_(sheetName, fromId, toId);
  });
}

function replaceStudentId_(sheetName, fromId, toId) {
  var sheet = getSheet_(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return;
  var headers = data[0];
  var col = headers.indexOf('id_estudiante');
  if (col < 0) return;
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][col]) === String(fromId)) sheet.getRange(r + 1, col + 1).setValue(toId);
  }
  clearRows_(sheetName);
}

function getOrCreatePerfil_(idUsuario) {
  var perfil = getPerfilByUser_(idUsuario);
  if (perfil) return perfil;
  var username = getUsername_(idUsuario);
  var nuevo = {
    id_estudiante: nextId_(CONFIG.SHEETS.ESTUDIANTES),
    id_usuario: idUsuario,
    nombres: username || 'Estudiante',
    apellidos: '',
    cedula: '',
    email: '',
    telefono: '',
    comparte_contacto: 0,
    carrera: '',
    semestre: '',
    turno: '',
    observaciones: ''
  };
  appendObject_(CONFIG.SHEETS.ESTUDIANTES, nuevo);
  return nuevo;
}

function getUsername_(idUsuario) {
  var user = getRows_(CONFIG.SHEETS.USUARIOS).find(function(u) { return u.id_usuario == idUsuario; });
  return user ? user.username : '';
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function getSheet_(name) {
  if (SHEET_CACHE_[name]) return SHEET_CACHE_[name];
  var sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet && SCHEMA[name]) {
    sheet = getSpreadsheet_().insertSheet(name);
    sheet.getRange(1, 1, 1, SCHEMA[name].length).setValues([SCHEMA[name]]);
    styleHeader_(sheet, SCHEMA[name].length);
  }
  if (!sheet) throw new Error('Falta la hoja ' + name + '. Ejecuta setupFacenAppV4().');
  if (SCHEMA[name] && sheet.getLastRow() > 0 && !HEADER_CACHE_[name]) {
    ensureHeaders_(sheet, SCHEMA[name]);
    HEADER_CACHE_[name] = true;
  }
  SHEET_CACHE_[name] = sheet;
  return sheet;
}

function getRows_(name) {
  if (ROW_CACHE_[name]) return ROW_CACHE_[name];
  var sheet = getSheet_(name);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    ROW_CACHE_[name] = [];
    return ROW_CACHE_[name];
  }
  var headers = values[0];
  ROW_CACHE_[name] = values.slice(1).filter(function(row) {
    return row.some(function(v) { return v !== ''; });
  }).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
  return ROW_CACHE_[name];
}

function appendObject_(sheetName, obj) {
  var sheet = getSheet_(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(function(h) { return obj[h] === undefined ? '' : obj[h]; }));
  clearRows_(sheetName);
}

function updateRowById_(sheetName, idColumn, idValue, values) {
  return updateRowByKey_(sheetName, idColumn, idValue, values);
}

function updateRowByKey_(sheetName, keyColumn, keyValue, values) {
  var sheet = getSheet_(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var keyIndex = headers.indexOf(keyColumn);
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][keyIndex]) === String(keyValue)) {
      Object.keys(values).forEach(function(k) {
        var c = headers.indexOf(k);
        if (c >= 0) sheet.getRange(r + 1, c + 1).setValue(values[k]);
      });
      clearRows_(sheetName);
      return true;
    }
  }
  return false;
}

function findRow_(sheetName, predicate) {
  var rows = getRows_(sheetName);
  for (var i = 0; i < rows.length; i++) {
    if (predicate(rows[i])) return i + 2;
  }
  return -1;
}

function nextId_(sheetName) {
  var rows = getRows_(sheetName);
  if (!rows.length) return 1;
  var firstKey = Object.keys(rows[0])[0];
  return Math.max.apply(null, rows.map(function(r) { return Number(r[firstKey]) || 0; })) + 1;
}

function clearRows_(sheetName) {
  delete ROW_CACHE_[sheetName];
  if ([CONFIG.SHEETS.ASIGNATURAS, CONFIG.SHEETS.SECCIONES, CONFIG.SHEETS.HORARIOS, CONFIG.SHEETS.AULAS].indexOf(sheetName) >= 0) {
    clearCatalogCache_();
  }
}

function clearCatalogCache_() {
  try {
    CacheService.getScriptCache().remove(catalogCacheKey_());
    CacheService.getScriptCache().remove('facen_v4_catalogo');
  } catch (e) {}
}

function catalogCacheKey_() {
  return 'facen_v4_catalogo_real_xlsx_v2';
}

function isActive_(value) {
  if (value === '' || value === null || value === undefined) return true;
  if (typeof value === 'string') {
    var normalized = value.toLowerCase().trim();
    if (!normalized) return true;
    return ['0', 'false', 'no', 'inactivo', 'inactiva'].indexOf(normalized) < 0;
  }
  return Number(value) !== 0;
}

function withLock_(callback) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function styleHeader_(sheet, cols) {
  sheet.getRange(1, 1, 1, cols).setFontWeight('bold').setBackground('#163a5f').setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  for (var i = 1; i <= cols; i++) sheet.setColumnWidth(i, 150);
}

function ensureHeaders_(sheet, expected) {
  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var added = 0;
  expected.forEach(function(header) {
    if (headers.indexOf(header) < 0) {
      sheet.getRange(1, headers.length + added + 1).setValue(header);
      added++;
    }
  });
  if (added) styleHeader_(sheet, headers.length + added);
}

function seedCatalog_() {
  if (getRows_(CONFIG.SHEETS.AULAS).length === 0) {
    [
      [1, 'Aula 101', 'Bloque A', 45],
      [2, 'Laboratorio Bio 2', 'Bloque B', 28],
      [3, 'Aula Magna', 'Central', 120],
      [4, 'Laboratorio Computacion', 'Bloque C', 32]
    ].forEach(function(r) {
      appendObject_(CONFIG.SHEETS.AULAS, { id_aula: r[0], nombre_aula: r[1], edificio: r[2], capacidad: r[3] });
    });
  }
  if (getRows_(CONFIG.SHEETS.ASIGNATURAS).length === 0) {
    [
      [1, 'MAT101', 'Calculo I', 'Licenciatura en Ciencias Mencion Matematica', 1, 6],
      [2, 'FIS101', 'Fisica General I', 'Licenciatura en Ciencias Mencion Fisica', 1, 5],
      [3, 'BIO120', 'Biologia Celular', 'Licenciatura en Biotecnologia', 2, 5],
      [4, 'QUI110', 'Quimica General', 'Licenciatura en Ciencias Mencion Quimica', 1, 5],
      [5, 'INF140', 'Programacion I', 'Licenciatura en Tecnologia de Produccion', 1, 4]
    ].forEach(function(r) {
      appendObject_(CONFIG.SHEETS.ASIGNATURAS, { id_asignatura: r[0], codigo: r[1], nombre_asignatura: r[2], carrera: r[3], semestre: r[4], creditos: r[5], activo: 1 });
    });
  }
  if (getRows_(CONFIG.SHEETS.SECCIONES).length === 0) {
    [
      [1, 1, 'A', 45], [2, 1, 'B', 45], [3, 2, 'A', 40], [4, 3, 'A', 28], [5, 4, 'A', 40], [6, 5, 'A', 32]
    ].forEach(function(r) {
      appendObject_(CONFIG.SHEETS.SECCIONES, { id_seccion: r[0], id_asignatura: r[1], codigo_seccion: r[2], cupo: r[3], activo: 1 });
    });
  }
  if (getRows_(CONFIG.SHEETS.HORARIOS).length === 0) {
    [
      [1, 1, 'Lunes', '07:30', '09:00', 1],
      [2, 1, 'Miercoles', '07:30', '09:00', 1],
      [3, 2, 'Martes', '18:00', '19:30', 3],
      [4, 2, 'Jueves', '18:00', '19:30', 3],
      [5, 3, 'Lunes', '09:15', '10:45', 3],
      [6, 3, 'Viernes', '09:15', '10:45', 3],
      [7, 4, 'Martes', '10:00', '12:00', 2],
      [8, 5, 'Miercoles', '13:00', '15:00', 3],
      [9, 6, 'Jueves', '15:00', '17:00', 4]
    ].forEach(function(r) {
      appendObject_(CONFIG.SHEETS.HORARIOS, { id_horario: r[0], id_seccion: r[1], dia: r[2], hora_ini: r[3], hora_fin: r[4], id_aula: r[5] });
    });
  }
}

function makeSalt_() {
  return Utilities.getUuid() + Utilities.getUuid();
}

function hashPassword_(password, salt) {
  var value = String(password) + ':' + salt;
  for (var i = 0; i < CONFIG.HASH_ITERATIONS; i++) {
    value = digestHex_(value + ':' + salt + ':' + i);
  }
  return value;
}

function legacyHashPassword_(password, salt) {
  return digestHex_(String(password) + String(salt || ''));
}

function tokenHash_(token) {
  return digestHex_(String(token));
}

function digestHex_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function(b) {
    var v = b < 0 ? b + 256 : b;
    return ('0' + v.toString(16)).slice(-2);
  }).join('');
}

function now_() {
  return Utilities.formatDate(new Date(), 'America/Asuncion', 'yyyy-MM-dd HH:mm:ss');
}

function isoDate_(date) {
  if (!date) return '';
  return Utilities.formatDate(new Date(date), 'America/Asuncion', 'yyyy-MM-dd');
}

function periodoActual_() {
  var d = new Date();
  return (d.getMonth() < 6 ? '1er Semestre ' : '2do Semestre ') + d.getFullYear();
}

function score_(value) {
  if (value === '' || value === null || value === undefined) return '';
  var n = Number(value);
  if (isNaN(n)) return '';
  if (n < 0) n = 0;
  if (n > 5) n = 5;
  return Math.round(n * 100) / 100;
}

function promedio_(values) {
  var nums = values.filter(function(v) { return v !== '' && v !== null && v !== undefined && !isNaN(v); }).map(Number);
  if (!nums.length) return '';
  var sum = nums.reduce(function(a, b) { return a + b; }, 0);
  return Math.round((sum / nums.length) * 100) / 100;
}

function priorityRank_(value) {
  var v = normalize_(value);
  if (v === 'alta') return 0;
  if (v === 'media') return 1;
  if (v === 'baja') return 2;
  return 3;
}

function agendaRank_(item) {
  if (item.fecha) return new Date(item.fecha).getTime();
  var order = dayOrderValue_(item.dia);
  return Date.now() + order * 24 * 60 * 60 * 1000;
}

function dayOrderValue_(day) {
  var n = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].indexOf(normalize_(day));
  return n < 0 ? 99 : n;
}

function numberOr_(value, fallback) {
  var n = Number(value);
  return isNaN(n) ? fallback : n;
}

function indexBy_(rows, key) {
  var map = {};
  rows.forEach(function(r) { map[r[key]] = r; });
  return map;
}

function cleanUsername_(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePayload_(value) {
  if (!value) return {};
  if (typeof value === 'string') {
    try { return JSON.parse(value); }
    catch (e) { return {}; }
  }
  return value;
}

function trim_(value) {
  return String(value || '').trim();
}

function normalize_(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function fail_(message) {
  return { success: false, message: message };
}

function log_(idUsuario, accion, detalle) {
  try {
    appendObject_(CONFIG.SHEETS.LOGS, {
      id_log: nextId_(CONFIG.SHEETS.LOGS),
      fecha: now_(),
      id_usuario: idUsuario || '',
      accion: accion,
      detalle: detalle || ''
    });
  } catch (e) {}
}
