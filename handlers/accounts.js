/**
 * Homework 3 - Controlador del CRUD Accounts
 */

// Dependencias libs
const helpers = require('../lib/helpers')
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
      'head.title': helpers.translate('account.create.page.title', req.lang),
      'head.description': helpers.translate('account.create.page.description', req.lang),
      'body.title': helpers.translate('account.create.title', req.lang),
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
handlers.edit = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': helpers.translate('account.edit.page.title', req.lang),
      'body.title': helpers.translate('account.edit.title', req.lang),
      'body.class': 'accountEdit',
    }

    helpers.getTemplate('accounts/edit', data, (err, str) => {
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
 * Accounts - post (URI: account/delete)
 * @param req
 * @param callback
 */
handlers.delete = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': helpers.translate('account.delete.page.title', req.lang),
      'body.title': helpers.translate('account.delete.title', req.lang),
      'body.class': 'accountDeleted',
    }

    helpers.getTemplate('accounts/delete', data, (err, str) => {
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
