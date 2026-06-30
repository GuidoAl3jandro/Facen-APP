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
    CARRERAS: 'CARRERAS',
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
  },
  CANONICAL_URL: 'https://appfacen.github.io/Facen-APP/',
  EMBEDDED_CATALOG: {
    FILE: 'catalogo_csv',
    SCRIPT_ID: 'facen-catalogo-horarios-csv',
    CAREER: 'Licenciatura en Ciencias Mencion Matematica Estadistica',
    FACULTY: 'FACEN',
    VERSION: '2026-2-csv-20260616'
  },
  CATALOG_SNAPSHOT: {
    PREFIX: 'FACEN_CATALOG_SNAPSHOT_',
    CHUNK_SIZE: 7500,
    VERSION_PREFIX: 'sheet-csv-'
  }
};

var SCHEMA = {
  USUARIOS: ['id_usuario', 'username', 'password_hash', 'salt', 'rol', 'activo', 'fecha_creacion', 'ultimo_acceso'],
  SESIONES: ['token_hash', 'id_usuario', 'rol', 'creado_en', 'expira_en', 'activo'],
  ESTUDIANTES: ['id_estudiante', 'id_usuario', 'nombres', 'apellidos', 'cedula', 'email', 'telefono', 'comparte_contacto', 'carrera', 'semestre', 'turno', 'observaciones'],
  CARRERAS: ['id_carrera', 'nombre_carrera', 'facultad', 'duracion_semestres', 'activo'],
  ASIGNATURAS: ['id_asignatura', 'codigo', 'nombre_asignatura', 'carrera', 'semestre', 'creditos', 'activo'],
  SECCIONES: ['id_seccion', 'id_asignatura', 'codigo_seccion', 'cupo', 'activo'],
  HORARIOS_ASIGNATURAS: ['id_horario', 'id_seccion', 'dia', 'hora_ini', 'hora_fin', 'id_aula'],
  AULAS: ['id_aula', 'nombre_aula', 'edificio', 'capacidad'],
  INSCRIPCIONES: ['id_inscripcion', 'id_estudiante', 'id_seccion', 'semestre_anho', 'fecha_inscripcion', 'activo', 'periodo', 'id_asignatura_snapshot', 'codigo_asignatura_snapshot', 'nombre_asignatura_snapshot', 'codigo_seccion_snapshot', 'horarios_snapshot', 'fuente_catalogo', 'version_catalogo'],
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
var EMBEDDED_CATALOG_CACHE_ = null;
var SNAPSHOT_CATALOG_CACHE_ = null;
var CATALOG_LOOKUP_CACHE_ = null;
var SHEET_ALIASES_ = {
  HORARIOS_ASIGNATURAS: ['HORARIOS_ASIGNATURAS', 'HORARIOS']
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
        carrera: canonicalCareerName_(datos.carrera),
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

function recuperarContrasena(datos) {
  try {
    datos = normalizePayload_(datos);
    var username = cleanUsername_(datos.username);
    if (!username) return fail_('Ingresa tu usuario.');
    if (!datos.email && !datos.cedula) return fail_('Ingresa el email o la cedula guardada en tu perfil.');
    return withLock_(function() {
      var user = getRows_(CONFIG.SHEETS.USUARIOS).find(function(u) { return cleanUsername_(u.username) === username; });
      if (!user || !isActive_(user.activo)) return fail_('No encontramos una cuenta activa con ese usuario.');
      var perfil = getPerfilByUser_(user.id_usuario) || {};
      var emailOk = datos.email && normalize_(perfil.email) === normalize_(datos.email);
      var cedulaOk = datos.cedula && digitsOnly_(perfil.cedula) === digitsOnly_(datos.cedula);
      if (!emailOk && !cedulaOk) return fail_('Los datos no coinciden con el perfil guardado.');
      var tempPassword = makeTempPassword_();
      var salt = makeSalt_();
      updateRowById_(CONFIG.SHEETS.USUARIOS, 'id_usuario', user.id_usuario, {
        password_hash: hashPassword_(tempPassword, salt),
        salt: salt,
        ultimo_acceso: ''
      });
      log_(user.id_usuario, 'RECUPERAR_CONTRASENA', 'Clave temporal generada');
      return {
        success: true,
        message: 'Contrasena temporal generada.',
        temporaryPassword: tempPassword
      };
    });
  } catch (e) {
    return fail_('No se pudo recuperar la contrasena. ' + e.message);
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
    var inscripciones = safeCall_(function() { return obtenerMisInscripciones_(perfil.id_estudiante); }, []);
    var notas = safeCall_(function() { return obtenerMisNotas_(perfil.id_estudiante, inscripciones); }, []);
    var agenda = safeCall_(function() { return obtenerMiAgenda_(perfil.id_estudiante); }, []);
    var apuntes = safeCall_(function() { return obtenerMisApuntes_(perfil.id_estudiante); }, []);
    var eventos = safeCall_(function() { return obtenerMisEventos_(perfil.id_estudiante); }, []);
    var lecturas = safeCall_(function() { return obtenerMisLecturas_(perfil.id_estudiante); }, []);
    var grupos = safeCall_(function() { return obtenerMisGrupos_(perfil.id_estudiante); }, []);
    var preferencias = safeCall_(function() { return obtenerPreferencias_(perfil.id_estudiante); }, obtenerPreferenciasDefault_());
    return bootstrapResponse_(session, perfil, inscripciones, notas, agenda, preferencias, '', {
      apuntes: apuntes,
      eventos: eventos,
      lecturas: lecturas,
      grupos: grupos
    });
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
    if (vista === 'catalogo') return { success: true, catalogo: obtenerCatalogoParaPerfil_(perfil, false), carreras: obtenerCarreras_() };
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

function obtenerCarreras() {
  return { success: true, carreras: obtenerCarreras_() };
}

function diagnosticoCatalogoRapido() {
  var catalogo = obtenerCatalogo_(false);
  var counts = catalogCounts_(catalogo);
  var meta = catalogSnapshotMeta_();
  return {
    success: true,
    fuente: meta.version ? 'snapshot_hoja_calculo' : 'csv_embebido_gas',
    version: meta.version || CONFIG.EMBEDDED_CATALOG.VERSION,
    actualizado_en: meta.updated_at || '',
    actualizado_por: meta.updated_by || '',
    asignaturas: counts.asignaturas,
    secciones: counts.secciones,
    horarios: counts.horarios,
    url_canonica: CONFIG.CANONICAL_URL
  };
}

function actualizarCatalogoDesdeHoja(token) {
  var session = requireSession_(token);
  var perfil = getOrCreatePerfil_(session.id_usuario);
  return withLock_(function() {
    var catalogo = buildSheetCatalog_();
    if (!catalogo.length) {
      return fail_('No hay asignaturas activas en la hoja de calculo para actualizar el catalogo.');
    }
    var csv = catalogToCsv_(catalogo);
    var counts = catalogCounts_(catalogo);
    var version = CONFIG.CATALOG_SNAPSHOT.VERSION_PREFIX + Utilities.formatDate(new Date(), 'America/Asuncion', 'yyyyMMdd-HHmmss');
    saveCatalogSnapshotCsv_(csv, {
      version: version,
      updated_at: now_(),
      updated_by: session.id_usuario,
      asignaturas: counts.asignaturas,
      secciones: counts.secciones,
      horarios: counts.horarios
    });
    clearCatalogCache_();
    log_(session.id_usuario, 'CATALOGO_ACTUALIZAR', counts.asignaturas + ' asignaturas, ' + counts.secciones + ' secciones, ' + counts.horarios + ' horarios');
    var inscripciones = obtenerMisInscripciones_(perfil.id_estudiante);
    var notas = obtenerMisNotas_(perfil.id_estudiante, inscripciones);
    var agenda = obtenerMiAgenda_(perfil.id_estudiante);
    return {
      success: true,
      message: 'Catalogo actualizado desde la hoja de calculo.',
      catalogo: obtenerCatalogoParaPerfil_(perfil, false),
      carreras: obtenerCarreras_(),
      catalogoLoaded: true,
      inscripciones: inscripciones,
      notas: notas,
      agenda: agenda,
      resumen: resumen_(perfil.id_estudiante, inscripciones, notas, obtenerMisApuntes_(perfil.id_estudiante), obtenerMisEventos_(perfil.id_estudiante), obtenerMisLecturas_(perfil.id_estudiante), obtenerMisGrupos_(perfil.id_estudiante), agenda),
      diagnostico: diagnosticoCatalogoRapido()
    };
  });
}

function obtenerCatalogo(token) {
  var session = requireSession_(token);
  var perfil = getOrCreatePerfil_(session.id_usuario);
  return { success: true, catalogo: obtenerCatalogoParaPerfil_(perfil, false), carreras: obtenerCarreras_() };
}

function obtenerCatalogoCarrera(token, carrera) {
  requireSession_(token);
  return { success: true, catalogo: obtenerCatalogoPorCarrera_(carrera, false), carreras: obtenerCarreras_() };
}

function obtenerCatalogo_(useCache) {
  var cacheKey = catalogCacheKey_();
  if (useCache !== false) {
    try {
      var cached = CacheService.getScriptCache().get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
  }
  var snapshot = snapshotCatalogo_();
  if (snapshot.length) {
    cacheCatalog_(cacheKey, snapshot);
    return snapshot;
  }
  var embedded = embeddedCatalogo_();
  if (embedded.length) {
    cacheCatalog_(cacheKey, embedded);
    return embedded;
  }
  ensureCatalogSeeded_();
  var asignaturas = buildSheetCatalog_();
  if (!asignaturas.length) asignaturas = defaultCatalogo_();
  cacheCatalog_(cacheKey, asignaturas);
  return asignaturas;
}

function cacheCatalog_(cacheKey, catalogo) {
  try {
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(catalogo), 600);
  } catch (e) {}
}

function buildSheetCatalog_() {
  var carreras = careerMap_();
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
  var asignaturas = getRows_(CONFIG.SHEETS.ASIGNATURAS).filter(function(a) {
    return isActive_(a.activo) && isSelectableAsignatura_(a);
  }).map(function(a) {
    a.codigo = a.codigo || ('ASIG-' + a.id_asignatura);
    a.nombre_asignatura = a.nombre_asignatura || a.nombre || 'Asignatura sin nombre';
    a.carrera = carreras[normalize_(a.carrera)] || a.carrera || 'FACEN';
    a.semestre = a.semestre || '';
    a.creditos = a.creditos || '';
    a.secciones = seccionesByAsig[a.id_asignatura] || [];
    return a;
  }).sort(function(a, b) {
    return String(a.carrera || '').localeCompare(String(b.carrera || '')) ||
      String(a.nombre_asignatura || '').localeCompare(String(b.nombre_asignatura || ''));
  });
  return asignaturas;
}

function obtenerCatalogoParaPerfil_(perfil, useCache) {
  if (!perfil || !trim_(perfil.carrera)) return [];
  return obtenerCatalogoPorCarrera_(perfil.carrera, useCache);
}

function obtenerCatalogoPorCarrera_(carrera, useCache) {
  var catalogo = obtenerCatalogo_(useCache);
  var normalized = normalize_(carrera);
  if (!normalized) return [];
  var exact = catalogo.filter(function(a) { return normalize_(a.carrera) === normalized; });
  if (exact.length) return exact;
  var related = catalogo.filter(function(a) { return careerMatches_(a.carrera, carrera); });
  if (related.length) return related;
  return catalogo;
}

function careerMatches_(catalogCareer, profileCareer) {
  var catalog = normalize_(catalogCareer);
  var profile = normalize_(profileCareer);
  if (!catalog || !profile) return false;
  if (catalog === profile || catalog.indexOf(profile) >= 0 || profile.indexOf(catalog) >= 0) return true;
  var catalogTokens = meaningfulCareerTokens_(catalog);
  var profileTokens = meaningfulCareerTokens_(profile);
  if (!catalogTokens.length || !profileTokens.length) return false;
  var hits = profileTokens.filter(function(token) { return catalogTokens.indexOf(token) >= 0; }).length;
  return hits >= Math.min(2, profileTokens.length);
}

function meaningfulCareerTokens_(value) {
  var stop = {
    licenciatura: true,
    ciencias: true,
    mencion: true,
    facen: true,
    en: true,
    de: true,
    del: true,
    la: true,
    el: true,
    y: true
  };
  return String(value || '').split(/[^a-z0-9]+/).filter(function(token) {
    return token.length > 2 && !stop[token];
  });
}

function obtenerCarreras_() {
  var map = {};
  try {
    getRows_(CONFIG.SHEETS.CARRERAS).forEach(function(c) {
      var name = trim_(c.nombre_carrera || c.carrera || c.nombre);
      if (name && isActive_(c.activo)) map[normalize_(name)] = {
        id_carrera: c.id_carrera || '',
        nombre_carrera: name,
        facultad: c.facultad || '',
        duracion_semestres: c.duracion_semestres || ''
      };
    });
  } catch (e) {}
  if (!Object.keys(map).length) {
    try {
      seedCatalog_();
      getRows_(CONFIG.SHEETS.CARRERAS).forEach(function(c) {
        var name = trim_(c.nombre_carrera || c.carrera || c.nombre);
        if (name && isActive_(c.activo)) map[normalize_(name)] = {
          id_carrera: c.id_carrera || '',
          nombre_carrera: name,
          facultad: c.facultad || '',
          duracion_semestres: c.duracion_semestres || ''
        };
      });
    } catch (e) {}
  }
  embeddedCarreras_().forEach(function(c) {
    if (c.nombre_carrera) map[normalize_(c.nombre_carrera)] = c;
  });
  if (!Object.keys(map).length) {
    getRows_(CONFIG.SHEETS.ASIGNATURAS).forEach(function(a) {
      var name = trim_(a.carrera);
      if (name) map[normalize_(name)] = {
        id_carrera: '',
        nombre_carrera: name,
        facultad: 'FACEN',
        duracion_semestres: ''
      };
    });
  }
  if (!Object.keys(map).length) {
    defaultCarreras_().forEach(function(c) {
      map[normalize_(c.nombre_carrera)] = c;
    });
  }
  return Object.keys(map).map(function(k) { return map[k]; }).sort(function(a, b) {
    return String(a.nombre_carrera || '').localeCompare(String(b.nombre_carrera || ''));
  });
}

function defaultCarreras_() {
  return [
    [1, 'Licenciatura en Biotecnologia', 'FACEN', 10],
    [2, 'Licenciatura en Ciencias Mencion Biologia', 'FACEN', 10],
    [3, 'Licenciatura en Ciencias Mencion Fisica', 'FACEN', 10],
    [4, 'Licenciatura en Ciencias Mencion Geologia', 'FACEN', 10],
    [5, 'Licenciatura en Ciencias Mencion Matematica Estadistica', 'FACEN', 10],
    [6, 'Licenciatura en Ciencias Mencion Matematica Pura', 'FACEN', 10],
    [7, 'Licenciatura en Ciencias Mencion Quimica', 'FACEN', 10],
    [8, 'Licenciatura en Educacion Matematica', 'FACEN', 10],
    [9, 'Licenciatura en Fisica Medica', 'FACEN', 10],
    [10, 'Licenciatura en Logistica y Gestion del Transporte', 'FACEN', 10],
    [11, 'Licenciatura en Radiologia e Imagenologia', 'FACEN', 10],
    [12, 'Licenciatura en Tecnologia de Produccion', 'FACEN', 10]
  ].map(function(r) {
    return {
      id_carrera: r[0],
      nombre_carrera: r[1],
      facultad: r[2],
      duracion_semestres: r[3]
    };
  });
}

function careerMap_() {
  var map = {};
  obtenerCarreras_().forEach(function(c) {
    map[normalize_(c.nombre_carrera)] = c.nombre_carrera;
  });
  return map;
}

function canonicalCareerName_(value) {
  var raw = trim_(value);
  if (!raw) return '';
  var mapped = careerMap_()[normalize_(raw)];
  return mapped || raw;
}

function isSelectableAsignatura_(asignatura) {
  var name = normalize_(asignatura.nombre_asignatura || asignatura.nombre);
  return name.indexOf('asueto') < 0 &&
    name.indexOf('feriado') < 0 &&
    name.indexOf('receso') < 0;
}

function ensureCatalogSeeded_() {
  if (embeddedCatalogo_().length) return;
  if (getRows_(CONFIG.SHEETS.ASIGNATURAS).length && getRows_(CONFIG.SHEETS.SECCIONES).length) return;
  seedCatalog_();
}

function snapshotCatalogo_() {
  if (SNAPSHOT_CATALOG_CACHE_) return SNAPSHOT_CATALOG_CACHE_;
  var meta = catalogSnapshotMeta_();
  SNAPSHOT_CATALOG_CACHE_ = catalogoFromCsv_(catalogSnapshotCsv_(), {
    source: 'snapshot_hoja_calculo',
    version: meta.version || '',
    legacySequentialIds: false
  });
  return SNAPSHOT_CATALOG_CACHE_;
}

function embeddedCatalogo_() {
  if (EMBEDDED_CATALOG_CACHE_) return EMBEDDED_CATALOG_CACHE_;
  EMBEDDED_CATALOG_CACHE_ = catalogoFromCsv_(embeddedCatalogCsv_(), {
    source: 'csv_embebido_gas',
    version: CONFIG.EMBEDDED_CATALOG.VERSION,
    legacySequentialIds: true,
    defaultCareer: CONFIG.EMBEDDED_CATALOG.CAREER
  });
  return EMBEDDED_CATALOG_CACHE_;
}

function catalogoFromCsv_(csv, options) {
  options = options || {};
  csv = trim_(csv);
  if (!csv) return [];
  var rows;
  try {
    rows = Utilities.parseCsv(csv);
  } catch (e) {
    return [];
  }
  if (!rows || rows.length < 2) {
    return [];
  }
  var headers = rows.shift().map(normalizeCsvHeader_);
  var subjects = {};
  var subjectOrder = [];
  var sectionOrder = 0;
  rows.forEach(function(row) {
    var item = {};
    headers.forEach(function(header, index) {
      item[header] = trim_(row[index]);
    });
    var name = item.nombre_asignatura || item.asignatura || item.nombre;
    if (!name || !isSelectableAsignatura_({ nombre_asignatura: name })) return;
    var code = item.codigo_asignatura || item.codigo || '';
    var career = item.carrera || options.defaultCareer || CONFIG.EMBEDDED_CATALOG.CAREER;
    var subjectId = item.id_asignatura || item.id_materia || '';
    var subjectKey = subjectId ? ('id|' + subjectId) : normalize_([code, name, career].join('|'));
    if (!subjects[subjectKey]) {
      if (!subjectId) {
        subjectId = options.legacySequentialIds ? 1000 + subjectOrder.length + 1 : stableCatalogId_('ASIG', [code, name, career]);
      }
      subjects[subjectKey] = {
        id_asignatura: subjectId,
        codigo: code || 'S/C',
        nombre_asignatura: name,
        carrera: career,
        semestre: item.semestre || '',
        periodo: item.semestre || '',
        creditos: '',
        activo: 1,
        fuente: options.source || 'csv',
        version_catalogo: options.version || '',
        secciones: [],
        _sectionMap: {}
      };
      subjectOrder.push(subjects[subjectKey]);
    }
    var subject = subjects[subjectKey];
    var sectionCode = item.seccion || 'Unica';
    var sectionId = item.id_seccion || '';
    var sectionKey = sectionId ? ('id|' + sectionId) : normalize_(sectionCode);
    if (!subject._sectionMap[sectionKey]) {
      sectionOrder++;
      if (!sectionId) {
        sectionId = options.legacySequentialIds ? 2000 + sectionOrder : stableCatalogId_('SEC', [subject.id_asignatura, sectionCode]);
      }
      subject._sectionMap[sectionKey] = {
        id_seccion: sectionId,
        id_asignatura: subject.id_asignatura,
        codigo_seccion: sectionCode,
        cupo: '',
        activo: 1,
        fuente: options.source || 'csv',
        version_catalogo: options.version || '',
        horarios: []
      };
      subject.secciones.push(subject._sectionMap[sectionKey]);
    }
    subject._sectionMap[sectionKey].horarios.push({
      dia: item.dia || '',
      hora_ini: item.hora_inicio || item.hora_ini || '',
      hora_fin: item.hora_fin || '',
      aula: item.aula || 'Sin aula',
      edificio: item.edificio || '',
      docente: item.docente || '',
      periodo: item.semestre || ''
    });
  });
  return subjectOrder.map(function(subject) {
    delete subject._sectionMap;
    subject.secciones.sort(function(a, b) {
      return String(a.codigo_seccion || '').localeCompare(String(b.codigo_seccion || ''));
    });
    return subject;
  }).sort(function(a, b) {
    return String(a.nombre_asignatura || '').localeCompare(String(b.nombre_asignatura || ''));
  });
}

function stableCatalogId_(prefix, parts) {
  return prefix + '-' + digestHex_(parts.map(function(v) { return normalize_(v); }).join('|')).slice(0, 12);
}

function embeddedCatalogCsv_() {
  try {
    var html = HtmlService.createHtmlOutputFromFile(CONFIG.EMBEDDED_CATALOG.FILE).getContent();
    var pattern = new RegExp("<script\\b[^>]*id=[\"']" + CONFIG.EMBEDDED_CATALOG.SCRIPT_ID + "[\"'][^>]*>([\\s\\S]*?)<\\/script>", 'i');
    var match = html.match(pattern);
    return trim_((match ? match[1] : html).replace(/^\uFEFF/, ''));
  } catch (e) {
    return '';
  }
}

function normalizeCsvHeader_(value) {
  return normalize_(value).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function catalogToCsv_(catalogo) {
  var headers = ['id_asignatura', 'codigo_asignatura', 'nombre_asignatura', 'id_seccion', 'seccion', 'dia', 'hora_inicio', 'hora_fin', 'aula', 'edificio', 'docente', 'semestre', 'carrera'];
  var rows = [headers];
  (catalogo || []).forEach(function(asignatura) {
    (asignatura.secciones || []).forEach(function(seccion) {
      var horarios = seccion.horarios && seccion.horarios.length ? seccion.horarios : [{}];
      horarios.forEach(function(horario) {
        rows.push([
          asignatura.id_asignatura,
          asignatura.codigo,
          asignatura.nombre_asignatura,
          seccion.id_seccion,
          seccion.codigo_seccion,
          horario.dia || '',
          horario.hora_ini || '',
          horario.hora_fin || '',
          horario.aula || '',
          horario.edificio || '',
          horario.docente || '',
          asignatura.semestre || asignatura.periodo || '',
          asignatura.carrera || ''
        ]);
      });
    });
  });
  return rows.map(function(row) {
    return row.map(csvCell_).join(',');
  }).join('\n');
}

function csvCell_(value) {
  value = String(value === null || value === undefined ? '' : value);
  if (/[",\n\r]/.test(value)) return '"' + value.replace(/"/g, '""') + '"';
  return value;
}

function saveCatalogSnapshotCsv_(csv, meta) {
  var props = PropertiesService.getScriptProperties();
  var prefix = CONFIG.CATALOG_SNAPSHOT.PREFIX;
  clearCatalogSnapshot_(props);
  var chunkSize = CONFIG.CATALOG_SNAPSHOT.CHUNK_SIZE;
  var chunks = [];
  for (var i = 0; i < csv.length; i += chunkSize) {
    chunks.push(csv.slice(i, i + chunkSize));
  }
  props.setProperty(prefix + 'chunks', String(chunks.length));
  chunks.forEach(function(chunk, index) {
    props.setProperty(prefix + 'csv_' + index, chunk);
  });
  Object.keys(meta || {}).forEach(function(key) {
    props.setProperty(prefix + key, String(meta[key]));
  });
}

function clearCatalogSnapshot_(props) {
  props = props || PropertiesService.getScriptProperties();
  var prefix = CONFIG.CATALOG_SNAPSHOT.PREFIX;
  var count = Number(props.getProperty(prefix + 'chunks') || 0);
  for (var i = 0; i < count; i++) props.deleteProperty(prefix + 'csv_' + i);
  ['chunks', 'version', 'updated_at', 'updated_by', 'asignaturas', 'secciones', 'horarios'].forEach(function(key) {
    props.deleteProperty(prefix + key);
  });
}

function catalogSnapshotCsv_() {
  try {
    var props = PropertiesService.getScriptProperties();
    var prefix = CONFIG.CATALOG_SNAPSHOT.PREFIX;
    var count = Number(props.getProperty(prefix + 'chunks') || 0);
    if (!count) return '';
    var parts = [];
    for (var i = 0; i < count; i++) parts.push(props.getProperty(prefix + 'csv_' + i) || '');
    return parts.join('');
  } catch (e) {
    return '';
  }
}

function catalogSnapshotMeta_() {
  try {
    var props = PropertiesService.getScriptProperties();
    var prefix = CONFIG.CATALOG_SNAPSHOT.PREFIX;
    return {
      version: props.getProperty(prefix + 'version') || '',
      updated_at: props.getProperty(prefix + 'updated_at') || '',
      updated_by: props.getProperty(prefix + 'updated_by') || '',
      asignaturas: props.getProperty(prefix + 'asignaturas') || '',
      secciones: props.getProperty(prefix + 'secciones') || '',
      horarios: props.getProperty(prefix + 'horarios') || ''
    };
  } catch (e) {
    return {};
  }
}

function catalogCounts_(catalogo) {
  var counts = { asignaturas: (catalogo || []).length, secciones: 0, horarios: 0 };
  (catalogo || []).forEach(function(asignatura) {
    counts.secciones += (asignatura.secciones || []).length;
    (asignatura.secciones || []).forEach(function(seccion) {
      counts.horarios += (seccion.horarios || []).length;
    });
  });
  return counts;
}

function embeddedCarreras_() {
  var map = {};
  snapshotCatalogo_().concat(embeddedCatalogo_()).forEach(function(asignatura) {
    var name = trim_(asignatura.carrera);
    if (name) map[normalize_(name)] = {
      id_carrera: asignatura.id_carrera || 'CSV-2026-2',
      nombre_carrera: name,
      facultad: CONFIG.EMBEDDED_CATALOG.FACULTY,
      duracion_semestres: ''
    };
  });
  return Object.keys(map).map(function(key) { return map[key]; });
}

function catalogLookups_() {
  if (CATALOG_LOOKUP_CACHE_) return CATALOG_LOOKUP_CACHE_;
  var lookups = {
    asignaturas: {},
    secciones: {}
  };
  obtenerCatalogo_(true).forEach(function(asignatura) {
    lookups.asignaturas[String(asignatura.id_asignatura)] = asignatura;
    (asignatura.secciones || []).forEach(function(seccion) {
      lookups.secciones[String(seccion.id_seccion)] = seccion;
    });
  });
  CATALOG_LOOKUP_CACHE_ = lookups;
  return CATALOG_LOOKUP_CACHE_;
}

function mergedAsignaturasIndex_() {
  var map = {};
  var embedded = catalogLookups_().asignaturas;
  Object.keys(embedded).forEach(function(key) { map[key] = embedded[key]; });
  try {
    getRows_(CONFIG.SHEETS.ASIGNATURAS).forEach(function(row) {
      if (!map[row.id_asignatura]) map[row.id_asignatura] = row;
    });
  } catch (e) {}
  return map;
}

function mergedSeccionesIndex_() {
  var map = {};
  var embedded = catalogLookups_().secciones;
  Object.keys(embedded).forEach(function(key) { map[key] = embedded[key]; });
  try {
    getRows_(CONFIG.SHEETS.SECCIONES).forEach(function(row) {
      if (!map[row.id_seccion]) map[row.id_seccion] = row;
    });
  } catch (e) {}
  return map;
}

function findCatalogSeccion_(idSeccion) {
  var seccion = catalogLookups_().secciones[String(idSeccion)];
  if (seccion && isActive_(seccion.activo)) return seccion;
  try {
    return getRows_(CONFIG.SHEETS.SECCIONES).find(function(s) {
      return s.id_seccion == idSeccion && isActive_(s.activo);
    }) || null;
  } catch (e) {
    return null;
  }
}

function findCatalogAsignatura_(idAsignatura) {
  var asignatura = catalogLookups_().asignaturas[String(idAsignatura)];
  if (asignatura && isActive_(asignatura.activo)) return asignatura;
  try {
    return getRows_(CONFIG.SHEETS.ASIGNATURAS).find(function(a) {
      return a.id_asignatura == idAsignatura && isActive_(a.activo);
    }) || null;
  } catch (e) {
    return null;
  }
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
    carrera: canonicalCareerName_(datos.carrera),
    semestre: trim_(datos.semestre),
    turno: trim_(datos.turno),
    observaciones: trim_(datos.observaciones)
  };
  if (!updateRowById_(CONFIG.SHEETS.ESTUDIANTES, 'id_estudiante', perfil.id_estudiante, values)) {
    return fail_('No se encontro la fila de perfil para actualizar. Reintenta iniciar sesion.');
  }
  if (datos.nueva_password) {
    if (String(datos.nueva_password).length < 8) return fail_('La nueva contrasena debe tener al menos 8 caracteres.');
    var salt = makeSalt_();
    if (!updateRowById_(CONFIG.SHEETS.USUARIOS, 'id_usuario', session.id_usuario, {
      password_hash: hashPassword_(datos.nueva_password, salt),
      salt: salt
    })) {
      return fail_('No se pudo actualizar la contrasena.');
    }
  }
  Object.keys(values).forEach(function(key) {
    perfil[key] = values[key];
  });
  log_(session.id_usuario, 'PERFIL', 'Actualizado');
  return {
    success: true,
    message: 'Perfil guardado.',
    perfil: perfil,
    user: publicUserFromPerfil_(session.id_usuario, session.rol, '', perfil),
    catalogo: obtenerCatalogoParaPerfil_(perfil, false),
    carreras: obtenerCarreras_(),
    catalogoLoaded: true
  };
}

function inscribirSeccion(token, idSeccion) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  var seccion = findCatalogSeccion_(idSeccion);
  if (!seccion) return fail_('La seccion no existe.');
  var asignatura = findCatalogAsignatura_(seccion.id_asignatura) || {};
  return withLock_(function() {
    var secciones = mergedSeccionesIndex_();
    var existentes = getRows_(CONFIG.SHEETS.INSCRIPCIONES).filter(function(i) {
      return i.id_estudiante == perfil.id_estudiante && isActive_(i.activo);
    });
    if (existentes.some(function(i) { return i.id_seccion == idSeccion; })) return fail_('Ya estas inscripto en esa seccion.');
    if (existentes.some(function(i) {
      var sec = secciones[i.id_seccion];
      return sec && sec.id_asignatura == seccion.id_asignatura;
    })) return fail_('Ya tenes una seccion de esa asignatura.');

    var idInscripcion = nextId_(CONFIG.SHEETS.INSCRIPCIONES);
    var periodo = periodoActual_();
    appendObject_(CONFIG.SHEETS.INSCRIPCIONES, {
      id_inscripcion: idInscripcion,
      id_estudiante: perfil.id_estudiante,
      id_seccion: idSeccion,
      semestre_anho: periodo,
      fecha_inscripcion: now_(),
      activo: 1,
      periodo: periodo,
      id_asignatura_snapshot: seccion.id_asignatura || '',
      codigo_asignatura_snapshot: asignatura.codigo || '',
      nombre_asignatura_snapshot: asignatura.nombre_asignatura || '',
      codigo_seccion_snapshot: seccion.codigo_seccion || '',
      horarios_snapshot: JSON.stringify(seccion.horarios || []),
      fuente_catalogo: seccion.fuente || asignatura.fuente || '',
      version_catalogo: seccion.version_catalogo || asignatura.version_catalogo || ''
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
    SpreadsheetApp.flush();
    clearRows_(CONFIG.SHEETS.INSCRIPCIONES);
    clearRows_(CONFIG.SHEETS.NOTAS);
    log_(session.id_usuario, 'INSCRIPCION', String(idSeccion));
    var inscripciones = obtenerMisInscripciones_(perfil.id_estudiante);
    return {
      success: true,
      message: 'Asignatura agregada.',
      inscripciones: inscripciones,
      notas: obtenerMisNotas_(perfil.id_estudiante, inscripciones),
      resumen: resumen_(perfil.id_estudiante, inscripciones, null, [], [], [], [], obtenerMiAgenda_(perfil.id_estudiante)),
      catalogo: obtenerCatalogoParaPerfil_(perfil, false),
      catalogoLoaded: true
    };
  });
}

function quitarInscripcion(token, idInscripcion) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  if (!getOwnedInscripcion_(perfil.id_estudiante, idInscripcion)) return fail_('Inscripcion no encontrada.');
  if (!updateRowById_(CONFIG.SHEETS.INSCRIPCIONES, 'id_inscripcion', idInscripcion, { activo: 0 })) {
    return fail_('No se pudo quitar la asignatura.');
  }
  log_(session.id_usuario, 'DESINSCRIPCION', String(idInscripcion));
  var inscripciones = obtenerMisInscripciones_(perfil.id_estudiante);
  var agenda = obtenerMiAgenda_(perfil.id_estudiante);
  return {
    success: true,
    message: 'Asignatura quitada.',
    inscripciones: inscripciones,
    notas: obtenerMisNotas_(perfil.id_estudiante, inscripciones),
    resumen: resumen_(perfil.id_estudiante, inscripciones, null, [], [], [], [], agenda)
  };
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
  if (!updateRowById_(CONFIG.SHEETS.NOTAS, 'id_nota', nota.id_nota, values)) {
    return fail_('No se pudo guardar la nota.');
  }
  log_(session.id_usuario, 'NOTA', String(idInscripcion));
  return { success: true, message: 'Nota guardada.' };
}

function guardarApunte(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  if (!datos.titulo) return fail_('Agrega un titulo.');
  var idAsignatura = datos.id_asignatura ? trim_(datos.id_asignatura) : '';
  if (idAsignatura && !estudianteCursaAsignatura_(perfil.id_estudiante, idAsignatura)) return fail_('Solo podes asociar apuntes a tus asignaturas.');
  if (datos.id_apunte) {
    var apunte = getRows_(CONFIG.SHEETS.APUNTES).find(function(a) {
      return a.id_apunte == datos.id_apunte && a.id_estudiante == perfil.id_estudiante;
    });
    if (!apunte) return fail_('Apunte no encontrado.');
    if (!updateRowById_(CONFIG.SHEETS.APUNTES, 'id_apunte', datos.id_apunte, {
      id_asignatura: idAsignatura,
      tipo: trim_(datos.tipo || 'apunte'),
      titulo: trim_(datos.titulo),
      contenido: trim_(datos.contenido),
      fecha_modificacion: now_()
    })) {
      return fail_('No se pudo actualizar el apunte.');
    }
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
  SpreadsheetApp.flush();
  clearRows_(CONFIG.SHEETS.APUNTES);
  log_(session.id_usuario, 'APUNTE_DELETE', String(idApunte));
  return { success: true };
}

function guardarEvento(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  if (!datos.titulo || !datos.fecha) return fail_('Agrega titulo y fecha.');
  var idAsignatura = datos.id_asignatura ? trim_(datos.id_asignatura) : '';
  if (idAsignatura && !estudianteCursaAsignatura_(perfil.id_estudiante, idAsignatura)) return fail_('Evento fuera de tus asignaturas.');
  if (datos.id_evento) {
    var row = findRow_(CONFIG.SHEETS.EVENTOS, function(e) { return e.id_evento == datos.id_evento && e.id_estudiante == perfil.id_estudiante; });
    if (row < 0) return fail_('Evento no encontrado.');
    if (!updateRowById_(CONFIG.SHEETS.EVENTOS, 'id_evento', datos.id_evento, {
      id_asignatura: idAsignatura,
      titulo: trim_(datos.titulo),
      descripcion: trim_(datos.descripcion),
      fecha: new Date(datos.fecha),
      hora: trim_(datos.hora),
      tipo: trim_(datos.tipo || 'recordatorio'),
      completado: datos.completado ? 1 : 0
    })) {
      return fail_('No se pudo actualizar el recordatorio.');
    }
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
  SpreadsheetApp.flush();
  clearRows_(CONFIG.SHEETS.EVENTOS);
  log_(session.id_usuario, 'EVENTO_DELETE', String(idEvento));
  return { success: true };
}

function guardarLectura(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  if (!datos.titulo) return fail_('Agrega un titulo para la lectura.');
  var idAsignatura = datos.id_asignatura ? trim_(datos.id_asignatura) : '';
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
    if (!updateRowById_(CONFIG.SHEETS.LECTURAS, 'id_lectura', datos.id_lectura, values)) {
      return fail_('No se pudo actualizar la lectura.');
    }
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
  SpreadsheetApp.flush();
  clearRows_(CONFIG.SHEETS.LECTURAS);
  log_(session.id_usuario, 'LECTURA_DELETE', String(idLectura));
  return { success: true };
}

function guardarGrupo(token, datos) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  datos = normalizePayload_(datos);
  if (!datos.nombre) return fail_('Agrega un nombre para el grupo.');
  var idAsignatura = datos.id_asignatura ? trim_(datos.id_asignatura) : '';
  if (idAsignatura && !estudianteCursaAsignatura_(perfil.id_estudiante, idAsignatura)) return fail_('Solo podes asociar grupos a tus asignaturas.');
  var values = {
    id_asignatura: idAsignatura,
    nombre: trim_(datos.nombre),
    integrantes: trim_(datos.integrantes),
    canal: trim_(datos.canal),
    lugar: trim_(datos.lugar),
    proxima_fecha: dateOnlyString_(datos.proxima_fecha),
    proxima_hora: trim_(datos.proxima_hora),
    objetivo: trim_(datos.objetivo),
    estado: trim_(datos.estado || 'Activo'),
    fecha_modificacion: now_()
  };
  if (datos.id_grupo) {
    var row = findRow_(CONFIG.SHEETS.GRUPOS, function(g) { return g.id_grupo == datos.id_grupo && g.id_estudiante == perfil.id_estudiante; });
    if (row < 0) return fail_('Grupo no encontrado.');
    if (!updateRowById_(CONFIG.SHEETS.GRUPOS, 'id_grupo', datos.id_grupo, values)) {
      return fail_('No se pudo actualizar el grupo.');
    }
  } else {
    values.id_grupo = nextId_(CONFIG.SHEETS.GRUPOS);
    values.id_estudiante = perfil.id_estudiante;
    values.fecha_creacion = now_();
    appendObject_(CONFIG.SHEETS.GRUPOS, values);
  }
  log_(session.id_usuario, 'GRUPO', values.nombre);
  var grupos = obtenerMisGrupos_(perfil.id_estudiante);
  return {
    success: true,
    message: 'Grupo guardado.',
    grupos: grupos,
    gruposLoaded: true,
    resumen: resumen_(perfil.id_estudiante, null, null, null, null, null, grupos, null)
  };
}

function eliminarGrupo(token, idGrupo) {
  var session = requireSession_(token);
  var perfil = getPerfilByUser_(session.id_usuario);
  var row = findRow_(CONFIG.SHEETS.GRUPOS, function(g) { return g.id_grupo == idGrupo && g.id_estudiante == perfil.id_estudiante; });
  if (row < 0) return fail_('Grupo no encontrado.');
  getSheet_(CONFIG.SHEETS.GRUPOS).deleteRow(row);
  SpreadsheetApp.flush();
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
  var idAsignatura = datos.id_asignatura ? trim_(datos.id_asignatura) : '';
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
    if (!updateRowById_(CONFIG.SHEETS.AGENDA, 'id_agenda', datos.id_agenda, values)) {
      return fail_('No se pudo actualizar la agenda.');
    }
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
  if (!updateRowById_(CONFIG.SHEETS.AGENDA, 'id_agenda', idAgenda, { activo: 0, fecha_modificacion: now_() })) {
    return fail_('No se pudo eliminar la entrada.');
  }
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
    if (!updateRowById_(CONFIG.SHEETS.PREFERENCIAS, 'id_preferencia', pref.id_preferencia, values)) {
      return fail_('No se pudieron actualizar las preferencias.');
    }
  } else {
    values.id_preferencia = nextId_(CONFIG.SHEETS.PREFERENCIAS);
    values.id_estudiante = perfil.id_estudiante;
    appendObject_(CONFIG.SHEETS.PREFERENCIAS, values);
  }
  log_(session.id_usuario, 'PREFERENCIAS', 'Alertas actualizadas');
  return { success: true, message: 'Preferencias guardadas.' };
}

function obtenerMisInscripciones_(idEstudiante) {
  var secciones = mergedSeccionesIndex_();
  var asignaturas = mergedAsignaturasIndex_();
  var aulas = indexBy_(getRows_(CONFIG.SHEETS.AULAS), 'id_aula');
  var horarios = getRows_(CONFIG.SHEETS.HORARIOS);
  return getRows_(CONFIG.SHEETS.INSCRIPCIONES).filter(function(i) {
    return i.id_estudiante == idEstudiante && isActive_(i.activo);
  }).map(function(i) {
    var sec = secciones[i.id_seccion] || {};
    var idAsignatura = sec.id_asignatura || i.id_asignatura_snapshot || '';
    var asig = asignaturas[idAsignatura] || {};
    i.id_asignatura = idAsignatura;
    i.codigo_seccion = sec.codigo_seccion || i.codigo_seccion_snapshot || '';
    i.nombre_asignatura = asig.nombre_asignatura || i.nombre_asignatura_snapshot || '';
    i.codigo = asig.codigo || i.codigo_asignatura_snapshot || '';
    i.carrera = asig.carrera || '';
    var embeddedHorarios = sec.horarios || [];
    var snapshotHorarios = parseHorariosSnapshot_(i.horarios_snapshot);
    i.horarios = embeddedHorarios.length ? embeddedHorarios : (snapshotHorarios.length ? snapshotHorarios : horarios.filter(function(h) { return h.id_seccion == i.id_seccion; }).map(function(h) {
      var aula = aulas[h.id_aula] || {};
      return { dia: h.dia, hora_ini: h.hora_ini, hora_fin: h.hora_fin, aula: aula.nombre_aula || 'Sin aula', edificio: aula.edificio || '' };
    }));
    return i;
  });
}

function parseHorariosSnapshot_(value) {
  if (!value) return [];
  try {
    var parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
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
  var asignaturas = mergedAsignaturasIndex_();
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
  var asignaturas = mergedAsignaturasIndex_();
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
  var asignaturas = mergedAsignaturasIndex_();
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

function bootstrapResponse_(session, perfil, inscripciones, notas, agenda, preferencias, warning, extra) {
  perfil = perfil || {};
  extra = extra || {};
  var apuntes = extra.apuntes || [];
  var eventos = extra.eventos || [];
  var lecturas = extra.lecturas || [];
  var grupos = extra.grupos || [];
  return {
    success: true,
    warning: warning || '',
    user: publicUserFromPerfil_(session.id_usuario, session.rol, '', perfil),
    perfil: perfil,
    carreras: obtenerCarreras_(),
    catalogo: [],
    catalogoLoaded: false,
    inscripciones: inscripciones || [],
    notas: notas || [],
    apuntes: apuntes,
    apuntesLoaded: true,
    eventos: eventos,
    eventosLoaded: true,
    lecturas: lecturas,
    lecturasLoaded: true,
    grupos: grupos,
    gruposLoaded: true,
    agenda: agenda || [],
    preferencias: preferencias || obtenerPreferenciasDefault_(),
    companeros: [],
    companerosLoaded: false,
    resumen: resumen_(perfil.id_estudiante, inscripciones || [], notas || [], apuntes, eventos, lecturas, grupos, agenda || [])
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
  var secciones = mergedSeccionesIndex_();
  var asignaturas = mergedAsignaturasIndex_();
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
  var asignaturas = mergedAsignaturasIndex_();
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
  var asignaturas = mergedAsignaturasIndex_();
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
  var ss = getSpreadsheet_();
  var sheet = findSheetByName_(ss, name);
  if (!sheet && SCHEMA[name]) {
    sheet = ss.insertSheet(name);
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

function findSheetByName_(ss, name) {
  var names = SHEET_ALIASES_[name] || [name];
  for (var i = 0; i < names.length; i++) {
    var sheet = ss.getSheetByName(names[i]);
    if (sheet) return sheet;
  }
  return null;
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
    headers.forEach(function(h, i) { obj[h] = serializableCellValue_(row[i]); });
    return obj;
  });
  return ROW_CACHE_[name];
}

function serializableCellValue_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    if (isNaN(value.getTime())) return '';
    return Utilities.formatDate(value, 'America/Asuncion', 'yyyy-MM-dd HH:mm:ss');
  }
  return value;
}

function appendObject_(sheetName, obj) {
  var sheet = getSheet_(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(function(h) { return obj[h] === undefined ? '' : obj[h]; }));
  SpreadsheetApp.flush();
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
  if (keyIndex < 0) return false;
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][keyIndex]) === String(keyValue)) {
      Object.keys(values).forEach(function(k) {
        var c = headers.indexOf(k);
        if (c >= 0) sheet.getRange(r + 1, c + 1).setValue(values[k]);
      });
      SpreadsheetApp.flush();
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
  if ([CONFIG.SHEETS.CARRERAS, CONFIG.SHEETS.ASIGNATURAS, CONFIG.SHEETS.SECCIONES, CONFIG.SHEETS.HORARIOS, CONFIG.SHEETS.AULAS].indexOf(sheetName) >= 0) {
    clearCatalogCache_();
  }
}

function clearCatalogCache_() {
  EMBEDDED_CATALOG_CACHE_ = null;
  SNAPSHOT_CATALOG_CACHE_ = null;
  CATALOG_LOOKUP_CACHE_ = null;
  try {
    CacheService.getScriptCache().remove(catalogCacheKey_());
    CacheService.getScriptCache().remove('facen_v5_catalogo_csv_' + CONFIG.EMBEDDED_CATALOG.VERSION);
    CacheService.getScriptCache().remove('facen_v4_catalogo');
    CacheService.getScriptCache().remove('facen_v4_catalogo_real_xlsx_v2');
    CacheService.getScriptCache().remove('facen_v4_catalogo_carreras_v4');
  } catch (e) {}
}

function catalogCacheKey_() {
  var snapshotVersion = catalogSnapshotMeta_().version;
  return 'facen_v6_catalogo_' + (snapshotVersion || CONFIG.EMBEDDED_CATALOG.VERSION);
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
  if (getRows_(CONFIG.SHEETS.CARRERAS).length === 0) {
    [
      [1, 'Licenciatura en Biotecnologia', 'FACEN', 10],
      [2, 'Licenciatura en Ciencias Mencion Biologia', 'FACEN', 10],
      [3, 'Licenciatura en Ciencias Mencion Fisica', 'FACEN', 10],
      [4, 'Licenciatura en Ciencias Mencion Geologia', 'FACEN', 10],
      [5, 'Licenciatura en Ciencias Mencion Matematica Estadistica', 'FACEN', 10],
      [6, 'Licenciatura en Ciencias Mencion Matematica Pura', 'FACEN', 10],
      [7, 'Licenciatura en Ciencias Mencion Quimica', 'FACEN', 10],
      [8, 'Licenciatura en Educacion Matematica', 'FACEN', 10],
      [9, 'Licenciatura en Fisica Medica', 'FACEN', 10],
      [10, 'Licenciatura en Logistica y Gestion del Transporte', 'FACEN', 10],
      [11, 'Licenciatura en Radiologia e Imagenologia', 'FACEN', 10],
      [12, 'Licenciatura en Tecnologia de Produccion', 'FACEN', 10]
    ].forEach(function(r) {
      appendObject_(CONFIG.SHEETS.CARRERAS, { id_carrera: r[0], nombre_carrera: r[1], facultad: r[2], duracion_semestres: r[3], activo: 1 });
    });
  }
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

function makeTempPassword_() {
  return 'Facen-' + Utilities.getUuid().slice(0, 8);
}

function digitsOnly_(value) {
  return String(value === null || value === undefined ? '' : value).replace(/\D/g, '');
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

function dateOnlyString_(value) {
  value = trim_(value);
  if (!value) return '';
  var match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return match[1] + '-' + match[2] + '-' + match[3];
  var date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return Utilities.formatDate(date, 'America/Asuncion', 'yyyy-MM-dd');
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
