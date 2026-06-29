/**
 * FACEN App - Recovery Web App.
 * Emergency password recovery bridge for the public fallback app.
 */

var CONFIG = {
  SPREADSHEET_ID: '1bxqwZy6cW1gGdPGtRyWDn52WdmbMpiMKvLjA6X2lFmc',
  HASH_ITERATIONS: 6000,
  SHEETS: {
    USUARIOS: 'USUARIOS',
    ESTUDIANTES: 'ESTUDIANTES',
    LOGS: 'LOGS'
  }
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Recuperar acceso - FACEN App')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function recuperarContrasena(datos) {
  try {
    datos = normalizePayload_(datos);
    var username = cleanUsername_(datos.username);
    if (!username) return fail_('Ingresa tu usuario.');
    if (!datos.email && !datos.cedula) {
      return fail_('Ingresa el email o la cedula guardada en tu perfil.');
    }

    return withLock_(function() {
      var usuariosSheet = getSheet_(CONFIG.SHEETS.USUARIOS);
      var usuarios = readObjects_(usuariosSheet);
      var found = null;
      for (var i = 0; i < usuarios.length; i++) {
        if (cleanUsername_(usuarios[i].username) === username) {
          found = { rowIndex: i + 2, data: usuarios[i] };
          break;
        }
      }
      if (!found || !isActive_(found.data.activo)) {
        return fail_('No encontramos una cuenta activa con ese usuario.');
      }

      var perfil = getPerfilByUser_(found.data.id_usuario);
      var emailOk = datos.email && normalize_(perfil.email) === normalize_(datos.email);
      var cedulaOk = datos.cedula && digitsOnly_(perfil.cedula) === digitsOnly_(datos.cedula);
      if (!emailOk && !cedulaOk) return fail_('Los datos no coinciden con el perfil guardado.');

      var tempPassword = makeTempPassword_();
      var salt = makeSalt_();
      updateObjectAtRow_(usuariosSheet, found.rowIndex, {
        password_hash: hashPassword_(tempPassword, salt),
        salt: salt,
        ultimo_acceso: ''
      });
      log_(found.data.id_usuario, 'RECUPERAR_CONTRASENA', 'Clave temporal generada desde recovery webapp');

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

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function getPerfilByUser_(idUsuario) {
  var rows = readObjects_(getSheet_(CONFIG.SHEETS.ESTUDIANTES));
  return rows.find(function(row) {
    return String(row.id_usuario) === String(idUsuario);
  }) || {};
}

function getSheet_(name) {
  var sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(name);
  if (!sheet) throw new Error('No existe la hoja ' + name + '.');
  return sheet;
}

function readObjects_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0].map(function(header) { return String(header || '').trim(); });
  return values.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(header, index) {
      if (header) obj[header] = row[index];
    });
    return obj;
  });
}

function updateObjectAtRow_(sheet, rowIndex, values) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function(header) { return String(header || '').trim(); });
  Object.keys(values).forEach(function(key) {
    var col = headers.indexOf(key) + 1;
    if (col <= 0) throw new Error('No existe la columna ' + key + ' en ' + sheet.getName() + '.');
    sheet.getRange(rowIndex, col).setValue(values[key]);
  });
  SpreadsheetApp.flush();
}

function log_(idUsuario, accion, detalle) {
  try {
    var sheet = getSheet_(CONFIG.SHEETS.LOGS);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map(function(header) { return String(header || '').trim(); });
    var row = headers.map(function(header) {
      if (header === 'id_log') return nextLogId_(sheet);
      if (header === 'fecha') return new Date();
      if (header === 'id_usuario') return idUsuario;
      if (header === 'accion') return accion;
      if (header === 'detalle') return detalle;
      return '';
    });
    sheet.appendRow(row);
  } catch (e) {
    console.warn('No se pudo registrar LOGS: ' + e.message);
  }
}

function nextLogId_(sheet) {
  return Math.max(1, sheet.getLastRow());
}

function normalizePayload_(value) {
  return value && typeof value === 'object' ? value : {};
}

function cleanUsername_(value) {
  return String(value || '').trim().toLowerCase();
}

function normalize_(value) {
  return String(value || '').trim().toLowerCase();
}

function digitsOnly_(value) {
  return String(value === null || value === undefined ? '' : value).replace(/\D/g, '');
}

function isActive_(value) {
  return String(value).trim() !== '0' && String(value).toLowerCase() !== 'false';
}

function makeSalt_() {
  return Utilities.getUuid() + Utilities.getUuid();
}

function makeTempPassword_() {
  return 'Facen-' + Utilities.getUuid().slice(0, 8);
}

function hashPassword_(password, salt) {
  var value = String(password) + ':' + salt;
  for (var i = 0; i < CONFIG.HASH_ITERATIONS; i++) {
    value = digestHex_(value + ':' + salt + ':' + i);
  }
  return value;
}

function digestHex_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function(b) {
    var v = b < 0 ? b + 256 : b;
    return ('0' + v.toString(16)).slice(-2);
  }).join('');
}

function fail_(message) {
  return { success: false, message: message };
}
