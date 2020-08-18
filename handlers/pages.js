/**
 * Homework 3
 * Crear una API Simple para mostrar un mensaje
 */

// Dependencias libs
const helpers = require('../lib/helpers')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * URI /index - Muestra la página de inicio
 * @param req
 * @param callback
 */
handlers.index = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    helpers.getTemplate('index', (err, str) => {
      if (!err && str) {
        callback(200, str, 'html')
      } else {
        callback(404, undefined, 'html')
      }
    })
  }
}

module.exports = handlers
