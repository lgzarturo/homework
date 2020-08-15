/**
 * Homework 2 - Controlador del CRUD Menu
 * Aquí se define el método get para obtener el menu de la pizzeria.
 */

// Dependencias libs
const data = require('../lib/data')
const helpers = require('../lib/helpers')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Manejo de los métodos que serán aceptados en el controlador.
 * @param req
 * @param callback
 */
handlers.items = function (req, callback) {
  const acceptableMethods = ['get']
  if (acceptableMethods.indexOf(req.method) !== -1) {
    handlers._items[req.method](req, callback)
  } else {
    callback(405, { error: helpers.translate('error.method.not.allowed', req.lang) })
  }
}

// Controlador dependiendo de la solicitud URI
handlers._items = {}

/**
 * URI /menu?code={?}
 * @param req
 * @param callback
 */
handlers._items.get = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const token = typeof req.headers.token === 'string' ? req.headers.token : false
  const email = typeof req.headers.email === 'string' && req.headers.email.trim().length > 0 ? req.headers.email : false
  const code = typeof req.queryStringObject.code === 'string' && req.queryStringObject.code.trim().length > 0 ? req.queryStringObject.code.trim() : false

  helpers.verifyToken(token, email, function (isValid) {
    // Verificar si el token es válido
    if (isValid) {
      data.read('items', 'menu', function (errRead, dataItems) {
        if (!errRead && dataItems) {
          if (code) {
            callback(200, dataItems[code])
          } else {
            callback(200, dataItems)
          }
        } else {
          callback(400, { error: helpers.translate('error.data.not.available', req.lang) })
        }
      })
    } else {
      callback(403, { error: helpers.translate('error.token.invalid', req.lang) })
    }
  })
}

module.exports = handlers
