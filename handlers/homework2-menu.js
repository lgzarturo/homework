/**
 * Homework 2 - Controlador del CRUD Menu
 * Aquí se define el método get para obtener el menu de la pizzeria.
 */

// Dependencias libs
const data = require('../lib/data')
const helpers = require('../lib/helpers')
const validators = require('../validation/request_validation')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Manejo de los métodos que serán aceptados en el controlador.
 * @param req
 * @param callback
 */
handlers.items = (req, callback) => {
  if (validators.isValidMethod(req.method, ['get'])) {
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
handlers._items.get = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const token = validators.isValidTokenField(req.headers.token)
  const email = validators.isValidEmailField(req.headers.email)
  const code = validators.isValidTextField(req.queryStringObject.code)

  helpers.verifyToken(token, email, (isValid) => {
    // Verificar si el token es válido
    if (isValid) {
      data.read('items', 'menu', (errRead, dataItems) => {
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
