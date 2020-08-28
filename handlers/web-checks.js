/**
 * Homework 3 - Controlador del CRUD Checks
 */

// Dependencias libs
const helpers = require('../lib/helpers')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Checks - post (URI: check/create)
 * @param req
 * @param callback
 */
handlers.create = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': 'Create a new check',
      'body.title': 'Web site check',
      'body.class': 'checkCreate',
    }

    helpers.getTemplate('checks/create', data, (err, str) => {
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
 * Checks - post (URI: check/edit)
 * @param req
 * @param callback
 */
handlers.edit = (req, callback) => {}

/**
 * Checks - post (URI: check/delete)
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
      'body.class': 'checkDeleted',
    }

    helpers.getTemplate('checks/delete', data, (err, str) => {
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
