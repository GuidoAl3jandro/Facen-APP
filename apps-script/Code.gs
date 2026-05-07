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
  ESTUDIANTES: ['id_estudiante', 'id_usuario', 'nombres', 'apellidos', 'cedula', 'email', 'telefono', 'carrera', 'semestre', 'turno', 'observaciones'],
  ASIGNATURAS: ['id_asignatura', 'codigo', 'nombre_asignatura', 'carrera', 'semestre', 'creditos', 'activo'],
  SECCIONES: ['id_seccion', 'id_asignatura', 'codigo_seccion', 'cupo', 'activo'],
  HORARIOS_ASIGNATURAS: ['id_horario', 'id_seccion', 'dia', 'hora_ini', 'hora_fin', 'id_aula'],
  AULAS: ['id_aula', 'nombre_aula', 'edificio', 'capacidad'],
  INSCRIPCIONES: ['id_inscripcion', 'id_estudiante', 'id_seccion', 'periodo', 'fecha_inscripcion', 'activo'],
  NOTAS: ['id_nota', 'id_inscripcion', 'parcial1', 'parcial2', 'trabajos', 'final', 'promedio', 'estado', 'observaciones', 'fecha_modificacion'],
  APUNTES: ['id_apunte', 'id_estudiante', 'id_asignatura', 'tipo', 'titulo', 'contenido', 'fecha_creacion', 'fecha_modificacion'],
  EVENTOS_PERSONALES: ['id_evento', 'id_estudiante', 'id_asignatura', 'titulo', 'descripcion', 'fecha', 'hora', 'tipo', 'completado'],
  LOGS: ['id_log', 'fecha', 'id_usuario', 'accion', 'detalle']
};

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
    }
  });
  seedCatalog_();
  return { success: true, message: 'FACEN App v3 inicializada.' };
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
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  var catalogo = obtenerCatalogo(token);
  return {
    success: true,
    user: publicUser_(session.id_usuario, session.rol),
    perfil: perfil,
    catalogo: catalogo.catalogo,
    inscripciones: obtenerMisInscripciones_(perfil.id_estudiante),
    notas: obtenerMisNotas_(perfil.id_estudiante),
    apuntes: obtenerMisApuntes_(perfil.id_estudiante),
    eventos: obtenerMisEventos_(perfil.id_estudiante),
    resumen: resumen_(perfil.id_estudiante)
  };
}

function obtenerCatalogo(token) {
  requireSession_(token);
  var aulas = indexBy_(getRows_(CONFIG.SHEETS.AULAS), 'id_aula');
  var horarios = getRows_(CONFIG.SHEETS.HORARIOS);
  var secciones = getRows_(CONFIG.SHEETS.SECCIONES).filter(function(s) { return s.activo != 0; });
  var seccionesByAsig = {};
  secciones.forEach(function(s) {
    s.horarios = horarios.filter(function(h) { return h.id_seccion == s.id_seccion; }).map(function(h) {
      var aula = aulas[h.id_aula] || {};
      return { dia: h.dia, hora_ini: h.hora_ini, hora_fin: h.hora_fin, aula: aula.nombre_aula || 'Sin aula', edificio: aula.edificio || '' };
    });
    if (!seccionesByAsig[s.id_asignatura]) seccionesByAsig[s.id_asignatura] = [];
    seccionesByAsig[s.id_asignatura].push(s);
  });
  var asignaturas = getRows_(CONFIG.SHEETS.ASIGNATURAS).filter(function(a) { return a.activo != 0; }).map(function(a) {
    a.secciones = seccionesByAsig[a.id_asignatura] || [];
    return a;
  });
  return { success: true, catalogo: asignaturas };
}

