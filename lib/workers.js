/**
 * Worker related task
 */

// Dependencias node
const util = require('util')

const debug = util.debuglog('lib')
// Dependencias libs
const logs = require('./logs')

const lib = {}

/**
 * Generar un registro del log.
 * @param logFileName
 * @param message
 * @param code
 * @param state
 */
lib.log = function (logFileName, message, code, state) {
  if (message && logFileName) {
    const time = Date.now()
    let requestMessage = message
    const requestCode = typeof code === 'number' ? code : 404
    const requestState = typeof state === 'string' ? state : 'notFound'
    if (typeof message === 'object') {
      requestMessage = JSON.stringify(message)
    }

    const logData = {
      message: requestMessage,
      code: requestCode,
      state: requestState,
      time: time,
    }

    const logString = JSON.stringify(logData)

    logs.append(logFileName, logString, function (errAppend) {
      if (!errAppend) {
        debug('Se ha registrado con éxito el evento.')
      } else {
        debug('Error al registrar el log.')
      }
    })
  } else {
    debug('No se ha agregado ningún mensaje para el registro del log')
  }
}

/**
 * Rotación de los logs
 */
lib.rotateLogs = function () {
  // Lista de todos los archivos log que no han sido comprimidos
  logs.list(false, function (errList, listLogs) {
    if (!errList && logs && logs.length > 0) {
      listLogs.forEach(function (logName) {
        // Comprimir los datos y guardarlos en otro archivo
        const logId = logName.replace('.log', '')
        const newFileId = `${logId}-${Date.now()}`
        logs.compress(logId, newFileId, function (errCompress) {
          if (!errCompress) {
            // Truncar el archivo log
            logs.truncate(logId, function (err) {
              if (!err) {
                debug('Success: se ha truncado el archivo log')
              } else {
                debug('Error: al truncar el archivo log')
              }
            })
          } else {
            debug('Error: al comprimir uno de los archivos: ', errCompress)
          }
        })
      })
    } else {
      debug('Error: no se encontraron logs para rotar')
    }
  })
}

/**
 * Rotación de log una vez por día
 */
lib.logRotationLoop = function () {
  setInterval(function () {
    lib.rotateLogs()
  }, 1000 * 60 * 60 * 24)
}

/**
 * Inicializar script
 */
lib.init = function () {
  // Enviar a la consola
  console.log('\x1b[33m%s\x1b[0m', 'Ejecución en segundo plano.')
  // Comprimir los archivos logs
  lib.rotateLogs()
  lib.logRotationLoop()
}

module.exports = lib
