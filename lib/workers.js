/**
 * Worker rekated task
 */

// Dependencias
var util = require('util');
var debug = util.debuglog('lib');

// Dependencias de la aplicación
var _logs = require('./logs');

var lib = {};

lib.log = function (logFileName, message, code, state) {
  if (message && logFileName) {
    var time = Date.now();	
    if (typeof(message) == 'object') {
      message = JSON.stringify(message);
    }
    code = typeof(code) == 'number' ? code : 404;
    state = typeof(state) == 'string' ? state : 'notFound';

    var logData = {
      'message' : message,
      'code' : code,
      'state' : state,
      'time' : time,
    };
			
    var logString = JSON.stringify(logData);

    _logs.append(logFileName, logString, function (err) {
      if (!err) {
        debug('Se ha registrado con exito el evento.');
      } else{
        debug('Error al registrar el log.');
      }
    });
  } else {
    debug('No se ha agregado ningún mensaje para el registro del log');
  }
};

// Rotación de los logs
lib.rotateLogs = function () {
  // Lista de todos los archivos log que no han sido comprimidos
  _logs.list(false, function (err, logs) {
    if (!err && logs && logs.length > 0) {
      logs.forEach(function (logName) {
        // Comprimir los datos y guardarlos en otro archivo
        var logId = logName.replace('.log', '');
        var newFileId = `${logId}-${Date.now()}`;
        _logs.compress(logId, newFileId, function (err) {
          if (!err) {
            // Truncar el archivo log
            _logs.truncate(logId, function (err) {
              if (!err){
                debug('Success: se ha truncado el archivo log');
              } else {
                debug('Error: al truncar el archivo log');
              }
            });
          } else {
            debug('Error: al comprimir uno de los archivos: ', err);
          }
        });
      });
    } else{
      debug('Error: no se encontraron logs para rotar');
    }
  });
};

// Rotación de log una vez por día
lib.logRotationLoop = function () {
  setInterval(function () {
    lib.rotateLogs();
  }, 1000 * 60 * 60 * 24);
};

// Inicializar script
lib.init = function () {
  // Enviar a la consola
  console.log('\x1b[33m%s\x1b[0m', 'Ejecución en segundo plano.');

  // Comprimir todo los logs
  lib.rotateLogs();
  lib.logRotationLoop();
};

module.exports = lib;