function guardarPerfil(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  updateRowById_(CONFIG.SHEETS.ESTUDIANTES, 'id_estudiante', perfil.id_estudiante, {
    nombres: trim_(datos.nombres),
    apellidos: trim_(datos.apellidos),
    cedula: trim_(datos.cedula),
    email: trim_(datos.email),
    telefono: trim_(datos.telefono),
    carrera: trim_(datos.carrera),
    semestre: trim_(datos.semestre),
    turno: trim_(datos.turno),
    observaciones: trim_(datos.observaciones)
  });
  log_(session.id_usuario, 'PERFIL', 'Actualizado');
  return { success: true, message: 'Perfil guardado.' };
}

function inscribirSeccion(token, idSeccion) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  var seccion = getRows_(CONFIG.SHEETS.SECCIONES).find(function(s) { return s.id_seccion == idSeccion && s.activo != 0; });
  if (!seccion) return fail_('La seccion no existe.');
  return withLock_(function() {
    var secciones = indexBy_(getRows_(CONFIG.SHEETS.SECCIONES), 'id_seccion');
    var existentes = getRows_(CONFIG.SHEETS.INSCRIPCIONES).filter(function(i) {
      return i.id_estudiante == perfil.id_estudiante && i.activo != 0;
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
    return { success: true, message: 'Asignatura agregada.' };
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
  datos = datos || {};
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
  log_(session.id_usuario, 'APUNTE_DELETE', String(idApunte));
  return { success: true };
}

function guardarEvento(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = datos || {};
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
  log_(session.id_usuario, 'EVENTO_DELETE', String(idEvento));
  return { success: true };
}

function obtenerMisInscripciones_(idEstudiante) {
  var secciones = indexBy_(getRows_(CONFIG.SHEETS.SECCIONES), 'id_seccion');
  var asignaturas = indexBy_(getRows_(CONFIG.SHEETS.ASIGNATURAS), 'id_asignatura');
  var aulas = indexBy_(getRows_(CONFIG.SHEETS.AULAS), 'id_aula');
  var horarios = getRows_(CONFIG.SHEETS.HORARIOS);
  return getRows_(CONFIG.SHEETS.INSCRIPCIONES).filter(function(i) {
    return i.id_estudiante == idEstudiante && i.activo != 0;
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

function obtenerMisNotas_(idEstudiante) {
  var inscripciones = obtenerMisInscripciones_(idEstudiante);
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

function resumen_(idEstudiante) {
  var inscripciones = obtenerMisInscripciones_(idEstudiante);
  var notas = obtenerMisNotas_(idEstudiante);
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
    clasesHoy: clasesHoy
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
  var rows = getRows_(CONFIG.SHEETS.SESIONES);
  var found = rows.find(function(s) {
    return s.token_hash === hash && s.activo != 0 && new Date(s.expira_en).getTime() > Date.now();
  });
  return found || null;
}

function publicUser_(idUsuario, rol, username) {
  var perfil = getPerfilByUser_(idUsuario);
  return {
    id: Number(idUsuario),
    username: username || getUsername_(idUsuario),
    rol: rol || CONFIG.ROLES.ESTUDIANTE,
    nombre: perfil ? (perfil.nombres + ' ' + perfil.apellidos).trim() : username
  };
}

function getPerfilByUser_(idUsuario) {
  return getRows_(CONFIG.SHEETS.ESTUDIANTES).find(function(e) { return e.id_usuario == idUsuario; }) || null;
}

function getUsername_(idUsuario) {
  var user = getRows_(CONFIG.SHEETS.USUARIOS).find(function(u) { return u.id_usuario == idUsuario; });
  return user ? user.username : '';
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function getSheet_(name) {
  var sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error('Falta la hoja ' + name + '. Ejecuta setupFacenAppV3().');
  return sheet;
}

function getRows_(name) {
  var sheet = getSheet_(name);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  return values.slice(1).filter(function(row) {
    return row.some(function(v) { return v !== ''; });
  }).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function appendObject_(sheetName, obj) {
  var sheet = getSheet_(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(function(h) { return obj[h] === undefined ? '' : obj[h]; }));
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
