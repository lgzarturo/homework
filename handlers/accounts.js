/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias libs
// const data = require('../lib/data')
const helpers = require('../lib/helpers')
// const validators = require('../validation/request_validation')
// const checkers = require('../validation/request_clean')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Accounts - post (URI: account/create)
 * @param req
 * @param callback
 */
handlers.create = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': 'Create an Account',
      'head.description': 'Registrate para poder usar el servicio.',
      'body.title': 'Registra tu cuenta',
      'body.class': 'accountCreate',
    }

    helpers.getTemplate('accounts/create', data, (err, str) => {
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
 * Accounts - post (URI: account/edit)
 * @param req
 * @param callback
 */
handlers.edit = (req, callback) => {}

/**
 * Accounts - post (URI: account/delete)
 * @param req
 * @param callback
 */
handlers.delete = (req, callback) => {}

module.exports = handlers
