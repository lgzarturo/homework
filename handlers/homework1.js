/**
 * Homework 1
 * Crear una API Simple para mostrar un mensaje
 */

// Dependencias libs
const workers = require('../lib/workers')
const helpers = require('../lib/helpers')
// Controlador dependiendo la solicitud URI
const handlers = {}

const logFileName = 'homework1'

/**
 * URI /ping - Sirve para verificar si el servidor esta vivo.
 * @param req
 * @param callback
 */
handlers.ping = (req, callback) => {
  callback(200, { success: helpers.translate('success.ping', req.lang) })
}

/**
 * URI /hello - Solo muestra un mensaje de bienvenida.
 * @param req
 * @param callback - code: 200
 */
handlers.hello = (req, callback) => {
  const data = {
    success: helpers.translate('success.hello.world.pizza', req.lang),
    data: helpers.translate('homework.one', req.lang),
  }
  workers.log(logFileName, data, 200, '/hello')
  callback(200, data)
}

/**
 * URI por default - Si no cumple con ninguna ruta se devuelve un error 404
 * @param req
 * @param callback 404
 */
handlers.notFound = (req, callback) => {
  const data = {
    error: helpers.translate('resource.not.found', req.lang),
  }
  workers.log(logFileName, data, 404, 'notFound')
  callback(404, data)
}

module.exports = handlers
