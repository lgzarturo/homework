/**
 * Worker related task
 */

// Dependencias node
const util = require('util')
const url = require('url')
const http = require('http')
const https = require('https')

const debug = util.debuglog('lib')
// Dependencias libs
const _data = require('./data')
const helpers = require('./helpers')
const validators = require('../validation/request_validation')
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
    if (!errList && listLogs && listLogs.length > 0) {
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
 * Checks
 */

lib.gatherAllChecks = () => {
  _data.list('checks', (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        if (!check.includes('.md')) {
          _data.read('checks', check, (errCheck, checkData) => {
            if (!errCheck && checkData) {
              lib.validateCheck(checkData)
            } else {
              console.log('No se pudo leer la información del check', check)
            }
          })
        }
      })
    } else {
      console.log('Error: no hay checks para procesar')
    }
  })
}

lib.validateCheck = (checkData) => {
  checkData = typeof checkData === 'object' && checkData !== null ? checkData : {}
  checkData.id = validators.isValidTextFieldSize(checkData.id, 48)
  checkData.userEmail = validators.isValidTextField(checkData.userEmail)
  checkData.protocol = validators.isValidProtocolValue(checkData.protocol)
  checkData.url = validators.isValidTextField(checkData.url)
  checkData.method = validators.isValidMethodValue(checkData.method)
  checkData.successCodes = validators.isValidArrayObject(checkData.successCodes)
  checkData.timeoutSeconds = validators.isValidTimeInSeconds(checkData.timeoutSeconds)
  checkData.state = typeof checkData.state === 'string' && ['up', 'down'].indexOf(checkData.state) !== -1 ? checkData.state : 'down'
  checkData.lastChecked = typeof checkData.lastChecked === 'number' && checkData.lastChecked > 0 ? checkData.lastChecked : false

  if (checkData.id && checkData.userEmail && checkData.protocol && checkData.url && checkData.method && checkData.successCodes && checkData.timeoutSeconds) {
    lib.performCheck(checkData)
  } else {
    console.log('Error: no se pudo ejecutar un check')
  }
}

lib.performCheck = (checkData) => {
  const checkOutcome = {
    error: false,
    responseCode: false,
  }

  let outcomeSent = false
  const parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true)
  const { hostname } = parsedUrl
  const { path } = parsedUrl
  const requestDetails = {
    protocol: `${checkData.protocol}:`,
    hostname: hostname,
    method: checkData.method.toUpperCase(),
    path: path,
    timeout: checkData.timeoutSeconds * 1000,
  }

  const _moduleToUse = checkData.protocol === 'http' ? http : https
  const req = _moduleToUse.request(requestDetails, (res) => {
    checkOutcome.responseCode = res.statusCode
    lib.log('checks', checkData, res.statusCode, 'perform')
    if (!outcomeSent) {
      lib.processCheckOutcome(checkData, checkOutcome)
      outcomeSent = true
    }
  })

  req.on('error', (e) => {
    checkOutcome.error = {
      error: true,
      value: e,
    }
    if (!outcomeSent) {
      lib.processCheckOutcome(checkData, checkOutcome)
      outcomeSent = true
    }
  })

  req.on('timeout', (e) => {
    checkOutcome.error = {
      error: true,
      value: `Timeout: ${e}`,
    }
    if (!outcomeSent) {
      lib.processCheckOutcome(checkData, checkOutcome)
      outcomeSent = true
    }
  })

  req.end()
}

lib.processCheckOutcome = (checkData, checkOutcome) => {
  const state = !checkOutcome.error && checkOutcome.responseCode && checkData.successCodes.indexOf(checkOutcome.responseCode) !== -1 ? 'up' : 'down'
  const alert = !!(checkData.lastChecked && checkData.state !== state)
  const timeOfCheck = Date.now()
  const newCheckData = checkData
  newCheckData.state = state
  newCheckData.lastChecked = timeOfCheck
  lib.logCheck(checkData, checkOutcome, state, alert, timeOfCheck)
  _data.update('checks', newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alert) {
        lib.alertUserToStatusChange(newCheckData)
      } else {
        console.log('No se necesita enviar una alerta')
      }
    } else {
      console.log('Error al intentar guardar la actualización de un check')
    }
  })
}

lib.alertUserToStatusChange = (checkData) => {
  const message = `Alert: Your check for ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} is currently ${checkData.state}`
  helpers.twilio('+529982229740', message, (err) => {
    if (err) {
      console.log('Error al enviar el mensaje por sms', err)
    }
  })
  helpers.mailgun(checkData.userEmail, 'Check status website', message, (err) => {
    if (err) {
      console.log('Error al enviar el mensaje por correo', err)
    }
  })
}

lib.logCheck = (checkData, checkOutcome, state, alertWarranted, timeOfCheck) => {
  const logData = {
    check: checkData,
    outcome: checkOutcome,
    state: state,
    alert: alertWarranted,
    time: timeOfCheck,
  }

  const logString = JSON.stringify(logData)
  const logFilename = checkData.id
  lib.log(logFilename, logString, checkOutcome.responseCode, state)
}

lib.checkLoop = () => {
  setInterval(function () {
    lib.gatherAllChecks()
  }, 1000 * 60)
}

/**
 * Inicializar script
 */
lib.init = function () {
  // Enviar a la consola
  console.log('\x1b[33m%s\x1b[0m', 'Ejecución en segundo plano.')
  lib.gatherAllChecks()
  lib.checkLoop()
  // Comprimir los archivos logs
  lib.rotateLogs()
  lib.logRotationLoop()
}

module.exports = lib
