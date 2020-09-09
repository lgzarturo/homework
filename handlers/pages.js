/**
 * Homework 3
 * Controller para las páginas estáticas
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
    const data = {
      'head.title': helpers.translate('pages.index.page.title', req.lang),
      'head.description': helpers.translate('pages.index.page.description', req.lang),
      'body.title': helpers.translate('pages.index.title', req.lang),
      'body.class': 'index',
    }

    helpers.getTemplate('pages/index', data, (err, str) => {
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

handlers.favicon = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    helpers.getStaticAsset('favicon.ico', (err, data) => {
      if (!err && data) {
        callback(200, data, 'favicon')
      } else {
        callback(500)
      }
    })
  }
}

handlers.public = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const assetName = req.trimmedPath.replace('public/', '').trim()
    if (assetName.length > 0) {
      helpers.getStaticAsset(assetName, (err, data) => {
        if (!err && data) {
          let contentType = 'plain'
          if (assetName.indexOf('.css') !== -1) {
            contentType = 'css'
          } else if (assetName.indexOf('.js') !== -1) {
            contentType = 'js'
          } else if (assetName.indexOf('.png') !== -1) {
            contentType = 'png'
          } else if (assetName.indexOf('.jpg') !== -1) {
            contentType = 'jpg'
          } else if (assetName.indexOf('.ico') !== -1) {
            contentType = 'favicon'
          }
          callback(200, data, contentType)
        } else {
          callback(500)
        }
      })
    } else {
      callback(404)
    }
  }
}

module.exports = handlers
