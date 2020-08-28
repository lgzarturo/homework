/**
 * Homework 3 - Controlador del CRUD Session
 */

// Dependencias libs
const helpers = require('../lib/helpers')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Sessions - post (URI: session/create)
 * @param req
 * @param callback
 */
handlers.create = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': 'Login to your account',
      'head.description': 'Favor de ingresar los datos de acceso, para iniciar sesión.',
      'body.title': 'Puerta de entrada al sistema',
      'body.class': 'sessionCreate',
    }

    helpers.getTemplate('sessions/create', data, (err, str) => {
      if (!err && str) {
        helpers.applyLayout(str, data, (errLayout, content) => {
          if (!errLayout && content) {
            callback(200, content, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(404, undefined, 'html')
      }
    })
  }
}

/**
 * Sessions - post (URI: session/edit)
 * @param req
 * @param callback
 */
handlers.edit = (req, callback) => {}

/**
 * Sessions - post (URI: session/delete)
 * @param req
 * @param callback
 */
handlers.delete = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': 'Logout',
      'head.description': 'La sesión ha terminado.',
      'body.title': 'Gracias por usar el sistema',
      'body.class': 'sessionDeleted',
    }

    helpers.getTemplate('sessions/delete', data, (err, str) => {
      if (!err && str) {
        helpers.applyLayout(str, data, (errLayout, content) => {
          if (!errLayout && content) {
            callback(200, content, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(404, undefined, 'html')
      }
    })
  }
}

module.exports = handlers
